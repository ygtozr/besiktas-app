# Sürüm notları

## 1.1.0 — 24 Kasım 2026

- **Asistler:** Olaylarda golün altında asist yapan yazar. ESPN asisti gole bağlamadığı için
  yalnızca kesin eşleşen asistler gole yazılır (oyuncu o dakikada sahada mı, kaç asisti var);
  belirsiz olanlar olay listesinin altında "Asist yapanlar" olarak ayrıca gösterilir.
  Türkiye Kupası maçlarında asist doğrudan API-Football'dan gelir.
- **Saha dizilişi:** Kadrolar sekmesinde ilk 11 sahada dizilişe göre gösterilir.
  Oyundan çıkanların üstünde ⇄ işareti, altında dakika ve giren oyuncu yazar; gol ve kartlar
  oyuncunun üstünde işaretlenir. Yedekler listesinde oyuna girenler önce, kimin yerine girdiği ile.
- Büyük yazı boyutunda skor ve takım adları taşmaz.

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
