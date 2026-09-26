import type { GridColumn, TrendValue } from '@/components/enterprise-grid'
import type { GridCellKind, TimestampFormat } from '@/components/grid-cell-types'

export type ShowcaseRow = {
  id: number; name: string; owner: string; seats: number; priority: string; due: string
  email: string; phone: string; progress: number; price: number; tags: string[]; status: string
  country: string; timestamp: string; enabled: boolean; website: string; duration: number
  fileSize: number; rating: number; color: string; trend: TrendValue
}

const names = ['Aster', 'Northstar', 'Orion', 'Clover', 'Horizon', 'Nimbus', 'Atlas', 'Ember', 'Solstice', 'Mariner', 'Willow', 'Signal']
const owners = ['Maya Chen', 'Arda Yılmaz', 'Nora Hayes', 'Leo Martin', 'Zeynep Kaya', 'Elena Rossi']
const colors = ['#9B8AFB', '#64C9A9', '#F3B970', '#F18A9E', '#8FB8F9']
const tagPool = ['Priority', 'API', 'Trial', 'Enterprise', 'Design', 'Growth']
const statusOptions = { active: { label: 'Active', tone: 'success' as const }, pending: { label: 'Pending', tone: 'warning' as const }, paused: { label: 'Paused', tone: 'neutral' as const }, blocked: { label: 'Blocked', tone: 'danger' as const } }

export function makeShowcaseRows(count = 2400): ShowcaseRow[] {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1, name: `${names[i % names.length]} ${['Studio', 'Labs', 'Systems', 'Group'][Math.floor(i / names.length) % 4]}`,
    owner: owners[(i * 5 + Math.floor(i / 17)) % owners.length], seats: 5 + (i * 37) % 960,
    priority: ['Low', 'Medium', 'High', 'Urgent'][(i * 7 + Math.floor(i / 8)) % 4],
    due: new Date(now + (i % 80 - 20) * 86400_000).toISOString().slice(0, 10),
    email: `team${i + 1}@example.com`, phone: `+90 555 ${String(100 + i % 899)} ${String(1000 + i % 8999)}`,
    progress: (i * 17) % 101, price: 99 + (i * 137) % 28_000,
    tags: tagPool.filter((_, index) => (i + index * 3) % 5 === 0).slice(0, 3),
    status: (['active', 'pending', 'paused', 'blocked'] as const)[(i * 13 + Math.floor(i / 9)) % 4],
    country: ['TR', 'DE', 'US', 'GB', 'FR'][i % 5],
    timestamp: new Date(now - (i % 180) * 3_600_000).toISOString(), enabled: i % 4 !== 0,
    website: `https://example.com/workspaces/${i + 1}`, duration: 120 + (i * 473) % 220_000,
    fileSize: 80_000 + (i * 19_473_281) % 4_000_000_000,
    rating: ((i * 7) % 11) / 2, color: colors[i % colors.length],
    trend: { points: Array.from({ length: 14 }, (_, day) => 45 + i % 25 + (i % 2 ? 2 : -1) * day + Math.sin(day + i) * 6) },
  }))
}

export const typeCatalog: { slug: keyof ShowcaseRow; kind: GridCellKind; name: string; description: string; raw: string; action: string }[] = [
  { slug:'name',kind:'text',name:'Text',description:'Searchable and editable text with a compact, readable cell.',raw:'string',action:'Try search and double-click to edit.' },
  { slug:'seats',kind:'number',name:'Number',description:'Numeric sorting, range filtering and totals.',raw:'number',action:'Set a minimum and maximum in the filter row.' },
  { slug:'priority',kind:'select',name:'Select',description:'Predefined values with multi-select filtering.',raw:'string',action:'Filter by two priorities, then edit a cell.' },
  { slug:'due',kind:'date',name:'Date',description:'Calendar date with an inclusive date-range filter.',raw:'YYYY-MM-DD',action:'Filter a date range in the column.' },
  { slug:'email',kind:'email',name:'Email',description:'Mail link with validation in the cell editor.',raw:'string',action:'Open the mail link or edit the address.' },
  { slug:'phone',kind:'phone',name:'Phone',description:'Click-to-call number with format-preserving editing.',raw:'string',action:'Click to call, then try editing the number.' },
  { slug:'progress',kind:'progress',name:'Progress',description:'Accessible meter with a bounded numeric editor.',raw:'number',action:'Double-click to move the slider.' },
  { slug:'price',kind:'price',name:'Price',description:'Localized currency with raw-number filtering and totals.',raw:'number',action:'Change currency above the table.' },
  { slug:'tags',kind:'tags',name:'Tags',description:'Multiple labels with any/all matching.',raw:'string[]',action:'Filter for any or all tags.' },
  { slug:'status',kind:'status',name:'Status',description:'Semantic colors backed by stable status codes.',raw:'string',action:'Filter statuses or edit one from the list.' },
  { slug:'country',kind:'country',name:'Country',description:'Flag and localized country name from ISO codes.',raw:'ISO country code',action:'Select one or more countries.' },
  { slug:'timestamp',kind:'timestamp',name:'Timestamp',description:'Nine Discord-style formats, relative refresh and exact-date tooltip.',raw:'ISO date / Unix time',action:'Switch formats and hover the timestamp.' },
  { slug:'enabled',kind:'boolean',name:'Boolean',description:'Three-state filter with a clear yes/no indicator.',raw:'boolean',action:'Filter yes or no, then change a value.' },
  { slug:'website',kind:'url',name:'URL',description:'Safe http(s) link displayed as a compact address.',raw:'string',action:'Open a URL or try an invalid edit.' },
  { slug:'duration',kind:'duration',name:'Duration',description:'Human-readable time stored and filtered in seconds.',raw:'seconds',action:'Use a seconds range, then edit a duration.' },
  { slug:'fileSize',kind:'fileSize',name:'File size',description:'Human-readable size stored and filtered in bytes.',raw:'bytes',action:'Edit a value in MB and inspect its CSV value.' },
  { slug:'rating',kind:'rating',name:'Rating',description:'Stars and score with configurable maximum and step.',raw:'number',action:'Drag the rating slider.' },
  { slug:'color',kind:'color',name:'Color',description:'HEX value with swatch, picker and multi-value filter.',raw:'HEX string',action:'Pick another color in the editor.' },
  { slug:'trend',kind:'trend',name:'Trend',description:'Tiny SVG chart with percentage change.',raw:'{ points: number[] }',action:'Filter by change percentage and edit the series.' },
]

export function showcaseColumns(format: TimestampFormat = 'R', currency = 'TRY'): GridColumn<ShowcaseRow>[] {
  return [
    { key:'name',title:'Workspace',kind:'text',width:200,editable:true },
    { key:'owner',title:'Owner',kind:'text',width:170,editable:true },
    { key:'status',title:'Status',kind:'status',width:130,editable:true,cellOptions:{statusOptions} },
    { key:'progress',title:'Progress',kind:'progress',width:160,editable:true,aggregate:'avg' },
    { key:'price',title:'Revenue',kind:'price',width:155,editable:true,aggregate:'sum',cellOptions:{currency,locale:'en-US'} },
    { key:'trend',title:'Trend',kind:'trend',width:175,editable:true },
    { key:'tags',title:'Tags',kind:'tags',width:165,editable:true,options:tagPool,cellOptions:{maxTags:2} },
    { key:'country',title:'Country',kind:'country',width:155,editable:true,options:['TR','DE','US','GB','FR'],cellOptions:{locale:'en-US'} },
    { key:'timestamp',title:'Last activity',kind:'timestamp',width:220,editable:true,cellOptions:{timestampFormat:format,relativeRefreshMs:60_000,locale:'en-US'} },
    { key:'enabled',title:'Enabled',kind:'boolean',width:120,editable:true },
    { key:'email',title:'Email',kind:'email',width:220,editable:true },
    { key:'phone',title:'Phone',kind:'phone',width:170,editable:true },
    { key:'website',title:'Website',kind:'url',width:215,editable:true },
    { key:'priority',title:'Priority',kind:'select',width:145,editable:true,options:['Low','Medium','High','Urgent'] },
    { key:'seats',title:'Seats',kind:'number',width:115,editable:true,aggregate:'sum' },
    { key:'due',title:'Due date',kind:'date',width:155,editable:true },
    { key:'duration',title:'Time spent',kind:'duration',width:155,editable:true,aggregate:'sum' },
    { key:'fileSize',title:'Storage',kind:'fileSize',width:165,editable:true,aggregate:'sum' },
    { key:'rating',title:'Rating',kind:'rating',width:155,editable:true,aggregate:'avg',cellOptions:{ratingMax:5,ratingStep:0.5} },
    { key:'color',title:'Color',kind:'color',width:135,editable:true,options:colors },
  ]
}
