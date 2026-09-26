import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import '../index.css'
import '../App.css'
import '../showcase.css'
import '../maker.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://datatable.coreor.net'
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Coreor DataTable | React data grid', template: '%s | Coreor DataTable' },
  description: 'A composable React data table with typed cells, inline editors, filters, virtual rows, server pagination and CSV export. Explore live examples and generate code.',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', title: 'Coreor DataTable', description: 'Explore 19 column types and build an interactive React data table.', url: siteUrl, siteName: 'Coreor DataTable' },
  twitter: { card: 'summary_large_image', title: 'Coreor DataTable', description: 'Build a React data grid with typed columns and live examples.' },
}
export const viewport: Viewport = { themeColor: '#071016', width: 'device-width', initialScale: 1 }
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  const schema = { '@context':'https://schema.org', '@type':'SoftwareSourceCode', name:'Coreor DataTable', description:'Typed React data grid with editable cells, filters, server pagination and CSV export.', codeRepository:'https://github.com/battincik/coreor-datatable', programmingLanguage:['TypeScript','React'], license:'https://github.com/battincik/coreor-datatable/blob/main/LICENSE' }
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  return <html lang="en"><body>
    {measurementId && <>
      <Script id="google-analytics-config" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${measurementId}', { send_page_view: false });`}
      </Script>
      <Script id="google-analytics" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
    </>}
    {children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
  </body></html>
}
