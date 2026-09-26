import type { Metadata } from 'next'
import App from '@/App'
import { typeCatalog } from '@/data/showcase'
import { features, presets } from '@/showcase/catalog'

const routes = [[],['types'],['features'],['examples'],['docs'],['docs','installation'],['docs','usage'],['docs','publishing'],['maker'],...typeCatalog.map(t => ['types',t.slug]),...features.map(f => ['features',f.slug]),['features','server'],...presets.map(p => ['examples',p.slug])]
export function generateStaticParams() { return routes.map(slug => ({ slug })) }
export const dynamicParams = false
const titles: Record<string,string> = { types:'Column types', features:'Feature labs', examples:'Example data sets', docs:'Documentation', maker:'Table Maker' }
export async function generateMetadata({ params }: { params: Promise<{slug?:string[]}> }): Promise<Metadata> {
  const { slug = [] } = await params
  const path = '/' + slug.join('/')
  const title = typeCatalog.find(t => t.slug === slug[1])?.name ?? features.find(f => f.slug === slug[1])?.name ?? presets.find(p => p.slug === slug[1])?.name ?? (slug[1] === 'server' ? 'Server data' : slug[1] ? slug[1][0].toUpperCase() + slug[1].slice(1) : titles[slug[0]] ?? 'Interactive showcase')
  return { title, description: `Explore ${title} with working React data table examples, code snippets and documentation.`, alternates: { canonical: path }, openGraph: { title: `${title} | Coreor DataTable`, url: path } }
}
export default async function ShowcasePage({ params }: { params: Promise<{slug?:string[]}> }) {
  const { slug = [] } = await params
  return <App initialPath={'/' + slug.join('/')}/>
}
