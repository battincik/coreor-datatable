import path from 'node:path'
import assert from 'node:assert/strict'
import React from 'react'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {url:'http://localhost/'})
for (const name of ['window','document','navigator','HTMLElement','Element','Node','MutationObserver','Event','CustomEvent']) Object.defineProperty(globalThis,name,{configurable:true,value:dom.window[name]})
globalThis.getComputedStyle = dom.window.getComputedStyle
globalThis.requestAnimationFrame = callback => setTimeout(callback, 0)
globalThis.cancelAnimationFrame = clearTimeout
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
dom.window.HTMLElement.prototype.scrollTo = function ({top = 0}) { this.scrollTop = top }
const {render, fireEvent, cleanup, waitFor} = await import('@testing-library/react')
const vite = await createServer({resolve:{alias:{'@':path.resolve('src')}},server:{middlewareMode:true},appType:'custom'})
try {
 const {EnterpriseGrid} = await vite.ssrLoadModule('/src/components/enterprise-grid.tsx')
 const columns = [{key:'name',title:'Name',width:160}]
 const data = Array.from({length:123},(_,i)=>({id:i+1,name:`Customer ${i+1}`}))
 let view = render(React.createElement(EnterpriseGrid,{data,columns,title:'Client',pagination:{initialPageSize:25}}))
 assert.equal(view.container.querySelector('.page-indicator').textContent,'Page 1 of 5')
 fireEvent.click(view.getByLabelText('Sonraki sayfa'))
 await waitFor(()=>assert.equal(view.container.querySelector('.page-indicator').textContent,'Page 2 of 5'))
 fireEvent.change(view.getByLabelText('Sayfa başına satır'),{target:{value:'50'}})
 await waitFor(()=>assert.equal(view.container.querySelector('.page-indicator').textContent,'Page 1 of 3'))
 fireEvent.click(view.getByLabelText('Sonraki sayfa'))
 fireEvent.change(view.getByLabelText('Tüm alanlarda ara'),{target:{value:'Customer 1'}})
 await waitFor(()=>assert.equal(view.container.querySelector('.page-indicator').textContent,'Page 1 of 1'))
 fireEvent.change(view.getByLabelText('Tüm alanlarda ara'),{target:{value:''}})
 view.rerender(React.createElement(EnterpriseGrid,{data,columns,title:'Client',pagination:{state:{pageIndex:2,pageSize:10}}}))
 assert.equal(view.container.querySelector('.page-indicator').textContent,'Page 3 of 13')
 view.rerender(React.createElement(EnterpriseGrid,{data,columns,title:'Client',pagination:false}))
 assert.equal(view.container.querySelector('.grid-pagination'),null)
 cleanup()
 const seen=[]
 view=render(React.createElement(EnterpriseGrid,{data:data.slice(0,25),columns,title:'Server',serverMode:true,totalRows:123,pagination:{initialPageSize:25},onQueryChange:q=>seen.push(q)}))
 assert.equal(view.container.querySelector('.page-indicator').textContent,'Page 1 of 5')
 fireEvent.click(view.getByLabelText('Sonraki sayfa'))
 await waitFor(()=>assert.equal(view.container.querySelector('.page-indicator').textContent,'Page 2 of 5'))
 assert.equal(seen.at(-1).pageIndex,1)
 assert.equal(seen.at(-1).pageSize,25)
 cleanup()
 const timerDelays=[]
 const activeTimers=new Set()
 const originalSetInterval=dom.window.setInterval.bind(dom.window)
 const originalClearInterval=dom.window.clearInterval.bind(dom.window)
 dom.window.setInterval=(callback,delay)=>{timerDelays.push(delay);const id=originalSetInterval(callback,delay);activeTimers.add(id);return id}
 dom.window.clearInterval=id=>{activeTimers.delete(id);return originalClearInterval(id)}
 const timed=[{id:1,updatedAt:new Date(Date.now()-60000).toISOString()}]
 const {renderGridCell}=await vite.ssrLoadModule('/src/components/grid-cell-types.tsx')
 view=render(renderGridCell('timestamp',timed[0].updatedAt,{timestampFormat:'R'}))
 fireEvent.focus(view.container.querySelector('time'))
 await waitFor(()=>assert.ok(dom.window.document.querySelector('.grid-tooltip')))
 assert.ok(dom.window.document.querySelector('.grid-tooltip').textContent.includes('UTC:'))
 cleanup()
 const timestampColumns=ms=>[{key:'updatedAt',title:'Updated',kind:'timestamp',cellOptions:{timestampFormat:'R',relativeRefreshMs:ms}}]
 view=render(React.createElement(EnterpriseGrid,{data:timed,columns:timestampColumns(10000),title:'Timestamps'}))
 assert.equal(timerDelays.at(-1),10000)
 view.rerender(React.createElement(EnterpriseGrid,{data:timed,columns:timestampColumns(300000),title:'Timestamps'}))
 assert.equal(timerDelays.at(-1),300000)
 view.rerender(React.createElement(EnterpriseGrid,{data:timed,columns:[{key:'updatedAt',title:'Updated',kind:'timestamp',cellOptions:{timestampFormat:'F'}}],title:'Timestamps'}))
 assert.equal(activeTimers.size,0)
 cleanup()
 dom.window.setInterval=originalSetInterval
 dom.window.clearInterval=originalClearInterval
 console.log('Pagination: client navigation, size, search reset, dynamic disable and server query passed')
} finally { await vite.close(); dom.window.close() }
