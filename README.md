# Bulk Mode

Tek kullanıcılık, offline çalışan PWA. Beslenme + takviye + kilo takibi + antrenman (A/B/C rotasyonu, animasyonlu hareket görselleri) + haftalık rapor + market listesi. Veri `localStorage`'da, sunucu/hesap yok.

## Çalıştırma (PC)

```
npx serve -l 5500 .
```

Tarayıcıda `http://localhost:5500`.

## iPhone'a kurulum

Service worker (offline mod) ve bildirimler HTTPS ister; iPhone'da yerel ağ IP'si + HTTP ile çalışmaz.
En pratik yol: dosyaları ücretsiz bir statik hosta koymak (GitHub Pages önerilir).

1. GitHub'da boş bir repo aç (örn. `bulk-mode`), bu klasörü pushla.
2. Repo → Settings → Pages → Branch: `main`, klasör `/ (root)` → Save.
3. iPhone Safari'de `https://<kullanıcı>.github.io/bulk-mode/` adresini aç.
4. Paylaş düğmesi (kare + ok) → **Ana Ekrana Ekle**.
5. Uygulamayı bir kez aç — artık offline da çalışır.

Bildirim izni: Rapor sekmesi → Ayarlar → "Bildirim izni ver" (iOS 16.4+, yalnızca ana ekrana eklenmiş halde çalışır). Sunucusuz PWA sınırından dolayı uygulama tamamen kapalıyken bildirim gelmez; uygulama açıkken ve açıldığı anda kontrol edilir.

## Güncelleme

Kod değiştirince `sw.js` içindeki `CACHE` sürümünü artır (`bulk-tracker-v3` vb.) ve yeniden yükle/pushla; telefonda uygulamayı bir kez internetliyken aç.
