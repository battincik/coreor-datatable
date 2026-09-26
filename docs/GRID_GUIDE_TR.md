# Enterprise Grid

shadcn/ui kaynak bileşenleri ile hazırlanmış, tekrar kullanılabilir React veri grid'i ve çok sayfalı etkileşimli showcase. Ana sayfada 19 sütun tipinin hepsi 2.400 satırlı tek tabloda bulunur. Ayrıca her sütun tipi, önemli grid işlevleri ve üç farklı veri kümesi için ayrı örnek sayfaları vardır.

## Başlatma

```bash
npm install
npm run dev
```

Üretim derlemesi: `npm run build`. Proje Vite + React 19 + TypeScript + Tailwind CSS 4 tabanlıdır. `src/components/ui` altındaki Button, Input, Checkbox, Dropdown Menu ve Popover shadcn/ui stilinde yerel kaynak bileşenleridir. shadcn CLI çevrimiçi tema servisine erişemediği için kaynaklar doğrudan projeye eklenmiştir. Radix UI temeli ve `components.json` yapılandırması mevcuttur.

## Showcase sayfaları

| Yol | İçerik |
| --- | --- |
| `/` | 20 sütunlu kapsamlı tablo: 19 tip, filtre, düzenleme, sıralama, sabitleme, sayfalama, seçim ve CSV dışa aktarma |
| `/types` ve `/types/:slug` | 19 tiplik katalog ve her tipin odaklı tablosu, deneme yönergeleri, örnek sütun tanımı |
| `/features` ve `/features/:slug` | Filtreler, editörler, seçim/dışa aktarma, sayfalama, sütun kontrolleri, 10.000 satır sanallaştırması, zaman damgaları ve sunucu modu |
| `/examples` ve `/examples/:slug` | Yenilemeler, stok ve faturalar için gerçekçi veri kümeleri |

Sayfalar doğrudan URL ile açılır; kenar menüsü ve geri/ileri gezinmesi çalışır. Canlı kontrollerde saat biçimi, para birimi, tablo yüksekliği ve sayfalama değiştirilebilir. `/features/server` sayfası 720 kayıttan yalnızca etkin sayfayı gride verir; filtreleme, sıralama ve tam dışa aktarma yerel bir API simülasyonunda çalışır. Gerçek bir backend çağrısı içermez.

## Özellikler

- Satır sanallaştırma: aktif sayfadaki ekranda görünen satırlar ve küçük bir ek aralık çizilir.
- İstemci veya sunucu sayfalaması; 25/50/100/250/500/1000 satır seçenekleri, ilk/önceki/sonraki/son sayfa kontrolleri.
- Tüm sütunlarda arama; metin için `contains`, sayısal tiplerde aralık ve karşılaştırma, tarih aralığı, durum/ülke/etiket için çoklu seçim.
- Artan/azalan sıralama, filtre satırı, sütun gizleme, sürükleyerek genişlik değiştirme, sola sabitleme.
- Compact / Standard / Comfortable yoğunluğu; sayfalar arasında korunan seçim, sayfa/seçim/filtre kapsamlı CSV dışa aktarma, istemci modunda onaylı toplu silme.
- Hücreye çift tıklayarak türe uygun editör açma, doğrulama; değişiklik geçmişinde 20 adım geri al/yinele; sıfırlama.
- Görünen ve filtrelenmiş satırların sayısı ile toplam/ortalama alt satırı; boş ve yükleniyor durumları.
- CSV'de UTF-8 BOM, tırnak kaçışları ve formül başlangıçlarına karşı güvenli metin dönüştürme.

## Temel kullanım

```tsx
import { useState } from 'react'
import { EnterpriseGrid, type GridColumn } from './components/enterprise-grid'

type User = { id: number; name: string; team: string; score: number }
const columns: GridColumn<User>[] = [
  { key: 'name', title: 'Name', width: 200, editable: true },
  { key: 'team', title: 'Team', kind: 'select', options: ['Sales', 'Support'] },
  { key: 'score', title: 'Score', kind: 'number', aggregate: 'avg' },
]

function Users() {
  const [data, setData] = useState<User[]>([
    { id: 1, name: 'Ada', team: 'Sales', score: 92 },
  ])
  return <EnterpriseGrid title="Users" data={data} columns={columns}
    onDataChange={setData} filename="users.csv" height={500} />
}
```

`id` her satırda benzersiz ve kararlı olmalıdır. `data` ve `columns` dizilerini gereksiz her render'da yeniden oluşturmamak gerekir. `onDataChange` verilmezse düzenleme ve silme devre dışıdır.

## Değişkenlere göre tablo oluşturma

Grid'in veri alanları sabit değildir. `columns` dizisi o anda gösterilecek alanları belirler; `data` yeni kayıtlar geldikçe yenilenir. Bu prop'lar değişince grid yeniden render edilir. Backend'den gelen alan tanımlarını uygulamanın izin verdiği alanlarla eşleyin:

```tsx
import { useMemo, useState } from 'react'
import type { GridColumn } from './components/enterprise-grid'

type RecordRow = { id: string; [field: string]: string | number }
type Field = {
  name: string
  label: string
  type: 'text' | 'number' | 'select'
  choices?: string[]
}

function DynamicTable({ rows, fields, onRowsChange }: {
  rows: RecordRow[]
  fields: Field[]
  onRowsChange: (next: RecordRow[]) => void
}) {
  const [showPrices, setShowPrices] = useState(true)
  const columns = useMemo<GridColumn<RecordRow>[]>(() =>
    fields
      .filter(field => showPrices || field.name !== 'price')
      .map(field => ({
        key: field.name,
        title: field.label,
        kind: field.type,
        options: field.choices,
        width: field.type === 'number' ? 140 : 200,
        editable: field.name !== 'id',
      })), [fields, showPrices])

  return <>
    <button onClick={() => setShowPrices(value => !value)}>Fiyat sütununu değiştir</button>
    <EnterpriseGrid title="Dinamik kayıtlar" data={rows} columns={columns}
      onDataChange={onRowsChange} />
  </>
}
```

Alan adlarını yalnızca güvenilir şemadan üretin. Gizlenecek alanları `columns` dizisinden çıkarabilir veya kullanıcıya sütun menüsüyle gizlettirebilirsiniz. `height`, `title`, `loading`, `filename`, `totalRows`, `pagination`, `columns` ve `data` prop'ları sonradan değiştirilebilir. `initialPageSize` yalnızca ilk açılış için kullanılır; sonradan sayfa boyutunu dışarıdan değiştirmek için aşağıdaki kontrollü `state` özelliğini kullanın.

## Sayfalama ayarları

**İstemci:** Tüm veri `data` içine gelir. Arama ve sıralama tüm kayıtlar üzerinde uygulanır, ardından bir sayfa sanal kaydırmayla görüntülenir. Varsayılan boyut 100 satırdır. `pagination={false}` sayfalamayı kapatır.

```tsx
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 100 })

<EnterpriseGrid
  title="Products"
  data={products}
  columns={productColumns}
  pagination={{
    state: pagination,
    onChange: setPagination,
    pageSizeOptions: [25, 50, 100, 250, 500],
  }}
/>

// Herhangi bir buton, ayar veya URL parametresinden sonradan değiştirme:
setPagination({ pageIndex: 0, pageSize: 250 })
```

`pageIndex` sıfırdan başlar; ekranda 1'den başlayan sayfa numarası gösterilir. Arama, filtre ve sıralama değişince ilk sayfaya dönülür. Kayıt silindikten sonra geçersiz kalan sayfa otomatik olarak son geçerli sayfaya çekilir. Kontrolsüz kullanım için `pagination={{initialPageSize: 50}}` yeterlidir.

**Sunucu:** `serverMode` açıkken `data` yalnızca mevcut sayfadaki kayıtlar olmalı; arama, sıralama ve filtreleme sunucuda uygulanmalı, `totalRows` de filtrelenen kayıt sayısını bildirmelidir. `onQueryChange` her sayfa ve sayfa boyutu değişikliğini içerir.

## Farklı kullanım örnekleri

### 1. Satış yenilemeleri

`src/data/examples.ts` içindeki `renewalColumns` ile `makeRenewals(10_000)` çağrısını kullanın. Bölge ve aşama çoklu seçim filtresi, ARR toplamı, Health ortalaması, sayı karşılaştırması ve CSV dışa aktarma örnekte çalışır.

### 2. Depo/stok

`inventoryColumns`, `makeInventory(12_000)` ile SKU araması, depo/kategori filtreleri, stok toplamı ve eşik karşılaştırması içerir. Ürün adını veya stok sayısını çift tıklayarak değiştirebilirsiniz.

### 3. Faturalar

`invoiceColumns`, `makeInvoices(1_800)` ile ödeme durumu ve tutara göre filtrelemeyi gösterir. Seçili faturaları Copy ile TSV olarak panoya, Export ile CSV olarak indirebilirsiniz.

### 4. API'den sayfa getirme

```tsx
import { useCallback, useEffect, useState } from 'react'
import { EnterpriseGrid, type GridQuery, type GridExportRequest } from './components/enterprise-grid'

const initialQuery: GridQuery = {
  search: '', sorting: [], filters: [], pageIndex: 0, pageSize: 100,
}

function RemoteCustomers() {
  const [query, setQuery] = useState(initialQuery)
  const [rows, setRows] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const onQueryChange = useCallback((next: GridQuery) => {
    setQuery(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
  }, [])

  const onExportRequest = useCallback(async (request: GridExportRequest) => {
    const response = await fetch('/api/customers/export', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error(`CSV export failed: HTTP ${response.status}`)
    return response.blob() // Grid dönen Blob'u dosya olarak indirir.
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      search: query.search,
      sort: JSON.stringify(query.sorting),
      filters: JSON.stringify(query.filters),
      limit: String(query.pageSize),
      offset: String(query.pageIndex * query.pageSize),
    })
    setLoading(true)
    fetch(`/api/customers?${params}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<{ items: Customer[]; total: number }>
      })
      .then(result => { setRows(result.items); setTotal(result.total) })
      .catch(error => { if (error.name !== 'AbortError') console.error(error) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query])

  return <EnterpriseGrid title="Customers" data={rows} columns={customerColumns}
    serverMode totalRows={total} loading={loading} onQueryChange={onQueryChange}
    onExportRequest={onExportRequest} filename="customers.csv"
    pagination={{initialPageSize: 100}} />
}
```

`Customer` ve `customerColumns` uygulamanızın tipleri ve sütunlarıdır. API örneğinde `limit/offset` kullanılıyor; veri çok büyüdüğünde cursor tabanlı sayfalama için API sözleşmesini uyarlayın. İstemci bu modda veriyi yeniden filtreleyip sıralamaz. **Seçilen ID’ler sayfalar arasında korunur.** Yüklü olmayan kayıtlar panoya kopyalanamaz; sunucu modunda seçili ID’leri veya tüm filtrelenmiş sonuçları indirmek için aşağıdaki `onExportRequest` callback’i gereklidir. Toplu silme sunucu modunda kapalıdır. Alt satır toplamları yüklü sayfaya aittir.

### Tipli filtre ve editörler

| Sütun türü | Filtre | `editable: true` editörü |
| --- | --- | --- |
| `text`, `email`, `phone` | Metin içerir | Metin, e-posta veya telefon girişi; e-posta/telefon doğrulaması |
| `number`, `price`, `progress` | Alt/üst aralık veya `>`, `<`, `=` | Sayısal giriş; ilerleme için kaydırıcı ve 0–`maximum` sınırı |
| `date`, `timestamp` | Yerel saat diliminde dahilî başlangıç ve bitiş günü | Tarih veya yerel tarih-saat; zaman damgası ISO UTC olarak saklanır |
| `select`, `status`, `country` | Çoklu seçim | Seçim listesi; durum etiketleri koddan ayrıdır |
| `tags` | Çoklu seçim; herhangi biri veya tümü | Virgülle ayrılmış etiketler bir diziye dönüştürülür |
| `boolean` | Tümü / evet / hayır | Boolean seçim menüsü |
| `url` | Adres içinde metin | Yalnızca `http(s)` URL kabul eden giriş |
| `duration`, `fileSize`, `rating`, `trend` | Saniye, bayt, puan veya değişim yüzdesi aralığı | Sayı, birimli sayı, yıldız puanı veya nokta dizisi |
| `color` | Birden fazla HEX renk | HEX ve renk seçici |

```tsx
{ key: 'price', title: 'Tutar', kind: 'price', editable: true,
  validate: (value) => Number(value) < 0 ? 'Tutar negatif olamaz' : null }
{ key: 'tags', title: 'Etiketler', kind: 'tags', editable: true,
  options: ['VIP', 'Trial', 'Enterprise'] }
```

Sunucuya gönderilen `GridQuery.filters` filtre değerleri düz JSON'dur: sayısal aralık `{op:'between',min:100,max:500}`, tarih aralığı `{from:'2026-09-01',to:'2026-09-30'}`, etiket seçimi `{values:['VIP','Trial'],mode:'all'}`. Backend filtreleri aynı anlamda yorumlamalıdır. Sunucu modunda `status`, `country` ve `tags` için **bütün olası değerleri** `options` veya `statusOptions` ile sağlayın; aksi halde filtre menüsü yalnızca yüklü sayfadaki değerleri bulabilir. `onDataChange` değişen diziyi üst bileşene verir; uzak kaydetme, hata ve iyimser güncelleme yönetimi uygulamanın sorumluluğundadır.

### Sayfalar arası seçim ve dışa aktarma

Başlıktaki seçim kutusu **geçerli sayfayı** seçer. Sonraki sayfaya geçip başka satırları seçtiğinizde önceki sayfanın ID'leri korunur. Filtre veya sıralama değişse de seçili ID'ler korunur; **Seçimi temizle** veya **Reset** ile kaldırılır. İstemci modunda **Select filtered**, o anda filtreye uyan tüm satırları seçer.

- **Current page CSV:** Yalnızca ekranda yüklü sayfayı indirir; sunucu callback'i gerekmez.
- **All filtered results CSV:** İstemci modunda bütün filtrelenmiş satırları indirir. Sunucu modunda `onExportRequest({scope:'filtered',query,...})` çağrılır; backend sonuçları üretir.
- **Export selected:** İstemci modunda tüm seçili ID'lerin satırlarını indirir. Sunucu modunda `onExportRequest({scope:'selected',selectedIds,...})` çağrılır; backend bu ID'lerin tamamını getirir. Filtre dışındaki seçili ID'ler de kapsamdadır.
- **Copy loaded:** Sunucu modunda panoya yalnızca o anda yüklü seçili satırlar yazılır; buton bunu açıkça belirtir.

Sunucudan dönen `Blob` otomatik olarak `filename` ile indirilir. Callback `void` dönerse indirmeyi kendisi yönetebilir. `onExportRequest` sağlanmadığında sunucu için toplu dışa aktarma seçenekleri devre dışı kalır. Dışa aktarma sırasında düğmeler kilitlenir; istek hatası tabloda gösterilir. Backend, istenen `columnKeys` listesini doğrulamalı, CSV hücrelerini güvenle kaçırmalı ve uygun yetki kontrolünü uygulamalıdır.

## API

| Prop | Tür | Açıklama |
|---|---|---|
| `title` | `string` | Bölüm adı ve erişilebilir etiket |
| `data` | `T[]` | Yüklü kayıtlar; `T` içinde kararlı `id` gerekir |
| `columns` | `GridColumn<T>[]` | Sütunlar ve filtre biçimi |
| `onDataChange` | `(next: T[]) => void` | Düzenleme ve silme sonrası yeni dizi |
| `onQueryChange` | `(query: GridQuery) => void` | Arama, sıralama, filtre ve sayfa değişikliği |
| `serverMode` | `boolean` | Sunucu filtreleme/sıralama ve sayfalamasını etkinleştirir |
| `pagination` | `GridPaginationOptions | false` | Sayfa durumu, boyut seçenekleri ve dış kontrol; varsayılan açık |
| `totalRows` | `number` | Sunucu modunda uzaktaki filtrelenmiş toplam satır |
| `loading` | `boolean` | Yükleme göstergesi |
| `height` | `number` | Kaydırılabilir gövde yüksekliği, varsayılan 460 |
| `filename` | `string` | CSV dosya adı |
| `onExportRequest` | `(request: GridExportRequest) => Blob | void | Promise<Blob | void>` | Sunucu modunda seçili ID’ler veya filtrelenmiş tüm kayıtlar için dışa aktarma |

`GridColumn<T>`: `key`, `title`, isteğe bağlı `width`, `kind`, `options`, `editable`, `validate`, `format`, `render`, `cellOptions`, `aggregate` (`sum`, `avg`). `format` yalnızca ekrandaki değeri değiştirir; CSV ham değeri içerir. Export menüsünde mevcut sayfa ile tüm filtrelenmiş sonuçlar ayrı seçeneklerdir. Alt satır toplamları istemci modunda tüm filtrelenmiş kayıtlardan; sunucu modunda yüklenen sayfadan hesaplanır.

## Klavye ve etkileşim

Tab ile başlıklara, menülere, onay kutularına ve satırların ilk veri hücresine ulaşın. Sütun menüleri ve çoklu seçim açılır pencereleri Radix UI tarafından yönetilir. Hücreyi çift tıklayıp düzenledikten sonra Enter ile kaydedin, Escape ile iptal edin. Delete düğmesi yalnızca istemci modunda `onDataChange` varsa çalışır ve onay ister. Reset görünüm durumunu temizler; kayıt verisini değiştirmez.

## Performans sınırı

Sanal kaydırma aktif sayfanın DOM yükünü sınırlar, fakat istemci modunda filtreleme ve sıralama yüklü tüm kayıtların üzerinde çalışır. Milyonlarca satır veya pahalı hücre dönüştürmeleri için API tarafında indeksli sorgu, cursor/sayfa getirme ve `serverMode` kullanın. Bu demo 10–12 bin satırda etkileşimi göstermeyi amaçlar. Sütun sanallaştırması, sunucudaki bilinmeyen tüm ID’leri tek işlemle seçme ve sunucu toplamları bu sürüme dahil değildir; bilinen ID’ler arasında sayfa değiştirerek seçim ve sunucuya dışa aktarma isteği desteklenir.

## Kaynaklar

- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/radix/data-table)
- [TanStack Table virtualization guide](https://tanstack.com/table/latest/docs/framework/react/guide/virtualization)
- [TanStack Virtual React](https://tanstack.com/virtual/latest/docs/framework/react)

## Özel sütun tipleri

`GridColumn<T>.kind` ham veriye dokunmadan yalnızca hücre görünümünü seçer. Aşağıdaki tipler ana showcase tablosunda ve `/types` sayfalarında çalışır; tüm `cellOptions` değerleri `columns` dizisi güncellenerek çalışma anında değiştirilebilir.

| `kind` | Beklenen ham değer | Seçenek / davranış |
| --- | --- | --- |
| `email` | E-posta metni | Geçerliyse `mailto:` bağlantısı; geçersiz veri düz metin |
| `phone` | Telefon metni | Geçerliyse `tel:` bağlantısı; görüntülenen biçim korunur |
| `progress` | Sayı | `maximum` varsayılan 100; erişilebilir ilerleme çubuğu ve yüzde |
| `price` | Sayı | `currency` varsayılan `TRY`, `locale` varsayılan `tr-TR`; `Intl.NumberFormat` |
| `tags` | Metin dizisi | `maxTags` varsayılan 2; kalanlar `+N`; tam liste başlıkta |
| `status` | Durum kodu | `statusOptions` kodu görünen etiket ve `neutral/success/warning/danger/info` tona eşler |
| `country` | ISO 3166-1 alpha-2 ülke kodu | Bayrak ve `Intl.DisplayNames` ile yerel ad; bilinmeyen kod aynen görünür |
| `timestamp` | ISO tarih, `Date`, Unix saniye veya milisaniye | `timestampFormat`: `t/T/d/D/f/F/s/S/R`; `locale`; göreli zaman için `relativeRefreshMs` |
| `boolean` | `true` / `false` | Evet/hayır rozeti; üç durumlu filtre, seçim editörü |
| `url` | Tam `http(s)` URL | Güvenli yeni sekme bağlantısı; metin filtresi, URL editörü |
| `duration` | Saniye (`number`) | `1 sa 25 dk`; saniye bazlı aralık ve editör |
| `fileSize` | Bayt (`number`) | 1000 tabanlı B/KB/MB/GB; bayt bazlı filtre, birimli editör |
| `rating` | Sayı | Dolu yıldız oranı ve puan; `ratingMax`/`ratingStep`, aralık ve kaydırıcı |
| `color` | HEX renk (`#RRGGBB`, kısa HEX veya 8 haneli HEX) | Renk örneği; çoklu filtre, HEX/renk editörü |
| `trend` | `{ points: number[], change?: number }` veya sayı dizisi | Küçük SVG grafik ve yüzde değişimi; değişim yüzdesiyle filtre/sıralama, dizi editörü |

```tsx
import type { GridColumn, TimestampFormat } from './components/enterprise-grid'

type Customer = {
  id: string; email: string; phone: string; completion: number
  amount: number; labels: string[]; state: string; country: string; updatedAt: string
}

function makeColumns(format: TimestampFormat): GridColumn<Customer>[] {
  return [
    { key: 'email', title: 'E-posta', kind: 'email' },
    { key: 'phone', title: 'Telefon', kind: 'phone' },
    { key: 'completion', title: 'İlerleme', kind: 'progress', cellOptions: { maximum: 100 } },
    { key: 'amount', title: 'Tutar', kind: 'price', cellOptions: { currency: 'EUR', locale: 'tr-TR' } },
    { key: 'labels', title: 'Etiketler', kind: 'tags', cellOptions: { maxTags: 3 } },
    { key: 'state', title: 'Durum', kind: 'status', cellOptions: {
      statusOptions: {
        active: { label: 'Aktif', tone: 'success' },
        pending: { label: 'Bekliyor', tone: 'warning' },
      },
    } },
    { key: 'country', title: 'Ülke', kind: 'country' },
    { key: 'updatedAt', title: 'Güncellendi', kind: 'timestamp',
      cellOptions: { timestampFormat: format, locale: 'tr-TR', relativeRefreshMs: 10_000 } },
  ]
}

// const [format, setFormat] = useState<TimestampFormat>('R')
// const columns = useMemo(() => makeColumns(format), [format])
// <EnterpriseGrid title="Müşteriler" data={customers} columns={columns} />
```

### Discord zaman biçimleri

| Kod | Görünüm |
| --- | --- |
| `t` | Kısa saat |
| `T` | Saniyeli saat |
| `d` | Kısa tarih |
| `D` | Uzun tarih |
| `f` | Tarih ve saat |
| `F` | Haftanın günü, tarih ve saat |
| `s` | Kısa tarih ve saat |
| `S` | Kısa tarih ve saniyeli saat |
| `R` | Göreli zaman (`2 saat önce`); varsayılan olarak dakikada bir tazelenir |

`R` biçiminde `cellOptions.relativeRefreshMs` yenileme aralığını milisaniye olarak belirler. Örneğin `1_000` her saniye, `10_000` her on saniye, `60_000` her dakika ve `300_000` her beş dakikadır. Minimum aralık 1 saniyedir. Birden fazla `R` sütunu varsa grid en kısa aralıkta tek zamanlayıcı çalıştırır; `R` kullanılmadığında zamanlayıcı kurmaz. Sekme tekrar görünür olduğunda zaman hemen tazelenir. Aralık sıklaştıkça görünür satırlar daha sık yeniden çizilir; binlerce satırlı ekranlarda çoğu kullanım için 60 saniye yeterlidir.

Tarih hücresinin üzerine gelince veya klavyeyle odaklanınca tooltip açılır. Tooltip yerel saat diliminde **tam tarih ve saati**, ayrıca kesin UTC ISO değerini gösterir. Bu davranış dokuz biçimin tamamında geçerlidir; tabloda gösterilen kısa/göreli değer ham tarihi değiştirmez. Demo sekmesinde zaman biçimi ve `R` için yenileme aralığı canlı değiştirilebilir.

Bu kodlar Discord'un **görünüm çeşitlerini** temsil eder; Discord mesajı için `<t:unix:R>` metni üretmez. Tarayıcının yerel saat dilimini kullanır. Uygulama genelinde sabit saat dilimi istiyorsanız `render` fonksiyonu ile özel biçimleyici sağlayın. Sıralama, arama, filtre ve CSV dışa aktarımı ham değerleri kullanır; göreli zaman ve para sembolü CSV'ye yazılmaz. Sunucu modunda API'nin sayısal/tarih türlerine uygun sıralama ve filtre uygulaması gerekir. `tags` sütununda birden çok etiketten herhangi biri veya tümü seçilebilir. Sunucu modunda backend aynı filtre sözleşmesini uygulamalıdır.

### Entegrasyon hücresi

`render(value, row)` hücreye React içeriği verir ve yerleşik `kind` görünümünden önce çalışır. Böylece CRM, ödeme veya mesajlaşma gibi eylemlere uygulamanın callback'lerini bağlayabilirsiniz:

```tsx
const columns: GridColumn<Customer>[] = [
  { key: 'email', title: 'Müşteri', kind: 'email', render: (email, row) => (
    <button type="button" onClick={() => openCustomer(row.id)}>{String(email)}</button>
  ) },
]
```

`format(value, row)` düz metin için kullanılmaya devam eder. Öncelik sırası `render` → `format` → `kind` görünümüdür. Çok sayıda hücrede entegrasyon verisini render sırasında ayrı API çağrılarıyla yüklemeyin; satır verisine topluca ekleyin veya görünür satırlara yönelik önbellekli veri kaynağı kullanın. `editable` açık olduğunda `status`, `country`, `select`, `tags`, `progress`, `date` ve `timestamp` için kendi editörleri açılır. Uygulamaya özgü kuralları `validate(value, row)` ile ekleyebilirsiniz.

### Ek tipler: süre, dosya boyutu, puan ve trend

`/types` sayfaları `boolean`, `url`, `duration`, `fileSize`, `rating`, `color` ve `trend` tiplerini düzenlenebilir kayıtlarla gösterir. Aşağıdaki örnekte süre **saniye**, dosya boyutu **bayt**, değişim ise **yüzde** olarak filtrelenir; ekranda yerelleştirilmiş bir değer gösterilir:

```tsx
import type { GridColumn, TrendValue } from './components/enterprise-grid'

type Metric = {
  id: number; enabled: boolean; url: string; durationSeconds: number
  bytes: number; rating: number; color: string; trend: TrendValue
}
const columns: GridColumn<Metric>[] = [
  { key: 'enabled', title: 'Aktif', kind: 'boolean', editable: true },
  { key: 'url', title: 'Site', kind: 'url', editable: true },
  { key: 'durationSeconds', title: 'Süre', kind: 'duration', editable: true },
  { key: 'bytes', title: 'Boyut', kind: 'fileSize', editable: true },
  { key: 'rating', title: 'Puan', kind: 'rating', editable: true,
    cellOptions: { ratingMax: 5, ratingStep: 0.5 } },
  { key: 'color', title: 'Renk', kind: 'color', editable: true },
  { key: 'trend', title: 'Değişim', kind: 'trend', editable: true },
]
```

`trend.change` verilirse gösterilen yüzde ve sıralama için kullanılır. Verilmezse `(son − ilk) / |ilk| × 100` hesaplanır; ilk değer 0 ise yüzde boş görünür. Grafikte en çok 60 örnek nokta çizilir. Trend editörü virgülle ayrılmış en az iki sayı alır ve değişimi yeniden hesaplamak için `{points}` kaydeder. CSV'ye trend hücresi `points` ile `change` alanlarını içeren JSON metni olarak yazılır; diğer yeni tipler ham boolean/URL/saniye/bayt/puan/HEX değerleriyle yazılır. Sunucu modunda backend aynı ham değerler üzerinden sıralama ve filtreleme yapmalıdır.

`url` tipi yalnızca geçerli `http:` ve `https:` bağlantılarını açar; geçersiz değer düz metin olarak görünür ve editörde kaydedilemez. `color` editörü HEX doğrular. `fileSize` editöründe B, KB, MB veya GB seçebilirsiniz; kayıt bayt cinsine çevrilir. `rating` aralığı ve adımı `cellOptions` ile belirlenir.
