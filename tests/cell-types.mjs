import path from 'node:path'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { renderToStaticMarkup } from 'react-dom/server'

const server = await createServer({ resolve: { alias: { '@': path.resolve('src') } }, server: { middlewareMode: true }, appType: 'custom' })
try {
  const { formatTimestamp, renderGridCell } = await server.ssrLoadModule('/src/components/grid-cell-types.tsx')
  const { formatDuration, formatFileSize, trendChange, safeUrl } = await server.ssrLoadModule('/src/components/grid-value-utils.ts')
  const date = '2026-09-25T12:34:56.000Z'
  for (const format of ['t', 'T', 'd', 'D', 'f', 'F', 's', 'S', 'R']) {
    assert.notEqual(formatTimestamp(date, format, 'tr-TR', Date.parse(date) + 3600_000), '—', format)
    assert.ok(renderToStaticMarkup(renderGridCell('timestamp', date, { timestampFormat: format })).includes('<time'), format)
  }
  assert.equal(formatTimestamp('invalid-date', 'R'), '—')
  assert.ok(formatTimestamp(date, 'R', 'tr-TR', Date.parse(date) + 3600_000).includes('önce'))
  assert.ok(renderToStaticMarkup(renderGridCell('email', 'ada@example.com')).includes('mailto:ada@example.com'))
  assert.ok(renderToStaticMarkup(renderGridCell('phone', '+90 555 123 4567')).includes('tel:+905551234567'))
  assert.ok(renderToStaticMarkup(renderGridCell('progress', 25, { maximum: 50 })).includes('width:50%'))
  assert.ok(renderToStaticMarkup(renderGridCell('price', 10, { currency: 'EUR', locale: 'en-US' })).includes('€'))
  assert.ok(renderToStaticMarkup(renderGridCell('tags', ['a', 'b', 'c'], { maxTags: 2 })).includes('+1'))
  assert.ok(renderToStaticMarkup(renderGridCell('status', 'active', { statusOptions: { active: { label: 'Aktif', tone: 'success' } } })).includes('grid-tone-success'))
  assert.ok(renderToStaticMarkup(renderGridCell('country', 'TR', { locale: 'tr-TR' })).includes('Türkiye'))
  assert.ok(renderToStaticMarkup(renderGridCell('boolean', false)).includes('× No'))
  assert.ok(renderToStaticMarkup(renderGridCell('url', 'https://example.com/account')).includes('rel="noopener noreferrer"'))
  assert.equal(safeUrl('javascript:alert(1)'), null)
  assert.equal(formatDuration(3661), '1 sa 1 dk')
  assert.equal(formatFileSize(1_500_000, 'en-US'), '1.5 MB')
  assert.ok(renderToStaticMarkup(renderGridCell('rating', 3.5, { ratingMax: 5 })).includes('width:70%'))
  assert.ok(renderToStaticMarkup(renderGridCell('color', '#836FFF')).includes('background-color:#836FFF'))
  assert.equal(trendChange({ points: [100, 125] }), 25)
  assert.ok(renderToStaticMarkup(renderGridCell('trend', { points: [100, 125] })).includes('<svg'))
  console.log('Cell types: links, progress, currency, tags, status, country and nine timestamp formats passed')
} finally {
  await server.close()
}
