# @battincik/coreor-datatable

A typed, editable React data grid with 19 cell types, column filters, virtual rows, server pagination, persistent row selection and CSV export.

**The first npm release is pending.** Source and examples: https://github.com/battincik/coreor-datatable

```bash
npm install @battincik/coreor-datatable
```

```tsx
// Load once in your application root.
import '@battincik/coreor-datatable/styles.css'

'use client'
import { useState } from 'react'
import { EnterpriseGrid, type GridColumn } from '@battincik/coreor-datatable'

type Row = { id: number; name: string; score: number }
const columns: GridColumn<Row>[] = [
  { key: 'name', title: 'Name', kind: 'text', editable: true },
  { key: 'score', title: 'Score', kind: 'number', editable: true },
]
export function Demo() {
  const [data, setData] = useState<Row[]>([{ id: 1, name: 'Coreor', score: 90 }])
  return <EnterpriseGrid data={data} columns={columns} onDataChange={setData}
    pagination={{ initialPageSize: 25 }} />
}
```

For full options and integrations, read [the API guide](https://github.com/battincik/coreor-datatable/blob/main/docs/API.md) or try the [Table Maker](https://datatable.coreor.net/maker) once the showcase is deployed.
