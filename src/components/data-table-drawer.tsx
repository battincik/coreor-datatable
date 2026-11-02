'use client'

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { EnterpriseGrid, type EnterpriseGridProps, type GridColumn, type GridPaginationOptions } from '@/components/enterprise-grid'
import type { GridCellKind } from '@/components/grid-cell-types'

export type DataTableDrawerColumn<T> = {
  id: string
  header: ReactNode
  title?: string
  width?: number
  minWidth?: number
  align?: 'start' | 'center' | 'end'
  /** Raw value used by Coreor DataTable for sorting, global search and export. */
  value?: (row: T) => unknown
  sortValue?: (row: T) => string | number | null | undefined
  filter?: {
    type: 'text' | 'number' | 'date' | 'multi'
    value: (row: T) => string | number | string[] | null | undefined
    options?: { label: string; value: string }[]
  }
  kind?: GridCellKind
  render: (row: T, index: number) => ReactNode
}

export type DataTableDrawerTab = {
  id: string
  label: string
  icon?: ReactNode
  count?: number
  content: ReactNode
}

export type DataTableDrawerProps<T> = {
  storageKey: string
  persistState?: boolean
  title: ReactNode
  headerActions?: ReactNode
  toolbar?: ReactNode
  searchText?: (row: T) => string
  searchPlaceholder?: string
  rowLabel?: string
  columns: DataTableDrawerColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  selectedRowKey?: string
  onRowClick?: (row: T) => void
  loading?: boolean
  empty?: ReactNode
  footer?: ReactNode
  height?: number
  pagination?: GridPaginationOptions | false
  filename?: string
  drawer?: {
    open: boolean
    onClose: () => void
    eyebrow?: ReactNode
    title: ReactNode
    subtitle?: ReactNode
    avatar?: ReactNode
    actions?: ReactNode
    tabs: DataTableDrawerTab[]
    defaultTab?: string
  }
}

type DrawerGridRow<T> = {
  id: string
  __source: T
  __index: number
} & Record<string, unknown>

const DEFAULT_DRAWER_WIDTH = 620
const MIN_DRAWER_WIDTH = 420

const kindForColumn = <T,>(column: DataTableDrawerColumn<T>): GridCellKind => {
  if (column.kind) return column.kind
  if (!column.filter) return 'text'
  if (column.filter.type === 'number') return 'number'
  if (column.filter.type === 'date') return 'date'
  if (column.filter.type === 'multi') return 'select'
  return 'text'
}

const plainTitle = (title: ReactNode, fallback: string) => typeof title === 'string' ? title : fallback

export function DataTableDrawer<T>({
  storageKey,
  persistState = true,
  title,
  headerActions,
  toolbar,
  searchText,
  rowLabel = 'kayıt',
  columns,
  rows,
  rowKey,
  selectedRowKey,
  onRowClick,
  loading,
  empty = 'Kayıt bulunamadı.',
  footer,
  height = 520,
  pagination = false,
  filename = 'export.csv',
  drawer,
}: DataTableDrawerProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [drawerWidth, setDrawerWidth] = useState(() => {
    if (typeof window === 'undefined' || !persistState) return DEFAULT_DRAWER_WIDTH
    const stored = Number(window.localStorage.getItem(`${storageKey}:width`))
    return Number.isFinite(stored) && stored >= MIN_DRAWER_WIDTH ? stored : DEFAULT_DRAWER_WIDTH
  })
  const [fullWidth, setFullWidth] = useState(() => {
    if (typeof window === 'undefined' || !persistState) return false
    return window.localStorage.getItem(`${storageKey}:full-width`) === 'true'
  })
  const [activeTab, setActiveTab] = useState(drawer?.defaultTab || drawer?.tabs[0]?.id || '')
  const requestedTab = drawer?.defaultTab || drawer?.tabs[0]?.id || ''
  const effectiveActiveTab = drawer?.tabs.some(tab => tab.id === activeTab) ? activeTab : requestedTab

  const data = useMemo<DrawerGridRow<T>[]>(() => rows.map((row, index) => {
    const normalized: DrawerGridRow<T> = { id: rowKey(row), __source: row, __index: index }
    for (const column of columns) {
      const explicit = column.value?.(row)
      const filtered = column.filter?.value(row)
      const sorted = column.sortValue?.(row)
      const searchable = searchText?.(row)
      normalized[column.id] = explicit ?? filtered ?? sorted ?? searchable ?? ''
    }
    return normalized
  }), [columns, rowKey, rows, searchText])

  const gridColumns = useMemo<GridColumn<DrawerGridRow<T>>[]>(() => columns.map(column => ({
    key: column.id,
    title: column.title || (typeof column.header === 'string' ? column.header : column.id),
    width: column.width,
    kind: kindForColumn(column),
    options: column.filter?.type === 'multi' ? column.filter.options?.map(option => option.value) : undefined,
    render: (_value, gridRow) => {
      const selected = selectedRowKey === gridRow.id
      const activate = () => onRowClick?.(gridRow.__source)
      const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!onRowClick || (event.key !== 'Enter' && event.key !== ' ')) return
        event.preventDefault()
        activate()
      }
      return <div
        role={onRowClick ? 'button' : undefined}
        tabIndex={onRowClick ? 0 : undefined}
        onClick={activate}
        onKeyDown={onKeyDown}
        style={{
          width: '100%', minWidth: 0, minHeight: '100%', display: 'flex', alignItems: 'center',
          justifyContent: column.align === 'end' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start',
          borderRadius: 5, outline: 'none', cursor: onRowClick ? 'pointer' : undefined,
          background: selected ? 'rgba(255,255,255,.055)' : undefined,
        }}
      >{column.render(gridRow.__source, gridRow.__index)}</div>
    },
  })), [columns, onRowClick, selectedRowKey])

  const startDrawerResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (fullWidth) return
    event.preventDefault()
    const rect = rootRef.current?.getBoundingClientRect()
    const right = rect?.right ?? window.innerWidth
    const rootWidth = rect?.width ?? window.innerWidth
    const maxWidth = Math.max(MIN_DRAWER_WIDTH, rootWidth - 280)
    const move = (pointerEvent: PointerEvent) => setDrawerWidth(Math.min(maxWidth, Math.max(MIN_DRAWER_WIDTH, right - pointerEvent.clientX)))
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
      document.body.style.removeProperty('cursor')
      document.body.style.removeProperty('user-select')
      if (persistState) {
        const width = rootRef.current?.querySelector<HTMLElement>('[data-coreor-drawer]')?.offsetWidth
        if (width) window.localStorage.setItem(`${storageKey}:width`, String(width))
      }
    }
    document.body.style.setProperty('cursor', 'col-resize')
    document.body.style.setProperty('user-select', 'none')
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  const toggleFullWidth = () => setFullWidth(current => {
    const next = !current
    if (persistState) window.localStorage.setItem(`${storageKey}:full-width`, String(next))
    return next
  })

  const gridProps: Pick<EnterpriseGridProps<DrawerGridRow<T>>, 'data' | 'columns' | 'title' | 'loading' | 'height' | 'pagination' | 'filename'> = {
    data,
    columns: gridColumns,
    title: plainTitle(title, rowLabel),
    loading,
    height,
    pagination,
    filename,
  }

  return <div ref={rootRef} style={{ position: 'relative', minHeight: 0, height: '100%', overflow: 'hidden', background: '#050505' }}>
    <section style={{ display: 'flex', minWidth: 0, height: '100%', flexDirection: 'column' }} aria-hidden={drawer?.open && fullWidth}>
      <div style={{ display: 'flex', minHeight: 48, alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '0 18px', borderBottom: '1px solid rgba(255,255,255,.09)', background: '#070707' }}>
        <div style={{ minWidth: 0 }}>{title}</div>
        {headerActions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{headerActions}</div>}
      </div>
      {toolbar && <div style={{ display: 'flex', minHeight: 42, alignItems: 'center', gap: 8, padding: '5px 12px', borderBottom: '1px solid rgba(255,255,255,.08)', background: '#090a0c' }}>{toolbar}</div>}
      <div className="coreor-datatable-drawer-grid" style={{ minHeight: 0, flex: 1, overflow: 'auto' }}>
        <style>{`.coreor-datatable-drawer-grid>.enterprise-grid>.grid-title{display:none}.coreor-datatable-drawer-grid>.enterprise-grid{min-height:100%;background:#050505}.coreor-datatable-drawer-grid .grid-shell{border-radius:0;border-left:0;border-right:0}`}</style>
        <EnterpriseGrid {...gridProps} />
      </div>
      {loading && rows.length === 0 ? <div style={{ padding: 18, color: '#7b818d', fontSize: 12 }}>Kayıtlar yükleniyor…</div> : null}
      {!loading && rows.length === 0 ? <div style={{ padding: 18, color: '#7b818d', fontSize: 12 }}>{empty}</div> : null}
      {footer && <footer style={{ minHeight: 44, borderTop: '1px solid rgba(255,255,255,.08)', background: '#0b0b0b' }}>{footer}</footer>}
    </section>

    {drawer?.open && <aside
      data-coreor-drawer
      aria-label="Kayıt detayları"
      style={{
        position: 'absolute', inset: '0 0 0 auto', zIndex: 20, display: 'flex', width: fullWidth ? '100%' : drawerWidth,
        maxWidth: '100%', minWidth: `min(${MIN_DRAWER_WIDTH}px, 100%)`, flexDirection: 'column',
        borderLeft: fullWidth ? 0 : '1px solid rgba(255,255,255,.12)', background: '#070707', boxShadow: '-18px 0 42px rgba(0,0,0,.34)',
      }}
    >
      {!fullWidth && <div onPointerDown={startDrawerResize} aria-hidden="true" style={{ position: 'absolute', inset: '0 auto 0 -5px', zIndex: 4, width: 10, cursor: 'col-resize' }} />}
      <header style={{ display: 'flex', minHeight: 48, alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,.09)' }}>
        <div style={{ minWidth: 0, overflow: 'hidden', color: '#7f8490', fontSize: 12, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drawer.eyebrow}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <button type="button" onClick={toggleFullWidth} title={fullWidth ? 'Bölünmüş görünüme dön' : 'Tam genişlikte aç'} style={{ display: 'inline-flex', height: 30, alignItems: 'center', gap: 7, border: 0, borderRadius: 5, background: 'transparent', padding: '0 8px', color: '#868b96', cursor: 'pointer' }}>
            {fullWidth ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}<span style={{ fontSize: 11 }}>{fullWidth ? 'Daralt' : 'Genişlet'}</span>
          </button>
          <button type="button" onClick={drawer.onClose} title="Paneli kapat" style={{ display: 'grid', width: 30, height: 30, placeItems: 'center', border: 0, borderRadius: 5, background: 'transparent', color: '#868b96', cursor: 'pointer' }}><X size={17}/></button>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: drawer.avatar ? 'auto minmax(0,1fr)' : 'minmax(0,1fr)', alignItems: 'center', columnGap: 16, rowGap: 16, minHeight: 132, padding: '20px 18px', borderBottom: '1px solid rgba(255,255,255,.09)' }}>
        {drawer.avatar && <div style={{ display: 'grid', width: 54, height: 54, placeItems: 'center', border: '1px solid rgba(117,148,255,.35)', borderRadius: 10, background: '#111319', color: '#fff', fontSize: 17, fontWeight: 700 }}>{drawer.avatar}</div>}
        <div style={{ minWidth: 0 }}><h2 style={{ overflow: 'hidden', margin: 0, color: '#f2f3f7', fontSize: 19, letterSpacing: '-.025em', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drawer.title}</h2>{drawer.subtitle && <p style={{ overflow: 'hidden', margin: '6px 0 0', color: '#858a95', fontSize: 12, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drawer.subtitle}</p>}</div>
        {drawer.actions && <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 6 }}>{drawer.actions}</div>}
      </div>
      <nav aria-label="Detay sekmeleri" style={{ display: 'flex', minHeight: 49, alignItems: 'stretch', gap: 2, overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,.1)', padding: '0 12px', background: '#0a0a0a' }}>
        {drawer.tabs.map(tab => {
          const active = effectiveActiveTab === tab.id
          return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{ position: 'relative', display: 'inline-flex', flex: '0 0 auto', alignItems: 'center', gap: 7, border: 0, borderBottom: active ? '2px solid #86a6ff' : '2px solid transparent', background: 'transparent', padding: '0 10px', color: active ? '#fff' : '#777d88', fontSize: 12, cursor: 'pointer' }}>
            {tab.icon}{tab.label}{typeof tab.count === 'number' && <b style={{ minWidth: 17, borderRadius: 9, background: 'rgba(255,255,255,.08)', padding: '1px 5px', color: '#aeb3bd', fontSize: 10 }}>{tab.count}</b>}
          </button>
        })}
      </nav>
      <div style={{ minHeight: 0, flex: 1, overflow: 'auto', padding: '12px 14px' }}>{drawer.tabs.find(tab => tab.id === effectiveActiveTab)?.content}</div>
    </aside>}
  </div>
}
