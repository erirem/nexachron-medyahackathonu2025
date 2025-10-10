# Haber Trivia Popup Özelliği

Bu özellik, kullanıcıların güncel haberlerin %80'ini okuduktan sonra haber trivia oyununa yönlendiren bir popup gösterir.

## Özellikler

- **Haber Okuma Takibi**: Kullanıcıların okuduğu haberler otomatik olarak takip edilir
- **%80 Kuralı**: Güncel haberlerin %80'i okunduğunda popup gösterilir
- **Gamification Entegrasyonu**: Mevcut XP sistemi ile entegre çalışır
- **Çoklu Dil Desteği**: Türkçe çeviriler dahil
- **Kalıcı Depolama**: Okunan haberler ve popup durumu localStorage'da saklanır

## Teknik Detaylar

### Yeni Dosyalar

1. **`contexts/news-tracking-context.tsx`**: Haber okuma takibi için context
2. **`components/trivia-popup.tsx`**: Trivia popup komponenti
3. **`i18n/messages/tr.json`**: Türkçe çeviriler (triviaPopup bölümü)

### Güncellenen Dosyalar

1. **`app/[locale]/layout.tsx`**: NewsTrackingProvider eklendi
2. **`app/[locale]/(dashboard)/dashboard/_components/dashboard.tsx`**: Popup entegrasyonu
3. **`app/[locale]/(dashboard)/dashboard/_components/enhanced-news-modal.tsx`**: Haber okuma takibi
4. **`app/[locale]/(dashboard)/haber/[id]/_components/news-article.tsx`**: Haber okuma takibi

### Nasıl Çalışır

1. Kullanıcı bir haber makalesini 3 saniye boyunca okuduğunda, makale "okundu" olarak işaretlenir
2. Dashboard'da toplam haber sayısı ve okunan haber sayısı karşılaştırılır
3. Okunan haberlerin yüzdesi %80'e ulaştığında popup gösterilir
4. Popup'ta kullanıcı trivia oyununa yönlendirilebilir veya daha sonra hatırlatılabilir

### Test Etme

1. Dashboard'a gidin
2. Birkaç haber makalesini açın ve 3 saniye bekleyin
3. %80'e ulaştığınızda popup görünecektir
4. Console'da takip loglarını görebilirsiniz

### Yapılandırma

- **Okuma Süresi**: 3 saniye (değiştirilebilir)
- **Popup Eşiği**: %80 (değiştirilebilir)
- **XP Ödülü**: +35 XP (değiştirilebilir)

## Gelecek Geliştirmeler

- [ ] Popup eşiğini kullanıcı ayarlarından değiştirebilme
- [ ] Farklı kategoriler için ayrı takip
- [ ] Günlük/haftalık sıfırlama seçenekleri
- [ ] Daha detaylı istatistikler
