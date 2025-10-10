# Kişisel Analist ve Karşılama Ekranı Özelliği

Bu özellik, kullanıcılara siteye girdiklerinde motivasyonel bir karşılama ekranı ve kapsamlı kişisel analist sayfası sunar.

## 🎯 Özellikler

### 1. Karşılama Ekranı (Welcome Screen)
- **İlk Giriş**: Kullanıcı siteye ilk kez girdiğinde otomatik gösterilir
- **3 Adımlı Sunum**: 
  - Oyunlar oyna, XP kazan
  - Sonraki rütbeye geç
  - Kişisel analistin
- **Otomatik Kapanma**: 8 saniye sonra otomatik kapanır
- **Manuel Kapanma**: Dışarı tıklayarak veya X butonuna basarak kapatılabilir
- **Modern İkonlar**: Emoji yerine SVG ikonlar kullanılır

### 2. Kişisel Analist Sayfası
- **Günlük/Haftalık/Aylık Analizler**: 3 farklı zaman diliminde detaylı istatistikler
- **Tab Sistemi**: Günlük, haftalık ve aylık görünümler arasında geçiş
- **Motivasyonel Mesajlar**: Zaman dilimine göre kişiselleştirilmiş geri bildirimler
- **Rütbe İlerlemesi**: Mevcut rütbe ve sonraki rütbe bilgileri
- **Hedef Sistemi**: Günlük, haftalık ve aylık hedefler
- **Başarılar**: Zaman dilimine göre kazanılan başarılar
- **Öneriler**: Kişiselleştirilmiş gelişim önerileri

### 3. Aktivite Takibi
- **Günlük Takip**: Her gün için ayrı istatistikler
- **Haftalık Takip**: Haftalık toplam istatistikler
- **Aylık Takip**: Aylık toplam istatistikler
- **Haber Okuma**: Her haber okunduğunda tüm zaman dilimlerinde takip edilir
- **Yorum Yapma**: Yorum yapıldığında kaydedilir
- **Quiz Tamamlama**: Quiz oynandığında sayılır
- **Konu Takibi**: Konu takip edildiğinde güncellenir
- **Otomatik Sıfırlama**: Günlük, haftalık ve aylık sıfırlamalar

## 🛠️ Teknik Detaylar

### Yeni Dosyalar
1. **`contexts/personal-analyst-context.tsx`**: Kişisel analist mantığı
2. **`components/welcome-screen.tsx`**: Karşılama ekranı komponenti
3. **`app/[locale]/(dashboard)/analyst/page.tsx`**: Kişisel analist sayfası

### Güncellenen Dosyalar
1. **`lib/types/gamification.ts`**: Haftalık aktivite ve analist tipleri
2. **`contexts/gamification-context.tsx`**: Aktivite takibi fonksiyonları
3. **`app/[locale]/layout.tsx`**: PersonalAnalystProvider eklendi
4. **`app/[locale]/(dashboard)/dashboard/_components/dashboard.tsx`**: Karşılama ekranı entegrasyonu
5. **`i18n/messages/tr.json`**: Türkçe çeviriler

### Veri Yapıları

#### DailyActivity
```typescript
interface DailyActivity {
  date: Date;
  newsRead: number;
  commentsMade: number;
  quizzesCompleted: number;
  xpEarned: number;
  topicsFollowed: number;
  streakDays: number;
}
```

#### WeeklyActivity
```typescript
interface WeeklyActivity {
  weekStart: Date;
  weekEnd: Date;
  newsRead: number;
  commentsMade: number;
  quizzesCompleted: number;
  xpEarned: number;
  topicsFollowed: number;
  streakDays: number;
  dailyActivities: DailyActivity[];
}
```

#### MonthlyActivity
```typescript
interface MonthlyActivity {
  monthStart: Date;
  monthEnd: Date;
  newsRead: number;
  commentsMade: number;
  quizzesCompleted: number;
  xpEarned: number;
  topicsFollowed: number;
  streakDays: number;
  weeklyActivities: WeeklyActivity[];
}
```

#### PersonalAnalyst
```typescript
interface PersonalAnalyst {
  dailyStats: DailyActivity;
  weeklyStats: WeeklyActivity;
  monthlyStats: MonthlyActivity;
  achievements: string[];
  nextRankProgress: {
    currentRank: UserRank;
    nextRank: UserRank;
    xpToNext: number;
    progressPercentage: number;
  };
  motivationalMessage: string;
  recommendations: string[];
  dailyGoal: {
    target: number;
    current: number;
    percentage: number;
  };
  weeklyGoal: {
    target: number;
    current: number;
    percentage: number;
  };
  monthlyGoal: {
    target: number;
    current: number;
    percentage: number;
  };
}
```

## 🎮 Kullanım

### Karşılama Ekranı
- Kullanıcı siteye ilk kez girdiğinde otomatik gösterilir
- localStorage'da `nexachron_welcome_seen` anahtarı ile kontrol edilir
- 3 adımlı sunum ile kullanıcıya platform özelliklerini tanıtır

### Kişisel Analist
- Sidebar'dan "Kişisel Analist" linkine tıklayarak erişilir
- Günlük, haftalık ve aylık performansı detaylı olarak gösterir
- Tab sistemi ile farklı zaman dilimleri arasında geçiş
- Zaman dilimine göre motivasyonel mesajlar ve öneriler sunar
- Rütbe ilerlemesini takip eder
- Modern SVG ikonlar ile görsel zenginlik

### Aktivite Takibi
- Tüm aktiviteler otomatik olarak takip edilir
- Günlük, haftalık ve aylık olarak sıfırlanır
- Kişisel analist tarafından analiz edilir
- Zaman dilimine göre farklı eşikler ve hedefler

## 📊 Motivasyonel Mesajlar

### Günlük Mesajlar
- "Bugün 3 haber okudun, 1 yorum yaptın ve 45 XP kazandın!"
- "WOW! Bugün 5+ haber okudun! Sen gerçek bir haber tutkunusun!"

### Haftalık Mesajlar
- "Bu hafta 25 haber okudun, harika!"
- "WOW! Bu hafta 20+ haber okudun! Sen gerçek bir haber tutkunusun!"
- "Harika! Bu hafta 10+ yorumla topluluğa büyük katkı sağladın!"

### Aylık Mesajlar
- "Bu ay 80+ haber okudun! İnanılmaz bir performans!"
- "Harika! Bu ay 40+ yorumla topluluğa büyük katkı sağladın!"
- "İnanılmaz! Bu ay 2000+ XP kazandın! Sen bir XP makinesisin!"

### XP Kazanma
- Günlük: "Bugün 50+ XP kazandın! Harika!"
- Haftalık: "Bu hafta 500+ XP kazandın! Sen bir XP makinesisin!"
- Aylık: "Bu ay 2000+ XP kazandın! İnanılmaz!"

## 🎯 Hedefler

### Günlük Hedefler
Rütbeye göre belirlenen günlük XP hedefleri:
- **Yeni Katılımcı**: 15 XP
- **Aktif Okur**: 25 XP
- **Bilgi Paylaşımcısı**: 40 XP
- **Uzman Yorumcu**: 60 XP
- **Topluluk Lideri**: 80 XP

### Haftalık Hedefler
Rütbeye göre belirlenen haftalık XP hedefleri:
- **Yeni Katılımcı**: 100 XP
- **Aktif Okur**: 200 XP
- **Bilgi Paylaşımcısı**: 350 XP
- **Uzman Yorumcu**: 500 XP
- **Topluluk Lideri**: 750 XP

### Aylık Hedefler
Rütbeye göre belirlenen aylık XP hedefleri:
- **Yeni Katılımcı**: 400 XP
- **Aktif Okur**: 800 XP
- **Bilgi Paylaşımcısı**: 1400 XP
- **Uzman Yorumcu**: 2000 XP
- **Topluluk Lideri**: 3000 XP

## 🔧 Yapılandırma

### Karşılama Ekranı
- **Gösterim Süresi**: 8 saniye
- **Adım Değişim Süresi**: 2 saniye
- **Kontrol**: localStorage ile

### Aktivite Takibi
- **Haber Okuma Süresi**: 3 saniye
- **Günlük Sıfırlama**: Her gün gece yarısı
- **Haftalık Sıfırlama**: Pazar gecesi
- **Aylık Sıfırlama**: Ay sonu
- **Depolama**: React state + localStorage

## 🚀 Gelecek Geliştirmeler

- [x] Günlük analiz raporları
- [x] Aylık performans özetleri
- [x] Modern SVG ikonlar
- [ ] Sosyal karşılaştırmalar
- [ ] Kişiselleştirilmiş hedefler
- [ ] Push bildirimleri
- [ ] Email raporları
- [ ] Detaylı analitik grafikler
- [ ] Haftalık trend analizi
- [ ] Performans karşılaştırmaları

## 📱 Responsive Tasarım

- **Desktop**: Tam genişlik karşılama ekranı
- **Tablet**: Orta boyut kartlar
- **Mobile**: Kompakt tasarım
- **Tüm cihazlarda**: Smooth animasyonlar

Bu özellik kullanıcıların platformu daha iyi anlamasını ve motivasyonlarını artırmasını sağlar!
