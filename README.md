# Coreor DataTable

A typed React data grid and interactive Next.js showcase. Configure 19 cell types, inline editors, column-aware filters, virtual rows, pagination, selection across pages, CSV exports and server queries.

> The npm package is prepared but **not published yet**. See [publishing](docs/PUBLISHING.md) for the first release. The live showcase is a separate Next.js application in this repository.

## Get started

```bash
git clone https://github.com/battincik/coreor-datatable.git
cd coreor-datatable
npm install
npm run dev
```

The showcase uses Next.js App Router and Turbopack. `npm run build` creates the npm package and statically renders the showcase. Node.js 20.9+ is required for Next.js 16; use a current Node.js LTS release for development.

Once the package is published:

```bash
npm install @battincik/coreor-datatable
```

```tsx
// Import once in your app root (e.g. app/layout.tsx).
import '@battincik/coreor-datatable/styles.css'

// In a client component:
'use client'
import { useState } from 'react'
import { EnterpriseGrid, type GridColumn } from '@battincik/coreor-datatable'

type Row = { id: number; name: string; total: number }
const columns: GridColumn<Row>[] = [
  { key: 'name', title: 'Name', kind: 'text', editable: true },
  { key: 'total', title: 'Total', kind: 'price', editable: true,
    cellOptions: { currency: 'TRY', locale: 'tr-TR' } },
]
export function Example() {
  const [rows, setRows] = useState<Row[]>([{ id: 1, name: 'Coreor', total: 1200 }])
  return <EnterpriseGrid data={rows} columns={columns} onDataChange={setRows}
    pagination={{ initialPageSize: 25 }} filename="data.csv" />
}
```

## Explore the showcase

- `/` — every column type and core behavior in one 2,400-row table.
- `/types` — 19 focused type examples, typed filters and editors.
- `/features` — eight labs including virtual rows, timestamps and server pagination.
- `/maker` — Table Maker: choose columns and options, preview changes and copy a React snippet.
- `/docs` — installation, usage and publishing guides.
- `/examples` — renewals, inventory and invoices.

All listed pages have static HTML, titles, canonical URLs, a sitemap and robots rules. Set `NEXT_PUBLIC_SITE_URL` to the actual deployed public origin before building; the default `https://datatable.coreor.net` is only a placeholder.

## Repository layout

| Location | Purpose |
| --- | --- |
| `src/components/`, `src/lib/`, `src/library.ts` | Library source; the package build uses this same code |
| `packages/coreor-datatable/` | npm metadata and generated `dist/` (build before publishing) |
| `src/app/`, `src/showcase/` | Next.js showcase and Table Maker |
| `docs/API.md` | Grid API and supported raw types |
| `docs/PUBLISHING.md` | First npm release and future versioning |
| `docs/GRID_GUIDE_TR.md` | Detailed Turkish grid and integration guide |

## Quality checks

```bash
npm test
npm run lint
npm run build
npm run pack:dry
```

The library package has React and React DOM as peer dependencies. Its `styles.css` is imported once by the consumer. The server lab in the showcase simulates an API locally; connect `onQueryChange` and `onExportRequest` to a real API in your app.

[Contributing](CONTRIBUTING.md) · [License](LICENSE) · [Coreor](https://coreor.net)
