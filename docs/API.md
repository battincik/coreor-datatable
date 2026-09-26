# DataTable API

## `<EnterpriseGrid<T>>`

Each row needs a stable, unique `id: string | number`.

| Prop | Description |
| --- | --- |
| `data: T[]` | Current rows, or the active server page in `serverMode`. |
| `columns: GridColumn<T>[]` | Typed fields. Can change at runtime. |
| `onDataChange?: (rows:T[]) => void` | Controlled editing, deletion, undo and redo. Omitting it makes the grid read-only. |
| `title?: string` | Toolbar title. |
| `height?: number` | Scroll viewport height in pixels. |
| `pagination?: false \| { initialPageSize?, pageSizeOptions?, state?, onChange? }` | Client pagination or disabled when `false`. |
| `serverMode?: boolean` | Sorting, filtering and pagination delegated to your API. |
| `totalRows?: number` | Total matching count when using `serverMode`. |
| `onQueryChange?: (query: GridQuery) => void` | New search, sort, filter and page parameters. |
| `onExportRequest?: (request: GridExportRequest) => Promise<Blob \| string \| void>` | Server export callback for all matching or selected rows. |
| `filename?: string` | CSV download filename. |

`GridQuery` is `{ search, sorting, filters, pageIndex, pageSize }`. In server mode, only the active page is provided in `data`, while selected row IDs persist across pages. Your API must sort/filter raw values with the same semantics as the column type. The server export callback handles rows not loaded in the browser.

## Columns

```tsx
const columns: GridColumn<MyRow>[] = [{
  key: 'amount', title: 'Amount', kind: 'price', width: 160,
  editable: true, aggregate: 'sum',
  cellOptions: { currency: 'TRY', locale: 'tr-TR' },
}]
```

`kind` controls rendering, filter and editor behavior. `options` provides choices for select, tags, country and color; `cellOptions` configures status labels, currency, relative refresh, rating and display. `aggregate` supports sum/average on numeric types.

| Kinds | Raw value |
| --- | --- |
| `text`, `select`, `email`, `phone`, `status`, `country`, `url`, `color` | string |
| `number`, `progress`, `price`, `duration`, `fileSize`, `rating` | number (seconds for duration; bytes for file size) |
| `date` | `YYYY-MM-DD` string |
| `timestamp` | ISO string, Date or Unix time (seconds/milliseconds) |
| `tags` | string[] |
| `boolean` | boolean |
| `trend` | `{ points: number[]; change?: number }` |

Timestamp formats: `t`, `T`, `d`, `D`, `f`, `F`, `s`, `S`, `R` (relative). Relative values refresh on a configured interval; focus or hover shows the exact date. See [the Turkish guide](GRID_GUIDE_TR.md) for detailed filters, editors, pagination and export behavior.

## Integration notes

- Add `'use client'` above a Next.js component that renders the grid. Import the CSS once at the application root.
- Keep `data` and `columns` references stable when possible. Use `onDataChange` for edits.
- For server integrations, debounce requests as appropriate and ignore stale responses.
- CSV sanitizes formula-like prefixes, escapes quoted fields, and includes a UTF-8 BOM.
- Client virtualization limits DOM nodes, while client sorting and filtering still process all loaded rows. Use `serverMode` for very large data sets.
