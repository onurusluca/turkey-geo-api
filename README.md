# Turkey Geographic Data API (2024 Edition)

## English

A comprehensive RESTful API providing accurate and up-to-date geographic data for Turkey, including provinces (il), districts (ilçe), and neighborhoods (mahalle).

## Features

- **Complete Geographic Coverage**: Access data for all 81 provinces of Turkey, their districts, and neighborhoods
- **Simple RESTful Interface**: Easy-to-use API endpoints with intuitive structure
- **Filtering Capabilities**: Filter districts by province and neighborhoods by district or province
- **TypeScript Implementation**: Built with TypeScript for robust type safety
- **Performance Optimized**: Fast response times with minimal overhead
- **Open Source**: Free to use and extend under MIT license

## Installation

### Prerequisites

- Node.js (v20+)
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone https://github.com/onurusluca/turkey-geo-api.git
cd turkey-geo-api
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. For development with auto-restart:

```bash
npm run dev
# or
yarn dev
```

Build the project:

```bash
npm run build
# or
yarn build
```

Start the server:

```bash
npm start
# or
yarn start
```

The API will be running at <http://localhost:8080>.

## API Endpoints

### Provinces (İller)

| Endpoint | Description |
|----------|-------------|
| `GET /api/provinces` | Get all provinces |
| `GET /api/provinces/:id` | Get a specific province by ID (Plate number) |

### Districts (İlçeler)

| Endpoint | Description |
|----------|-------------|
| `GET /api/districts` | Get all districts |
| `GET /api/districts/:id` | Get a specific district by ID |
| `GET /api/districts/province/:provinceId` | Get all districts for a specific province |

### Neighborhoods (Mahalleler)

| Endpoint | Description |
|----------|-------------|
| `GET /api/neighborhoods` | Get all neighborhoods |
| `GET /api/neighborhoods/:id` | Get a specific neighborhood by ID |
| `GET /api/neighborhoods/district/:districtId` | Get all neighborhoods for a specific district |
| `GET /api/neighborhoods/province/:provinceId` | Get all neighborhoods for a specific province |

## Example Usage

### Get all provinces

```bash
curl http://localhost:8080/api/provinces
```

### Get districts of Ankara (province ID 6)

```bash
curl http://localhost:8080/api/districts/province/6
```

### Response Format

```json
[
  {
    "provinceId": 6,
    "id": 1217,
    "province": "Ankara",
    "name": "Çankaya",
    "area": 268
  },
  {
    "provinceId": 6,
    "id": 1233,
    "province": "Ankara",
    "name": "Keçiören",
    "area": 190
  }
]
```

## License

This project is licensed under the MIT License. Feel free to use and extend it as you wish - see the LICENSE file for details.

---

## Turkish

# Türkiye Coğrafi Veri API'si (2024 Sürümü)

Türkiye'nin tüm illeri, ilçeleri ve mahalleleri hakkında doğru ve güncel coğrafi veriler sunan kapsamlı bir RESTful API.

## Özellikler

- **Tam Coğrafi Kapsama**: Türkiye'nin 81 ilinin, ilçelerinin ve mahallelerinin verilerine erişim
- **Basit RESTful Arayüz**: Sezgisel yapıya sahip, kullanımı kolay API endpoint'leri
- **Filtreleme Özellikleri**: İllere göre ilçeleri, ilçelere veya illere göre mahalleleri filtreleme
- **TypeScript İmplementasyonu**: Güçlü tip güvenliği için TypeScript ile geliştirilmiştir
- **Performans Odaklı**: Minimum yük ile hızlı yanıt süreleri
- **Açık Kaynak**: MIT lisansı altında ücretsiz kullanım ve geliştirme

## Kurulum

### Gereksinimler

- Node.js (v20+)
- npm veya yarn

### Kurulum Adımları

1. Depoyu klonlayın:

```bash
git clone https://github.com/onurusluca/turkey-geo-api.git
cd turkey-geo-api
```

2. Bağımlılıkları yükleyin:

```bash
npm install
# veya
yarn install
```

3. Geliştirme için otomatik yeniden başlatma ile:

```bash
npm run dev
# veya
yarn dev
```

Projeyi derleyin:

```bash
npm run build
# veya
yarn build
```

Sunucuyu başlatın:

```bash
npm start
# veya
yarn start
```

API <http://localhost:8080> adresinde çalışıyor olacaktır.

## API Endpoint'leri

### İller

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/provinces` | Tüm illeri getir |
| `GET /api/provinces/:id` | ID'ye göre belirli bir ili getir (Plaka numarası) |

### İlçeler

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/districts` | Tüm ilçeleri getir |
| `GET /api/districts/:id` | ID'ye göre belirli bir ilçeyi getir |
| `GET /api/districts/province/:provinceId` | Belirli bir ilin tüm ilçelerini getir |

### Mahalleler

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/neighborhoods` | Tüm mahalleleri getir |
| `GET /api/neighborhoods/:id` | ID'ye göre belirli bir mahalleyi getir |
| `GET /api/neighborhoods/district/:districtId` | Belirli bir ilçenin tüm mahallelerini getir |
| `GET /api/neighborhoods/province/:provinceId` | Belirli bir ilin tüm mahallelerini getir |

## Kullanım Örnekleri

### Tüm illeri getir

```bash
curl http://localhost:8080/api/provinces
```

### Ankara'nın ilçelerini getir (il ID'si 6)

```bash
curl http://localhost:8080/api/districts/province/6
```

### Yanıt Formatı

```json
[
  {
    "provinceId": 6,
    "id": 1217,
    "province": "Ankara",
    "name": "Çankaya",
    "area": 268
  },
  {
    "provinceId": 6,
    "id": 1233,
    "province": "Ankara",
    "name": "Keçiören",
    "area": 190
  }
]
```

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. İstediğiniz gibi kullanabilir ve geliştirebilirsiniz - detaylar için LICENSE dosyasına bakın.
