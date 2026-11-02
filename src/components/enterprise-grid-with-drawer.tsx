import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { X } from 'lucide-react'
import { EnterpriseGrid, type EnterpriseGridProps, type GridColumn } from './enterprise-grid'
import { renderGridCell } from './grid-cell-types'

export type GridDrawerOptions<T> = {
  /** Drawer body. Receives the clicked row and a close callback. */
  render: (row: T, close: () => void) => ReactNode
  /** Optional accessible title shown in the drawer header. */
  title?: ReactNode | ((row: T) => ReactNode)
  /** Optional supporting text shown under the title. */
  description?: ReactNode | ((row: T) => ReactNode)
  /** Restrict drawer opening to specific columns. Defaults to every data column. */
  columns?: Array<keyof T & string>
  /** Drawer width. Defaults to 520px and remains responsive on small screens. */
  width?: number | string
  /** Called whenever a row is opened. */
  onOpen?: (row: T) => void
  /** Called when the drawer closes. */
  onClose?: () => void
}

export type EnterpriseGridWithDrawerProps<T extends { id: string | number }> = EnterpriseGridProps<T> & {
  drawer: GridDrawerOptions<T>
}

const interactiveSelector = 'a,button,input,select,textarea,[role="button"],[contenteditable="true"]'
const resolve = <T,>(value: ReactNode | ((row: T) => ReactNode) | undefined, row: T) => typeof value === 'function' ? value(row) : value

export function EnterpriseGridWithDrawer<T extends { id: string | number }>({ drawer, columns, ...gridProps }: EnterpriseGridWithDrawerProps<T>) {
  const [activeRow, setActiveRow] = useState<T | null>(null)
  const allowedColumns = useMemo(() => drawer.columns ? new Set<string>(drawer.columns) : null, [drawer.columns])

  const close = () => {
    setActiveRow(null)
    drawer.onClose?.()
  }

  const open = (row: T) => {
    setActiveRow(row)
    drawer.onOpen?.(row)
  }

  useEffect(() => {
    if (!activeRow) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [activeRow])

  const drawerColumns = useMemo<GridColumn<T>[]>(() => columns.map(column => {
    if (allowedColumns && !allowedColumns.has(column.key)) return column
    const renderOriginal = (value: T[keyof T], row: T) => column.render
      ? column.render(value, row)
      : column.format
        ? column.format(value, row)
        : renderGridCell(column.kind, value, column.cellOptions)

    const activate = (event: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>, row: T) => {
      const target = event.target as HTMLElement
      if (target.closest(interactiveSelector) && target !== event.currentTarget) return
      if ('key' in event && event.key !== 'Enter' && event.key !== ' ') return
      if ('key' in event) event.preventDefault()
      open(row)
    }

    return {
      ...column,
      render: (value, row) => <span
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={`Open details for ${String(row.id)}`}
        onClick={event => activate(event, row)}
        onKeyDown={event => activate(event, row)}
        style={{ display: 'block', width: '100%', minWidth: 0, cursor: 'pointer' }}
      >{renderOriginal(value, row)}</span>,
    }
  }), [columns, allowedColumns])

  const width = typeof drawer.width === 'number' ? `${drawer.width}px` : drawer.width ?? '520px'
  const overlayStyle: CSSProperties = { position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,.48)', backdropFilter: 'blur(2px)' }
  const panelStyle: CSSProperties = { position: 'fixed', zIndex: 81, top: 0, right: 0, bottom: 0, width: `min(${width}, 94vw)`, background: '#0b0b0c', borderLeft: '1px solid #27272a', boxShadow: '-24px 0 60px rgba(0,0,0,.38)', overflowY: 'auto', color: '#f4f4f5' }

  return <>
    <EnterpriseGrid {...gridProps} columns={drawerColumns}/>
    {activeRow && <>
      <button type="button" aria-label="Close details" onClick={close} style={overlayStyle}/>
      <aside role="dialog" aria-modal="true" aria-label="Row details" style={panelStyle}>
        <div style={{ position: 'sticky', top: 0, zIndex: 2, display: 'flex', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 22px', background: 'rgba(11,11,12,.96)', borderBottom: '1px solid #27272a', backdropFilter: 'blur(14px)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>{resolve(drawer.title, activeRow) ?? 'Details'}</div>
            {drawer.description && <div style={{ marginTop: 6, color: '#8f8f96', fontSize: 12, lineHeight: 1.45 }}>{resolve(drawer.description, activeRow)}</div>}
          </div>
          <button type="button" onClick={close} aria-label="Close drawer" style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, flex: '0 0 auto', border: '1px solid #2c2c30', borderRadius: 7, background: '#151517', color: '#b7b7bd', cursor: 'pointer' }}><X size={15}/></button>
        </div>
        {drawer.render(activeRow, close)}
      </aside>
    </>}
  </>
}
