# Mobil Infinite Scroll Düzeltmesi

## Sorun
Ana sayfada infinite scroll eklenirken iki FlutterError ile karşılaşıldı:
1. `Tried to modify a provider while the widget tree was building`
2. `ref.listen can only be used within the build method`

## Kök Sebep
- Provider'ları `initState`, `dispose`, `didUpdateWidget` gibi lifecycle metodlarında doğrudan değiştirmek yasak
- `ref.listen` sadece build metodunda kullanılabilir
- Scroll listener ve kategori değişimi callback'lerinde provider modifikasyonu

## Çözüm

### 1. Provider Modifikasyonlarını Geciktirme
Tüm provider değişikliklerini `Future(() {...})` ile sarmaladık:

```dart
// ❌ YANLIŞ
_scrollController.addListener(() {
  ref.read(paginatedNewsProvider.notifier).loadMore();
});

// ✅ DOĞRU
_scrollController.addListener(() {
  Future(() {
    ref.read(paginatedNewsProvider.notifier).loadMore();
  });
});
```

### 2. Kategori Dinleyicisi için `listenManual` Kullanımı
`ref.listen` yerine `ref.listenManual` kullanıp dispose'ta kapatıyoruz:

```dart
ProviderSubscription<String?>? _categorySubscription;

@override
void initState() {
  super.initState();
  
  _categorySubscription = ref.listenManual<String?>(
    selectedCategoryProvider,
    (prev, next) {
      Future(() {
        ref.read(paginatedNewsProvider.notifier).loadFirst(categoryId: next);
      });
    },
  );
}

@override
void dispose() {
  _categorySubscription?.close();
  super.dispose();
}
```

### 3. İlk Yükleme Stratejisi
```dart
WidgetsBinding.instance.addPostFrameCallback((_) {
  final initialCategory = ref.read(selectedCategoryProvider);
  Future(() {
    ref.read(paginatedNewsProvider.notifier).loadFirst(
      categoryId: initialCategory,
    );
  });
});
```

## Teknik Detaylar

### Değişen Dosyalar
1. **apps/mobile/lib/features/news/presentation/providers/news_provider.dart**
   - `PaginatedNewsState` ve `PaginatedNewsNotifier` eklendi
   - `loadFirst(categoryId)` ve `loadMore()` metodları
   - Sayfa başına 10 öğe (`_pageSize = 10`)

2. **apps/mobile/lib/features/news/presentation/pages/dashboard_page.dart**
   - `paginatedNewsProvider` kullanımı
   - Scroll listener ile %90'da lazy load
   - Kategori değişiminde reset + scroll to top
   - Tüm provider modifikasyonları `Future(() {...})` ile sarmalandı

### Infinite Scroll Akışı
```
1. initState
   ├─ Scroll listener ekle (Future ile loadMore)
   ├─ postFrameCallback → Future ile loadFirst
   └─ listenManual → kategori değişince Future ile loadFirst

2. Kullanıcı scroll eder
   ├─ %90'a ulaşınca
   └─ Future(() => loadMore()) tetiklenir

3. Kategori değişir
   ├─ listenManual callback çalışır
   ├─ Future(() => loadFirst(newCategory))
   └─ Scroll başa döner (animate)
```

## Neden Future() Gerekli?

Riverpod kuralı: Provider değişikliği ancak widget ağacı build edildikten sonra yapılabilir.

- `initState`, `dispose` → build sürecinin parçası
- `listener callbacks` → build sırasında tetiklenebilir
- `Future(() {...})` → event loop'un sonraki tick'inde çalışır (build bittikten sonra)

## Test Senaryoları

### ✅ Başarılı Senaryolar
1. **İlk Açılış**
   - Sayfa yüklenir → 10 haber gösterilir
   - Skeleton loading yok (direkt veri)

2. **Infinite Scroll**
   - Aşağı kaydırma → %90'da otomatik +10 haber
   - Loading skeleton'lar grid sonunda görünür
   - Smooth yükleme (frame drop yok)

3. **Kategori Değişimi**
   - Kategori seçilir → liste resetlenir
   - Yeni kategoriyle ilk 10 haber yüklenir
   - Scroll yumuşakça başa döner (250ms)

4. **Hata Durumu**
   - API hatası → mevcut öğeler kalır
   - "Yeniden Dene" butonu → loadFirst tetikler

## Kullanılan Riverpod Pattern'leri

1. **NotifierProvider** - State yönetimi
2. **listenManual** - Build dışında dinleme
3. **ProviderSubscription** - Manuel subscription yönetimi
4. **Future(() {...})** - Delayed modification

## Hot Reload
Terminal'de `r` tuşuna basarak değişiklikleri test edebilirsiniz.

## İleriki İyileştirmeler
- [ ] Pull-to-refresh
- [ ] "Yükleniyor..." göstergesi iyileştirmesi
- [ ] "Tüm haberler yüklendi" mesajı
- [ ] Hata retry mekanizması
- [ ] Offline önbellekleme
