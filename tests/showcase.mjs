import path from 'node:path'
import assert from 'node:assert/strict'
import React from 'react'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/types' })
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'MutationObserver', 'Event', 'CustomEvent']) Object.defineProperty(globalThis, name, { configurable: true, value: dom.window[name] })
globalThis.getComputedStyle = dom.window.getComputedStyle
globalThis.requestAnimationFrame = callback => setTimeout(callback, 0)
globalThis.cancelAnimationFrame = clearTimeout
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
dom.window.scrollTo = () => {}
dom.window.HTMLElement.prototype.scrollTo = () => {}
const { render, fireEvent, cleanup, waitFor } = await import('@testing-library/react')
const vite = await createServer({ resolve: { alias: { '@': path.resolve('src') } }, server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: App } = await vite.ssrLoadModule('/src/App.tsx')
  const { typeCatalog, showcaseColumns } = await vite.ssrLoadModule('/src/data/showcase.ts')
  assert.equal(typeCatalog.length, 19)
  assert.equal(new Set(showcaseColumns().map(column => column.kind)).size, 19)
  const view = render(React.createElement(App, { initialPath: '/types' }))
  assert.equal(view.container.querySelectorAll('.sc-type-card').length, 19)
  fireEvent.click(view.getByRole('link', { name: /Text Searchable/i }))
  await waitFor(() => assert.equal(dom.window.location.pathname, '/types/name'))
  assert.ok(view.container.textContent.includes('Try text in context'))
  assert.ok(view.container.querySelector('.enterprise-grid'))
  fireEvent.click(view.getByRole('link', { name: /All column types/i }))
  fireEvent.click(view.getByRole('link', { name: /Feature labs 08/i }))
  assert.equal(view.container.querySelectorAll('.sc-feature-tile').length, 8)
  fireEvent.click(view.getByRole('link', { name: /Server data.*local API simulation/i }))
  await waitFor(() => assert.equal(dom.window.location.pathname, '/features/server'))
  assert.ok(view.container.textContent.includes('only 25 loaded in this page'))
  fireEvent.click(view.getByLabelText('Sonraki sayfa'))
  await waitFor(() => assert.ok(view.container.textContent.includes('Page 2 of')))
  fireEvent.click(view.getByRole('link', { name: /Table Maker NEW/i }))
  await waitFor(() => assert.ok(view.container.textContent.includes('YOUR REACT SNIPPET')))
  fireEvent.click(view.getByLabelText('Add Rating column'))
  assert.ok(view.container.textContent.includes('7 columns · 120 records'))
  fireEvent.change(view.getByLabelText('Maker currency'), {target:{value:'EUR'}})
  assert.ok(view.container.querySelector('.sc-code pre').textContent.includes('"EUR"'))
  console.log('Showcase: type routes, feature labs, server paging and live Table Maker passed')
} finally {
  cleanup()
  await vite.close()
  dom.window.close()
}
