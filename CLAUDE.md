# Bulk Mode — Proje Kuralları

Tek kullanıcılık, offline çalışan vanilla PWA (build adımı YOK — React/Vite/npm paketi ekleme).
Arayüz dili Türkçe. Veri cihazda `localStorage`'da durur, sunucu/hesap yok.

## Dosyalar
- `index.html` — tek sayfa; 5 alt sekme: Bugün (Beslenme/Takviye/Kilo), Antrenman, Takvim (sürükle-bırak plan: program/yemek/su), Rapor, Market
- `app.js` — tüm uygulama mantığı (state, takvim + sürükle-bırak plan, hatırlatmalar)
- `exercises.js` — hareket animasyonları (SVG) + kas haritası
- `styles.css` — tema: koyu sıcak zemin, amber vurgu (#f0a63a), kırmızı ana kas (#e04f36)
- `sw.js` — service worker; HTML network-first, diğerleri cache-first

## ZORUNLU: Her değişiklikte
1. `sw.js` içindeki `CACHE` sürümünü artır (`bulk-tracker-v6` → `v7` ...) VE `index.html` başlığındaki `.app-version` etiketini aynı numaraya güncelle (`v12` → `v13` ...). Yoksa telefonda eski sürüm görünmeye devam eder / hangi sürümün açık olduğu anlaşılmaz.
2. Yeni dosya eklersen `sw.js` ASSETS listesine ve gerekirse `index.html`'e ekle.

## Veri şeması (localStorage anahtarı: `bulkTracker.v1`)
Şemayı bozacak değişiklikte eski veriyi migrate et — kullanıcının geçmiş kayıtları silinmemeli.
`load()` fonksiyonu eksik alanları defaultState ile tamamlar; yeni alanları oraya ekle.

## Animasyon sistemi (exercises.js)
- İki kare tekniği: `frames(A, B)` başlangıç/bitiş pozunu keskin geçişle değiştirir (SMIL discrete).
- Figürler `seg/arm/leg/torsoS/torsoF/headP` yardımcılarıyla dolgulu silüet olarak çizilir.
- SVG `filter` (feGaussianBlur vb.) KULLANMA — gömülü tarayıcılarda boyamayı bozuyor.
- Her sahnede: ekipman etiketi (sol üst), yön oku (A karesinde), efor karesinde yükselen istif.

## Test
```
npx serve -l 5500 .
```
Tarayıcıda http://localhost:5500 — SW önbelleği nedeniyle değişiklik görünmezse iki kez yenile.

## Dağıtım
GitHub Pages, `main` dalı kök dizinden yayınlanır. Push sonrası ~1 dk içinde
https://<kullanıcı>.github.io/<repo>/ güncellenir; telefonda uygulamayı internetliyken bir kez aç.
