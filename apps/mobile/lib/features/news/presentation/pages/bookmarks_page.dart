import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/l10n/l10n.dart';
import '../../domain/entities/news_item.dart';
import '../providers/bookmarks_provider.dart';
import '../widgets/enhanced_news_card.dart';
import 'news_detail_page.dart';

class BookmarksPage extends ConsumerStatefulWidget {
  const BookmarksPage({super.key});

  @override
  ConsumerState<BookmarksPage> createState() => _BookmarksPageState();
}

class _BookmarksPageState extends ConsumerState<BookmarksPage> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'Tümü';
  String _searchQuery = '';

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bookmarkedNewsAsync = ref.watch(bookmarksProvider);
    final categories = ref.watch(bookmarkCategoriesProvider);
    
    return Scaffold(
      backgroundColor: AppColors.midnight,
      body: bookmarkedNewsAsync.when(
        data: (bookmarkedNews) {
          final filteredNews = _searchQuery.isNotEmpty
              ? ref.watch(searchBookmarksProvider(_searchQuery))
              : ref.watch(bookmarksByCategoryProvider(_selectedCategory));
          
          return _buildContent(context, bookmarkedNews, categories, filteredNews);
        },
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.glowCyan),
        ),
        error: (error, stackTrace) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.white.withOpacity(0.5),
              ),
              const SizedBox(height: 16),
              Text(
                'Haberler yüklenemedi',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Lütfen internet bağlantınızı kontrol edin',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.5),
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  // ignore: discarded_futures
                  ref.refresh(bookmarksProvider);
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Tekrar Dene'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.glowCyan,
                  foregroundColor: AppColors.midnight,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, List<NewsItem> bookmarkedNews, List<CategoryInfo> categories, List<NewsItem> filteredNews) {
    return CustomScrollView(
      controller: _scrollController,
      slivers: [
        SliverAppBar(
          title: Text(context.l10n.bookmarksTitle),
          centerTitle: true,
          backgroundColor: AppColors.midnight,
          elevation: 0,
          floating: true,
          snap: true,
          expandedHeight: 0,
          toolbarHeight: kToolbarHeight,
        ),
        
        // Arama çubuğu
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              controller: _searchController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Kaydedilenlerde ara...',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
                prefixIcon: Icon(Icons.search, color: Colors.white.withOpacity(0.6)),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: Icon(Icons.clear, color: Colors.white.withOpacity(0.6)),
                        onPressed: () {
                          setState(() {
                            _searchQuery = '';
                            _searchController.clear();
                          });
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.white.withOpacity(0.1),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
            ),
          ),
        ),
        
        // Kategori filtreleri - Geliştirilmiş tasarım
        SliverToBoxAdapter(
          child: Container(
            height: 60,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final category = categories[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: _EnhancedCategoryChip(
                    category: category,
                    isActive: _selectedCategory == category.name,
                    onTap: () {
                      setState(() {
                        _selectedCategory = category.name;
                        _searchQuery = '';
                        _searchController.clear();
                      });
                    },
                  ),
                );
              },
            ),
          ),
        ),
        
        // İstatistik kartı
        if (bookmarkedNews.isNotEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: _BookmarksStatsCard(
                totalBookmarks: bookmarkedNews.length,
                filteredCount: filteredNews.length,
                selectedCategory: _selectedCategory,
              ),
            ),
          ),
        
        // Haber listesi
        if (filteredNews.isEmpty)
          SliverFillRemaining(
            child: Center(
              child: Text(
                'Henüz kaydedilen haber yok.',
                style: TextStyle(color: Colors.white.withOpacity(0.7)),
              ),
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final newsItem = filteredNews[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: EnhancedNewsCard(
                      news: newsItem,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => NewsDetailPage(newsId: newsItem.id),
                          ),
                        );
                      },
                    ),
                  );
                },
                childCount: filteredNews.length,
              ),
            ),
          ),
      ],
    );
  }
}

// İstatistik kartı
class _BookmarksStatsCard extends StatelessWidget {
  const _BookmarksStatsCard({
    required this.totalBookmarks,
    required this.filteredCount,
    required this.selectedCategory,
  });

  final int totalBookmarks;
  final int filteredCount;
  final String selectedCategory;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          colors: [
            Colors.white.withOpacity(0.1),
            Colors.white.withOpacity(0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(
                Icons.bookmark,
                color: AppColors.glowCyan,
                size: 24,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      selectedCategory == 'Tümü' 
                          ? '$filteredCount kaydedilen haber'
                          : '$selectedCategory: $filteredCount haber',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      '$totalBookmarks toplam',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (selectedCategory != 'Tümü') ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.glowCyan.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.glowCyan.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.filter_alt,
                    size: 16,
                    color: AppColors.glowCyan,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'Kategori filtresi aktif',
                    style: TextStyle(
                      color: AppColors.glowCyan,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// Gelişmiş kategori chip widget'ı
class _EnhancedCategoryChip extends StatelessWidget {
  const _EnhancedCategoryChip({
    required this.category,
    required this.isActive,
    required this.onTap,
  });

  final CategoryInfo category;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive 
              ? category.color.withOpacity(0.2)
              : Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isActive 
                ? category.color.withOpacity(0.5)
                : Colors.white.withOpacity(0.2),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              category.icon,
              size: 16,
              color: isActive ? category.color : Colors.white.withOpacity(0.7),
            ),
            const SizedBox(width: 8),
            Text(
              category.name,
              style: TextStyle(
                color: isActive ? category.color : Colors.white.withOpacity(0.8),
                fontSize: 14,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: isActive 
                    ? category.color.withOpacity(0.3)
                    : Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '${category.count}',
                style: TextStyle(
                  color: isActive ? category.color : Colors.white.withOpacity(0.8),
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}