import 'package:flutter/material.dart';

class GameCompletionDialog extends StatelessWidget {
  final String gameTitle;
  final int score;
  final int maxScore;
  final Duration timeElapsed;
  final int? moves;
  final VoidCallback onPlayAgain;
  final VoidCallback onBackToGames;

  const GameCompletionDialog({
    super.key,
    required this.gameTitle,
    required this.score,
    required this.maxScore,
    required this.timeElapsed,
    this.moves,
    required this.onPlayAgain,
    required this.onBackToGames,
  });

  @override
  Widget build(BuildContext context) {
    final scorePercentage = (score / maxScore * 100).round();
    final isExcellent = scorePercentage >= 90;
    final isGood = scorePercentage >= 70;
    
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFF1a2234),
              const Color(0xFF0f1624),
            ],
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: Colors.white.withOpacity(0.2),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Success Icon
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isExcellent
                      ? [Colors.green, Colors.green.shade700]
                      : isGood
                          ? [Colors.orange, Colors.orange.shade700]
                          : [Colors.blue, Colors.blue.shade700],
                ),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isExcellent
                    ? Icons.emoji_events
                    : isGood
                        ? Icons.thumb_up
                        : Icons.check,
                color: Colors.white,
                size: 40,
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Title
            Text(
              isExcellent
                  ? 'Mükemmel!'
                  : isGood
                      ? 'İyi İş!'
                      : 'Tamamlandı!',
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            
            const SizedBox(height: 8),
            
            Text(
              '$gameTitle tamamlandı',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white.withOpacity(0.8),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Score Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Colors.white.withOpacity(0.2),
                ),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Skor',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        '$score / $maxScore',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 12),
                  
                  // Score Progress Bar
                  LinearProgressIndicator(
                    value: score / maxScore,
                    backgroundColor: Colors.white.withOpacity(0.2),
                    valueColor: AlwaysStoppedAnimation<Color>(
                      isExcellent
                          ? Colors.green
                          : isGood
                              ? Colors.orange
                              : Colors.blue,
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Stats Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _StatItem(
                        icon: Icons.access_time,
                        label: 'Süre',
                        value: _formatTime(timeElapsed),
                        color: Colors.blue,
                      ),
                      if (moves != null)
                        _StatItem(
                          icon: Icons.touch_app,
                          label: 'Hamle',
                          value: moves.toString(),
                          color: Colors.green,
                        ),
                      _StatItem(
                        icon: Icons.percent,
                        label: 'Başarı',
                        value: '$scorePercentage%',
                        color: Colors.yellow,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // XP Earned
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF8B5CF6), Color(0xFF7C3AED)],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.star,
                    color: Colors.white,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '+${_calculateXP()} XP Kazandın!',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onBackToGames,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      side: BorderSide(
                        color: Colors.white.withOpacity(0.3),
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Oyunlara Dön',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: onPlayAgain,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: const Color(0xFF0f6acd),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Tekrar Oyna',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  int _calculateXP() {
    // Base XP + score bonus
    int baseXP = 50;
    int scoreBonus = (score / maxScore * 50).round();
    
    // Time bonus (faster = more XP)
    int timeBonus = 0;
    if (timeElapsed.inSeconds < 60) {
      timeBonus = 25;
    } else if (timeElapsed.inSeconds < 120) {
      timeBonus = 15;
    } else if (timeElapsed.inSeconds < 180) {
      timeBonus = 10;
    }
    
    return baseXP + scoreBonus + timeBonus;
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
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withOpacity(0.7),
          ),
        ),
      ],
    );
  }
}
