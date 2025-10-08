import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/news_item.dart';
import '../../domain/entities/category.dart';
import '../../domain/services/news_api_service.dart';

// State providers need to be imported from flutter_riverpod

// News API Service Provider
final newsApiServiceProvider = Provider<NewsApiService>((ref) {
  return NewsApiService();
});

// Dashboard News Provider
final dashboardNewsProvider = FutureProvider<List<NewsItem>>((ref) async {
  final apiService = ref.watch(newsApiServiceProvider);
  return apiService.fetchDashboardNews();
});

// Popular News Provider
final popularNewsProvider = FutureProvider<List<NewsItem>>((ref) async {
  final apiService = ref.watch(newsApiServiceProvider);
  return apiService.fetchPopularNews(limit: 10);
});

// Categories Provider
final categoriesProvider = FutureProvider<List<NewsCategory>>((ref) async {
  final apiService = ref.watch(newsApiServiceProvider);
  return apiService.fetchCategories();
});

// News by ID Provider
final newsByIdProvider = FutureProvider.family<NewsItem, String>((
  ref,
  id,
) async {
  final apiService = ref.watch(newsApiServiceProvider);
  return apiService.fetchNewsById(id);
});

// News List Provider with filters
class NewsListParams {
  final int page;
  final int pageSize;
  final String? categoryId;
  final String? city;
  final bool? isPopular;

  NewsListParams({
    this.page = 1,
    this.pageSize = 10,
    this.categoryId,
    this.city,
    this.isPopular,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is NewsListParams &&
        other.page == page &&
        other.pageSize == pageSize &&
        other.categoryId == categoryId &&
        other.city == city &&
        other.isPopular == isPopular;
  }

  @override
  int get hashCode {
    return Object.hash(page, pageSize, categoryId, city, isPopular);
  }
}

final newsListProvider = FutureProvider.family<List<NewsItem>, NewsListParams>((
  ref,
  params,
) async {
  final apiService = ref.watch(newsApiServiceProvider);
  return apiService.fetchNewsList(
    page: params.page,
    pageSize: params.pageSize,
    categoryId: params.categoryId,
    city: params.city,
    isPopular: params.isPopular,
  );
});

// Selected Category State Provider
class SelectedCategoryNotifier extends Notifier<String?> {
  @override
  String? build() => null;

  void setCategory(String? category) {
    state = category;
  }

  void clear() {
    state = null;
  }
}

final selectedCategoryProvider =
    NotifierProvider<SelectedCategoryNotifier, String?>(
      SelectedCategoryNotifier.new,
    );

// Search Query Provider
class SearchQueryNotifier extends Notifier<String> {
  @override
  String build() => '';

  void setQuery(String query) {
    state = query;
  }

  void clear() {
    state = '';
  }
}

final searchQueryProvider = NotifierProvider<SearchQueryNotifier, String>(
  SearchQueryNotifier.new,
);

// Search Results Provider
final searchResultsProvider = FutureProvider<List<NewsItem>>((ref) async {
  final query = ref.watch(searchQueryProvider);
  if (query.isEmpty) {
    return [];
  }
  final apiService = ref.watch(newsApiServiceProvider);
  return apiService.searchNews(query);
});

// Infinite News State
class InfiniteNewsState {
  final List<NewsItem> items;
  final int page;
  final bool hasMore;
  final bool isLoading;

  InfiniteNewsState({
    required this.items,
    required this.page,
    required this.hasMore,
    this.isLoading = false,
  });

  InfiniteNewsState copyWith({
    List<NewsItem>? items,
    int? page,
    bool? hasMore,
    bool? isLoading,
  }) {
    return InfiniteNewsState(
      items: items ?? this.items,
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

// Infinite News Notifier
class InfiniteNewsNotifier extends Notifier<InfiniteNewsState> {
  static const int pageSize = 10;
  String? _categoryFilter;

  @override
  InfiniteNewsState build() {
    return InfiniteNewsState(items: [], page: 1, hasMore: true);
  }

  Future<void> loadInitial({String? categoryId}) async {
    _categoryFilter = categoryId;
    state = InfiniteNewsState(
      items: [],
      page: 1,
      hasMore: true,
      isLoading: true,
    );

    await _loadMore();
  }

  Future<void> loadMore() async {
    if (state.isLoading || !state.hasMore) return;
    await _loadMore();
  }

  Future<void> _loadMore() async {
    try {
      state = state.copyWith(isLoading: true);

      final apiService = ref.read(newsApiServiceProvider);
      final newItems = await apiService.fetchNewsList(
        page: state.page,
        pageSize: pageSize,
        categoryId: _categoryFilter,
      );

      state = state.copyWith(
        items: [...state.items, ...newItems],
        page: state.page + 1,
        hasMore: newItems.length == pageSize,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false);
      rethrow;
    }
  }

  void reset() {
    state = InfiniteNewsState(items: [], page: 1, hasMore: true);
  }
}

final infiniteNewsProvider =
    NotifierProvider<InfiniteNewsNotifier, InfiniteNewsState>(
      InfiniteNewsNotifier.new,
    );
