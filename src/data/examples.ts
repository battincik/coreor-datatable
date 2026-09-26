import type { GridColumn, TrendValue } from '@/components/enterprise-grid'
import type { TimestampFormat } from '@/components/grid-cell-types'
export type Renewal = { id: number; account: string; owner: string; region: string; stage: string; seats: number; arr: number; health: number; renews: string }
export type Inventory = { id: number; sku: string; product: string; category: string; warehouse: string; stock: number; price: number; reorder: number }
export type Invoice = { id: number; invoice: string; customer: string; status: string; issued: string; due: string; amount: number }
const names = ['Willow','Crescent','Tidewater','Aspen','Sterling','Foxglove','Clearwater','Highland','Larkspur','Orchard','Halcyon','Nimbus','Acacia','Bluewater','Granite','Atlas','Solstice','Cedar','Horizon','Mariner']
const suffixes = ['Freight','Labs','Systems','Group','Health','Capital','Studio','Logistics']
const owners = ['Sofía Álvarez','Tyler Hayes','Priya Raman','Ava Mitchell','Emma Collins','Owen Park','Hannah Walsh','Grace Liu']
const regions = ['North America','Europe','Asia Pacific','Latin America']
const stages = ['Discovery','Proposal','Negotiation','Committed','Closed won']
const categories = ['Hardware','Accessories','Networking','Storage','Displays']
const warehouses = ['Ankara','Berlin','London','Austin']
export const renewalColumns: GridColumn<Renewal>[] = [
  { key:'account',title:'Account',width:218,editable:true },{key:'owner',title:'Owner',width:176,editable:true},
  {key:'region',title:'Region',kind:'select',options:regions,width:158,editable:true},{key:'stage',title:'Stage',kind:'select',options:stages,width:145,editable:true},
  {key:'seats',title:'Seats',kind:'number',width:114,aggregate:'sum',editable:true},{key:'arr',title:'ARR',kind:'number',width:146,aggregate:'sum',editable:true,format:v=>'$'+Number(v).toLocaleString('en-US')},
  {key:'health',title:'Health',kind:'number',width:120,aggregate:'avg',editable:true,format:v=>`${v}%`},{key:'renews',title:'Renews',kind:'date',width:140,editable:true},
]
export const inventoryColumns: GridColumn<Inventory>[] = [
  {key:'sku',title:'SKU',width:150},{key:'product',title:'Product',width:225,editable:true},{key:'category',title:'Category',kind:'select',options:categories,width:170},
  {key:'warehouse',title:'Warehouse',kind:'select',options:warehouses,width:150},{key:'stock',title:'In stock',kind:'number',width:130,aggregate:'sum',editable:true},
  {key:'price',title:'Unit price',kind:'number',width:145,editable:true,format:v=>'$'+Number(v).toLocaleString('en-US')},{key:'reorder',title:'Reorder point',kind:'number',width:150,editable:true},
]
export const invoiceColumns: GridColumn<Invoice>[] = [
  {key:'invoice',title:'Invoice #',width:160},{key:'customer',title:'Customer',width:235,editable:true},{key:'status',title:'Status',kind:'select',options:['Paid','Open','Overdue','Draft'],width:150},
  {key:'issued',title:'Issued',kind:'date',width:140},{key:'due',title:'Due date',kind:'date',width:140},{key:'amount',title:'Amount',kind:'number',width:165,aggregate:'sum',format:v=>'$'+Number(v).toLocaleString('en-US')},
]
export function makeRenewals(count = 10000): Renewal[] { return Array.from({length:count},(_,i) => ({id:i+1,account:`${names[i%names.length]} ${suffixes[Math.floor(i/names.length)%suffixes.length]}`,owner:owners[(i*7+Math.floor(i/17))%owners.length],region:regions[(i*13+Math.floor(i/7))%4],stage:stages[(i*7+Math.floor(i/11))%5],seats:10+(i*37)%880,arr:(10+(i*37)%880)*(180+(i%9)*35),health:40+(i*17)%61,renews:`202${6+Math.floor(i%4)}-${String(1+i%12).padStart(2,'0')}-${String(1+i%28).padStart(2,'0')}`})) }
export function makeInventory(count=12000): Inventory[] { return Array.from({length:count},(_,i)=>({id:i+1,sku:`CR-${String(i+1).padStart(6,'0')}`,product:`${['Wireless Hub','Ultra Monitor','Dock Station','SSD Drive','Keyboard','Router'][i%6]} ${['Pro','Plus','Mini','Enterprise'][Math.floor(i/6)%4]}`,category:categories[i%5],warehouse:warehouses[(i*7+Math.floor(i/13))%4],stock:(i*37)%600,price:49+(i*19)%900,reorder:20+(i%6)*15})) }
export function makeInvoices(count=1800): Invoice[] { return Array.from({length:count},(_,i)=>({id:i+1,invoice:`INV-${2026+Math.floor(i/900)}-${String(i+1).padStart(5,'0')}`,customer:`${names[i%20]} ${suffixes[Math.floor(i/20)%8]}`,status:['Paid','Open','Overdue','Draft'][(i*11+Math.floor(i/7))%4],issued:`2026-${String(1+i%12).padStart(2,'0')}-${String(1+i%28).padStart(2,'0')}`,due:`2026-${String(1+(i+1)%12).padStart(2,'0')}-${String(1+i%28).padStart(2,'0')}`,amount:120+(i*97)%14800})) }
export type Contact = { id: number; name: string; email: string; phone: string; progress: number; price: number; tags: string[]; status: string; country: string; timestamp: string }
export function makeContacts(count = 1600): Contact[] { return Array.from({ length: count }, (_, i) => ({
  id: i + 1, name: `${names[i % names.length]} ${suffixes[Math.floor(i / names.length) % suffixes.length]}`,
  email: `user${i + 1}@example.com`, phone: `+90 555 ${String(i % 900 + 100)} ${String(i % 9000 + 1000)}`,
  progress: (i * 17) % 101, price: 199 + (i * 79) % 10000,
  tags: ['VIP', 'API', 'Trial', 'Priority', 'Enterprise'].filter((_, index) => (index + i) % 3 === 0),
  status: ['active', 'pending', 'blocked'][(i * 7 + Math.floor(i / 11)) % 3],
  country: ['TR', 'DE', 'US', 'GB', 'FR'][i % 5], timestamp: new Date(Date.now() - (i % 60) * 3600_000).toISOString(),
})) }
export function contactColumns(timestampFormat: TimestampFormat, relativeRefreshMs = 60_000): GridColumn<Contact>[] { return [
  { key: 'name', title: 'Account', width: 220 },
  { key: 'email', title: 'Email', kind: 'email', width: 220, editable: true },
  { key: 'phone', title: 'Phone', kind: 'phone', width: 165, editable: true },
  { key: 'progress', title: 'Progress', kind: 'progress', width: 170, aggregate: 'avg', editable: true },
  { key: 'price', title: 'Price', kind: 'price', width: 165, aggregate: 'sum', editable: true, cellOptions: { currency: 'TRY' } },
  { key: 'tags', title: 'Tags', kind: 'tags', width: 160, options: ['VIP', 'API', 'Trial', 'Priority', 'Enterprise'], editable: true, cellOptions: { maxTags: 2 } },
  { key: 'status', title: 'Status', kind: 'status', width: 140, editable: true, cellOptions: { statusOptions: { active: { label: 'Active', tone: 'success' }, pending: { label: 'Pending', tone: 'warning' }, blocked: { label: 'Blocked', tone: 'danger' } } } },
  { key: 'country', title: 'Country', kind: 'country', width: 150, options: ['TR', 'DE', 'US', 'GB', 'FR'], editable: true, cellOptions: { locale: 'en-US' } },
  { key: 'timestamp', title: 'Updated', kind: 'timestamp', width: 245, editable: true, cellOptions: { timestampFormat, relativeRefreshMs, locale: 'en-US' } },
] }
export type RichItem = { id: number; name: string; enabled: boolean; website: string; duration: number; fileSize: number; rating: number; color: string; trend: TrendValue }
const palette = ['#836FFF', '#4BB89B', '#E9B060', '#E47E94', '#6495ED']
export const richColumns: GridColumn<RichItem>[] = [
  { key: 'name', title: 'Project', width: 205, editable: true },
  { key: 'enabled', title: 'Enabled', kind: 'boolean', width: 125, editable: true },
  { key: 'website', title: 'Website', kind: 'url', width: 205, editable: true },
  { key: 'duration', title: 'Duration', kind: 'duration', width: 140, editable: true, aggregate: 'sum' },
  { key: 'fileSize', title: 'Size', kind: 'fileSize', width: 175, editable: true, aggregate: 'sum' },
  { key: 'rating', title: 'Rating', kind: 'rating', width: 160, editable: true, aggregate: 'avg', cellOptions: { ratingMax: 5, ratingStep: 0.5 } },
  { key: 'color', title: 'Color', kind: 'color', width: 145, editable: true, options: palette },
  { key: 'trend', title: 'Trend', kind: 'trend', width: 175, editable: true },
]
export function makeRichItems(count = 1800): RichItem[] { return Array.from({ length: count }, (_, i) => ({
  id: i + 1, name: `${names[i % names.length]} ${suffixes[Math.floor(i / names.length) % suffixes.length]}`,
  enabled: i % 4 !== 0, website: `https://example.com/projects/${i + 1}`,
  duration: 120 + (i * 373) % 180_000, fileSize: 45_000 + (i * 17_493_281) % 3_500_000_000,
  rating: ((i * 7) % 11) / 2, color: palette[i % palette.length],
  trend: { points: Array.from({ length: 12 }, (_, day) => 40 + (i % 30) + day * (i % 2 ? 2 : -1) + Math.sin(day + i) * 7) },
})) }
