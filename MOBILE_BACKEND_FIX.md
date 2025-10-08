# Mobil Backend Bağlantı Sorunu Düzeltmesi

## Sorun
Mobil uygulamada backend'den haber verilerini çekerken şu hata oluşuyordu:
```
type '_Map<String, dynamic>' is not a subtype of type 'String?' in type cast
```

## Kök Sebep
Backend API'den dönen `NewsWithMediaDto` nesnesinde:
- `category` alanı eksikti (sadece `categoryId` vardı)
- Mobil uygulama hem `category` hem de `categoryId` bekliyordu
- API response'unda `category: null` geliyordu, bu da parsing hatalarına neden oluyordu

## Çözüm

### 1. Backend Değişiklikleri

#### `packages/shared-types/index.d.ts`
```typescript
export interface NewsWithMediaDto {
  // ... diğer alanlar
  categoryId: string | null;
  category?: string | null; // ✨ Yeni eklendi - Category label/name
  // ... diğer alanlar
}
```

#### `apps/api/src/news/news.service.ts`
- `mapNewsRow` metoduna category mapping eklendi
- Category ID'den label'a dönüşüm yapılıyor (örn: "dunya" → "Dünya")
- API response artık hem `categoryId` hem de `category` döndürüyor

### 2. Mobil Uygulama Değişiklikleri

#### `apps/mobile/lib/features/news/domain/entities/news_item.dart`
- Category parsing mantığı basitleştirildi
- Artık API'den string olarak gelen `category` ve `categoryId` doğrudan kullanılıyor
- Object/Map kontrolü kaldırıldı (artık gerekli değil)

## Test Sonuçları

### API Response (Öncesi):
```json
{
  "category": null,
  "categoryId": "dunya"
}
```

### API Response (Sonrası):
```json
{
  "category": "Dünya",
  "categoryId": "dunya"
}
```

## Mobil Uygulamada Kullanım
Artık mobil uygulama backend'den haberleri sorunsuz şekilde çekebiliyor ve gösterebiliyor.

```dart
// Örnek kullanım
final news = NewsItem.fromJson(apiResponse);
print(news.category);    // "Dünya"
print(news.categoryId);  // "dunya"
```

## İlgili Dosyalar
- ✅ `packages/shared-types/index.d.ts`
- ✅ `apps/api/src/news/news.service.ts`
- ✅ `apps/mobile/lib/features/news/domain/entities/news_item.dart`
