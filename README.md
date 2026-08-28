# Beşiktaş App

Beşiktaş futbol takımına odaklanan, mobil öncelikli ve herkese açık bağımsız taraftar uygulaması.

> Bağımsız taraftar projesidir. Beşiktaş Jimnastik Kulübü'nün resmî uygulaması değildir.

## Özellikler

- Ana sayfa maç merkezi, geri sayım, son form ve lig konumu
- Organizasyon ve sezon filtreli fikstür; puan tablosu ve eşleşme görünümleri
- Pozisyon gruplu kadro ve oyuncu detayları
- Takım ve oyuncu performans görünümleri
- Mobil alt navigasyon, masaüstü üst navigasyon ve sistem tercihine göre açık/koyu tema
- Demo veri ve API-Football için değiştirilebilir sunucu adaptörü

## Yerel kurulum

Node.js 24 ve pnpm 11 gerekir.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Uygulama `http://localhost:3000` adresinde açılır. Varsayılan ortam demo veridir; API anahtarı gerekmez.

## Kontroller

```bash
pnpm format:check
pnpm lint
pnpm type-check
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:smoke
```

GitHub Actions aynı install, format, lint, type-check, test, build ve masaüstü smoke zincirini çalıştırır.

## Veri kaynağı

İlk preview açıkça etiketlenmiş kurgu demo verisi kullanır. Oyuncu fotoğrafları lisans doğrulaması yapılana kadar numaralı placeholder olarak gösterilir. API-Football canlı adaptörü için `.env.example` ve [adaptör belgesi](docs/veri-adaptoru.md) incelenebilir. Türkiye Kupası, güncel UEFA organizasyonu ve oyuncu dakikalarının sezon bazlı kapsamı canlı kullanımdan önce doğrulanmalıdır.

## Git ve sürümleme

Yeni çalışmalar `feature/*` dallarında taslak PR ve Vercel Preview ile sunulur. Kullanıcı açıkça onaylamadan `main` birleştirmesi, GitHub Release veya production deployment yapılmaz. Onaylanan kalıcı sürümler SemVer etiketi ve Türkçe sürüm notlarıyla yayınlanır.

## Vercel

Repo Vercel’e bağlandığında feature dalları Preview Deployment üretir. `FOOTBALL_DATA_PROVIDER` ve gizli API anahtarları Preview/Production ortamlarında ayrı ayrı Vercel Environment Variables olarak tanımlanır. Onaylanan preview aynı artefakt korunarak production’a terfi ettirilir; önceki deployment ve Git etiketi geri dönüş noktasıdır.
