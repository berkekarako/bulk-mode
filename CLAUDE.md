# Bulk Mode — Proje Kuralları

Tek kullanıcılık, offline çalışan vanilla PWA (build adımı YOK — React/Vite/npm paketi ekleme).
Arayüz dili Türkçe. Veri cihazda `localStorage`'da durur, sunucu/hesap yok.

## Dosyalar
- `index.html` — tek sayfa; 6 alt sekme: Bugün (Beslenme/Takviye/Kilo), Antrenman, Program (Programlarım + Sistem Programları + oluşturucu), Takvim (sürükle-bırak plan: program/yemek/su), Rapor, Market
- `app.js` — tüm uygulama mantığı (state, takvim + sürükle-bırak plan, hatırlatmalar)
- `exercises.js` — hareket kütüphanesi (EX_INFO: ~100 hareket; grup/ekipman/hedef/adımlar) + animasyonlar (SVG) + kas haritası
- `styles.css` — tema: koyu sıcak zemin, amber vurgu (#f0a63a), kırmızı ana kas (#e04f36)
- `sw.js` — service worker; HTML network-first, diğerleri cache-first

## ZORUNLU: Her değişiklikte
1. `sw.js` içindeki `CACHE` sürümünü artır (`bulk-tracker-v6` → `v7` ...) VE `index.html` başlığındaki `.app-version` etiketini aynı numaraya güncelle (`v12` → `v13` ...). Yoksa telefonda eski sürüm görünmeye devam eder / hangi sürümün açık olduğu anlaşılmaz.
2. Yeni dosya eklersen `sw.js` ASSETS listesine ve gerekirse `index.html`'e ekle.

## Veri şeması (localStorage anahtarı: `bulkTracker.v1`)
Şemayı bozacak değişiklikte eski veriyi migrate et — kullanıcının geçmiş kayıtları silinmemeli.
`load()` fonksiyonu eksik alanları defaultState ile tamamlar; yeni alanları oraya ekle.

## Görsel sistem (exercises.js)
- Sahneler parçalı: `SCENES[key]() -> {base, A, B, label}` (base: makine/zemin, A: başlangıç pozu, B: efor pozu).
- Detay panelinde animasyon YOK: her adımın yanında `poseSVG(key, "A"|"B")` ile durağan poz çizimi
  (ilk/son adım A, ara adımlar B). Kas figürü kaldırıldı — kaslar renkli mchip etiketleriyle gösterilir.
- `ANIMS` eski iki-kare animasyon API'si olarak SCENES'ten türetilir (şu an UI'da kullanılmıyor).
- Figürler `seg/arm/leg/torsoS/torsoF/headP` yardımcılarıyla dolgulu silüet olarak çizilir.
- SVG `filter` (feGaussianBlur vb.) KULLANMA — gömülü tarayıcılarda boyamayı bozuyor.
- Her sahnede: yön oku A pozunda; ekipman etiketi detayda `.ex-equip` rozetinde.

## Test
```
npx serve -l 5500 .
```
Tarayıcıda http://localhost:5500 — SW önbelleği nedeniyle değişiklik görünmezse iki kez yenile.

## Dağıtım
GitHub Pages, `main` dalı kök dizinden yayınlanır. Push sonrası ~1 dk içinde
https://<kullanıcı>.github.io/<repo>/ güncellenir; telefonda uygulamayı internetliyken bir kez aç.
