import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/reel_entity.dart';
import '../providers/reel_provider.dart';
import '../widgets/reel_video_player.dart';
import '../widgets/reel_action_buttons.dart';

class ReelsPage extends ConsumerStatefulWidget {
  const ReelsPage({super.key});

  @override
  ConsumerState<ReelsPage> createState() => _ReelsPageState();
}

class _ReelsPageState extends ConsumerState<ReelsPage> {
  late PageController _pageController;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  void _onReelTap() {
    // Reel'e tıklandığında video oynat/durdur
    // Bu işlevsellik ReelVideoPlayer içinde hallediliyor
  }

  void _onReelDoubleTap() {
    // Çift tıklandığında beğen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Reel beğenildi!'),
        duration: Duration(seconds: 1),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _onReelLongPress() {
    // Uzun basıldığında reel detaylarını göster
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Reel detayları gösteriliyor...'),
        duration: Duration(seconds: 1),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final exploreFeedAsync = ref.watch(exploreFeedProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: exploreFeedAsync.when(
          data: (response) {
            if (response.items.isEmpty) {
              return const Center(
                child: Text(
                  'Henüz reel bulunamadı',
                  style: TextStyle(color: Colors.white, fontSize: 18),
                ),
              );
            }

            return PageView.builder(
              controller: _pageController,
              scrollDirection: Axis.vertical,
              onPageChanged: _onPageChanged,
              itemCount: response.items.length,
              itemBuilder: (context, index) {
                final reel = response.items[index];
                return _buildReelItem(reel, index);
              },
            );
          },
          loading: () => const Center(
            child: CircularProgressIndicator(color: Colors.white),
          ),
          error: (error, stack) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.white, size: 64),
                const SizedBox(height: 16),
                const Text(
                  'Reels yüklenemedi',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  error.toString(),
                  style: const TextStyle(color: Colors.white70, fontSize: 14),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    ref.invalidate(exploreFeedProvider);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black,
                  ),
                  child: const Text('Tekrar Dene'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildReelItem(ReelEntity reel, int index) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Video Player
        ReelVideoPlayer(
          reel: reel,
          autoPlay: index == _currentIndex,
          onTap: _onReelTap,
          onDoubleTap: _onReelDoubleTap,
          onLongPress: _onReelLongPress,
        ),

        // Gradient overlay (alt kısım)
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            height: 200,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black.withValues(alpha: 0.7),
                ],
              ),
            ),
          ),
        ),

        // Reel bilgileri (alt sol)
        Positioned(
          bottom: 20,
          left: 16,
          right: 80,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                reel.title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              Text(
                reel.summary,
                style: const TextStyle(color: Colors.white70, fontSize: 14),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.blue.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Colors.blue.withValues(alpha: 0.5),
                      ),
                    ),
                    child: Text(
                      reel.category,
                      style: const TextStyle(
                        color: Colors.blue,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${reel.durationSec}s',
                    style: const TextStyle(color: Colors.white60, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Aksiyon butonları (sağ alt)
        Positioned(
          bottom: 20,
          right: 16,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ReelLikeButton(
                isLiked: false, // Bu değer state'den gelecek
                likeCount: (reel.engagementScore * 100).round(),
                onLikeChanged: (isLiked, newCount) {
                  // Beğeni durumu güncellenecek
                },
              ),
              const SizedBox(height: 16),
              ReelCommentButton(
                commentCount: 156, // Bu değer API'den gelecek
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Yorumlar yakında!'),
                      duration: Duration(seconds: 1),
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),
              ReelShareButton(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Paylaşım özelliği yakında!'),
                      duration: Duration(seconds: 1),
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),
              ReelBookmarkButton(
                isBookmarked: false, // Bu değer state'den gelecek
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Kaydedildi!'),
                      duration: Duration(seconds: 1),
                    ),
                  );
                },
              ),
            ],
          ),
        ),

        // Üst kısımda kategori filtresi
        Positioned(
          top: 20,
          left: 16,
          right: 16,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
            child: Text(
              reel.category.toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
