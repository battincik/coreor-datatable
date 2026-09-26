import { useMemo, useState } from 'react'
import type { GridColumn, GridExportRequest, GridQuery } from '@/components/enterprise-grid'
import type { TimestampFormat } from '@/components/grid-cell-types'
import { EnterpriseGrid } from '@/components/enterprise-grid'
import { invoiceColumns, inventoryColumns, makeInventory, makeInvoices, makeRenewals, renewalColumns } from '@/data/examples'
import { makeShowcaseRows, showcaseColumns, typeCatalog, type ShowcaseRow } from '@/data/showcase'
import { matchesColumnFilter } from '@/components/grid-filter-utils'
import { features, type FeatureSlug } from '@/showcase/catalog'
import { Database, SlidersHorizontal } from 'lucide-react'

export function DemoTable({ mode, focus, feature }: { mode:'all'|'type'|'feature'; focus?:string; feature?:FeatureSlug }) {
  const detail = features.find(item => item.slug === feature)
  const [rows, setRows] = useState(() => makeShowcaseRows(mode === 'all' ? 2400 : mode === 'type' ? 96 : detail?.count ?? 300))
  const [timestampFormat, setTimestampFormat] = useState<TimestampFormat>('R')
  const [currency, setCurrency] = useState('TRY')
  const [height, setHeight] = useState(mode === 'all' ? 560 : 440)
  const [paginate, setPaginate] = useState(true)
  const columns = useMemo(() => {
    const available = showcaseColumns(timestampFormat, currency)
    if (mode === 'all') return available
    const wanted = mode === 'type' ? ['name', focus, ...(focus === 'name' ? ['status','price'] : ['status','timestamp'])] : [...(detail?.keys ?? [])]
    return [...new Set(wanted)].map(key => available.find(col => col.key === key)).filter((col): col is GridColumn<ShowcaseRow> => !!col)
  }, [mode, focus, detail, timestampFormat, currency])
  const needsTime = mode === 'all' || focus === 'timestamp' || feature === 'timestamps'
  const needsCurrency = mode === 'all' || focus === 'price'
  return <>
    <div className="sc-controlbar"><div className="sc-control-title"><SlidersHorizontal size={16}/><div><strong>Live controls</strong><span>Changes apply while the grid is open.</span></div></div>
      {needsTime && <label>Time format <select aria-label="Timestamp format" value={timestampFormat} onChange={event => setTimestampFormat(event.target.value as TimestampFormat)}>{(['R','t','T','d','D','f','F','s','S'] as const).map(value => <option key={value} value={value}>{value} · {({R:'Relative',t:'Short time',T:'Time with seconds',d:'Short date',D:'Long date',f:'Date and time',F:'Full date and time',s:'Short date-time',S:'Date-time with seconds'})[value]}</option>)}</select></label>}
      {needsCurrency && <label>Currency <select aria-label="Currency" value={currency} onChange={event => setCurrency(event.target.value)}><option value="TRY">TRY ₺</option><option value="USD">USD $</option><option value="EUR">EUR €</option></select></label>}
      <label>Height <select aria-label="Grid height" value={height} onChange={event => setHeight(Number(event.target.value))}><option value={320}>320 px</option><option value={440}>440 px</option><option value={560}>560 px</option><option value={700}>700 px</option></select></label>
      <label className="sc-switch"><input type="checkbox" checked={paginate} onChange={event => setPaginate(event.target.checked)}/> Pagination</label>
    </div>
    <EnterpriseGrid title={mode === 'all' ? 'The complete workspace' : mode === 'type' ? `${typeCatalog.find(type => type.slug === focus)?.name} cells` : `${detail?.name} demo`} data={rows} onDataChange={setRows} columns={columns} height={height} pagination={paginate ? {initialPageSize:mode === 'type' ? 25 : 100,pageSizeOptions:[25,50,100,250,500]} : false} filename="showcase.csv"/>
  </>
}

export function ServerTable() {
  const [allRows] = useState(() => makeShowcaseRows(720))
  const [query, setQuery] = useState<GridQuery>({ search:'', sorting:[], filters:[], pageIndex:0, pageSize:25 })
  const [downloads, setDownloads] = useState(0)
  const columns = useMemo(() => showcaseColumns().filter(col => ['name','status','country','price','tags','enabled'].includes(col.key)), [])
  const result = useMemo(() => {
    let next = allRows.filter(row => columns.every(col => {
      const filter = query.filters.find(item => item.id === col.key)
      return !filter || matchesColumnFilter(col.kind, row[col.key], filter.value)
    }) && (!query.search || columns.some(col => String(row[col.key]).toLowerCase().includes(query.search.toLowerCase()))))
    if (query.sorting[0]) { const { id, desc } = query.sorting[0]; next = [...next].sort((a,b) => { const first = a[id as keyof ShowcaseRow], second = b[id as keyof ShowcaseRow]; const value = typeof first === 'number' && typeof second === 'number' ? first - second : String(first).localeCompare(String(second)); return desc ? -value : value }) }
    return next
  }, [allRows, columns, query])
  const visible = result.slice(query.pageIndex * query.pageSize, (query.pageIndex + 1) * query.pageSize)
  const exportRows = async (request: GridExportRequest) => {
    const chosen = request.scope === 'selected' ? allRows.filter(row => request.selectedIds.includes(String(row.id))) : result
    const keys = request.columnKeys.filter(key => columns.some(col => col.key === key))
    const safe = (value: unknown) => { let content = Array.isArray(value) ? value.join('; ') : String(value ?? ''); if (/^\s*[=+\-@\t\r]/.test(content)) content = `'${content}`; return `"${content.replaceAll('"','""')}"` }
    const csv = [keys.map(safe).join(','), ...chosen.map(row => keys.map(key => safe(row[key as keyof ShowcaseRow])).join(','))].join('\r\n')
    setDownloads(count => count + 1)
    return new Blob(['\uFEFF', csv], { type:'text/csv;charset=utf-8' })
  }
  return <><div className="sc-server-note"><Database size={16}/><span>Server-mode simulation · 720 records · only {visible.length} loaded in this page</span><span>{downloads} exports generated</span></div><EnterpriseGrid title="Remote customer pages" data={visible} columns={columns} serverMode totalRows={result.length} onQueryChange={next => setQuery(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)} onExportRequest={exportRows} pagination={{initialPageSize:25,pageSizeOptions:[25,50,100]}} filename="remote-customers.csv" height={460}/></>
}

export function PresetTable({ slug }: { slug:string }) {
  const [renewals,setRenewals] = useState(() => makeRenewals())
  const [inventory,setInventory] = useState(() => makeInventory())
  const [invoices,setInvoices] = useState(() => makeInvoices())
  return slug === 'renewals' ? <EnterpriseGrid title="Renewals" data={renewals} columns={renewalColumns} onDataChange={setRenewals} height={470} filename="renewals.csv"/> : slug === 'inventory' ? <EnterpriseGrid title="Inventory" data={inventory} columns={inventoryColumns} onDataChange={setInventory} height={470} filename="inventory.csv"/> : <EnterpriseGrid title="Invoices" data={invoices} columns={invoiceColumns} onDataChange={setInvoices} height={470} filename="invoices.csv"/>
}
