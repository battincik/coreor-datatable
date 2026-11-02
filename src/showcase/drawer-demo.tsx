import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Building2, Globe2, Mail, MapPin, UserRound } from 'lucide-react'
import { EnterpriseGridWithDrawer } from '@/components/enterprise-grid-with-drawer'
import { makeShowcaseRows, showcaseColumns, type ShowcaseRow } from '@/data/showcase'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

const labelStyle = { color: '#77777f', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '.08em' }
const valueStyle = { color: '#e7e7ea', fontSize: 13, fontWeight: 600 }
const actions = [
  { label: 'Message', icon: Mail },
  { label: 'Website', icon: Globe2 },
  { label: 'Owner', icon: UserRound },
]

export function DrawerDemoTable() {
  const [rows, setRows] = useState(() => makeShowcaseRows(120))
  const columns = useMemo(() => showcaseColumns().filter(column => ['name','owner','status','country','price','timestamp'].includes(column.key)), [])

  return <EnterpriseGridWithDrawer
    title="Customer workspaces"
    data={rows}
    onDataChange={setRows}
    columns={columns}
    height={520}
    pagination={{ initialPageSize: 25, pageSizeOptions: [25,50,100] }}
    filename="customers-with-drawer.csv"
    drawer={{
      columns: ['name'],
      width: 540,
      title: row => row.name,
      description: row => `${row.owner} · ${row.country}`,
      render: row => <CustomerDrawer row={row}/>,
    }}
  />
}

function CustomerDrawer({ row }: { row: ShowcaseRow }) {
  const initials = row.name.split(' ').map(part => part[0]).slice(0,2).join('').toUpperCase()
  const stats = [
    ['Revenue', money.format(row.price)],
    ['Seats', row.seats.toLocaleString('en-US')],
    ['Progress', `${row.progress}%`],
    ['Rating', `${row.rating.toFixed(1)} / 5`],
  ]

  return <div style={{ padding: 22 }}>
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', paddingBottom: 22, borderBottom: '1px solid #242427' }}>
      <div style={{ display: 'grid', placeItems: 'center', width: 54, height: 54, borderRadius: 13, background: `linear-gradient(135deg, ${row.color}, #4d6bff)`, color: 'white', fontWeight: 800, fontSize: 17 }}>{initials}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><strong style={{ fontSize: 18 }}>{row.name}</strong><span style={{ width: 7, height: 7, borderRadius: 999, background: row.enabled ? '#36c98f' : '#6b6b72' }}/></div>
        <div style={{ marginTop: 5, color: '#85858d', fontSize: 12 }}>{row.website.replace(/^https?:\/\//, '')}</div>
      </div>
      <span style={{ padding: '5px 8px', border: '1px solid #2a2a2f', borderRadius: 999, color: '#a8a8ae', fontSize: 11 }}>{row.status}</span>
    </div>

    <div style={{ display: 'flex', gap: 8, padding: '16px 0', borderBottom: '1px solid #242427' }}>
      {actions.map(action => { const Icon = action.icon; return <button key={action.label} type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 10px', border: '1px solid #2b2b30', borderRadius: 7, background: '#111113', color: '#b8b8bf', fontSize: 12, cursor: 'pointer' }}><Icon size={14}/>{action.label}</button> })}
    </div>

    <section style={{ padding: '20px 0', borderBottom: '1px solid #242427' }}>
      <div style={{ marginBottom: 14, fontSize: 12, fontWeight: 700 }}>Details</div>
      <div style={{ display: 'grid', gap: 14 }}>
        <Detail icon={<Building2 size={14}/>} label="Workspace" value={row.name}/>
        <Detail icon={<UserRound size={14}/>} label="Owner" value={row.owner}/>
        <Detail icon={<Mail size={14}/>} label="Email" value={row.email}/>
        <Detail icon={<MapPin size={14}/>} label="Country" value={row.country}/>
        <Detail icon={<Globe2 size={14}/>} label="Website" value={row.website.replace(/^https?:\/\//, '')}/>
        <Detail icon={<span style={{ fontSize: 13 }}>#</span>} label="Priority" value={row.priority}/>
      </div>
    </section>

    <section style={{ paddingTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}><strong style={{ fontSize: 12 }}>Overview</strong><span style={{ color: '#66666d', fontSize: 11 }}>Live row data</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>{stats.map(([label,value]) => <div key={label} style={{ minHeight: 94, padding: 13, border: '1px solid #29292d', borderRadius: 9, background: '#0f0f11' }}><div style={labelStyle}>{label}</div><div style={{ marginTop: 10, fontSize: 20, fontWeight: 750, color: label === 'Revenue' || label === 'Progress' ? '#3bd49f' : '#efeff1' }}>{value}</div></div>)}</div>
      <div style={{ marginTop: 12, padding: 13, border: '1px solid #29292d', borderRadius: 9, background: '#0f0f11' }}><div style={labelStyle}>Last activity</div><div style={{ ...valueStyle, marginTop: 7 }}>{date.format(new Date(row.timestamp))}</div></div>
    </section>
  </div>
}

function Detail({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '18px 92px minmax(0,1fr)', gap: 8, alignItems: 'center' }}><span style={{ color: '#6f6f77' }}>{icon}</span><span style={labelStyle}>{label}</span><span style={{ ...valueStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span></div>
}
