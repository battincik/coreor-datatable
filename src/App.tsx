"use client"
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, BookOpen, ChevronRight, Code2, Database, LayoutDashboard, Menu, SlidersHorizontal, Table2, WandSparkles, X } from 'lucide-react'
import { typeCatalog } from '@/data/showcase'
import { features, presets } from '@/showcase/catalog'
import { ClientOnly, NavLink, SectionHeading } from '@/showcase/ui'
import { FeatureDetail, FeatureGallery, Overview, PresetDetail, PresetGallery, TypeDetail, TypeGallery } from '@/showcase/pages'
import { DocsPage } from '@/showcase/docs-page'
import { TableMaker } from '@/showcase/table-maker'
import { trackPageView } from '@/app/analytics'

function usePathname(initialPath: string) {
  const [path, setPath] = useState(initialPath)
  useEffect(() => { const onPop = () => setPath(window.location.pathname); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [])
  const navigate = (next: string) => {
    if (window.location.pathname !== next) window.history.pushState(null, '', next)
    setPath(next)
    window.scrollTo?.({ top: 0, behavior: 'instant' })
  }
  return [path, navigate] as const
}

export default function App({ initialPath = '/' }: { initialPath?:string }) {
  const [path, navigate] = usePathname(initialPath)
  const [mobileOpen, setMobileOpen] = useState(false)
  const previousPath = useRef(path)
  useEffect(() => {
    if (previousPath.current !== path) {
      trackPageView(path)
      previousPath.current = path
    }
  }, [path])
  const parts = path.split('/').filter(Boolean)
  const type = parts[0] === 'types' && parts[1] ? typeCatalog.find(item => item.slug === parts[1]) : undefined
  const feature = parts[0] === 'features' && parts[1] ? [...features,{slug:'server',name:'Server data'}].find(item => item.slug === parts[1]) : undefined
  const preset = parts[0] === 'examples' && parts[1] ? presets.find(item => item.slug === parts[1]) : undefined
  const title = type?.name ?? feature?.name ?? preset?.name ?? (path === '/types' ? 'Column types' : path === '/features' ? 'Feature labs' : path === '/examples' ? 'Data sets' : path === '/maker' ? 'Table Maker' : path.startsWith('/docs') ? 'Documentation' : 'Overview')
  const nav = (next:string) => { navigate(next); setMobileOpen(false) }
  return <div className="sc-app">
    <aside className={`sc-sidebar ${mobileOpen ? 'sc-sidebar-open' : ''}`}>
      <div className="sc-brand"><span className="sc-brand-icon"><Table2 size={18}/></span><div><strong>COREOR<span> / DATA</span></strong><small>DATATABLE SHOWCASE</small></div><button className="sc-mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={17}/></button></div>
      <div className="sc-sidebar-scroll"><div className="sc-nav-label">GET STARTED</div>
        <NavLink to="/" active={path === '/'} navigate={nav} className="sc-nav-item"><LayoutDashboard size={17}/> Overview</NavLink>
        <NavLink to="/types" active={path === '/types'} navigate={nav} className="sc-nav-item"><Table2 size={17}/> Column types <span>19</span></NavLink>
        <NavLink to="/features" active={path === '/features'} navigate={nav} className="sc-nav-item"><SlidersHorizontal size={17}/> Feature labs <span>08</span></NavLink>
        <NavLink to="/examples" active={path === '/examples'} navigate={nav} className="sc-nav-item"><Database size={17}/> Data sets <span>03</span></NavLink>
        <NavLink to="/maker" active={path === '/maker'} navigate={nav} className="sc-nav-item"><WandSparkles size={17}/> Table Maker <span>NEW</span></NavLink>
        <NavLink to="/docs" active={path.startsWith('/docs')} navigate={nav} className="sc-nav-item"><Code2 size={17}/> Documentation</NavLink>
        <div className="sc-nav-label sc-nav-divider">GUIDES</div>
        <NavLink to="/docs/installation" active={path === '/docs/installation'} navigate={nav} className="sc-nav-item sc-nav-sub"><span className="sc-nav-dot"/>Installation</NavLink>
        <NavLink to="/docs/usage" active={path === '/docs/usage'} navigate={nav} className="sc-nav-item sc-nav-sub"><span className="sc-nav-dot"/>Usage & API</NavLink>
        <NavLink to="/docs/publishing" active={path === '/docs/publishing'} navigate={nav} className="sc-nav-item sc-nav-sub"><span className="sc-nav-dot"/>Publishing</NavLink>
        <div className="sc-nav-label sc-nav-divider">COLUMN TYPES</div>
        {typeCatalog.map(item => <NavLink key={item.slug} to={`/types/${item.slug}`} active={path === `/types/${item.slug}`} navigate={nav} className="sc-nav-item sc-nav-sub"><span className="sc-nav-dot"/>{item.name}</NavLink>)}
        <div className="sc-nav-label sc-nav-divider">FEATURE LABS</div>
        {features.map(item => <NavLink key={item.slug} to={`/features/${item.slug}`} active={path === `/features/${item.slug}`} navigate={nav} className="sc-nav-item sc-nav-sub"><span className="sc-nav-dot"/>{item.name}</NavLink>)}
        <NavLink to="/features/server" active={path === '/features/server'} navigate={nav} className="sc-nav-item sc-nav-sub"><span className="sc-nav-dot"/>Server data</NavLink>
      </div><div className="sc-sidebar-footer"><span className="sc-online"/> OPEN SOURCE <strong>v0.1.0</strong></div>
    </aside>
    {mobileOpen && <button className="sc-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>}
    <div className="sc-main"><header className="sc-topbar"><button className="sc-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={19}/></button><div className="sc-breadcrumb"><span>Coreor / DataTable</span><ChevronRight size={14}/><strong>{title}</strong></div><div className="sc-top-actions"><span className="sc-top-status"><span/> Interactive demo</span><NavLink to="/docs" navigate={nav}><BookOpen size={15}/> Documentation <ArrowUpRight size={14}/></NavLink><a href="https://github.com/battincik/coreor-datatable" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a></div></header>
      <main className="sc-content" key={path}>
        {path === '/' ? <Overview navigate={nav}/> : path === '/maker' ? <><SectionHeading eyebrow="PLAYGROUND / CONFIGURE AND COPY" title="Table Maker" description="Pick column types, tune behavior and inspect a working table and React snippet as you go."/><ClientOnly><TableMaker/></ClientOnly></> : path.startsWith('/docs') ? <DocsPage path={path} navigate={nav}/> : path === '/types' ? <TypeGallery navigate={nav}/> : type ? <TypeDetail slug={type.slug} navigate={nav}/> : path === '/features' ? <FeatureGallery navigate={nav}/> : feature ? <FeatureDetail slug={feature.slug} navigate={nav}/> : path === '/examples' ? <PresetGallery navigate={nav}/> : preset ? <PresetDetail slug={preset.slug} navigate={nav}/> : <><SectionHeading eyebrow="PAGE NOT FOUND" title="Nothing here" description="Choose a demo from the navigation."/><NavLink to="/" navigate={nav} className="sc-primary">Back to overview</NavLink></>}
        <footer className="sc-footer"><span>COREOR DATATABLE · OPEN SOURCE</span><span>React · TanStack Table · TanStack Virtual · Next.js</span></footer>
      </main>
    </div>
  </div>
}
