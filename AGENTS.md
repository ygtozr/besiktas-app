# Beşiktaş App çalışma kuralları

- Uygulama bağımsız taraftar projesidir; resmî kulüp ürünü gibi sunulamaz.
- `main` yalnızca kullanıcı tarafından açıkça onaylanmış kalıcı sürümleri içerir.
- Her geliştirme `feature/*` dalında yapılır ve taslak pull request ile sunulur.
- Her taslakta install, format, lint, type-check, test, build ve smoke kontrolleri çalıştırılır.
- Taslak değişiklikler Vercel Preview üzerinde doğrulanır; özet, ekran görüntüsü, PR ve Preview bağlantısı kullanıcıya verilir.
- Açık kullanıcı onayı olmadan PR birleştirilmez, `main` dalına yazılmaz, GitHub Release oluşturulmaz ve production yayını yapılmaz.
- Onaylanan sürüm SemVer etiketi, Türkçe sürüm notları ve geri alınabilir Vercel production deployment ile yayınlanır.
- API anahtarları kaynak koda, Git geçmişine, tarayıcıya veya loglara konulamaz; yalnızca sunucu tarafında ortam değişkenlerinden okunur.
- Canlı veri yoksa arayüz veriyi açıkça `Demo veri` olarak etiketler; eksik veya gecikmiş veri kullanıcıdan gizlenmez.
