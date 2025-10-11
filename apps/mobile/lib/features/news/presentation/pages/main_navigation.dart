import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dashboard_page.dart';
import 'bookmarks_page.dart';
import '../../../games/presentation/pages/games_page.dart';
import '../../../podcast/presentation/pages/podcast_page.dart';
import '../../../reels/presentation/pages/reels_page.dart';

class CurrentIndexNotifier extends Notifier<int> {
  @override
  int build() => 0;

  void setIndex(int index) {
    state = index;
  }
}

final currentIndexProvider = NotifierProvider<CurrentIndexNotifier, int>(
  CurrentIndexNotifier.new,
);

class MainNavigation extends ConsumerWidget {
  const MainNavigation({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(currentIndexProvider);

    final pages = [
      const DashboardPage(),
      const ReelsPage(),
      const PodcastPage(),
      const GamesPage(),
      const BookmarksPage(),
    ];

    return Scaffold(
      body: pages[currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF1a2234),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
          border: Border(
            top: BorderSide(
              color: Colors.white.withValues(alpha: 0.1),
              width: 1,
            ),
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: Container(
          padding: const EdgeInsets.fromLTRB(6, 16, 6, 32),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _NavBarItem(
                icon: Icons.home_outlined,
                activeIcon: Icons.home,
                label: 'Ana Sayfa',
                isActive: currentIndex == 0,
                onTap: () =>
                    ref.read(currentIndexProvider.notifier).setIndex(0),
              ),
              _NavBarItem(
                icon: Icons.video_library_outlined,
                activeIcon: Icons.video_library,
                label: 'Reels',
                isActive: currentIndex == 1,
                onTap: () =>
                    ref.read(currentIndexProvider.notifier).setIndex(1),
              ),
              _NavBarItem(
                icon: Icons.podcasts_outlined,
                activeIcon: Icons.podcasts,
                label: 'Podcast',
                isActive: currentIndex == 2,
                onTap: () =>
                    ref.read(currentIndexProvider.notifier).setIndex(2),
              ),
              _NavBarItem(
                icon: Icons.games_outlined,
                activeIcon: Icons.games,
                label: 'Oyunlar',
                isActive: currentIndex == 3,
                onTap: () =>
                    ref.read(currentIndexProvider.notifier).setIndex(3),
              ),
              _NavBarItem(
                icon: Icons.bookmark_outline,
                activeIcon: Icons.bookmark,
                label: 'Kayıtlar',
                isActive: currentIndex == 4,
                onTap: () =>
                    ref.read(currentIndexProvider.notifier).setIndex(4),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavBarItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _NavBarItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Flexible(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            gradient: isActive
                ? const LinearGradient(
                    colors: [Color(0xFF0f6acd), Color(0xFF1a8dff)],
                  )
                : null,
            borderRadius: BorderRadius.circular(18),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isActive ? activeIcon : icon,
                color: isActive
                    ? Colors.white
                    : Colors.white.withValues(alpha: 0.6),
                size: 26,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  color: isActive
                      ? Colors.white
                      : Colors.white.withValues(alpha: 0.6),
                  fontSize: 10,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                ),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Placeholder pages
class SearchPage extends StatelessWidget {
  const SearchPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF0F1624),
      body: Center(
        child: Text(
          'Arama Sayfası',
          style: TextStyle(color: Colors.white, fontSize: 24),
        ),
      ),
    );
  }
}
