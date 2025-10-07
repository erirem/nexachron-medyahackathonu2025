import 'package:flutter/material.dart';

class GamesPage extends StatefulWidget {
  const GamesPage({super.key});

  @override
  State<GamesPage> createState() => _GamesPageState();
}

class _GamesPageState extends State<GamesPage> {
  String _selectedCategory = 'all';

  final List<GameItem> _games = [
    GameItem(
      id: 'quizzes',
      title: 'Haber Quizleri',
      description: 'Güncel haberlerle ilgili bilginizi test edin',
      iconData: Icons.psychology,
      color: Colors.blue,
      category: 'educational',
      difficulty: 'Kolay',
      xpReward: 30,
      isAvailable: true,
      estimatedTime: '5-10 dk',
    ),
    GameItem(
      id: 'wordle',
      title: 'Wordle',
      description: '5 harfli Türkçe kelimeyi 6 denemede bulun',
      iconData: Icons.text_fields,
      color: Colors.green,
      category: 'word',
      difficulty: 'Orta',
      xpReward: 35,
      isAvailable: true,
      estimatedTime: '3-5 dk',
    ),
    GameItem(
      id: 'news-guessr',
      title: 'Haber Tahmin',
      description: 'Haberin hangi şehirden geldiğini haritada bul',
      iconData: Icons.map,
      color: Colors.cyan,
      category: 'trivia',
      difficulty: 'Orta',
      xpReward: 30,
      isAvailable: true,
      estimatedTime: '5-8 dk',
    ),
    GameItem(
      id: 'memory-game',
      title: 'Hafıza Oyunu',
      description: 'Haber görsellerini eşleştirin',
      iconData: Icons.extension,
      color: Colors.purple,
      category: 'memory',
      difficulty: 'Orta',
      xpReward: 25,
      isAvailable: false,
      estimatedTime: '5 dk',
    ),
    GameItem(
      id: 'timeline-game',
      title: 'Zaman Tüneli',
      description: 'Haberleri kronolojik sıraya koyun',
      iconData: Icons.timeline,
      color: Colors.orange,
      category: 'timeline',
      difficulty: 'Zor',
      xpReward: 40,
      isAvailable: false,
      estimatedTime: '8-10 dk',
    ),
  ];

  final Map<String, CategoryInfo> _categories = {
    'all': CategoryInfo(id: 'all', name: 'Tümü', iconData: Icons.games),
    'educational': CategoryInfo(
      id: 'educational',
      name: 'Eğitici',
      iconData: Icons.school,
    ),
    'word': CategoryInfo(id: 'word', name: 'Kelime', iconData: Icons.abc),
    'memory': CategoryInfo(
      id: 'memory',
      name: 'Hafıza',
      iconData: Icons.psychology,
    ),
    'trivia': CategoryInfo(id: 'trivia', name: 'Bilgi', iconData: Icons.quiz),
    'timeline': CategoryInfo(
      id: 'timeline',
      name: 'Zaman',
      iconData: Icons.timeline,
    ),
  };

  List<GameItem> get _filteredGames {
    if (_selectedCategory == 'all') return _games;
    return _games.where((game) => game.category == _selectedCategory).toList();
  }

  @override
  Widget build(BuildContext context) {
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
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Oyunlar',
                                  style: TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                Text(
                                  'Eğlen ve XP kazan',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Color(0xFF8fb8ff),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Stats card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.white.withOpacity(0.1),
                              Colors.white.withOpacity(0.05),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.1),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _StatItem(
                              icon: Icons.star,
                              label: 'Toplam XP',
                              value: '0',
                              color: Colors.yellow,
                            ),
                            Container(
                              width: 1,
                              height: 40,
                              color: Colors.white.withOpacity(0.2),
                            ),
                            _StatItem(
                              icon: Icons.gamepad,
                              label: 'Oynanan',
                              value: '0',
                              color: Colors.blue,
                            ),
                            Container(
                              width: 1,
                              height: 40,
                              color: Colors.white.withOpacity(0.2),
                            ),
                            _StatItem(
                              icon: Icons.emoji_events,
                              label: 'Kazanılan',
                              value: '0',
                              color: Colors.green,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Categories
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 60,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: _categories.length,
                    itemBuilder: (context, index) {
                      final category = _categories.values.elementAt(index);
                      final isActive = _selectedCategory == category.id;
                      return Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: GestureDetector(
                          onTap: () {
                            setState(() => _selectedCategory = category.id);
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              gradient: isActive
                                  ? const LinearGradient(
                                      colors: [
                                        Color(0xFF0f6acd),
                                        Color(0xFF1a8dff),
                                      ],
                                    )
                                  : null,
                              color: isActive
                                  ? null
                                  : Colors.white.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(
                                color: isActive
                                    ? Colors.white.withOpacity(0.3)
                                    : Colors.white.withOpacity(0.15),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  category.iconData,
                                  size: 20,
                                  color: isActive
                                      ? Colors.white
                                      : Colors.white.withOpacity(0.7),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  category.name,
                                  style: TextStyle(
                                    color: isActive
                                        ? Colors.white
                                        : Colors.white.withOpacity(0.7),
                                    fontWeight: isActive
                                        ? FontWeight.w600
                                        : FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 24)),

              // Games Grid
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 1,
                    childAspectRatio: 1.8,
                    mainAxisSpacing: 16,
                  ),
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final game = _filteredGames[index];
                    return _GameCard(game: game);
                  }, childCount: _filteredGames.length),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 32)),
            ],
          ),
        ),
      ),
    );
  }
}

class _GameCard extends StatelessWidget {
  final GameItem game;

  const _GameCard({required this.game});

  void _navigateToGame(BuildContext context) {
    if (!game.isAvailable) return;

    // Navigate based on game type
    if (game.id == 'quizzes') {
      Navigator.pushNamed(context, '/quizzes');
    } else if (game.id == 'wordle') {
      Navigator.pushNamed(context, '/wordle');
    } else if (game.id == 'news-guessr') {
      Navigator.pushNamed(context, '/news-guessr');
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('${game.title} açılıyor...')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _navigateToGame(context),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [game.color.withOpacity(0.2), game.color.withOpacity(0.1)],
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: game.color.withOpacity(0.3)),
        ),
        child: Stack(
          children: [
            if (!game.isAvailable)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.6),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.lock_outline, color: Colors.white, size: 32),
                        SizedBox(height: 8),
                        Text(
                          'Yakında',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: game.color.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Icon(game.iconData, size: 32, color: game.color),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: game.color.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.star, size: 16, color: game.color),
                            const SizedBox(width: 4),
                            Text(
                              '+${game.xpReward} XP',
                              style: TextStyle(
                                color: game.color,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    game.title,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    game.description,
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.white.withOpacity(0.7),
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      _InfoChip(
                        icon: Icons.trending_up,
                        label: game.difficulty,
                        color: game.color,
                      ),
                      const SizedBox(width: 8),
                      _InfoChip(
                        icon: Icons.access_time,
                        label: game.estimatedTime,
                        color: game.color,
                      ),
                    ],
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

class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.6)),
        ),
      ],
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _InfoChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.9),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class GameItem {
  final String id;
  final String title;
  final String description;
  final IconData iconData;
  final Color color;
  final String category;
  final String difficulty;
  final int xpReward;
  final bool isAvailable;
  final String estimatedTime;

  GameItem({
    required this.id,
    required this.title,
    required this.description,
    required this.iconData,
    required this.color,
    required this.category,
    required this.difficulty,
    required this.xpReward,
    required this.isAvailable,
    required this.estimatedTime,
  });
}

class CategoryInfo {
  final String id;
  final String name;
  final IconData iconData;

  CategoryInfo({required this.id, required this.name, required this.iconData});
}
