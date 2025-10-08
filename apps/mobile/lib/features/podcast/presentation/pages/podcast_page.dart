import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'podcast_player_page.dart';

class PodcastPage extends ConsumerWidget {
  const PodcastPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
                    child: const Icon(
                      Icons.add,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ],
              ),
            ),
            
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Featured Podcasts Section
                    _buildSectionHeader('Öne Çıkan Podcastler'),
                    const SizedBox(height: 16),
                    _buildFeaturedPodcasts(),
                    
                    const SizedBox(height: 32),
                    
                    // Trending Podcasts Section
                    _buildSectionHeader('Trend Podcastler'),
                    const SizedBox(height: 16),
                    _buildTrendingPodcasts(),
                    
                    const SizedBox(height: 32),
                    
                    // Categories Section
                    _buildSectionHeader('Kategoriler'),
                    const SizedBox(height: 16),
                    _buildCategories(),
                    
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

  Widget _buildFeaturedPodcasts() {
    return SizedBox(
      height: 200,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 5,
        itemBuilder: (context, index) {
          return Container(
            width: 160,
            margin: const EdgeInsets.only(right: 16),
            child: _buildPodcastCard(
              title: 'Güncel Haberler',
              subtitle: 'Son dakika gelişmeleri',
              imageUrl: 'https://picsum.photos/200/200?random=${index + 1}',
              duration: '15 dk',
              isPlaying: index == 0,
              index: index,
            ),
          );
        },
      ),
    );
  }

  Widget _buildTrendingPodcasts() {
    return SizedBox(
      height: 200,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 5,
        itemBuilder: (context, index) {
          return Container(
            width: 160,
            margin: const EdgeInsets.only(right: 16),
            child: _buildPodcastCard(
              title: 'Spor Haberleri',
              subtitle: 'Futbol, basketbol ve daha fazlası',
              imageUrl: 'https://picsum.photos/200/200?random=${index + 10}',
              duration: '12 dk',
              isPlaying: false,
              index: index,
            ),
          );
        },
      ),
    );
  }

  Widget _buildCategories() {
    final categories = [
      {'name': 'Gündem', 'color': Colors.blue, 'icon': Icons.trending_up},
      {'name': 'Spor', 'color': Colors.green, 'icon': Icons.sports_soccer},
      {'name': 'Teknoloji', 'color': Colors.purple, 'icon': Icons.computer},
      {'name': 'Ekonomi', 'color': Colors.orange, 'icon': Icons.trending_up},
      {'name': 'Dünya', 'color': Colors.red, 'icon': Icons.public},
      {'name': 'Kültür', 'color': Colors.pink, 'icon': Icons.movie},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1.5,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: categories.length,
      itemBuilder: (context, index) {
        final category = categories[index];
        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                (category['color'] as Color).withOpacity(0.8),
                (category['color'] as Color).withOpacity(0.6),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                category['icon'] as IconData,
                color: Colors.white,
                size: 32,
              ),
              const SizedBox(height: 8),
              Text(
                category['name'] as String,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPodcastCard({
    required String title,
    required String subtitle,
    required String imageUrl,
    required String duration,
    required bool isPlaying,
    required int index,
  }) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PodcastPlayerPage(
              podcastId: 'podcast_$index',
              title: title,
              subtitle: subtitle,
              imageUrl: imageUrl,
              duration: duration,
            ),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: Stack(
                children: [
                  Container(
                    height: 120,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      image: DecorationImage(
                        image: NetworkImage(imageUrl),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  if (isPlaying)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.7),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.play_arrow,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.7),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        duration,
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
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 12,
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
}
