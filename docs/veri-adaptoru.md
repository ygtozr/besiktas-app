# Veri adaptörü ve veri modeli

Uygulama sayfaları sağlayıcı yanıtlarını doğrudan tüketmez. `FootballDataProvider`, maç, puan durumu ve oyuncuları `FootballData` ortak modeline dönüştürür.

## Sağlayıcı değiştirme

1. `src/lib/providers` altında `FootballDataProvider` uygulayan bir adaptör oluşturun.
2. Sağlayıcı yanıtlarını `src/lib/types.ts` içindeki modellere dönüştürün.
3. `src/lib/data.ts` içindeki seçimi yeni ortam değişkeni değeriyle genişletin.
4. Anahtarı yalnızca `.env.local` ve Vercel Environment Variables içinde saklayın.
5. Sağlayıcının sezon/organizasyon kapsamını test edip eksik alanları `null` olarak koruyun.

`FOOTBALL_DATA_PROVIDER=demo` yerleşik seed verisini kullanır. `api-football` seçildiğinde anahtar yalnızca sunucuda okunur; canlı kapsam doğrulanamazsa demo veri gecikmiş durum etiketiyle güvenli yedek olarak gösterilir.

## Önbellek hedefleri

- Canlı maç: 15–30 saniye
- Yaklaşan maçlar ve puan tablosu: 5–15 dakika
- Kadro: 6–24 saat

Canlı adaptör tamamlanırken son başarılı yanıtın kalıcı sunucu depolamasında tutulması gerekir. Demo sürümü yanlış bir “canlı” iddiasında bulunmaz.
