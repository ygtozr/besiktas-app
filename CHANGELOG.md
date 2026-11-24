# Sürüm notları

## 1.0.0 — 24 Kasım 2026

İlk kalıcı sürüm.

### Ekranlar

- **Ana sayfa:** sıradaki maça geri sayım, son maç skoru, Süper Lig sırası.
- **Fikstür:** Süper Lig, Avrupa ve Türkiye Kupası maçları tek listede; turnuva filtresi.
- **Maç detayı:** goller, kartlar, oyuncu değişiklikleri, ilk 11 ve yedekler, istatistikler.
- **Canlı:** skor ve olay akışı; yalnızca maç saatinde otomatik yenilenir.
- **Kadro:** maç, dakika, gol, asist; ülke adları Türkçe.
- **Puan durumu:** Süper Lig ve Avrupa Ligi sekmeleri; Beşiktaş satırı vurgulu; bölge adları Türkçe.
- **Ayarlar:** 12 tema, 7 yazı tipi, yazı boyutu %85–%140.

### Veri

- Süper Lig ve Avrupa maçları: ESPN.
- Türkiye Kupası: API-Football (sunucuya `API_FOOTBALL_KEY` eklenince açılır).
- Sunucu önbelleği, eski kopya yedeği, günlük istek sayacı ve kota koruması.

### Bilinen sınırlar

- API-Football anahtarı tanımlı değilse Türkiye Kupası maçları görünmez; uygulama bunu açıkça yazar.
- Kupa bağlantısı belgelenmiş veri biçimiyle test edildi; gerçek veriyle ilk deneme anahtar eklenince yapılmalı.
- Oyuncu dakikaları lig maçlarından hesaplanır, uzatmalar sayılmaz.
