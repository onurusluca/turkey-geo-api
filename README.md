# Turkey Geographic Data API

REST API for Turkey’s provinces (il), districts (ilçe), neighborhoods (mahalle), streets (sokak), and — where present — towns (belde) and villages (köy). The server loads **`data/jsonl/`** into memory at startup.

Dataset (October 2026): **81** provinces, **973** districts, **73,398** neighborhoods, **1,276,922** streets, **390** towns, **18,171** villages. Plan RAM accordingly (streets dominate).

## Data sources

- [NVI address inquiry](https://adres.nvi.gov.tr/VatandasIslemleri/AdresSorgu) (aligned October 2026)
- [TÜİK population statistics](https://nip.tuik.gov.tr/) (October 2025)
- [TÜİK data portal](https://veriportali.tuik.gov.tr/tr), [Biruni](https://biruni.tuik.gov.tr/medas), [Harita Genel Müdürlüğü](https://www.harita.gov.tr/)

Layout: `provinces.jsonl` plus `province-{plateId}/` folders (`districts.jsonl`, `neighborhoods.jsonl`, `streets.jsonl`, optional `towns.jsonl` / `villages.jsonl`). Override the root with `GEO_DATA_DIR`.

## Run

Needs [Bun](https://bun.sh) 1.4+ (`packageManager` in `package.json`) or Node.js 20+ with npm / yarn / pnpm.

```bash
bun install
bun run dev
```

Production: `bun run build && bun run start`. Same scripts work with npm (`npm run dev:node` uses `tsx` if you are not using Bun). Listens on **http://localhost:8080** (`PORT`).

| Variable | Description |
|----------|-------------|
| `PORT` | Listen port (default **8080**). |
| `GEO_DATA_DIR` | Dataset root (absolute or cwd-relative). Default: `data/jsonl`. |
| `CORS_ORIGIN` | Comma-separated allowed origins. If unset, CORS reflects the request `Origin`. |

## API

All routes are **GET**. Collection routes accept `limit` (default 100, max **1000**), `offset`, and `q` (Turkish-aware substring on name fields). They return `{ items, total, limit, offset }`. Single-id routes return one object. Errors: `{ error, requestId }` plus `X-Request-ID`.

| Path | Description |
|------|-------------|
| `/` | Title, version, endpoint list |
| `/health` | Liveness |
| `/api/provinces` | All provinces |
| `/api/provinces/:id` | Province by plate id |
| `/api/districts` | All districts |
| `/api/districts/:id` | District by id |
| `/api/districts/province/:provinceId` | Districts in a province |
| `/api/neighborhoods` | All neighborhoods |
| `/api/neighborhoods/:id` | Neighborhood by id |
| `/api/neighborhoods/district/:districtId` | Neighborhoods in a district |
| `/api/neighborhoods/province/:provinceId` | Neighborhoods in a province |
| `/api/streets` | All streets (large) |
| `/api/streets/:id` | Street by id (`typeCode` + `typeName`) |
| `/api/streets/province/:provinceId` | Streets in a province |
| `/api/streets/district/:districtId` | Streets in a district |
| `/api/streets/neighborhood/:neighborhoodId` | Streets in a neighborhood |
| `/api/towns` | Towns |
| `/api/towns/:id` | Town by id |
| `/api/towns/province/:provinceId` | Towns in a province |
| `/api/villages` | Villages |
| `/api/villages/:id` | Village by id |
| `/api/villages/province/:provinceId` | Villages in a province |

```bash
curl "http://localhost:8080/api/provinces?limit=10"
curl "http://localhost:8080/api/districts?q=ank&limit=50"
curl "http://localhost:8080/api/districts/province/6?limit=20&offset=20"
curl http://localhost:8080/api/districts/1217
curl http://localhost:8080/health
```

```json
{
  "items": [{ "provinceId": 6, "id": 1217, "provinceName": "ANKARA", "name": "ÇANKAYA" }],
  "total": 25,
  "limit": 100,
  "offset": 0
}
```

```json
{ "error": "Province not found", "requestId": "550e8400-e29b-41d4-a716-446655440000" }
```

Empty filters still return HTTP 200 with `"items": []` and `"total": 0`.

Street `typeName` values: Köy Sokağı, Meydan, Bulvar, Cadde, Sokak, Küme Evler.

## License

MIT. See [LICENSE](./LICENSE). Issues and PRs: [github.com/onurusluca/turkey-geo-api](https://github.com/onurusluca/turkey-geo-api). Run `bun run lint` and `bun test` before opening a PR.

---

# Türkiye Coğrafi Veri API

İl, ilçe, mahalle, sokak ve varsa belde/köy kayıtları. Veri **`data/jsonl/`** altından başlangıçta belleğe yüklenir (Ekim 2026 paketi; sokak sayısı ~1,28 milyon — RAM’i buna göre ayarlayın).

Kaynaklar: [NVI Adres Sorgu](https://adres.nvi.gov.tr/VatandasIslemleri/AdresSorgu), [TÜİK](https://nip.tuik.gov.tr/), [HGM](https://www.harita.gov.tr/).

Kurulum ve uç noktalar yukarıdaki İngilizce bölümle aynıdır (`bun install && bun run dev`, port **8080**). Liste yanıtı `{ items, total, limit, offset }`; `limit` en fazla **1000**.
