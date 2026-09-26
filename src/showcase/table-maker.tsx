import { useMemo, useState } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { EnterpriseGrid, type GridColumn } from '@/components/enterprise-grid'
import type { TimestampFormat } from '@/components/grid-cell-types'
import { makeShowcaseRows, showcaseColumns, typeCatalog, type ShowcaseRow } from '@/data/showcase'
import { CodePanel } from './ui'

const initialKeys = ['name','status','price','progress','tags','timestamp']
export function TableMaker() {
  const [selected,setSelected] = useState<string[]>(initialKeys)
  const [labels,setLabels] = useState<Record<string,string>>({})
  const [widths,setWidths] = useState<Record<string,number>>({})
  const [editable,setEditable] = useState(true)
  const [pagination,setPagination] = useState(true)
  const [pageSize,setPageSize] = useState(25)
  const [height,setHeight] = useState(480)
  const [count,setCount] = useState(120)
  const [title,setTitle] = useState('My workspace')
  const [currency,setCurrency] = useState('TRY')
  const [format,setFormat] = useState<TimestampFormat>('R')
  const [rows,setRows] = useState(() => makeShowcaseRows(120))
  const columns = useMemo(() => {
    const source = showcaseColumns(format,currency)
    return selected.map(key => source.find(column => column.key === key)).filter((column):column is GridColumn<ShowcaseRow> => !!column).map(column => ({ ...column, title: labels[column.key] ?? column.title, width: widths[column.key] ?? column.width, editable }))
  }, [selected, labels, widths, editable, currency, format])
  const toggle = (key:string) => setSelected(current => current.includes(key) ? current.length > 1 ? current.filter(item => item !== key) : current : [...current,key])
  const changeCount = (value:number) => { setCount(value); setRows(makeShowcaseRows(value)) }
  const reset = () => { setSelected(initialKeys); setLabels({}); setWidths({}); setEditable(true); setPagination(true); setPageSize(25); setHeight(480); changeCount(120); setTitle('My workspace'); setCurrency('TRY'); setFormat('R') }
  const columnCode = columns.map(column => {
    const options = column.options ? `, options: ${JSON.stringify(column.options)}` : ''
    const cell = column.cellOptions ? `, cellOptions: ${JSON.stringify(column.cellOptions)}` : ''
    return `  { key: '${column.key}', title: ${JSON.stringify(column.title)}, kind: '${column.kind}', width: ${column.width}, editable: ${editable}${options}${cell} },`
  }).join('\n')
  const snippet = `// Import '${'@battincik/coreor-datatable'}/styles.css' once in your app root.\n'use client'\nimport { useState } from 'react'\nimport { EnterpriseGrid, type GridColumn } from '@battincik/coreor-datatable'\n\ntype Row = { id: number; ${columns.map(column => `${column.key}: ${column.kind === 'tags' ? 'string[]' : column.kind === 'trend' ? '{ points: number[] }' : ['number','progress','price','duration','fileSize','rating'].includes(column.kind ?? '') ? 'number' : column.kind === 'boolean' ? 'boolean' : 'string'}`).join('; ')} }\nconst columns: GridColumn<Row>[] = [\n${columnCode}\n]\nconst initialRows: Row[] = [\n  { id: 1, ${columns.map(column => `${column.key}: ${JSON.stringify(rows[0]?.[column.key] ?? '')}`).join(', ')} },\n]\nexport function MyTable() {\n  const [data, setData] = useState(initialRows)\n  return <EnterpriseGrid title=${JSON.stringify(title)} data={data} columns={columns}\n    ${editable ? 'onDataChange={setData} ' : ''}height={${height}}\n    pagination={${pagination ? `{ initialPageSize: ${pageSize} }` : 'false'}} filename="my-table.csv" />\n}`
  return <><div className="maker-layout"><section className="maker-panel" aria-label="Table configuration"><div className="maker-panel-head"><div><span>01 / CONFIGURE</span><h2>Your table, your rules.</h2></div><button onClick={reset} className="maker-reset"><RotateCcw size={14}/> Reset</button></div>
      <div className="maker-group"><h3>General</h3><label>Table title<input aria-label="Table title" value={title} onChange={e => setTitle(e.target.value)}/></label><div className="maker-field-row"><label>Sample rows<select aria-label="Sample rows" value={count} onChange={e => changeCount(Number(e.target.value))}>{[25,120,500,2000].map(n => <option key={n}>{n}</option>)}</select></label><label>Grid height<select aria-label="Maker grid height" value={height} onChange={e => setHeight(Number(e.target.value))}>{[320,480,620,760].map(n => <option key={n}>{n}</option>)}</select></label></div><div className="maker-field-row"><label>Currency<select aria-label="Maker currency" value={currency} onChange={e => setCurrency(e.target.value)}>{['TRY','USD','EUR','GBP'].map(n => <option key={n}>{n}</option>)}</select></label><label>Time format<select aria-label="Maker time format" value={format} onChange={e => setFormat(e.target.value as TimestampFormat)}>{(['R','t','T','d','D','f','F','s','S'] as const).map(n => <option key={n}>{n}</option>)}</select></label></div><label className="maker-check"><input type="checkbox" checked={editable} onChange={e => setEditable(e.target.checked)}/> Allow inline editing</label><label className="maker-check"><input type="checkbox" checked={pagination} onChange={e => setPagination(e.target.checked)}/> Enable pagination</label>{pagination && <label>Initial page size<select aria-label="Initial page size" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>{[25,50,100,250].map(n => <option key={n}>{n}</option>)}</select></label>}</div>
      <div className="maker-group"><h3>Columns <small>{selected.length} selected</small></h3><p>Turn types on or off. Rename and resize each selected column.</p><div className="maker-column-list">{typeCatalog.map(type => <div className="maker-column" key={type.slug}><label className="maker-check"><input type="checkbox" aria-label={`Add ${type.name} column`} checked={selected.includes(type.slug)} onChange={() => toggle(type.slug)}/><span>{type.name}</span><code>{type.kind}</code></label>{selected.includes(type.slug) && <div className="maker-column-settings"><input aria-label={`${type.name} label`} placeholder="Column label" value={labels[type.slug] ?? showcaseColumns().find(c => c.key === type.slug)?.title ?? ''} onChange={e => setLabels(current => ({...current,[type.slug]:e.target.value}))}/><input aria-label={`${type.name} width`} type="number" min={80} max={400} step={10} value={widths[type.slug] ?? showcaseColumns().find(c => c.key === type.slug)?.width ?? 150} onChange={e => setWidths(current => ({...current,[type.slug]: Math.max(80, Math.min(400,Number(e.target.value))) }))}/></div>}</div>)}</div></div>
    </section><div className="maker-stage"><div className="maker-stage-head"><span>02 / LIVE PREVIEW</span><strong>{columns.length} columns · {count} records</strong></div><EnterpriseGrid key={`${pagination}-${pageSize}`} title={title} data={rows} onDataChange={editable ? setRows : undefined} columns={columns} height={height} pagination={pagination ? {initialPageSize:pageSize,pageSizeOptions:[25,50,100,250]} : false} filename="my-table.csv"/><div className="maker-snippet-head"><span>03 / YOUR REACT SNIPPET</span><span>Copy into a client component <ArrowRight size={13}/></span></div><CodePanel code={snippet}/></div></div>
  </>
}
