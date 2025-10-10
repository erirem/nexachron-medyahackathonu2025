import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/game_types.dart';

class GameCard extends ConsumerWidget {
  final Game game;

  const GameCard({
    super.key,
    required this.game,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: () => _navigateToGame(context, game),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              _getGameColor(game.category).withOpacity(0.2),
              _getGameColor(game.category).withOpacity(0.1),
            ],
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: _getGameColor(game.category).withOpacity(0.3),
          ),
        ),
        child: Stack(
          children: [
            if (game.status != GameStatus.available)
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
              padding: const EdgeInsets.all(16), // Reduced from 20 to 16
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10), // Reduced from 12 to 10
                        decoration: BoxDecoration(
                          color: _getGameColor(game.category).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(14), // Reduced from 16 to 14
                        ),
                        child: Icon(
                          _getGameIcon(game.category),
                          size: 28, // Reduced from 32 to 28
                          color: _getGameColor(game.category),
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10, // Reduced from 12 to 10
                          vertical: 5, // Reduced from 6 to 5
                        ),
                        decoration: BoxDecoration(
                          color: _getGameColor(game.category).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(10), // Reduced from 12 to 10
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.star,
                              size: 14, // Reduced from 16 to 14
                              color: _getGameColor(game.category),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '+${game.xpReward} XP',
                              style: TextStyle(
                                color: _getGameColor(game.category),
                                fontWeight: FontWeight.bold,
                                fontSize: 12, // Added explicit font size
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10), // Reduced from 12 to 10
                  Text(
                    game.title,
                    style: const TextStyle(
                      fontSize: 18, // Reduced from 20 to 18
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6), // Reduced from 8 to 6
                  Expanded( // Use Expanded instead of Spacer to control space better
                    child: Text(
                      game.description,
                      style: TextStyle(
                        fontSize: 12, // Reduced from 13 to 12
                        color: Colors.white.withOpacity(0.7),
                        height: 1.2, // Reduced from 1.3 to 1.2
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 8), // Add small spacing before chips
                  Row(
                    children: [
                      _InfoChip(
                        icon: Icons.trending_up,
                        label: _getDifficultyName(game.difficulty),
                        color: _getGameColor(game.category),
                      ),
                      const SizedBox(width: 8),
                      _InfoChip(
                        icon: Icons.access_time,
                        label: game.estimatedTime,
                        color: _getGameColor(game.category),
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

  void _navigateToGame(BuildContext context, Game game) {
    if (game.status != GameStatus.available) return;

    // Navigate based on game type
    switch (game.id) {
      case 'quizzes':
        Navigator.pushNamed(context, '/quizzes');
        break;
      case 'wordle':
        Navigator.pushNamed(context, '/wordle');
        break;
      case 'news-guessr':
        Navigator.pushNamed(context, '/news-guessr');
        break;
      case 'memory-game':
        Navigator.pushNamed(context, '/memory-game');
        break;
      case 'word-puzzle':
        Navigator.pushNamed(context, '/word-puzzle');
        break;
      case 'timeline-game':
        Navigator.pushNamed(context, '/timeline-game');
        break;
      case 'spot-the-difference':
        Navigator.pushNamed(context, '/spot-difference');
        break;
      case 'flappy-aa-bird':
        Navigator.pushNamed(context, '/flappy-bird');
        break;
      case 'news-trivia':
        Navigator.pushNamed(context, '/news-trivia');
        break;
      default:
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${game.title} açılıyor...')),
        );
    }
  }

  Color _getGameColor(GameCategory category) {
    switch (category) {
      case GameCategory.educational:
        return Colors.blue;
      case GameCategory.memory:
        return Colors.purple;
      case GameCategory.word:
        return Colors.green;
      case GameCategory.trivia:
        return Colors.orange;
      case GameCategory.timeline:
        return Colors.cyan;
      case GameCategory.visual:
        return Colors.red;
      case GameCategory.arcade:
        return Colors.pink;
    }
  }

  IconData _getGameIcon(GameCategory category) {
    switch (category) {
      case GameCategory.educational:
        return Icons.school;
      case GameCategory.memory:
        return Icons.psychology;
      case GameCategory.word:
        return Icons.abc;
      case GameCategory.trivia:
        return Icons.quiz;
      case GameCategory.timeline:
        return Icons.timeline;
      case GameCategory.visual:
        return Icons.visibility;
      case GameCategory.arcade:
        return Icons.sports_esports;
    }
  }

  String _getDifficultyName(GameDifficulty difficulty) {
    switch (difficulty) {
      case GameDifficulty.easy:
        return 'Kolay';
      case GameDifficulty.medium:
        return 'Orta';
      case GameDifficulty.hard:
        return 'Zor';
    }
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
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), // Reduced padding
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10), // Reduced from 12 to 10
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color), // Reduced from 14 to 12
          const SizedBox(width: 3), // Reduced from 4 to 3
          Text(
            label,
            style: TextStyle(
              fontSize: 11, // Reduced from 12 to 11
              color: Colors.white.withOpacity(0.9),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
