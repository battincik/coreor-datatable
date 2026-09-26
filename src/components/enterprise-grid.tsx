import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type ColumnPinningState, type PaginationState, type RowSelectionState, type SortingState, type VisibilityState } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, Clipboard, Columns3, Download, EyeOff, Filter, MoreHorizontal, Pin, Redo2, RotateCcw, Search, Trash2, Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { renderGridCell, type CellOptions, type GridCellKind } from '@/components/grid-cell-types'
import { GridCellEditor, GridColumnFilter } from '@/components/grid-column-controls'
import { matchesColumnFilter } from '@/components/grid-filter-utils'
import { trendChange, trendPoints } from '@/components/grid-value-utils'
export type { GridCellKind, TimestampFormat, StatusOption, TrendValue } from '@/components/grid-cell-types'

export type GridColumn<T> = {
  key: keyof T & string
  title: string
  width?: number
  kind?: GridCellKind
  options?: string[]
  editable?: boolean
  format?: (value: T[keyof T], row: T) => string
  /** Takes priority over format and the built-in cell renderer. Use for integration-specific UI. */
  render?: (value: T[keyof T], row: T) => ReactNode
  cellOptions?: CellOptions
  /** Return a message to block an invalid edit. */
  validate?: (value: unknown, row: T) => string | null | undefined
  aggregate?: 'sum' | 'avg'
}
export type GridQuery = { search: string; sorting: SortingState; filters: ColumnFiltersState; pageIndex: number; pageSize: number }
export type GridExportRequest = { scope: 'selected' | 'filtered'; query: GridQuery; selectedIds: string[]; columnKeys: string[]; filename: string }
export type GridPaginationOptions = {
  /** Omit state to let the grid manage pagination locally. */
  state?: PaginationState
  onChange?: (state: PaginationState) => void
  initialPageSize?: number
  pageSizeOptions?: number[]
}
export type EnterpriseGridProps<T extends { id: string | number }> = {
  data: T[]
  columns: GridColumn<T>[]
  title: string
  onDataChange?: (next: T[]) => void
  onQueryChange?: (query: GridQuery) => void
  serverMode?: boolean
  /** false disables pagination; otherwise client or server pagination follows serverMode. */
  pagination?: GridPaginationOptions | false
  totalRows?: number
  loading?: boolean
  height?: number
  filename?: string
  /** Server mode: export matching rows or selected IDs beyond the loaded page. Return a Blob or start the download yourself. */
  onExportRequest?: (request: GridExportRequest) => Blob | void | Promise<Blob | void>
}
type Density = 'compact' | 'standard' | 'comfortable'
const heights: Record<Density, number> = { compact: 33, standard: 41, comfortable: 53 }
const fmt = (value: number) => new Intl.NumberFormat('en-US', { notation: value >= 1e6 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value)
const csvCell = (value: unknown) => {
  let text = value == null ? '' : String(value)
  if (/^[\s]*[=+\-@\t\r]/.test(text)) text = "'" + text
  return '"' + text.replaceAll('"', '""') + '"'
}
const exportValue = (kind: GridCellKind | undefined, value: unknown) => kind === 'trend' ? JSON.stringify({ points: trendPoints(value), change: trendChange(value) }) : value
const download = (content: string, filename: string) => {
  const url = URL.createObjectURL(new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function EnterpriseGrid<T extends { id: string | number }>({ data, columns, title, onDataChange, onQueryChange, serverMode = false, pagination: paginationOptions, totalRows, loading, height = 460, filename = 'export.csv', onExportRequest }: EnterpriseGridProps<T>) {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [sorting, setSorting] = useState<SortingState>([])
  const [filters, setFilters] = useState<ColumnFiltersState>([])
  const [visible, setVisible] = useState<VisibilityState>({})
  const [pinning, setPinning] = useState<ColumnPinningState>({ left: ['select'] })
  const [selected, setSelected] = useState<RowSelectionState>({})
  const [density, setDensity] = useState<Density>('standard')
  const [showFilters, setShowFilters] = useState(false)
  const [activeCell, setActiveCell] = useState('A1')
  const [editing, setEditing] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const relativeRefreshMs = columns.reduce((minimum, col) => {
    if (col.kind !== 'timestamp' || col.cellOptions?.timestampFormat !== 'R') return minimum
    const value = col.cellOptions.relativeRefreshMs
    const interval = typeof value === 'number' && Number.isFinite(value) ? Math.max(1_000, Math.floor(value)) : 60_000
    return Math.min(minimum, interval)
  }, Infinity)
  useEffect(() => {
    if (!Number.isFinite(relativeRefreshMs)) return
    const refresh = () => { if (!document.hidden) setNow(Date.now()) }
    refresh()
    const timer = window.setInterval(refresh, relativeRefreshMs)
    document.addEventListener('visibilitychange', refresh)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh) }
  }, [relativeRefreshMs])
  const [history, setHistory] = useState<{ past: T[][]; future: T[][] }>({ past: [], future: [] })
  const paginationEnabled = paginationOptions !== false
  const options = paginationOptions || undefined
  const pageSizeOptions = options?.pageSizeOptions?.filter(size => Number.isInteger(size) && size > 0) ?? [25, 50, 100, 250, 500, 1000]
  const [internalPagination, setInternalPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: options?.initialPageSize ?? 100 })
  const pagination = options?.state ?? internalPagination
  const setPage = (next: PaginationState) => {
    if (!options?.state) setInternalPagination(next)
    options?.onChange?.(next)
    bodyRef.current?.scrollTo({ top: 0 })
  }
  const scrollRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const commitData = (next: T[]) => { if (!onDataChange) return; setHistory(h => ({ past: [...h.past.slice(-19), data], future: [] })); onDataChange(next) }
  const undo = () => { if (!history.past.length || !onDataChange) return; const previous = history.past.at(-1)!; setHistory(h => ({ past: h.past.slice(0,-1), future: [data,...h.future] })); onDataChange(previous) }
  const redo = () => { if (!history.future.length || !onDataChange) return; const next = history.future[0]; setHistory(h => ({ past: [...h.past,data], future: h.future.slice(1) })); onDataChange(next) }
  const definitions = useMemo<ColumnDef<T>[]>(() => [
    { id: 'select', size: 52, minSize: 52, maxSize: 52, enableHiding: false, enableSorting: false, header: ({ table }) => <Checkbox aria-label="Bu sayfadaki satırları seç" checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false} onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)} />, cell: ({ row }) => <Checkbox aria-label={`${row.index + 1}. satırı seç`} checked={row.getIsSelected()} onCheckedChange={v => row.toggleSelected(!!v)} /> },
    ...columns.map(col => ({ id: col.key, accessorKey: col.key, size: col.width ?? 170, minSize: 85, header: col.title,
      ...(col.kind === 'trend' ? { sortingFn: (a, b) => { const first = trendChange(a.original[col.key]) ?? -Infinity, second = trendChange(b.original[col.key]) ?? -Infinity; return first === second ? 0 : first > second ? 1 : -1 } } : col.kind === 'boolean' ? { sortingFn: (a, b) => Number(a.original[col.key]) - Number(b.original[col.key]) } : {}),
      filterFn: (row, id, filter: unknown) => matchesColumnFilter(col.kind, row.getValue(id), filter),
      cell: ({ row, getValue }) => { const value = getValue() as T[keyof T]; return col.render ? col.render(value, row.original) : col.format ? col.format(value, row.original) : renderGridCell(col.kind, value, col.cellOptions, now) }
    } as ColumnDef<T>))
  ], [columns, now])
  const table = useReactTable({ data, columns: definitions, getRowId: row => String(row.id), state: { sorting, columnFilters: filters, globalFilter: deferredSearch, columnVisibility: visible, columnPinning: pinning, rowSelection: selected, pagination }, onSortingChange: updater => { setSorting(updater); setPage({ ...pagination, pageIndex: 0 }) }, onColumnFiltersChange: updater => { setFilters(updater); setPage({ ...pagination, pageIndex: 0 }) }, onColumnVisibilityChange: setVisible, onColumnPinningChange: setPinning, onRowSelectionChange: setSelected, onPaginationChange: updater => setPage(typeof updater === 'function' ? updater(pagination) : updater), getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(), manualSorting: serverMode, manualFiltering: serverMode, manualPagination: serverMode || !paginationEnabled, rowCount: serverMode ? totalRows ?? data.length : undefined, autoResetPageIndex: false, globalFilterFn: (row, _id, value) => columns.some(col => String(row.original[col.key] ?? '').toLocaleLowerCase().includes(String(value).toLocaleLowerCase())), enableRowSelection: true, columnResizeMode: 'onChange' })
  const rows = table.getRowModel().rows
  const filteredRows = table.getPrePaginationRowModel().rows
  const pageCount = paginationEnabled ? Math.max(1, table.getPageCount()) : 1
  const pageIndex = Math.min(pagination.pageIndex, pageCount - 1)
  const virtualizer = useVirtualizer({ count: rows.length, getScrollElement: () => bodyRef.current, estimateSize: () => heights[density], overscan: 8 })
  const queryCallback = useRef(onQueryChange)
  queryCallback.current = onQueryChange
  useEffect(() => { queryCallback.current?.({ search: deferredSearch, sorting, filters, pageIndex, pageSize: pagination.pageSize }) }, [deferredSearch, sorting, filters, pageIndex, pagination.pageSize])
  useEffect(() => { virtualizer.measure() }, [density, virtualizer])
  const setPageRef = useRef(setPage)
  setPageRef.current = setPage
  useEffect(() => { if (paginationEnabled && pagination.pageIndex >= pageCount) setPageRef.current({ pageIndex: pageCount - 1, pageSize: pagination.pageSize }) }, [pageCount, pagination.pageIndex, pagination.pageSize, paginationEnabled])
  const visibleCols = table.getVisibleLeafColumns()
  const selectedIds = Object.keys(selected).filter(id => selected[id])
  const selectedCount = selectedIds.length
  const selectedLoaded = data.filter(row => selected[String(row.id)])
  const choicesByKey = useMemo(() => Object.fromEntries(columns.filter(column => ['select', 'status', 'country', 'tags', 'color'].includes(column.kind ?? '')).map(column => {
    if (column.options?.length) return [column.key, column.options]
    if (column.kind === 'status' && column.cellOptions?.statusOptions) return [column.key, Object.keys(column.cellOptions.statusOptions)]
    const values = data.flatMap(row => column.kind === 'tags' && Array.isArray(row[column.key]) ? row[column.key] as string[] : [String(row[column.key] ?? '')])
    return [column.key, [...new Set(values.filter(Boolean))].sort()]
  })) as Record<string, string[]>, [columns, data])
  const choiceValues = (column: GridColumn<T>) => choicesByKey[column.key] ?? []
  const total = serverMode ? totalRows ?? data.length : filteredRows.length
  const changeSearch = (value: string) => { setSearch(value); setPage({ ...pagination, pageIndex: 0 }) }
  const reset = () => { setSearch(''); setFilters([]); setSorting([]); setVisible({}); setPinning({ left: ['select'] }); setSelected({}); setDensity('standard'); setShowFilters(false); setPage({ ...pagination, pageIndex: 0 }); bodyRef.current?.scrollTo({ top: 0 }) }
  const makeCsv = async (scope: 'page' | 'selected' | 'filtered') => {
    if (exporting) return
    setExportError('')
    const cols = columns.filter(col => table.getColumn(col.key)?.getIsVisible())
    if (serverMode && scope !== 'page') {
      if (!onExportRequest) { setExportError('Server export is not configured'); return }
      setExporting(true)
      try {
        const result = await onExportRequest({ scope, selectedIds: scope === 'selected' ? selectedIds : [], columnKeys: cols.map(col => col.key), filename, query: { search: deferredSearch, sorting, filters, pageIndex, pageSize: pagination.pageSize } })
        if (result instanceof Blob) {
          const url = URL.createObjectURL(result)
          const link = document.createElement('a'); link.href = url; link.download = filename; link.click()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
      } catch (error) { setExportError(error instanceof Error ? error.message : 'Export failed') }
      finally { setExporting(false) }
      return
    }
    const chosen = scope === 'page' ? rows.map(row => row.original) : scope === 'selected' ? selectedLoaded : filteredRows.map(row => row.original)
    download([cols.map(col => csvCell(col.title)).join(','), ...chosen.map(row => cols.map(col => csvCell(exportValue(col.kind, row[col.key]))).join(','))].join('\r\n'), filename)
  }
  const copySelected = async () => { const cols = columns.filter(c => table.getColumn(c.key)?.getIsVisible()); await navigator.clipboard.writeText(selectedLoaded.map(row => cols.map(c => String(exportValue(c.kind, row[c.key]) ?? '')).join('\t')).join('\n')) }
  const updateCell = (row: T, col: GridColumn<T>, value: unknown) => { commitData(data.map(item => item.id === row.id ? { ...item, [col.key]: value } : item)); setEditing(null) }
  const gridTemplate = visibleCols.map(c => `${c.getSize()}px`).join(' ')
  const pinnedStyle = (columnId: string): CSSProperties => { const c = table.getColumn(columnId)!; return c.getIsPinned() === 'left' ? { position: 'sticky', left: c.getStart('left'), zIndex: 3, background: '#1c1c1e', boxShadow: '1px 0 #303033' } : {} }
  return <section className="enterprise-grid" aria-label={title}>
    <div className="grid-title"><div><h2>{title}</h2><span>INTERACTIVE DATA WORKSPACE</span></div><Button variant="outline" size="sm" onClick={reset}><RotateCcw size={14}/> Reset</Button></div>
    <div className="grid-shell">
      <div className="grid-toolbar">
        {selectedCount ? <><Button variant="ghost" size="icon" aria-label="Seçimi temizle" onClick={() => setSelected({})}><X size={16}/></Button><strong>{fmt(selectedCount)} selected across pages</strong><div className="toolbar-spacer"/><Button variant="ghost" size="sm" title={serverMode ? 'Only selected rows loaded on this page can be copied' : undefined} disabled={!selectedLoaded.length} onClick={() => void copySelected()}><Clipboard size={15}/> Copy {serverMode ? 'loaded' : 'selected'}</Button><Button variant="ghost" size="sm" title={serverMode && !onExportRequest ? 'Provide onExportRequest to export selected IDs from all pages' : undefined} disabled={exporting || (serverMode && !onExportRequest)} onClick={() => void makeCsv('selected')}><Download size={15}/> Export selected</Button><Button variant="ghost" size="sm" className="danger" disabled={!onDataChange || serverMode} onClick={() => { if (window.confirm(`${selectedCount} kayıt silinsin mi?`)) { commitData(data.filter(item => !selected[String(item.id)])); setSelected({}) } }}><Trash2 size={15}/> Delete</Button></> : <>
          <div className="search-box"><Search size={15}/><Input aria-label="Tüm alanlarda ara" placeholder="Search across all columns..." value={search} onChange={e => changeSearch(e.target.value)}/>{search && <button aria-label="Aramayı temizle" onClick={() => changeSearch('')}><X size={13}/></button>}</div><span className="row-count">{fmt(total)} rows{serverMode && totalRows == null ? ' loaded' : ''}</span><div className="toolbar-spacer"/>
          <Button variant="ghost" size="icon" aria-label="Geri al" disabled={!history.past.length} onClick={undo}><Undo2 size={15}/></Button><Button variant="ghost" size="icon" aria-label="Yinele" disabled={!history.future.length} onClick={redo}><Redo2 size={15}/></Button><span className="divider"/>
          <Button variant={showFilters ? 'secondary' : 'ghost'} size="sm" onClick={() => setShowFilters(v => !v)}><Filter size={15}/> Filter{filters.length > 0 && <span className="pill">{filters.length}</span>}</Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><Columns3 size={15}/> Columns</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52"><DropdownMenuLabel>Visible columns</DropdownMenuLabel><DropdownMenuSeparator/>{columns.map(c => <DropdownMenuCheckboxItem key={c.key} checked={table.getColumn(c.key)?.getIsVisible()} onCheckedChange={v => table.getColumn(c.key)?.toggleVisibility(!!v)}>{c.title}</DropdownMenuCheckboxItem>)}<DropdownMenuSeparator/><DropdownMenuItem onClick={() => setVisible({})}>Show all columns</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Satır yoğunluğu"><MoreHorizontal size={18}/></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-44"><DropdownMenuLabel>Row density</DropdownMenuLabel>{(['compact','standard','comfortable'] as const).map(d => <DropdownMenuItem key={d} onClick={() => setDensity(d)}>{density === d && <Check size={14}/>}<span className={density === d ? '' : 'indent'}>{d[0].toUpperCase()+d.slice(1)}</span></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
          {!serverMode && <Button variant="ghost" size="sm" onClick={() => setSelected(Object.fromEntries(filteredRows.map(row => [row.id, true])))} disabled={!filteredRows.length}>Select filtered</Button>}
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" disabled={exporting}><Download size={15}/> {exporting ? 'Exporting…' : 'Export'}</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => void makeCsv('page')}>Current page CSV</DropdownMenuItem><DropdownMenuItem disabled={serverMode && !onExportRequest} title={serverMode && !onExportRequest ? 'Provide onExportRequest to export all matching rows' : undefined} onClick={() => void makeCsv('filtered')}>All filtered results CSV</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </>}
      </div>
      {exportError && <div className="grid-export-error" role="alert">{exportError}</div>}
      <div ref={scrollRef} className="grid-horizontal">
        <div style={{ width: table.getTotalSize(), minWidth: '100%' }}>
          <div className="grid-header grid-row" style={{ gridTemplateColumns: gridTemplate }} role="row">{visibleCols.map(column => { const meta = columns.find(c => c.key === column.id); return <div key={column.id} className="grid-head-cell" style={pinnedStyle(column.id)} role="columnheader"><span className="head-label">{column.id === 'select' ? flexRender(column.columnDef.header, table.getHeaderGroups()[0].headers.find(h => h.column.id === 'select')!.getContext()) : meta?.title}</span>{meta && <DropdownMenu><DropdownMenuTrigger asChild><button className="head-menu" aria-label={`${meta.title} seçenekleri`}><ChevronDown size={14}/></button></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-48"><DropdownMenuItem onClick={() => column.toggleSorting(false)}><ArrowUp size={14}/> Sort ascending</DropdownMenuItem><DropdownMenuItem onClick={() => column.toggleSorting(true)}><ArrowDown size={14}/> Sort descending</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem onClick={() => setShowFilters(true)}><Filter size={14}/> Filter</DropdownMenuItem><DropdownMenuItem onClick={() => setPinning(p => ({ ...p, left: column.getIsPinned() ? ['select'] : ['select', column.id] }))}><Pin size={14}/> {column.getIsPinned() ? 'Unpin' : 'Pin'} column</DropdownMenuItem><DropdownMenuItem onClick={() => column.toggleVisibility(false)}><EyeOff size={14}/> Hide column</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}{meta && <div className="resize-handle" onMouseDown={table.getHeaderGroups()[0].headers.find(h => h.column.id === column.id)?.getResizeHandler()} onTouchStart={table.getHeaderGroups()[0].headers.find(h => h.column.id === column.id)?.getResizeHandler()} />}</div> })}</div>
          {showFilters && <div className="grid-filters grid-row" style={{ gridTemplateColumns: gridTemplate }} role="row">{visibleCols.map(column => { const meta = columns.find(c => c.key === column.id); return <div key={column.id} className="filter-cell" style={pinnedStyle(column.id)}>{meta && <GridColumnFilter column={meta} value={column.getFilterValue()} choices={choiceValues(meta)} onChange={next => column.setFilterValue(next)} />}</div> })}</div>}
          <div ref={bodyRef} className="grid-body" style={{ height }} role="rowgroup" aria-busy={loading}>{loading && <div className="loading-bar">Loading data…</div>}{!loading && rows.length === 0 && <div className="empty">No rows match these filters. <button onClick={reset}>Clear filters</button></div>}<div style={{ position: 'relative', height: virtualizer.getTotalSize() }}>{virtualizer.getVirtualItems().map(item => { const row = rows[item.index]; return <div key={row.id} className={`grid-data-row grid-row ${row.getIsSelected() ? 'is-selected' : ''}`} role="row" aria-rowindex={item.index+2} style={{ gridTemplateColumns: gridTemplate, height: heights[density], transform: `translateY(${item.start}px)` }}>{visibleCols.map((column, index) => { const meta = columns.find(c => c.key === column.id); const cell = row.getVisibleCells().find(c => c.column.id === column.id)!; const cellId = `${row.id}:${column.id}`; return <div key={column.id} className={`grid-cell ${['number', 'price', 'duration', 'fileSize', 'rating'].includes(meta?.kind ?? '') ? 'numeric' : ''}`} style={pinnedStyle(column.id)} role="gridcell" tabIndex={index === 1 ? 0 : -1} onFocus={() => setActiveCell(`${String.fromCharCode(65+index)}${item.index+1}`)} onDoubleClick={() => { if (meta?.editable && onDataChange) { setEditing(cellId) } }}>{editing === cellId && meta ? <GridCellEditor key={cellId} column={meta} row={row.original} value={row.original[meta.key]} choices={choiceValues(meta)} onSave={value => updateCell(row.original, meta, value)} onCancel={() => setEditing(null)}/>: flexRender(cell.column.columnDef.cell, cell.getContext())}</div> })}</div> })}</div></div>
          <div className="grid-summary grid-row" style={{ gridTemplateColumns: gridTemplate }}><div className="summary-cell" style={pinnedStyle('select')}></div>{visibleCols.slice(1).map((col,index) => { const meta = columns.find(c => c.key === col.id); const aggregate = meta?.aggregate && filteredRows.length ? filteredRows.reduce((sum,row) => sum + Number(row.original[meta.key] ?? 0),0) / (meta.aggregate === 'avg' ? filteredRows.length : 1) : null; return <div key={col.id} className="summary-cell" style={pinnedStyle(col.id)}>{index === 0 ? `${fmt(filteredRows.length)} rows` : aggregate != null ? <><span>{meta?.aggregate === 'avg' ? 'Avg' : 'Sum'}</span><strong>{meta && ['duration','fileSize','rating','price','progress'].includes(meta.kind ?? '') ? renderGridCell(meta.kind, aggregate, meta.cellOptions, now) : fmt(aggregate)}</strong></> : null}</div> })}</div>
        </div>
      </div>
      <div className="grid-status"><strong>{activeCell}</strong><span>Count <b>{selectedCount || 1}</b></span><span className="status-right">{loading ? 'Loading' : `${fmt(rows.length)} visible · ${density} · double-click to edit`}</span></div>
      {paginationEnabled && <div className="grid-pagination" aria-label="Sayfalama"><span className="pagination-range">{total ? pageIndex * pagination.pageSize + 1 : 0}–{Math.min((pageIndex + 1) * pagination.pageSize, total)} / {fmt(total)}</span><label>Rows per page <select aria-label="Sayfa başına satır" value={pagination.pageSize} onChange={e => setPage({pageIndex: 0, pageSize: Number(e.target.value)})}>{[...new Set([...pageSizeOptions, pagination.pageSize])].sort((a,b)=>a-b).map(size=><option key={size} value={size}>{size}</option>)}</select></label><span className="page-indicator">Page {pageIndex + 1} of {pageCount}</span><div className="page-buttons"><Button variant="ghost" size="icon" aria-label="İlk sayfa" disabled={pageIndex === 0 || loading} onClick={() => setPage({...pagination,pageIndex:0})}><ChevronsLeft size={16}/></Button><Button variant="ghost" size="icon" aria-label="Önceki sayfa" disabled={pageIndex === 0 || loading} onClick={() => setPage({...pagination,pageIndex:pageIndex-1})}><ChevronLeft size={16}/></Button><Button variant="ghost" size="icon" aria-label="Sonraki sayfa" disabled={pageIndex >= pageCount-1 || loading} onClick={() => setPage({...pagination,pageIndex:pageIndex+1})}><ChevronRight size={16}/></Button><Button variant="ghost" size="icon" aria-label="Son sayfa" disabled={pageIndex >= pageCount-1 || loading} onClick={() => setPage({...pagination,pageIndex:pageCount-1})}><ChevronsRight size={16}/></Button></div></div>}
    </div>
  </section>
}
