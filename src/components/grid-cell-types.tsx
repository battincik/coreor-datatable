import type { ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDuration, formatFileSize, safeUrl, trendChange, trendPoints, validHexColor } from '@/components/grid-value-utils'
export type { TrendValue } from '@/components/grid-value-utils'

export type TimestampFormat = 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 's' | 'S' | 'R'
export type GridCellKind = 'text' | 'number' | 'select' | 'date' | 'email' | 'phone' | 'progress' | 'price' | 'tags' | 'status' | 'country' | 'timestamp' | 'boolean' | 'url' | 'duration' | 'fileSize' | 'rating' | 'color' | 'trend'
export type StatusStyle = 'neutral' | 'success' | 'warning' | 'danger' | 'info'
export type StatusOption = { label: string; tone?: StatusStyle }
export type CellOptions = {
  locale?: string
  currency?: string
  maximum?: number
  timestampFormat?: TimestampFormat
  /** Relative timestamps only. Defaults to 60_000 ms; minimum 1_000 ms. */
  relativeRefreshMs?: number
  statusOptions?: Record<string, StatusOption>
  maxTags?: number
  ratingMax?: number
  ratingStep?: number
}

const dateOf = (value: unknown): Date | null => {
  const date = typeof value === 'number' ? new Date(value < 1e11 ? value * 1000 : value) : value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatTimestamp(value: unknown, format: TimestampFormat = 'f', locale = 'tr-TR', now = Date.now()): string {
  const date = dateOf(value)
  if (!date) return '—'
  const options: Intl.DateTimeFormatOptions = format === 't' ? { hour: '2-digit', minute: '2-digit' }
    : format === 'T' ? { hour: '2-digit', minute: '2-digit', second: '2-digit' }
    : format === 'd' ? { day: '2-digit', month: '2-digit', year: 'numeric' }
    : format === 'D' ? { day: 'numeric', month: 'long', year: 'numeric' }
    : format === 's' ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : format === 'S' ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }
    : format === 'F' ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  if (format !== 'R') return new Intl.DateTimeFormat(locale, options).format(date)
  const seconds = Math.round((date.getTime() - now) / 1000)
  const abs = Math.abs(seconds)
  const [amount, unit]: [number, Intl.RelativeTimeFormatUnit] = abs < 60 ? [seconds, 'second'] : abs < 3600 ? [Math.round(seconds / 60), 'minute'] : abs < 86400 ? [Math.round(seconds / 3600), 'hour'] : abs < 2592000 ? [Math.round(seconds / 86400), 'day'] : abs < 31536000 ? [Math.round(seconds / 2592000), 'month'] : [Math.round(seconds / 31536000), 'year']
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(amount, unit)
}

function countryFlag(code: string) {
  return /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map(char => char.charCodeAt(0) + 127397)) : ''
}

export function renderGridCell(kind: GridCellKind | undefined, value: unknown, options: CellOptions = {}, now = Date.now()): ReactNode {
  if (value == null || value === '') return <span className="grid-muted">—</span>
  const locale = options.locale ?? 'tr-TR'
  switch (kind) {
    case 'email': {
      const email = String(value).trim()
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? <a className="grid-link" href={`mailto:${email}`} onClick={event => event.stopPropagation()}>{email}</a> : email
    }
    case 'phone': {
      const phone = String(value).trim()
      const dial = phone.replace(/[\s().-]/g, '')
      return /^\+?\d{7,15}$/.test(dial) ? <a className="grid-link" href={`tel:${dial}`} onClick={event => event.stopPropagation()}>{phone}</a> : phone
    }
    case 'boolean': return <span className={`grid-bool ${value ? 'grid-bool-true' : 'grid-bool-false'}`} aria-label={value ? 'Yes' : 'No'}>{value ? '✓ Yes' : '× No'}</span>
    case 'url': {
      const url = safeUrl(value)
      return url ? <a className="grid-link" href={url.href} target="_blank" rel="noopener noreferrer" title={url.href} onClick={event => event.stopPropagation()}>{url.hostname}{url.pathname === '/' ? '' : url.pathname}</a> : String(value)
    }
    case 'duration': {
      const seconds = Number(value)
      return Number.isFinite(seconds) ? <span title={`${seconds} seconds`}>{formatDuration(seconds, locale)}</span> : String(value)
    }
    case 'fileSize': {
      const bytes = Number(value)
      return Number.isFinite(bytes) ? <span title={`${bytes} bytes`}>{formatFileSize(bytes, locale)}</span> : String(value)
    }
    case 'rating': {
      const score = Number(value)
      if (!Number.isFinite(score)) return String(value)
      const max = options.ratingMax && options.ratingMax > 0 ? options.ratingMax : 5
      const ratio = Math.max(0, Math.min(100, score / max * 100))
      return <span className="grid-rating" role="img" aria-label={`${score} of ${max}`}><span className="grid-stars" aria-hidden="true"><span>★★★★★</span><span className="grid-stars-fill" style={{ width: `${ratio}%` }}>★★★★★</span></span><span>{new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(score)}</span></span>
    }
    case 'color': {
      const color = String(value)
      return validHexColor(color) ? <span className="grid-color"><span className="grid-color-swatch" style={{ backgroundColor: color }}/>{color.toUpperCase()}</span> : color
    }
    case 'trend': {
      const points = trendPoints(value)
      if (!points.length) return <span className="grid-muted">—</span>
      const change = trendChange(value)
      const { low, high } = points.reduce((bounds, point) => ({ low: Math.min(bounds.low, point), high: Math.max(bounds.high, point) }), { low: Infinity, high: -Infinity })
      const range = high - low || 1
      const sample = points.length > 60 ? Array.from({ length: 60 }, (_, index) => points[Math.round(index * (points.length - 1) / 59)]) : points
      const path = sample.map((point, index) => `${index ? 'L' : 'M'}${(index / Math.max(1, sample.length - 1) * 88).toFixed(1)},${(24 - (point - low) / range * 21).toFixed(1)}`).join(' ')
      const tone = change == null ? 'neutral' : change >= 0 ? 'up' : 'down'
      return <span className={`grid-trend grid-trend-${tone}`} title={`${points.length} points${change == null ? '' : `, ${change.toFixed(1)}% change`}`}><svg width="90" height="28" viewBox="0 0 90 28" role="img" aria-label={`Trend: ${points.length} points`}><path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{change == null ? '—' : `${change >= 0 ? '+' : ''}${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(change)}%`}</span></span>
    }
    case 'progress': {
      const maximum = options.maximum && options.maximum > 0 ? options.maximum : 100
      const numeric = Number(value)
      if (!Number.isFinite(numeric)) return String(value)
      const percent = Math.max(0, Math.min(100, numeric / maximum * 100))
      return <span className="grid-progress"><span className="grid-progress-track" role="progressbar" aria-valuenow={Math.max(0, Math.min(maximum, numeric))} aria-valuemin={0} aria-valuemax={maximum}><span style={{ width: `${percent}%` }} /></span><span>{new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(percent)}%</span></span>
    }
    case 'price': {
      const numeric = Number(value)
      if (!Number.isFinite(numeric)) return String(value)
      try { return new Intl.NumberFormat(locale, { style: 'currency', currency: options.currency ?? 'TRY' }).format(numeric) }
      catch { return String(value) }
    }
    case 'tags': {
      const tags = Array.isArray(value) ? value.map(String) : [String(value)]
      const limit = Math.max(0, options.maxTags ?? 2)
      return <span className="grid-tags" title={tags.join(', ')}>{tags.slice(0, limit).map((tag, index) => <span className="grid-tag" key={`${tag}-${index}`}>{tag}</span>)}{tags.length > limit && <span className="grid-tag grid-tag-more">+{tags.length - limit}</span>}</span>
    }
    case 'status': {
      const status = options.statusOptions?.[String(value)]
      return <span className={`grid-status-badge grid-tone-${status?.tone ?? 'neutral'}`}>{status?.label ?? String(value)}</span>
    }
    case 'country': {
      const code = String(value).toUpperCase()
      let label = String(value)
      try { label = new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? label } catch { /* unknown region code */ }
      return <span className="grid-country">{countryFlag(code)} {label}</span>
    }
    case 'timestamp': {
      const date = dateOf(value)
      if (!date) return String(value)
      const exact = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'long' }).format(date)
      return <TooltipProvider delayDuration={200}><Tooltip><TooltipTrigger asChild><time tabIndex={0} className="grid-timestamp" dateTime={date.toISOString()}>{formatTimestamp(value, options.timestampFormat, locale, now)}</time></TooltipTrigger><TooltipContent side="top"><strong>{exact}</strong><span>UTC: {date.toISOString()}</span></TooltipContent></Tooltip></TooltipProvider>
    }
    default: return String(value)
  }
}
