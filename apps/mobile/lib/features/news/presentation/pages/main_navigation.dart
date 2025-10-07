import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dashboard_page.dart';
import '../../../auth/presentation/pages/profile_screen.dart';
import '../../../games/presentation/pages/games_page.dart';

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
      const GamesPage(),
      const BookmarksPage(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: currentIndex, children: pages),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF1a2234),
          border: Border(
            top: BorderSide(color: Colors.white.withOpacity(0.1), width: 1),
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
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
                  icon: Icons.games_outlined,
                  activeIcon: Icons.games,
                  label: 'Oyunlar',
                  isActive: currentIndex == 1,
                  onTap: () =>
                      ref.read(currentIndexProvider.notifier).setIndex(1),
                ),
                _NavBarItem(
                  icon: Icons.bookmark_outline,
                  activeIcon: Icons.bookmark,
                  label: 'Kayıtlar',
                  isActive: currentIndex == 2,
                  onTap: () =>
                      ref.read(currentIndexProvider.notifier).setIndex(2),
                ),
                _NavBarItem(
                  icon: Icons.person_outline,
                  activeIcon: Icons.person,
                  label: 'Profil',
                  isActive: currentIndex == 3,
                  onTap: () =>
                      ref.read(currentIndexProvider.notifier).setIndex(3),
                ),
              ],
            ),
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
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          gradient: isActive
              ? const LinearGradient(
                  colors: [Color(0xFF0f6acd), Color(0xFF1a8dff)],
                )
              : null,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isActive ? activeIcon : icon,
              color: isActive ? Colors.white : Colors.white.withOpacity(0.6),
              size: 24,
            ),
            if (isActive) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ],
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

class BookmarksPage extends StatelessWidget {
  const BookmarksPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF0F1624),
      body: Center(
        child: Text(
          'Kaydedilenler',
          style: TextStyle(color: Colors.white, fontSize: 24),
        ),
      ),
    );
  }
}
