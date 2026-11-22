# Siyah Beyaz

Kişisel Beşiktaş takip uygulaması. Telefonda ana ekrana eklenir (PWA).
Bağımsız taraftar projesi. Kulüple bağı yok. Resmî logo ve marka kullanılmaz.

## Ekranlar

| Yol        | İçerik                                                          |
| ---------- | --------------------------------------------------------------- |
| `/`        | Sıradaki maç geri sayımı, son skor, Süper Lig sırası            |
| `/fikstur` | Süper Lig + Avrupa tek liste, filtreli                          |
| `/mac/:id` | Olaylar (gol, kart, değişiklik), ilk 11 ve yedekler, istatistik |
| `/canli`   | Canlı skor, olay akışı, otomatik yenileme (yalnız maç saatinde) |
| `/kadro`   | Oyuncular: maç, dakika, gol, asist                              |
| `/puan`    | Puan durumu, Beşiktaş satırı vurgulu                            |

## Kurulum

```bash
npm install
npm run dev        # http://localhost:5173 — /api/* de çalışır
```

Anahtar gerekmez. ESPN herkese açık uç sunar.

## Kontroller

```bash
npm run format:check
npm run lint
npm run typecheck
npm test           # ağ yok, kayıtlı ESPN örnekleriyle
npm run build
npm run smoke      # gerçek ESPN verisiyle API + 6 sayfa, ekran görüntüsü smoke-out/
```

## Mimari

```
api/              Vercel fonksiyonları (ince giriş)
server/handlers/  uç mantığı
server/espn/      ESPN istemcisi + ham veri → ortak tip dönüşümü
server/cache.ts   bellek önbelleği, kaynak çökerse eski kopya (stale)
server/counter.ts günlük dış istek sayacı, log: evt=upstream_request
server/source.ts  DataSource arayüzü: yeni kaynak buraya takılır
shared/           ortak tipler + canlı pencere mantığı (sunucu ve istemci)
config/club.ts    takım ve lig ID'leri (ESPN + API-Football yedek)
src/              React arayüz
```

İstemci yalnız `/api/*` çağırır. Dış kaynak adresi ve ileride gelecek anahtarlar sunucuda kalır.

### Önbellek

| Veri             | Süre                 |
| ---------------- | -------------------- |
| Fikstür          | 6 sa (maç günü 5 dk) |
| Puan durumu      | 1 sa                 |
| Kadro + dakika   | 24 sa                |
| Canlı maç        | 2 dk                 |
| Biten maç detayı | 7 gün                |

İki katman: CDN (`s-maxage`) + sunucu belleği. Kaynak hata verirse son kopya döner,
arayüz "Gecikmiş veri" yazar.

### Canlı

Pencere: başlamadan 15 dk önce → başladıktan 150 dk sonra. Pencere dışında `/api/live`
dış istek atmaz; istemciye pencere açılınca tekrar sor der.

### Dakika

ESPN dakika vermez. Biten lig maçlarının kadro ve değişiklik verisinden hesaplanır.
Uzatmalar sayılmaz.

## Bilinen eksikler

- **Türkiye Kupası yok.** ESPN kapsamıyor. Arayüz bunu açıkça yazar.
- ESPN resmî belgeli API değil. Değişirse `server/espn/` güncellenir ya da başka kaynak takılır.
- Sayaç sunucu belleğinde; soğuk başlangıçta sıfırlanır. Tam kayıt Vercel loglarında.
  Kalıcı sayaç için `CounterStore` Redis ile değiştirilir.
- API-Football ücretsiz plan güncel sezonu ve `next`/`last` sorgularını kapatıyor;
  bu yüzden ana kaynak değil. ID'leri `config/club.ts` içinde yedek olarak duruyor.

## ID doğrulama

```bash
npm run discover   # ESPN'de takım ve lig ID'lerini doğrular
```

## Sonraki aşamalar

Push bildirimi (gol, maç başlangıcı), rakip analizi, puan simülasyonu, haberler, transfer.
Her biri yeni `server/handlers/*` + `api/*` + sayfa olarak eklenir.
