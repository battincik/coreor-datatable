import { ArrowRight, ArrowUpRight, Database } from 'lucide-react'
import { typeCatalog, showcaseColumns } from '@/data/showcase'
import { features, presets } from '@/showcase/catalog'
import { DemoTable, PresetTable, ServerTable } from '@/showcase/demo-tables'
import { BackLink, ClientOnly, CodePanel, NavLink, NextLink, SectionHeading } from '@/showcase/ui'

type PageProps = { navigate:(path:string)=>void }

export function Overview({ navigate }: PageProps) {
  return <><section className="sc-hero"><div><div className="sc-hero-label"><span/> COREOR / REACT DATA GRID</div><h1>Every data shape.<br/><em>One powerful grid.</em></h1><p>Build fast, typed data experiences. Explore every cell type and feature, then generate your own table in the live playground.</p><div className="sc-hero-actions"><NavLink to="/maker" navigate={navigate} className="sc-primary">Open Table Maker <ArrowRight size={16}/></NavLink><NavLink to="/docs/installation" navigate={navigate} className="sc-secondary">Get started <ArrowRight size={16}/></NavLink></div></div><div className="sc-hero-visual"><div className="sc-hero-stat"><strong>19</strong><span>COLUMN TYPES</span></div><div className="sc-hero-stat"><strong>08</strong><span>FEATURE LABS</span></div><div className="sc-hero-stat"><strong>2.4k</strong><span>LIVE RECORDS</span></div><div className="sc-visual-lines"><i/><i/><i/><i/><i/><i/><i/></div></div></section>
    <div className="sc-metrics"><span><strong>20</strong> columns in one table</span><span><strong>Client + server</strong> examples</span><span><strong>Editable</strong> typed cells</span><span><strong>CSV</strong> export scopes</span></div>
    <div className="sc-section-title"><div><span>01 / EVERYTHING TOGETHER</span><h2>The complete workspace</h2><p>All column types and grid actions in a single, fully interactive table.</p></div><span className="sc-live"><span/> LIVE DATA</span></div>
    <div className="sc-action-guide"><span>TRY THIS</span><span>① Filter status + price</span><span>② Double-click a cell</span><span>③ Select across pages</span><span>④ Export CSV</span></div><ClientOnly><DemoTable mode="all"/></ClientOnly>
    <div className="sc-section-title sc-after-grid"><div><span>02 / EXPLORE IN DEPTH</span><h2>Go deeper, one capability at a time</h2><p>Focused examples make each behavior easy to inspect.</p></div></div>
    <div className="sc-feature-cards">{features.slice(0,4).map(item => <NavLink key={item.slug} to={`/features/${item.slug}`} navigate={navigate} className="sc-feature-card"><item.icon size={20}/><strong>{item.name}</strong><p>{item.description}</p><span>Open lab <ArrowUpRight size={14}/></span></NavLink>)}</div>
    <div className="sc-section-title sc-after-grid"><div><span>03 / BUILD WITH REACT</span><h2>From preview to production</h2><p>Copy a starter component, then fine tune it in the Table Maker.</p></div><NavLink to="/docs/usage" navigate={navigate} className="sc-secondary">Read the API <ArrowRight size={15}/></NavLink></div>
    <CodePanel code={`import '@battincik/coreor-datatable/styles.css'\nimport { EnterpriseGrid, type GridColumn } from '@battincik/coreor-datatable'\n\nconst columns: GridColumn<Row>[] = [\n  { key: 'name', title: 'Name', kind: 'text', editable: true },\n  { key: 'status', title: 'Status', kind: 'status' },\n]\n\n<EnterpriseGrid data={rows} columns={columns} onDataChange={setRows} />`}/>
  </>
}

export function TypeGallery({ navigate }: PageProps) {
  return <><SectionHeading eyebrow="COLUMN LIBRARY / 19 TYPES" title="The type gallery" description="A focused page for every type. Open one to try its renderer, filter, editor and export behavior."/><div className="sc-type-grid">{typeCatalog.map((type,index) => <NavLink key={type.slug} to={`/types/${type.slug}`} navigate={navigate} className="sc-type-card"><div className="sc-type-card-top"><span className="sc-type-number">{String(index+1).padStart(2,'0')}</span><span className="sc-kind">{type.kind}</span></div><h3>{type.name}</h3><p>{type.description}</p><div><code>{type.raw}</code><ArrowUpRight size={15}/></div></NavLink>)}</div></>
}

export function TypeDetail({ slug, navigate }: PageProps & { slug:string }) {
  const type = typeCatalog.find(item => item.slug === slug)!
  const sample = showcaseColumns().find(col => col.key === slug)!
  const code = `const columns: GridColumn<Row>[] = [\n  {\n    key: '${slug}',\n    title: '${sample.title}',\n    kind: '${type.kind}',\n    editable: true,${sample.options ? `\n    options: ${JSON.stringify(sample.options)},` : ''}${sample.cellOptions ? `\n    cellOptions: ${JSON.stringify(sample.cellOptions)},` : ''}\n  },\n]`
  return <><BackLink to="/types" label="All column types" name={type.name} navigate={navigate}/><SectionHeading eyebrow={`COLUMN TYPE / ${type.kind.toUpperCase()}`} title={`${type.name} columns`} description={type.description} action={<span className="sc-raw">RAW DATA · {type.raw}</span>}/><div className="sc-detail-strip"><div><span>01</span><strong>Render</strong><p>{type.description}</p></div><div><span>02</span><strong>Filter</strong><p>Click Filter and configure this column.</p></div><div><span>03</span><strong>Edit</strong><p>Double-click a value to change it.</p></div></div><div className="sc-section-title"><div><span>INTERACTIVE EXAMPLE</span><h2>Try {type.name.toLowerCase()} in context</h2><p>{type.action}</p></div></div><ClientOnly><DemoTable mode="type" focus={slug}/></ClientOnly><div className="sc-detail-bottom"><CodePanel code={code}/><div className="sc-tip-panel"><span>ABOUT THE DATA</span><h3>Raw values stay raw.</h3><p>The renderer changes how a cell looks. Sorting, filtering, editing and CSV export work with the underlying value, so integrations can use stable types.</p><NavLink to="/features" navigate={navigate}>Explore feature labs <ArrowRight size={15}/></NavLink></div></div></>
}

export function FeatureGallery({ navigate }: PageProps) {
  return <><SectionHeading eyebrow="CAPABILITIES / 08 LABS" title="Feature labs" description="Small, practical workspaces for understanding one grid behavior at a time."/><div className="sc-feature-grid">{features.map((item,index) => <NavLink key={item.slug} to={`/features/${item.slug}`} navigate={navigate} className="sc-feature-tile"><span className="sc-tile-index">{String(index+1).padStart(2,'0')} / 08</span><item.icon size={25}/><h3>{item.name}</h3><p>{item.description}</p><span>Open example <ArrowUpRight size={15}/></span></NavLink>)}<NavLink to="/features/server" navigate={navigate} className="sc-feature-tile"><span className="sc-tile-index">08 / 08</span><Database size={25}/><h3>Server data</h3><p>Real page boundaries and export callbacks with a local API simulation.</p><span>Open example <ArrowUpRight size={15}/></span></NavLink></div></>
}

export function FeatureDetail({ slug, navigate }: PageProps & { slug:string }) {
  const feature = features.find(item => item.slug === slug)
  const name = feature?.name ?? 'Server data'
  const description = feature?.description ?? 'Simulated server pagination, cross-page selection and backend-style exports.'
  const tips: readonly string[] = feature?.tips ?? ['Select a page, then go to the next page.','Export selected IDs from both pages.','Try All filtered results in the Export menu.']
  return <><BackLink to="/features" label="All feature labs" name={name} navigate={navigate}/><SectionHeading eyebrow="FEATURE LAB / INTERACTIVE" title={name} description={description}/><div className="sc-lab-notes">{tips.map((tip,index) => <div key={tip}><span>{String(index+1).padStart(2,'0')}</span><p>{tip}</p></div>)}</div><ClientOnly>{slug === 'server' ? <ServerTable/> : <DemoTable mode="feature" feature={slug as typeof features[number]['slug']}/>}</ClientOnly><NextLink navigate={navigate}/></>
}

export function PresetGallery({ navigate }: PageProps) {
  return <><SectionHeading eyebrow="REAL-WORLD DATA / 03 TABLES" title="Example data sets" description="Three industry-style tables with different records, columns and workflows."/><div className="sc-feature-grid">{presets.map(item => <NavLink key={item.slug} to={`/examples/${item.slug}`} navigate={navigate} className="sc-feature-tile"><span className="sc-tile-index">{item.count} RECORDS</span><Database size={25}/><h3>{item.name}</h3><p>{item.description}</p><span>Open example <ArrowUpRight size={15}/></span></NavLink>)}</div></>
}

export function PresetDetail({ slug, navigate }: PageProps & { slug:string }) {
  const item = presets.find(preset => preset.slug === slug)!
  return <><BackLink to="/examples" label="All data sets" name={item.name} navigate={navigate}/><SectionHeading eyebrow={`${item.count} RECORDS / EXAMPLE`} title={item.name} description={item.description}/><ClientOnly><PresetTable slug={slug}/></ClientOnly></>
}
