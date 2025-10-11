import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/game_types.dart';
import '../../domain/entities/gamification_models.dart';
import '../providers/game_provider.dart';
import '../providers/gamification_provider.dart';
import '../widgets/game_card.dart';
import '../widgets/category_chip.dart';
import '../widgets/user_stats_card.dart';
import '../widgets/daily_challenge_card.dart';

class GamesPage extends ConsumerStatefulWidget {
  const GamesPage({super.key});

  @override
  ConsumerState<GamesPage> createState() => _GamesPageState();
}

class _GamesPageState extends ConsumerState<GamesPage> {
  GameCategory? _selectedCategory;

  final Map<GameCategory, Map<String, dynamic>> _categories = {
    GameCategory.educational: {
      'name': 'Eğitici',
      'icon': Icons.school,
    },
    GameCategory.memory: {
      'name': 'Hafıza',
      'icon': Icons.psychology,
    },
    GameCategory.word: {
      'name': 'Kelime',
      'icon': Icons.abc,
    },
    GameCategory.trivia: {
      'name': 'Bilgi',
      'icon': Icons.quiz,
    },
    GameCategory.timeline: {
      'name': 'Zaman',
      'icon': Icons.timeline,
    },
    GameCategory.visual: {
      'name': 'Görsel',
      'icon': Icons.visibility,
    },
    GameCategory.arcade: {
      'name': 'Arcade',
      'icon': Icons.sports_esports,
    },
  };

  @override
  Widget build(BuildContext context) {
    final gamesAsync = ref.watch(gamesProvider);
    final userProfileAsync = ref.watch(userProfileProvider);
    
    return Scaffold(
      backgroundColor: const Color(0xFF0F1624),
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topLeft,
            radius: 1.5,
            colors: [Color(0xFF162639), Color(0xFF1a2234), Color(0xFF0f1624)],
            stops: [0.0, 0.55, 1.0],
          ),
        ),
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              // Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF0f6acd), Color(0xFF1a8dff)],
                              ),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Icon(
                              Icons.games_outlined,
                              color: Colors.white,
                              size: 32,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Oyunlar',
                                  style: TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                Row(
                                  children: [
                                    Expanded(
                                      child: userProfileAsync.when(
                                        data: (profile) => Text(
                                          profile != null
                                              ? 'Toplam ${profile.xp} XP - ${_getRankName(profile.currentRank)}'
                                              : 'Eğlen ve XP kazan',
                                          style: const TextStyle(
                                            fontSize: 14,
                                            color: Color(0xFF8fb8ff),
                                          ),
                                        ),
                                        loading: () => const Text(
                                          'Yükleniyor...',
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: Color(0xFF8fb8ff),
                                          ),
                                        ),
                                        error: (_, __) => const Text(
                                          'Eğlen ve XP kazan',
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: Color(0xFF8fb8ff),
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    GestureDetector(
                                      onTap: () => Navigator.pushNamed(context, '/multiplayer'),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          gradient: const LinearGradient(
                                            colors: [Color(0xFF8b5cf6), Color(0xFFa855f7)],
                                          ),
                                          borderRadius: BorderRadius.circular(12),
                                          boxShadow: [
                                            BoxShadow(
                                              color: const Color(0xFF8b5cf6).withOpacity(0.3),
                                              blurRadius: 8,
                                              offset: const Offset(0, 4),
                                            ),
                                          ],
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            const Icon(
                                              Icons.people,
                                              color: Colors.white,
                                              size: 16,
                                            ),
                                            const SizedBox(width: 6),
                                            const Text(
                                              'Çok Oyunculu',
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // User Stats Card
                      const UserStatsCard(),
                      
                      const SizedBox(height: 16),
                      
                      // Daily Challenge Card
                      const DailyChallengeCard(),
                    ],
                  ),
                ),
              ),

              // Categories
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 60,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    children: [
                      CategoryChip(
                        label: 'Tümü',
                        icon: Icons.games,
                        isSelected: _selectedCategory == null,
                        onTap: () => setState(() => _selectedCategory = null),
                      ),
                      const SizedBox(width: 12),
                      ..._categories.entries.map((entry) {
                        final category = entry.key;
                        final categoryData = entry.value;
                      return Padding(
                        padding: const EdgeInsets.only(right: 12),
                          child: CategoryChip(
                            label: categoryData['name'],
                            icon: categoryData['icon'],
                            isSelected: _selectedCategory == category,
                            onTap: () => setState(() => _selectedCategory = category),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 24)),

              // Games Grid
              gamesAsync.when(
                data: (games) {
                  final filteredGames = _selectedCategory == null
                      ? games
                      : games.where((game) => game.category == _selectedCategory).toList();

                  return SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                        sliver: SliverGrid(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 1,
                            childAspectRatio: 1.4, // Increased from 1.8 to 1.4 for more height
                            mainAxisSpacing: 16,
                          ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final game = filteredGames[index];
                          return GameCard(game: game);
                        },
                        childCount: filteredGames.length,
                      ),
                    ),
                  );
                },
                loading: () => const SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(40),
                      child: CircularProgressIndicator(
                        color: Color(0xFF8fb7ff),
                      ),
                    ),
                  ),
                ),
                error: (error, stack) => SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(40),
                      child: Column(
                        children: [
                          const Icon(
                            Icons.error_outline,
                            color: Colors.red,
                            size: 48,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Oyunlar yüklenirken hata oluştu',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 8),
                          ElevatedButton(
                            onPressed: () => ref.refresh(gamesProvider),
                            child: const Text('Tekrar Dene'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 32)),
            ],
          ),
        ),
      ),
    );
  }

  String _getRankName(UserRank rank) {
    switch (rank) {
      case UserRank.newMember:
        return 'Yeni Üye';
      case UserRank.activeReader:
        return 'Aktif Okuyucu';
      case UserRank.knowledgeSharer:
        return 'Bilgi Paylaşıcısı';
      case UserRank.expertCommenter:
        return 'Uzman Yorumcu';
      case UserRank.communityLeader:
        return 'Topluluk Lideri';
    }
  }
}

