export type TrendValue = { points: number[]; change?: number }

export function trendPoints(value: unknown): number[] {
  const source = Array.isArray(value) ? value : value && typeof value === 'object' && 'points' in value ? (value as TrendValue).points : []
  return Array.isArray(source) ? source.map(Number).filter(Number.isFinite) : []
}

export function trendChange(value: unknown): number | null {
  if (value && typeof value === 'object' && 'change' in value && Number.isFinite((value as TrendValue).change)) return (value as TrendValue).change!
  const points = trendPoints(value)
  if (points.length < 2 || points[0] === 0) return null
  return (points.at(-1)! - points[0]) / Math.abs(points[0]) * 100
}

export function formatDuration(value: number, locale = 'tr-TR'): string {
  if (!Number.isFinite(value)) return String(value)
  const seconds = Math.round(Math.abs(value))
  const units = locale.startsWith('tr') ? ['g', 'sa', 'dk', 'sn'] : ['d', 'h', 'm', 's']
  const parts = [Math.floor(seconds / 86400), Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60]
  const start = Math.max(0, parts.findIndex((part, index) => part > 0 && index < 3))
  const result = parts.slice(start).map((part, offset) => part ? `${part} ${units[start + offset]}` : '').filter(Boolean).slice(0, 2).join(' ') || `0 ${units[3]}`
  return `${value < 0 ? '−' : ''}${result}`
}

export function formatFileSize(value: number, locale = 'tr-TR'): string {
  if (!Number.isFinite(value)) return String(value)
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const rank = Math.min(units.length - 1, value ? Math.max(0, Math.floor(Math.log(Math.abs(value)) / Math.log(1000))) : 0)
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: rank ? 1 : 0 }).format(value / 1000 ** rank)} ${units[rank]}`
}

export function safeUrl(value: unknown): URL | null {
  try { const url = new URL(String(value)); return ['http:', 'https:'].includes(url.protocol) ? url : null }
  catch { return null }
}

export const validHexColor = (value: string) => /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)
