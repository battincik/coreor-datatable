import type { GridColumn } from '@/components/enterprise-grid'
import { trendChange } from '@/components/grid-value-utils'

export type NumberFilter = { op: '>' | '<' | '=' | 'between'; value?: number; min?: number; max?: number }
export type DateFilter = { from?: string; to?: string }
export type ChoiceFilter = { values: string[]; mode?: 'any' | 'all' }

const isChoice = (value: unknown): value is ChoiceFilter => typeof value === 'object' && value !== null && 'values' in value

export function matchesColumnFilter(kind: GridColumn<{id: string | number}>['kind'], raw: unknown, filter: unknown): boolean {
  if (filter == null || filter === '') return true
  if (kind === 'boolean') return typeof raw === 'boolean' && raw === filter
  if (kind === 'select' || kind === 'status' || kind === 'country' || kind === 'tags' || kind === 'color') {
    const values = Array.isArray(filter) ? filter.map(String) : isChoice(filter) ? filter.values : []
    if (!values.length) return true
    const rawValues = Array.isArray(raw) ? raw.map(String) : [String(raw ?? '')]
    return kind === 'tags' && isChoice(filter) && filter.mode === 'all'
      ? values.every(item => rawValues.includes(item)) : values.some(item => rawValues.includes(item))
  }
  if (kind === 'number' || kind === 'price' || kind === 'progress' || kind === 'duration' || kind === 'fileSize' || kind === 'rating' || kind === 'trend') {
    const { op, value, min, max } = filter as NumberFilter
    const number = kind === 'trend' ? trendChange(raw) : Number(raw)
    if (raw == null || raw === '' || number == null || !Number.isFinite(number)) return false
    if (op === 'between') return (min == null || number >= min) && (max == null || number <= max)
    if (value == null) return true
    return op === '>' ? number > value : op === '<' ? number < value : number === value
  }
  if (kind === 'date' || kind === 'timestamp') {
    const { from, to } = filter as DateFilter
    if (!from && !to) return true
    const date = raw instanceof Date ? raw : typeof raw === 'number' ? new Date(raw < 1e11 ? raw * 1000 : raw) : kind === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(String(raw)) ? new Date(`${raw}T00:00:00`) : new Date(String(raw))
    if (Number.isNaN(date.getTime())) return false
    const fromMs = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity
    const toDate = to ? new Date(`${to}T00:00:00`) : null
    if (toDate) toDate.setDate(toDate.getDate() + 1)
    const toMs = toDate?.getTime() ?? Infinity
    return date.getTime() >= fromMs && date.getTime() < toMs
  }
  return String(raw ?? '').toLocaleLowerCase().includes(String(filter).toLocaleLowerCase())
}
