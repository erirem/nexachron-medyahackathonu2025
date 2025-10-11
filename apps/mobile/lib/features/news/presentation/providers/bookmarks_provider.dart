import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod/riverpod.dart';
import '../../domain/entities/news_item.dart';
import '../../domain/services/news_api_service.dart';

// API servisi provider'ı
final newsApiServiceProvider = Provider<NewsApiService>((ref) => NewsApiService());

// Gerçek haberler provider'ı - API'den çekilen veriler
final bookmarksProvider = FutureProvider<List<NewsItem>>((ref) async {
  final newsApiService = ref.read(newsApiServiceProvider);
  
  try {
    // API'den haberleri çek
    final newsItems = await newsApiService.fetchNewsList(page: 1, pageSize: 20);
    
    // İçeriği boş bırak ve rastgele sırala
    final processedItems = newsItems.map((item) {
      return NewsItem(
        id: item.id,
        title: item.title,
        summary: item.summary,
        content: '', // İçeriği boş bırak
        categoryId: item.categoryId,
        category: item.category,
        city: item.city,
        imageUrl: item.imageUrl,
        images: item.images,
        isPopular: item.isPopular,
        createdAt: item.createdAt,
        publishedAt: item.publishedAt,
        mediaSummary: item.mediaSummary,
        media: item.media,
      );
    }).toList();
    
    // Rastgele sırala
    processedItems.shuffle();
    return processedItems;
  } catch (e) {
    print('❌ Error fetching bookmarks: $e');
    // Hata durumunda boş liste döndür
    return [];
  }
});

// Kategoriye göre filtreleme provider'ı
final bookmarksByCategoryProvider = Provider.family<List<NewsItem>, String>((ref, category) {
  final bookmarksAsync = ref.watch(bookmarksProvider);
  return bookmarksAsync.when(
    data: (bookmarks) {
      if (category == 'Tümü') {
        return bookmarks;
      }
      return bookmarks.where((news) => news.category == category).toList();
    },
    loading: () => [],
    error: (_, __) => [],
  );
});

// Arama provider'ı
final searchBookmarksProvider = Provider.family<List<NewsItem>, String>((ref, query) {
  final bookmarksAsync = ref.watch(bookmarksProvider);
  return bookmarksAsync.when(
    data: (bookmarks) {
      if (query.isEmpty) {
        return bookmarks;
      }
      return bookmarks.where((news) => 
        news.title.toLowerCase().contains(query.toLowerCase()) ||
        news.content.toLowerCase().contains(query.toLowerCase()) ||
        news.summary.toLowerCase().contains(query.toLowerCase())
      ).toList();
    },
    loading: () => [],
    error: (_, __) => [],
  );
});

// Seçili kategori provider'ı
final selectedCategoryProvider = Provider<String>((ref) => 'Tümü');

// Kategoriler provider'ı - geliştirilmiş
final bookmarkCategoriesProvider = Provider<List<CategoryInfo>>((ref) {
  final bookmarksAsync = ref.watch(bookmarksProvider);
  return bookmarksAsync.when(
    data: (bookmarks) {
      final categoryCounts = <String, int>{};
      
      for (final news in bookmarks) {
        final category = news.category ?? 'Diğer';
        categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
      }
      
      final categories = categoryCounts.entries.map((entry) => 
        CategoryInfo(
          name: entry.key,
          count: entry.value,
          icon: _getCategoryIcon(entry.key),
          color: _getCategoryColor(entry.key),
        )
      ).toList();
      
      // Sayıya göre sırala (en çok haber olan önce)
      categories.sort((a, b) => b.count.compareTo(a.count));
      
      // "Tümü" kategorisini başa ekle
      categories.insert(0, CategoryInfo(
        name: 'Tümü',
        count: bookmarks.length,
        icon: Icons.all_inclusive,
        color: const Color(0xFF3B82F6),
      ));
      
      return categories;
    },
    loading: () => [],
    error: (_, __) => [],
  );
});

// Kategori bilgisi sınıfı
class CategoryInfo {
  final String name;
  final int count;
  final IconData icon;
  final Color color;

  const CategoryInfo({
    required this.name,
    required this.count,
    required this.icon,
    required this.color,
  });
}

// Kategori ikonları
IconData _getCategoryIcon(String category) {
  switch (category) {
    case 'Teknoloji':
      return Icons.computer;
    case 'Ekonomi':
      return Icons.trending_up;
    case 'Spor':
      return Icons.sports_soccer;
    case 'Sağlık':
      return Icons.health_and_safety;
    case 'Dünya':
      return Icons.public;
    case 'Kültür':
      return Icons.palette;
    case 'Bilim':
      return Icons.science;
    case 'Politika':
      return Icons.account_balance;
    case 'Eğitim':
      return Icons.school;
    case 'Seyahat':
      return Icons.travel_explore;
    case 'Yaşam':
      return Icons.home;
    default:
      return Icons.category;
  }
}

// Kategori renkleri
Color _getCategoryColor(String category) {
  switch (category) {
    case 'Teknoloji':
      return const Color(0xFF3B82F6); // Mavi
    case 'Ekonomi':
      return const Color(0xFF10B981); // Yeşil
    case 'Spor':
      return const Color(0xFFEF4444); // Kırmızı
    case 'Sağlık':
      return const Color(0xFF8B5CF6); // Mor
    case 'Dünya':
      return const Color(0xFF06B6D4); // Cyan
    case 'Kültür':
      return const Color(0xFFF59E0B); // Turuncu
    case 'Bilim':
      return const Color(0xFF84CC16); // Lime
    case 'Politika':
      return const Color(0xFF6B7280); // Gri
    case 'Eğitim':
      return const Color(0xFFEC4899); // Pembe
    case 'Seyahat':
      return const Color(0xFF14B8A6); // Teal
    case 'Yaşam':
      return const Color(0xFFF97316); // Turuncu
    default:
      return const Color(0xFF6B7280); // Gri
  }
}