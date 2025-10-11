import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'podcast_player_page.dart';
import '../providers/podcast_provider.dart';
import '../providers/audio_player_notifier.dart';
import '../../domain/entities/podcast_item.dart';

class PodcastPage extends ConsumerStatefulWidget {
  const PodcastPage({super.key});

  @override
  ConsumerState<PodcastPage> createState() => _PodcastPageState();
}

class _PodcastPageState extends ConsumerState<PodcastPage> {
  @override
  Widget build(BuildContext context) {
    final podcastState = ref.watch(podcastNewsProvider);

    // İlk yüklemede haberleri çek
    ref.listen<PodcastNewsState>(podcastNewsProvider, (previous, next) {
      if (previous?.isLoading == false && next.isLoading == true) {
        // İlk yükleme başladı
      } else if (previous?.isLoading == true &&
          next.isLoading == false &&
          next.error != null) {
        // Hata oluştu
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: Colors.red,
            action: SnackBarAction(
              label: 'Tekrar Dene',
              textColor: Colors.white,
              onPressed: () => ref.read(podcastNewsProvider.notifier).refresh(),
            ),
          ),
        );
      }
    });

    // İlk yükleme
    if (!podcastState.isLoading &&
        podcastState.featuredPodcasts.isEmpty &&
        podcastState.error == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(podcastNewsProvider.notifier).loadPodcastNews();
      });
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F1624),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: const BoxDecoration(
                      color: Color(0xFF0f6acd),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.podcasts,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'PODCAST',
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        'Haber Podcastleri',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(Icons.add, color: Colors.white, size: 20),
                  ),
                ],
              ),
            ),

            // Content
            Expanded(
              child:
                  podcastState.isLoading &&
                      podcastState.featuredPodcasts.isEmpty
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: Color(0xFF0f6acd),
                      ),
                    )
                  : SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Featured Podcasts Section
                          _buildSectionHeader('Öne Çıkan Podcastler'),
                          const SizedBox(height: 16),
                          _buildFeaturedPodcasts(podcastState.featuredPodcasts),

                          const SizedBox(height: 32),

                          // Trending Podcasts Section
                          _buildSectionHeader('Trend Podcastler'),
                          const SizedBox(height: 16),
                          _buildTrendingPodcasts(podcastState.trendingPodcasts),

                          const SizedBox(height: 100), // Bottom padding
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          'Tümünü göster',
          style: TextStyle(
            color: Colors.blue[300],
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildFeaturedPodcasts(List<PodcastItem> podcasts) {
    if (podcasts.isEmpty) {
      return const SizedBox(
        height: 220,
        child: Center(
          child: Text(
            'Öne çıkan podcast bulunamadı',
            style: TextStyle(color: Colors.grey),
          ),
        ),
      );
    }

    return SizedBox(
      height: 220, // Yüksekliği artırdık
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: podcasts.length,
        itemBuilder: (context, index) {
          final podcast = podcasts[index];
          return Consumer(
            builder: (context, ref, child) {
              return Container(
                width: 160,
                margin: const EdgeInsets.only(right: 16),
                child: _buildPodcastCard(
                  context: context,
                  podcast: podcast,
                  ref: ref,
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildTrendingPodcasts(List<PodcastItem> podcasts) {
    if (podcasts.isEmpty) {
      return const SizedBox(
        height: 220,
        child: Center(
          child: Text(
            'Trend podcast bulunamadı',
            style: TextStyle(color: Colors.grey),
          ),
        ),
      );
    }

    return SizedBox(
      height: 220, // Yüksekliği artırdık
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: podcasts.length,
        itemBuilder: (context, index) {
          final podcast = podcasts[index];
          return Consumer(
            builder: (context, ref, child) {
              return Container(
                width: 160,
                margin: const EdgeInsets.only(right: 16),
                child: _buildPodcastCard(
                  context: context,
                  podcast: podcast,
                  ref: ref,
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildPodcastCard({
    required BuildContext context,
    required PodcastItem podcast,
    required WidgetRef ref,
  }) {
    // Audio player state'ini dinle
    final audioState = ref.watch(audioPlayerProvider);
    final isCurrentlyPlaying =
        audioState.isPlaying &&
        audioState.currentAudioUrl != null &&
        podcast.audioUrl == audioState.currentAudioUrl;

    return GestureDetector(
      onTap: () {
        // Seçili podcast'i ayarla
        ref.read(selectedPodcastProvider.notifier).setPodcast(podcast);

        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PodcastPlayerPage(podcast: podcast),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Image
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              child: Stack(
                children: [
                  Container(
                    height: 120,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      image: DecorationImage(
                        image: NetworkImage(podcast.imageUrl),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  if (isCurrentlyPlaying)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0f6acd).withOpacity(0.9),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.equalizer,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.7),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        podcast.duration,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                  // Kategori badge
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0f6acd), Color(0xFF1a8dff)],
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        podcast.category,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(8), // Padding'i azalttık
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    podcast.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13, // Font boyutunu küçülttük
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2), // Spacing'i azalttık
                  Text(
                    podcast.subtitle,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 11, // Font boyutunu küçülttük
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    // Podcast sayfasından çıkıldığında sesi durdur
    try {
      ref.read(audioPlayerProvider.notifier).stop();
    } catch (e) {
      print('❌ Error stopping audio on podcast page dispose: $e');
    }
    super.dispose();
  }
}
