import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../news/domain/services/news_api_service.dart';
import '../../domain/entities/podcast_item.dart';
import '../../domain/services/tts_api_service.dart';

/// Podcast news state
class PodcastNewsState {
  final List<PodcastItem> featuredPodcasts;
  final List<PodcastItem> trendingPodcasts;
  final bool isLoading;
  final String? error;

  const PodcastNewsState({
    this.featuredPodcasts = const [],
    this.trendingPodcasts = const [],
    this.isLoading = false,
    this.error,
  });

  PodcastNewsState copyWith({
    List<PodcastItem>? featuredPodcasts,
    List<PodcastItem>? trendingPodcasts,
    bool? isLoading,
    String? error,
  }) {
    return PodcastNewsState(
      featuredPodcasts: featuredPodcasts ?? this.featuredPodcasts,
      trendingPodcasts: trendingPodcasts ?? this.trendingPodcasts,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

/// Podcast news notifier
class PodcastNewsNotifier extends Notifier<PodcastNewsState> {
  late final NewsApiService _newsApiService;
  late final TTSApiService _ttsApiService;

  @override
  PodcastNewsState build() {
    _newsApiService = NewsApiService();
    _ttsApiService = TTSApiService();
    return const PodcastNewsState();
  }

  /// Haberleri yükle ve podcast formatına dönüştür
  Future<void> loadPodcastNews() async {
    try {
      state = state.copyWith(isLoading: true, error: null);

      print('📡 Loading podcast news...');

      // Haberleri çek (web ile aynı limit: 30)
      final newsItems = await _newsApiService.fetchNewsList(
        page: 1,
        pageSize: 30,
      );

      print('✅ Loaded ${newsItems.length} news items');

      // Podcast formatına dönüştür
      final podcastItems = newsItems
          .map((news) => PodcastItem.fromNewsItem(news))
          .toList();

      // Featured: İlk 5 haber (web ile aynı)
      final featuredPodcasts = podcastItems.take(5).toList();

      // Trending: 5-13 arası haberler (web ile aynı)
      final trendingPodcasts = podcastItems.skip(5).take(8).toList();

      state = state.copyWith(
        featuredPodcasts: featuredPodcasts,
        trendingPodcasts: trendingPodcasts,
        isLoading: false,
      );

      print(
        '✅ Podcast news loaded: ${featuredPodcasts.length} featured, ${trendingPodcasts.length} trending',
      );
    } catch (e) {
      print('❌ Error loading podcast news: $e');
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load podcast news: ${e.toString()}',
      );
    }
  }

  /// TTS ses oluştur ve podcast'i güncelle
  Future<PodcastItem?> generateTTSForPodcast(PodcastItem podcast) async {
    try {
      print('🎵 Generating TTS for podcast: ${podcast.title}');

      // TTS oluştur
      final ttsResponse = await _ttsApiService.generateTTS(
        newsId: podcast.id,
        contentType: 'summary',
        voice: 'alloy',
        speed: 1.0,
      );

      if (ttsResponse.isCompleted) {
        // Podcast'i audioUrl ile güncelle
        final updatedPodcast = podcast.copyWith(audioUrl: ttsResponse.audioUrl);

        // State'i güncelle
        _updatePodcastInState(updatedPodcast);

        print('✅ TTS generated successfully: ${ttsResponse.audioUrl}');
        return updatedPodcast;
      } else {
        throw Exception('TTS generation failed: ${ttsResponse.status}');
      }
    } catch (e) {
      print('❌ Error generating TTS: $e');
      state = state.copyWith(
        error: 'Failed to generate audio: ${e.toString()}',
      );
      return null;
    }
  }

  /// State'teki podcast'i güncelle
  void _updatePodcastInState(PodcastItem updatedPodcast) {
    // Featured podcasts'ta güncelle
    final updatedFeatured = state.featuredPodcasts.map((podcast) {
      return podcast.id == updatedPodcast.id ? updatedPodcast : podcast;
    }).toList();

    // Trending podcasts'ta güncelle
    final updatedTrending = state.trendingPodcasts.map((podcast) {
      return podcast.id == updatedPodcast.id ? updatedPodcast : podcast;
    }).toList();

    state = state.copyWith(
      featuredPodcasts: updatedFeatured,
      trendingPodcasts: updatedTrending,
    );
  }

  /// Hata temizle
  void clearError() {
    state = state.copyWith(error: null);
  }

  /// Yeniden yükle
  Future<void> refresh() async {
    await loadPodcastNews();
  }
}

/// News API service provider
final newsApiServiceProvider = Provider<NewsApiService>((ref) {
  return NewsApiService();
});

/// TTS API service provider
final ttsApiServiceProvider = Provider<TTSApiService>((ref) {
  return TTSApiService();
});

/// Podcast news provider
final podcastNewsProvider =
    NotifierProvider<PodcastNewsNotifier, PodcastNewsState>(
      () => PodcastNewsNotifier(),
    );

/// Seçili podcast notifier
class SelectedPodcastNotifier extends Notifier<PodcastItem?> {
  @override
  PodcastItem? build() => null;

  void setPodcast(PodcastItem? podcast) {
    state = podcast;
  }
}

/// Seçili podcast provider
final selectedPodcastProvider =
    NotifierProvider<SelectedPodcastNotifier, PodcastItem?>(
      () => SelectedPodcastNotifier(),
    );
