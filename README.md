# Turkey Geographic Data API

## English

A RESTful API for Turkey’s provinces (il), districts (ilçe), neighborhoods (mahalle), streets, and—where included—towns and villages. At startup the server loads the dataset from **`data/jsonl/`** (see [Data files](#data-files)).

### Data source

- **[Address inquiry (Nüfus ve Vatandaşlık İşleri)](https://adres.nvi.gov.tr/VatandasIslemleri/AdresSorgu)** — last aligned **March 2026**
- **[Nüfus İstatistikleri Portalı (Türkiye İstatistik Kurumu)](https://nip.tuik.gov.tr/)** — last reference **October 2025**
- **[Statistical data portal (Türkiye İstatistik Kurumu)](https://veriportali.tuik.gov.tr/tr)**
- **[National mapping portal (Harita Genel Müdürlüğü)](https://www.harita.gov.tr/)**
- **[Interactive statistics — Biruni (Türkiye İstatistik Kurumu)](https://biruni.tuik.gov.tr/medas)**

### Updates (April 2026)

- **Data & API (v1.3):** The bundled dataset under **`data/jsonl/`** (national file plus **`province-{id}/`** folders) adds richer province fields (population, area, postal code, altitude, phone codes, coastal/metro flags, NUTS, coordinates, maps, region), population and names on districts/neighborhoods where available, and dedicated resources for **streets**, **towns**, and **villages** (see [API reference](#api-reference)).
- **Runtime:** Optional **`GEO_DATA_DIR`** points at the dataset root (absolute or relative to the process working directory); default **`data/jsonl`**. The full index is loaded into memory at startup—plan RAM accordingly in production.
- Default workflow uses **[Bun](https://bun.sh)**; **npm** / **yarn** / **pnpm** work the same (`npm run build`, `pnpm start`). Production **`bun run start`** / **`npm start`** uses **Node** on compiled output (no Bun required at runtime).
- **API:** List routes use a **paginated envelope** (`items`, `total`, `limit`, `offset`), optional **`q`** (Turkish-aware). **`GET /health`**, **`X-Request-ID`**, errors include `requestId`.
- **Config:** Optional **`CORS_ORIGIN`** (comma-separated origins); if unset, CORS reflects the request `Origin`.
- Version **1.3.0**.

### Features

- **Complete geographic coverage:** All 81 provinces, plus districts, neighborhoods, and streets in the bundle, and towns/villages when that layer is present.
- **Simple REST interface:** JSON with predictable property names.
- **Filtering:** Districts by province; neighborhoods by district or province; streets by province, district, or neighborhood; towns/villages by province.
- **Pagination & search:** `limit` / `offset` / `q` on all collection routes (see [List responses](#list-responses)).
- **TypeScript** implementation.
- **Performance:** Dataset loaded once at startup into memory.
- **Open source:** MIT license.

### Prerequisites

- [Bun](https://bun.sh) **1.3+** (see `packageManager` in `package.json`). Alternatively **Node.js v20+** with **npm**, **yarn**, or **pnpm**.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/onurusluca/turkey-geo-api.git
cd turkey-geo-api
```

2. Install and run locally (Bun):

```bash
bun install
bun run dev
```

3. Production build and start (Bun):

```bash
bun run build
bun run start
```

*(**npm**, **yarn**, and **pnpm** work the same way, e.g. `npm install`, `npm run dev`, `pnpm start`. Development **without** Bun: `npm run dev:node` — uses `tsx`.)*

The API will be running at **http://localhost:8080** (override with `PORT`).

### Data files {#data-files}

- **Location:** `data/jsonl/` by default, or whatever **`GEO_DATA_DIR`** points to.
- **Layout:** `provinces.jsonl` at the root; optional `meta.json` (summary); one folder per province, `province-{plateId}/`, containing `districts.jsonl`, `neighborhoods.jsonl`, `streets.jsonl`, and optionally `towns.jsonl` / `villages.jsonl`.

### Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | Listen port (default **8080**). |
| `GEO_DATA_DIR` | Optional. Directory containing `provinces.jsonl` and `province-*` folders — absolute path, or relative to the process working directory. Default: **`data/jsonl`**. |
| `CORS_ORIGIN` | Optional. Comma-separated allowed origins, e.g. `https://app.example.com,https://admin.example.com`. If omitted, the server allows CORS by reflecting the request’s `Origin`. |

### API reference

All routes are **GET** only. Base URL examples use `http://localhost:8080` — replace with your host.

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| `GET` | `/` | — | API title, `version`, `endpoints`, and query hints |
| `GET` | `/health` | — | Liveness: `status`, `uptime`, `version`, `requestId` |
| `GET` | `/api/provinces` | `limit`, `offset`, `q` | All provinces (paginated envelope) |
| `GET` | `/api/provinces/:id` | — | One province by **plate ID** (`id`) |
| `GET` | `/api/districts` | `limit`, `offset`, `q` | All districts (paginated) |
| `GET` | `/api/districts/:id` | — | One district by **district** `id` |
| `GET` | `/api/districts/province/:provinceId` | `limit`, `offset`, `q` | Districts in that province (`provinceId` = plate code) |
| `GET` | `/api/neighborhoods` | `limit`, `offset`, `q` | All neighborhoods (paginated) |
| `GET` | `/api/neighborhoods/:id` | — | One neighborhood by **neighborhood** `id` |
| `GET` | `/api/neighborhoods/district/:districtId` | `limit`, `offset`, `q` | Neighborhoods in that district |
| `GET` | `/api/neighborhoods/province/:provinceId` | `limit`, `offset`, `q` | Neighborhoods in that province (`provinceId` = plate code) |
| `GET` | `/api/streets` | `limit`, `offset`, `q` | All streets (paginated; large dataset) |
| `GET` | `/api/streets/:id` | — | One street by registry `id` |
| `GET` | `/api/streets/province/:provinceId` | `limit`, `offset`, `q` | Streets in that province |
| `GET` | `/api/streets/district/:districtId` | `limit`, `offset`, `q` | Streets in that district |
| `GET` | `/api/streets/neighborhood/:neighborhoodId` | `limit`, `offset`, `q` | Streets in that neighborhood |
| `GET` | `/api/towns` | `limit`, `offset`, `q` | Towns (enrichment layer) |
| `GET` | `/api/towns/:id` | — | One town by `id` |
| `GET` | `/api/towns/province/:provinceId` | `limit`, `offset`, `q` | Towns in that province |
| `GET` | `/api/villages` | `limit`, `offset`, `q` | Villages (enrichment layer) |
| `GET` | `/api/villages/:id` | — | One village by `id` |
| `GET` | `/api/villages/province/:provinceId` | `limit`, `offset`, `q` | Villages in that province |

**Query parameters** (only on rows where the Query column lists them):

| Query | Description |
|-------|-------------|
| `limit` | Page size. Default **100**, maximum **50000**. |
| `offset` | Rows to skip. Default **0**. |
| `q` | Case-insensitive substring search (Turkish **İ/I**, **i/ı** aware). Matches **`name`** / **`fullOfficialName`** where present; **district** also matches **`provinceName`**; **neighborhood** matches **`provinceName`** and **`districtName`**; **street** matches those plus **`neighborhoodName`**; **town** / **village** match **`name`**, **`provinceName`**, **`districtName`**. |

**Response shape:** Rows with **`limit` / `offset` / `q`** return `{ "items", "total", "limit", "offset" }`. Rows with **—** under Query return a **single** JSON object. Errors return `{ "error", "requestId" }` with an appropriate HTTP status.

### List responses

Successful **collection** responses look like:

```json
{
  "items": [ /* array of resource objects */ ],
  "total": 973,
  "limit": 100,
  "offset": 0
}
```

- **`total`** is the number of rows **after** applying `q` (and route filters such as province/district), **before** slicing with `limit`/`offset`.
- If nothing matches, you still get **HTTP 200** with `"items": []` and `"total": 0`.

### Example usage

#### Paginated provinces (first page)

```bash
curl "http://localhost:8080/api/provinces?limit=10&offset=0"
```

#### Search districts whose name or province name contains “ank”

```bash
curl "http://localhost:8080/api/districts?q=ank&limit=50"
```

#### Districts of Ankara (province ID 6), second page

```bash
curl "http://localhost:8080/api/districts/province/6?limit=20&offset=20"
```

#### Single district by ID (plain object, not wrapped)

```bash
curl http://localhost:8080/api/districts/1217
```

#### Health check

```bash
curl http://localhost:8080/health
```

### Response format examples

**Collection (paginated):**

```json
{
  "items": [
    {
      "provinceId": 6,
      "id": 1217,
      "provinceName": "ANKARA",
      "name": "ÇANKAYA",
      "area": 268,
      "population": 922536,
      "postalCode": "06690",
      "fullOfficialName": "ÇANKAYA",
      "registrationNo": 1231
    },
    {
      "provinceId": 6,
      "id": 1233,
      "provinceName": "ANKARA",
      "name": "KEÇİÖREN",
      "area": 190,
      "population": 942884,
      "postalCode": "06380",
      "fullOfficialName": "KEÇİÖREN",
      "registrationNo": 1743
    }
  ],
  "total": 25,
  "limit": 100,
  "offset": 0
}
```

**Single resource (`GET /api/districts/:id`):**

```json
{
  "provinceId": 6,
  "id": 1217,
  "provinceName": "ANKARA",
  "name": "ÇANKAYA",
  "area": 268,
  "population": 922536,
  "postalCode": "06690",
  "fullOfficialName": "ÇANKAYA",
  "registrationNo": 1231
}
```

**Error (includes `requestId`):**

```json
{
  "error": "Province not found",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Contributing

1. Open an issue or pull request on [GitHub](https://github.com/onurusluca/turkey-geo-api).
2. For code changes: branch from `main`, keep commits focused, and describe what you changed in the PR.
3. Before opening a PR, run `bun run lint` (npm / yarn / pnpm: `npm run lint`, etc.) and fix any reported issues.

### License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## Turkish

# Türkiye Coğrafi Veri API’si

Türkiye’nin illeri, ilçeleri, mahalleleri, sokakları ve varsa belde/köy kayıtları için coğrafi veri sunan bir RESTful API. Sunucu veri setini başlangıçta **`data/jsonl/`** altından yükler ([Veri dosyaları](#veri-dosyalari-bolumu)).

### Veri kaynağı

- **[Nüfus ve Vatandaşlık İşleri adres sorgu](https://adres.nvi.gov.tr/VatandasIslemleri/AdresSorgu)** — son hizalama **Mart 2026**
- **[Nüfus İstatistikleri Portalı (Türkiye İstatistik Kurumu)](https://nip.tuik.gov.tr/)** — son referans **Ekim 2025**
- **[Türkiye İstatistik Kurumu veri portalı](https://veriportali.tuik.gov.tr/tr)**
- **[Harita Genel Müdürlüğü](https://www.harita.gov.tr/)**
- **[Biruni — interaktif istatistik (Türkiye İstatistik Kurumu)](https://biruni.tuik.gov.tr/medas)**

### Güncellemeler (Nisan 2026)

- **Veri ve API (v1.3):** **`data/jsonl/`** altındaki paket (ülke dosyası + **`province-{id}/`** klasörleri) illerde nüfus, alan, posta kodu, rakım, telefon kodları, kıyı/büyükşehir, NUTS, koordinat, harita ve bölge bilgileri; ilçe ve mahallelerde mümkün olan ölçüde nüfus ve adlar; **sokak**, **belde** ve **köy** için ayrı uç noktalar sunar ([API referansı](#api-referansi-bolumu)).
- **Çalışma zamanı:** İsteğe bağlı **`GEO_DATA_DIR`** veri kökünü gösterir (mutlak veya süreç çalışma dizinine göre göreli); varsayılan **`data/jsonl`**. Tüm indeks başlangıçta belleğe yüklenir — üretimde RAM’i buna göre ayarlayın.
- Varsayılan iş akışı **[Bun](https://bun.sh)**; **npm** / **yarn** / **pnpm** aynı şekilde. Üretimde **`bun run start`** / **`npm start`** derlenmiş çıktıyı **Node** ile çalıştırır.
- **API:** Sayfalı liste; **`q`** araması; **`GET /health`**, **`X-Request-ID`**, hatalarda `requestId`.
- **Yapılandırma:** **`CORS_ORIGIN`** isteğe bağlı.
- Sürüm **1.3.0**.

### Özellikler

- **Tam kapsama:** 81 il, ilçe ve mahalleler, paketteki sokaklar; varsa belde ve köy kayıtları.
- **Basit REST arayüzü:** Öngörülebilir JSON alan adları.
- **Filtreleme:** İle göre ilçeler; ilçe veya ile göre mahalleler; ile/ilçe/mahalleye göre sokaklar; ile göre belde/köy.
- **Sayfalama ve arama:** Tüm koleksiyon rotalarında `limit` / `offset` / `q` ([Liste yanıtları](#liste-yanitlari-bolumu)).
- **TypeScript** ile geliştirilmiştir.
- **Performans:** Veri setinin başlangıçta bir kez belleğe yüklenmesi.
- **Açık kaynak:** MIT lisansı.

### Gereksinimler

- [Bun](https://bun.sh) **1.3+** (`package.json` içindeki `packageManager`). Alternatif: **Node.js v20+** ve **npm**, **yarn** veya **pnpm**.

### Kurulum

1. Depoyu klonlayın:

```bash
git clone https://github.com/onurusluca/turkey-geo-api.git
cd turkey-geo-api
```

2. Kur ve yerelde çalıştır (Bun):

```bash
bun install
bun run dev
```

3. Üretim derlemesi ve başlatma (Bun):

```bash
bun run build
bun run start
```

*(**npm**, **yarn** ve **pnpm** aynı şekilde kullanılabilir, örn. `npm install`, `npm run dev`, `pnpm start`. Bun olmadan geliştirme: `npm run dev:node` — `tsx` kullanır.)*

API **http://localhost:8080** adresinde çalışır (`PORT` ile değiştirilebilir).

### Veri dosyaları {#veri-dosyalari-bolumu}

- **Konum:** Varsayılan **`data/jsonl/`**, veya **`GEO_DATA_DIR`** ile verdiğiniz kök.
- **Düzen:** Kökte `provinces.jsonl`; isteğe bağlı `meta.json`; il başına `province-{plaka}/` klasörü içinde `districts.jsonl`, `neighborhoods.jsonl`, `streets.jsonl`, isteğe bağlı `towns.jsonl` / `villages.jsonl`.

### Ortam değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `PORT` | Dinleme portu (varsayılan **8080**). |
| `GEO_DATA_DIR` | İsteğe bağlı. `provinces.jsonl` ve `province-*` klasörlerini içeren dizin — mutlak yol veya süreç çalışma dizinine göre göreli. Varsayılan: **`data/jsonl`**. |
| `CORS_ORIGIN` | İsteğe bağlı. Virgülle ayrılmış izinli kökenler, örn. `https://app.example.com,https://admin.example.com`. Boş bırakılırsa sunucu CORS’ta isteğin `Origin` değerini yansıtır. |

### API referansı {#api-referansi-bolumu}

Tüm uç noktalar yalnızca **GET** kullanır. Örneklerde taban adres `http://localhost:8080` — kendi sunucunuzla değiştirin.

| Metot | Yol | Sorgu | Açıklama |
|-------|-----|-------|----------|
| `GET` | `/` | — | API başlığı, `version`, `endpoints`, sorgu ipuçları |
| `GET` | `/health` | — | Canlılık: `status`, `uptime`, `version`, `requestId` |
| `GET` | `/api/provinces` | `limit`, `offset`, `q` | Tüm iller (sayfalı zarf) |
| `GET` | `/api/provinces/:id` | — | Tek il — **plaka** `id` |
| `GET` | `/api/districts` | `limit`, `offset`, `q` | Tüm ilçeler (sayfalı) |
| `GET` | `/api/districts/:id` | — | Tek ilçe — **ilçe** `id` |
| `GET` | `/api/districts/province/:provinceId` | `limit`, `offset`, `q` | O ilin ilçeleri (`provinceId` = plaka) |
| `GET` | `/api/neighborhoods` | `limit`, `offset`, `q` | Tüm mahalleler (sayfalı) |
| `GET` | `/api/neighborhoods/:id` | — | Tek mahalle — **mahalle** `id` |
| `GET` | `/api/neighborhoods/district/:districtId` | `limit`, `offset`, `q` | O ilçenin mahalleleri |
| `GET` | `/api/neighborhoods/province/:provinceId` | `limit`, `offset`, `q` | O ilin mahalleleri (`provinceId` = plaka) |
| `GET` | `/api/streets` | `limit`, `offset`, `q` | Tüm sokaklar (sayfalı; büyük veri) |
| `GET` | `/api/streets/:id` | — | Tek sokak — kayıt `id` |
| `GET` | `/api/streets/province/:provinceId` | `limit`, `offset`, `q` | O ilin sokakları |
| `GET` | `/api/streets/district/:districtId` | `limit`, `offset`, `q` | O ilçenin sokakları |
| `GET` | `/api/streets/neighborhood/:neighborhoodId` | `limit`, `offset`, `q` | O mahallenin sokakları |
| `GET` | `/api/towns` | `limit`, `offset`, `q` | Beldeler (zenginleştirme) |
| `GET` | `/api/towns/:id` | — | Tek belde — `id` |
| `GET` | `/api/towns/province/:provinceId` | `limit`, `offset`, `q` | O ilin beldeleri |
| `GET` | `/api/villages` | `limit`, `offset`, `q` | Köyler (zenginleştirme) |
| `GET` | `/api/villages/:id` | — | Tek köy — `id` |
| `GET` | `/api/villages/province/:provinceId` | `limit`, `offset`, `q` | O ilin köyleri |

**Sorgu parametreleri** (yalnızca Sorgu sütununda listelenen satırlar):

| Sorgu | Açıklama |
|-------|----------|
| `limit` | Sayfa boyutu. Varsayılan **100**, en fazla **50000**. |
| `offset` | Atlanacak satır. Varsayılan **0**. |
| `q` | Büyük/küçük harf duyarsız alt dize (Türkçe **İ/I**, **i/ı** uyumlu). Var olan **`name`** / **`fullOfficialName`**; ilçede **`provinceName`**; mahallede **`provinceName`** ve **`districtName`**; sokakta bunlar ve **`neighborhoodName`**; belde/köyde **`name`**, **`provinceName`**, **`districtName`**. |

**Yanıt şekli:** `limit` / `offset` / `q` içeren satırlar `{ "items", "total", "limit", "offset" }` döner. Sorgu sütunu **—** olan satırlar **tek** JSON nesnesi. Hatalar uygun HTTP durumu ile `{ "error", "requestId" }`.

### Liste yanıtları {#liste-yanitlari-bolumu}

Başarılı **koleksiyon** yanıtı şuna benzer:

```json
{
  "items": [ /* il, ilçe veya mahalle nesneleri dizisi */ ],
  "total": 973,
  "limit": 100,
  "offset": 0
}
```

- **`total`**, `limit`/`offset` diliminden önce `q` ve rota filtreleri uygulandıktan sonra kalan satır sayısıdır.
- Eşleşme yoksa yine **HTTP 200**, `"items": []` ve `"total": 0`.

### Kullanım örnekleri

#### Sayfalı iller (ilk sayfa)

```bash
curl "http://localhost:8080/api/provinces?limit=10&offset=0"
```

#### Adında veya il adında “ank” geçen ilçeler

```bash
curl "http://localhost:8080/api/districts?q=ank&limit=50"
```

#### Ankara ilçeleri (il ID 6), ikinci sayfa

```bash
curl "http://localhost:8080/api/districts/province/6?limit=20&offset=20"
```

#### Tek ilçe ID ile (zarf yok, düz nesne)

```bash
curl http://localhost:8080/api/districts/1217
```

#### Sağlık kontrolü

```bash
curl http://localhost:8080/health
```

### Yanıt formatı örnekleri

**Koleksiyon (sayfalı):**

```json
{
  "items": [
    {
      "provinceId": 6,
      "id": 1217,
      "provinceName": "ANKARA",
      "name": "ÇANKAYA",
      "area": 268,
      "population": 922536,
      "postalCode": "06690",
      "fullOfficialName": "ÇANKAYA",
      "registrationNo": 1231
    },
    {
      "provinceId": 6,
      "id": 1233,
      "provinceName": "ANKARA",
      "name": "KEÇİÖREN",
      "area": 190,
      "population": 942884,
      "postalCode": "06380",
      "fullOfficialName": "KEÇİÖREN",
      "registrationNo": 1743
    }
  ],
  "total": 25,
  "limit": 100,
  "offset": 0
}
```

**Tek kaynak (`GET /api/districts/:id`):**

```json
{
  "provinceId": 6,
  "id": 1217,
  "provinceName": "ANKARA",
  "name": "ÇANKAYA",
  "area": 268,
  "population": 922536,
  "postalCode": "06690",
  "fullOfficialName": "ÇANKAYA",
  "registrationNo": 1231
}
```

**Hata (`requestId` ile):**

```json
{
  "error": "Province not found",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Katkıda bulunma

1. [GitHub](https://github.com/onurusluca/turkey-geo-api) üzerinden issue veya pull request açın.
2. Kod değişiklikleri için: `main` dalından dal açın, commit’leri odaklı tutun ve PR’da neyi değiştirdiğinizi yazın.
3. PR açmadan önce `bun run lint` (npm / yarn / pnpm: `npm run lint` vb.) çalıştırın ve uyarıları giderin.

### Lisans

Bu proje MIT Lisansı altındadır. Ayrıntılar için [LICENSE](./LICENSE) dosyasına bakın.
