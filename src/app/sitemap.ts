import type { MetadataRoute } from 'next'
import { typeCatalog } from '@/data/showcase'
import { features, presets } from '@/showcase/catalog'
const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://datatable.coreor.net'
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['','types','features','examples','maker','docs','docs/installation','docs/usage','docs/publishing',...typeCatalog.map(t => `types/${t.slug}`),...features.map(f => `features/${f.slug}`),'features/server',...presets.map(p => `examples/${p.slug}`)]
  return paths.map(path => ({ url: `${base}/${path}`, changeFrequency: path ? 'monthly' : 'weekly', priority: path ? .7 : 1 }))
}
