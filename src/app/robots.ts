import type { MetadataRoute } from 'next'
const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://datatable.coreor.net'
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent:'*', allow:'/' }, sitemap:`${base}/sitemap.xml` }
}
