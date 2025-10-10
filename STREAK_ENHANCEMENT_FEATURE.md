# Streak Özelliği Geliştirmeleri

Bu özellik, kullanıcıların streak (günlük giriş serisi) özelliğini daha belirgin hale getirir ve her girişte motivasyonel popup gösterir.

## 🎯 Özellikler

### 1. Gelişmiş Sidebar Streak Gösterimi
- **Belirgin Tasarım**: Streak bilgisi artık özel bir kart içinde gösterilir
- **Gradient Arka Plan**: Turuncu-kırmızı gradient ile dikkat çekici tasarım
- **Büyük Sayılar**: Streak sayısı büyük ve kalın font ile vurgulanır
- **Sonraki Hedef**: Kullanıcının sonraki milestone'u gösterilir
- **Streak Koruması**: Koruma hakkı varsa gösterilir

### 2. Günlük Streak Popup'ı
- **Her Girişte Gösterim**: Kullanıcı her giriş yaptığında otomatik gösterilir
- **5 Saniye Otomatik Kapanma**: Kullanıcı müdahale etmezse otomatik kapanır
- **Manuel Kapanma**: Dışarı tıklayarak veya X butonuna basarak kapatılabilir
- **Günlük Kontrol**: Aynı gün içinde sadece bir kez gösterilir

### 3. Kapsamlı Streak Bilgileri
- **Mevcut Streak**: Kullanıcının güncel streak sayısı
- **En Uzun Streak**: Kullanıcının ulaştığı en yüksek streak
- **Streak Bonusu**: Günlük streak bonusu hesaplama
- **Sonraki Hedefler**: Yaklaşan milestone'lar ve ödülleri
- **Streak Koruması**: Mevcut koruma hakkı bilgisi

## 🛠️ Teknik Detaylar

### Yeni Dosyalar
1. **`components/streak-popup.tsx`**: Streak popup komponenti
2. **`STREAK_ENHANCEMENT_FEATURE.md`**: Bu dokümantasyon

### Güncellenen Dosyalar
1. **`components/user-profile/mini-profile-widget.tsx`**: Sidebar streak tasarımı
2. **`app/[locale]/(dashboard)/dashboard/_components/dashboard.tsx`**: Streak popup entegrasyonu
3. **`contexts/gamification-context.tsx`**: Streak bonus hesaplama
4. **`i18n/messages/tr.json`**: Streak popup çevirileri

### Veri Yapıları

#### Streak Popup Props
```typescript
interface StreakPopupProps {
  isVisible: boolean;
  onClose: () => void;
}
```

#### Streak Milestone
```typescript
interface StreakMilestone {
  days: number;
  reward: number;
  title: string;
}
```

## 🎮 Kullanıcı Deneyimi

### Sidebar Streak Gösterimi
1. **Görsel Vurgu**: Turuncu-kırmızı gradient kart ile dikkat çekici
2. **Büyük Sayılar**: Streak sayısı 2xl font ile vurgulanır
3. **Sonraki Hedef**: Kullanıcının ulaşabileceği sonraki milestone
4. **Koruma Bilgisi**: Streak koruması varsa gösterilir

### Streak Popup
1. **Otomatik Gösterim**: Her girişte otomatik olarak gösterilir
2. **Animasyonlu Giriş**: Smooth scale ve opacity animasyonları
3. **Kapsamlı Bilgi**: Mevcut streak, en uzun streak, bonus bilgileri
4. **Motivasyonel Mesajlar**: Streak seviyesine göre kişiselleştirilmiş mesajlar
5. **Sonraki Hedefler**: Yaklaşan milestone'lar ve ödülleri

## 📊 Streak Bonus Sistemi

### Günlük Bonus Hesaplama
- **0-6 gün**: Günlük streak × 5 XP
- **7-29 gün**: Günlük streak × 10 XP
- **30+ gün**: Günlük streak × 20 XP

### Milestone Ödülleri
- **7 gün**: 50 XP bonus
- **30 gün**: 200 XP bonus
- **100 gün**: 500 XP bonus
- **365 gün**: 1000 XP bonus

## 🎨 Tasarım Özellikleri

### Sidebar Streak Kartı
- **Gradient Arka Plan**: `from-orange-500/20 to-red-500/20`
- **Border**: `border-orange-500/30`
- **İkon**: SVG flame ikonu
- **Typography**: Büyük sayılar ve vurgulu metinler

### Streak Popup
- **Arka Plan**: `from-orange-900/90 to-red-900/90`
- **Border**: `border-orange-500/30`
- **Animasyonlar**: Scale ve opacity geçişleri
- **Responsive**: Tüm cihazlarda uyumlu

## 🔧 Yapılandırma

### Popup Gösterim Kontrolü
- **localStorage Anahtarı**: `nexachron_streak_popup_last_shown`
- **Günlük Kontrol**: Aynı gün içinde tekrar gösterilmez
- **İlk Ziyaret**: Welcome screen'den sonra gösterilir

### Otomatik Kapanma
- **Süre**: 5 saniye
- **Manuel Kapanma**: Dışarı tıklama veya X butonu
- **Animasyon**: Smooth fade out

## 🚀 Gelecek Geliştirmeler

- [ ] Streak streak'leri için özel rozetler
- [ ] Streak leaderboard'u
- [ ] Streak streak'leri için özel ödüller
- [ ] Streak streak'leri için push bildirimleri
- [ ] Streak streak'leri için sosyal paylaşım
- [ ] Streak streak'leri için detaylı istatistikler

## 📱 Responsive Tasarım

- **Desktop**: Tam genişlik popup ve sidebar kartı
- **Tablet**: Orta boyut popup ve kompakt sidebar
- **Mobile**: Küçük popup ve minimal sidebar
- **Tüm cihazlarda**: Smooth animasyonlar ve geçişler

## 🎯 Motivasyonel Mesajlar

### Streak Seviyelerine Göre
- **0 gün**: "Hadi başlayalım! İlk streak'ini oluştur!"
- **1 gün**: "Harika! İlk gününü tamamladın!"
- **2-6 gün**: "X günlük streak'in devam ediyor!"
- **7-29 gün**: "Mükemmel! X günlük streak'in harika!"
- **30+ gün**: "İnanılmaz! X günlük streak'in efsane!"

Bu özellik kullanıcıların streak'lerini korumalarını teşvik eder ve günlük giriş alışkanlığı oluşturmalarına yardımcı olur! 🔥
