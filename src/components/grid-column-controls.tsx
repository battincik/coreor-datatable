import { useState } from 'react'
import type { GridColumn } from '@/components/enterprise-grid'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown } from 'lucide-react'

import { type NumberFilter, type DateFilter, type ChoiceFilter } from '@/components/grid-filter-utils'
import { safeUrl, trendPoints, validHexColor } from '@/components/grid-value-utils'

const isChoice = (value: unknown): value is ChoiceFilter => typeof value === 'object' && value !== null && 'values' in value

type FilterProps<T> = { column: GridColumn<T>; value: unknown; choices?: string[]; onChange: (value: unknown) => void }

export function GridColumnFilter<T>({ column, value, choices = [], onChange }: FilterProps<T>) {
  const [numericOp, setNumericOp] = useState<NumberFilter['op']>('between')
  const { kind, title } = column
  if (kind === 'boolean') return <select className="grid-boolean-filter" aria-label={`${title} boolean filtresi`} value={value === true ? 'true' : value === false ? 'false' : ''} onChange={event => onChange(event.target.value === '' ? undefined : event.target.value === 'true')}><option value="">All</option><option value="true">Yes</option><option value="false">No</option></select>
  if (kind === 'select' || kind === 'status' || kind === 'country' || kind === 'tags' || kind === 'color') {
    const selected = Array.isArray(value) ? value.map(String) : isChoice(value) ? value.values : []
    const mode = isChoice(value) ? value.mode ?? 'any' : 'any'
    return <Popover><PopoverTrigger asChild><button className="select-filter" aria-label={`${title} filtrele`}>{selected.length ? `${selected.length} selected` : 'All'} <ChevronDown size={12}/></button></PopoverTrigger><PopoverContent align="start" className="w-48 p-2"><div className="filter-options">{choices.map(option => <label key={option}><Checkbox checked={selected.includes(option)} onCheckedChange={() => { const next = selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option]; onChange(next.length ? { values: next, mode } : undefined) }}/>{kind === 'color' && validHexColor(option) && <span className="grid-color-swatch" style={{ backgroundColor: option }}/ >}{column.cellOptions?.statusOptions?.[option]?.label ?? option}</label>)}</div>{kind === 'tags' && <label className="filter-mode">Match <select aria-label={`${title} eşleşme türü`} value={mode} onChange={event => onChange(selected.length ? { values: selected, mode: event.target.value } : undefined)}><option value="any">Any tag</option><option value="all">All tags</option></select></label>}<button className="clear-filter" onClick={() => onChange(undefined)}>Clear filter</button></PopoverContent></Popover>
  }
  if (kind === 'number' || kind === 'price' || kind === 'progress' || kind === 'duration' || kind === 'fileSize' || kind === 'rating' || kind === 'trend') {
    const current = (value ?? {}) as NumberFilter
    const op = current.op ?? numericOp
    const updateNumber = (part: 'value' | 'min' | 'max', text: string) => {
      const next = { ...current, op, [part]: text === '' ? undefined : Number(text) }
      onChange(op === 'between' ? next.min == null && next.max == null ? undefined : next : next.value == null ? undefined : next)
    }
    return <div className="number-filter" title={kind === 'duration' ? 'Values in seconds' : kind === 'fileSize' ? 'Values in bytes' : kind === 'trend' ? 'Values in percent change' : undefined}><select aria-label={`${title} karşılaştırma`} value={op} onChange={event => { setNumericOp(event.target.value as NumberFilter['op']); onChange(undefined) }}><option value="between">Range</option><option value=">">&gt;</option><option value="<">&lt;</option><option value="=">=</option></select>{op === 'between' ? <><input aria-label={`${title} minimum`} type="number" placeholder="Min" value={current.min ?? ''} onChange={event => updateNumber('min', event.target.value)}/><input aria-label={`${title} maksimum`} type="number" placeholder="Max" value={current.max ?? ''} onChange={event => updateNumber('max', event.target.value)}/></> : <input aria-label={`${title} filtre değeri`} type="number" placeholder="Value" value={current.value ?? ''} onChange={event => updateNumber('value', event.target.value)}/>}</div>
  }
  if (kind === 'date' || kind === 'timestamp') {
    const current = (value ?? {}) as DateFilter
    return <Popover><PopoverTrigger asChild><button className="select-filter" aria-label={`${title} tarih filtresi`}>{current.from || current.to ? `${current.from ?? '…'} – ${current.to ?? '…'}` : 'Date range'} <ChevronDown size={12}/></button></PopoverTrigger><PopoverContent align="start" className="date-filter"><label>From<input type="date" aria-label={`${title} başlangıç`} value={current.from ?? ''} onChange={event => { const from = event.target.value || undefined; onChange(from || current.to ? { ...current, from } : undefined) }}/></label><label>To<input type="date" aria-label={`${title} bitiş`} value={current.to ?? ''} onChange={event => { const to = event.target.value || undefined; onChange(to || current.from ? { ...current, to } : undefined) }}/></label><button className="clear-filter" onClick={() => onChange(undefined)}>Clear dates</button></PopoverContent></Popover>
  }
  return <input aria-label={`${title} içinde ara`} placeholder="Contains" value={String(value ?? '')} onChange={event => onChange(event.target.value || undefined)}/>
}

type EditorProps<T> = { column: GridColumn<T>; row: T; value: T[keyof T]; onSave: (value: unknown) => void; onCancel: () => void; choices?: string[] }

function initialDraft(value: unknown, kind?: GridColumn<{id: string | number}>['kind']) {
  if (kind === 'tags') return Array.isArray(value) ? value.join(', ') : String(value ?? '')
  if (kind === 'trend') return trendPoints(value).join(', ')
  if (kind === 'date' && value instanceof Date) {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000)
    return local.toISOString().slice(0, 10)
  }
  if (kind === 'timestamp') {
    const date = value instanceof Date ? value : typeof value === 'number' ? new Date(value < 1e11 ? value * 1000 : value) : new Date(String(value))
    if (Number.isNaN(date.getTime())) return ''
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    return local.toISOString().slice(0, 16)
  }
  return String(value ?? '')
}

export function GridCellEditor<T>({ column, row, value, onSave, onCancel, choices = [] }: EditorProps<T>) {
  const [draft, setDraft] = useState(() => initialDraft(value, column.kind))
  const [sizeUnit, setSizeUnit] = useState<'B' | 'KB' | 'MB' | 'GB'>('B')
  const [error, setError] = useState('')
  const kind = column.kind
  const save = () => {
    let next: unknown = draft.trim()
    if (kind === 'number' || kind === 'price' || kind === 'progress' || kind === 'duration' || kind === 'fileSize' || kind === 'rating') {
      next = Number(draft)
      if (draft.trim() === '' || !Number.isFinite(next)) return setError('Enter a valid number')
      if (kind === 'progress' && ((next as number) < 0 || (next as number) > (column.cellOptions?.maximum ?? 100))) return setError('Value is outside the progress range')
      if ((kind === 'fileSize' || kind === 'duration') && (next as number) < 0) return setError('Value cannot be negative')
      if (kind === 'fileSize') next = Math.round((next as number) * ({ B: 1, KB: 1000, MB: 1_000_000, GB: 1_000_000_000 }[sizeUnit]))
      if (kind === 'rating' && ((next as number) < 0 || (next as number) > (column.cellOptions?.ratingMax ?? 5))) return setError('Rating is outside the allowed range')
      if (kind === 'rating' && column.cellOptions?.ratingStep && Math.abs((next as number) / column.cellOptions.ratingStep - Math.round((next as number) / column.cellOptions.ratingStep)) > 1e-8) return setError(`Rating must use ${column.cellOptions.ratingStep} steps`)
    }
    if (kind === 'boolean') next = draft === 'true'
    if (kind === 'url' && !safeUrl(next)) return setError('Only valid http(s) URLs are allowed')
    if (kind === 'color' && !validHexColor(String(next))) return setError('Use a HEX color such as #4A90E2')
    if (kind === 'trend') {
      const parts = draft.split(',').map(part => part.trim())
      const points = parts.map(Number)
      if (parts.length < 2 || parts.some(part => !part) || points.some(point => !Number.isFinite(point))) return setError('Enter at least two numbers separated by commas')
      next = { points }
    }
    if (kind === 'tags') next = draft.split(',').map(tag => tag.trim()).filter(Boolean)
    if (kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(next))) return setError('Invalid email address')
    if (kind === 'phone' && !/^\+?\d{7,15}$/.test(String(next).replace(/[\s().-]/g, ''))) return setError('Invalid phone number')
    if (kind === 'timestamp') {
      const date = new Date(draft)
      if (!draft || Number.isNaN(date.getTime())) return setError('Invalid date and time')
      next = typeof value === 'number' ? value < 1e11 ? Math.floor(date.getTime() / 1000) : date.getTime() : value instanceof Date ? date : date.toISOString()
    }
    if (kind === 'date' && (!draft || Number.isNaN(new Date(`${draft}T00:00:00`).getTime()))) return setError('Invalid date')
    const customError = column.validate?.(next, row)
    if (customError) return setError(customError)
    onSave(next)
  }
  const allChoices = [...new Set([...choices, ...(draft ? [draft] : [])])]
  return <div className="grid-editor" onKeyDown={event => { event.stopPropagation(); if (event.key === 'Escape') onCancel(); if (event.key === 'Enter' && !(event.target instanceof HTMLTextAreaElement)) { event.preventDefault(); save() } }}>
    {kind === 'boolean' || kind === 'select' || kind === 'status' || kind === 'country' ? <select autoFocus aria-label={`${column.title} düzenle`} value={draft} onChange={event => { setDraft(event.target.value); setError('') }}>{(kind === 'boolean' ? ['true', 'false'] : allChoices).map(choice => <option value={choice} key={choice}>{kind === 'boolean' ? choice === 'true' ? 'Yes' : 'No' : column.cellOptions?.statusOptions?.[choice]?.label ?? choice}</option>)}</select>
      : kind === 'progress' || kind === 'rating' ? <><input autoFocus type="range" aria-label={`${column.title} kaydırıcı`} min={0} max={kind === 'rating' ? column.cellOptions?.ratingMax ?? 5 : column.cellOptions?.maximum ?? 100} step={kind === 'rating' ? column.cellOptions?.ratingStep ?? 0.5 : 1} value={draft} onChange={event => setDraft(event.target.value)}/><input type="number" aria-label={`${column.title} düzenle`} min={0} max={kind === 'rating' ? column.cellOptions?.ratingMax ?? 5 : column.cellOptions?.maximum ?? 100} step={kind === 'rating' ? column.cellOptions?.ratingStep ?? 0.5 : 1} value={draft} onChange={event => setDraft(event.target.value)}/></>
      : <><input autoFocus aria-label={`${column.title} düzenle`} type={kind === 'date' ? 'date' : kind === 'timestamp' ? 'datetime-local' : kind === 'email' ? 'email' : kind === 'url' ? 'url' : kind === 'phone' ? 'tel' : ['number','price','duration','fileSize'].includes(kind ?? '') ? 'number' : 'text'} step={kind === 'price' || kind === 'fileSize' ? '0.01' : undefined} value={draft} placeholder={kind === 'tags' || kind === 'trend' ? 'value1, value2' : undefined} onChange={event => { setDraft(event.target.value); setError('') }}/>{kind === 'fileSize' && <select className="grid-size-unit" aria-label={`${column.title} birim`} value={sizeUnit} onChange={event => { const nextUnit = event.target.value as typeof sizeUnit; const factors = {B:1,KB:1000,MB:1_000_000,GB:1_000_000_000}; setDraft(String(Number(draft) * factors[sizeUnit] / factors[nextUnit])); setSizeUnit(nextUnit) }}>{['B','KB','MB','GB'].map(unit => <option key={unit}>{unit}</option>)}</select>}{kind === 'color' && <input className="grid-color-input" type="color" aria-label={`${column.title} renk seçici`} value={validHexColor(draft) && draft.length === 7 ? draft : '#000000'} onChange={event => setDraft(event.target.value)}/>}</>}
    <button type="button" aria-label="Değişikliği kaydet" onClick={save}>✓</button><button type="button" aria-label="Düzenlemeyi iptal et" onClick={onCancel}>×</button>{error && <span className="grid-editor-error" role="alert">{error}</span>}
  </div>
}
