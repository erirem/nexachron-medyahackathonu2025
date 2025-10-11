import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:ui';

import '../../domain/entities/game_types.dart';
import '../../domain/entities/gamification_models.dart';
import '../widgets/glassmorphic_button.dart';

class SocialFeaturesWidget extends ConsumerWidget {
  final GameResult? gameResult;
  final UserProfile? userProfile;

  const SocialFeaturesWidget({
    super.key,
    this.gameResult,
    this.userProfile,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.green.withOpacity(0.2),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.green.withOpacity(0.15),
                  Colors.green.withOpacity(0.05),
                ],
              ),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
                width: 1.5,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.share,
                        color: Colors.green.shade300,
                        size: 24,
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Sosyal Özellikler',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  if (gameResult != null) ...[
                    // Share Score
                    _buildSocialButton(
                      icon: Icons.share,
                      label: 'Skoru Paylaş',
                      color: Colors.blue,
                      onTap: () => _shareScore(context, gameResult!),
                    ),
                    const SizedBox(height: 12),
                  ],
                  
                  // Challenge Friends
                  _buildSocialButton(
                    icon: Icons.people_alt,
                    label: 'Arkadaşlarını Davet Et',
                    color: Colors.purple,
                    onTap: () => _challengeFriends(context),
                  ),
                  const SizedBox(height: 12),
                  
                  // View Leaderboard
                  _buildSocialButton(
                    icon: Icons.leaderboard,
                    label: 'Liderlik Tablosu',
                    color: Colors.orange,
                    onTap: () => _viewLeaderboard(context),
                  ),
                  
                  if (userProfile != null) ...[
                    const SizedBox(height: 16),
                    // User Stats
                    _buildUserStats(userProfile!),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSocialButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              color.withOpacity(0.2),
              color.withOpacity(0.1),
            ],
          ),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: color.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Colors.white.withOpacity(0.5),
              size: 16,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUserStats(UserProfile profile) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withOpacity(0.1),
            Colors.white.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Senin İstatistiklerin',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildStatItem(
                  'Seviye',
                  _getRankName(profile.currentRank),
                  Colors.blue,
                ),
              ),
              Expanded(
                child: _buildStatItem(
                  'XP',
                  '${profile.xp}',
                  Colors.green,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _buildStatItem(
                  'Seri',
                  '${profile.currentStreak}',
                  Colors.orange,
                ),
              ),
              Expanded(
                child: _buildStatItem(
                  'Rozetler',
                  '${profile.badges.length}',
                  Colors.purple,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(8),
      margin: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  void _shareScore(BuildContext context, GameResult result) {
    final message = 'Nexachron\'da ${result.gameId} oyununda ${result.score} puan aldım! 🎮\n'
        'Sen de oynamak ister misin? #Nexachron #Gaming';
    
    // Mock share functionality
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Skor paylaşıldı: ${result.score} puan!'),
        backgroundColor: Colors.green.withOpacity(0.8),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  void _challengeFriends(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const FriendChallengeDialog(),
    );
  }

  void _viewLeaderboard(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const LeaderboardPage(),
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

class FriendChallengeDialog extends StatefulWidget {
  const FriendChallengeDialog({super.key});

  @override
  State<FriendChallengeDialog> createState() => _FriendChallengeDialogState();
}

class _FriendChallengeDialogState extends State<FriendChallengeDialog> {
  final TextEditingController _messageController = TextEditingController();
  String _selectedGame = 'news_trivia';

  final Map<String, String> _games = {
    'news_trivia': 'Haber Trivia',
    'wordle': 'Kelime Oyunu',
    'memory_game': 'Hafıza Oyunu',
    'quiz': 'Genel Quiz',
  };

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.white.withOpacity(0.2),
                    Colors.white.withOpacity(0.1),
                  ],
                ),
                border: Border.all(
                  color: Colors.white.withOpacity(0.3),
                  width: 1.5,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.people_alt,
                          color: Colors.purple.shade300,
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'Arkadaşlarını Davet Et',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const Spacer(),
                        IconButton(
                          onPressed: () => Navigator.of(context).pop(),
                          icon: const Icon(Icons.close, color: Colors.white),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    
                    // Game Selection
                    DropdownButtonFormField<String>(
                      initialValue: _selectedGame,
                      style: const TextStyle(color: Colors.white),
                      dropdownColor: const Color(0xFF1a2234),
                      decoration: InputDecoration(
                        labelText: 'Oyun Seç',
                        labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.1),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      items: _games.entries.map((entry) {
                        return DropdownMenuItem(
                          value: entry.key,
                          child: Text(entry.value),
                        );
                      }).toList(),
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => _selectedGame = value);
                        }
                      },
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Custom Message
                    TextField(
                      controller: _messageController,
                      style: const TextStyle(color: Colors.white),
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'Özel mesaj (isteğe bağlı)',
                        hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.1),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: GlassmorphicButton(
                            text: 'İptal',
                            primaryColor: Colors.grey,
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: GlassmorphicButton(
                            text: 'Davet Gönder',
                            primaryColor: Colors.purple,
                            icon: Icons.send,
                            onPressed: _sendChallenge,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _sendChallenge() {
    final gameName = _games[_selectedGame] ?? _selectedGame;
    final message = _messageController.text.trim();
    
    // Mock challenge sending
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$gameName için davet gönderildi!'),
        backgroundColor: Colors.purple.withOpacity(0.8),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}

class LeaderboardPage extends StatelessWidget {
  const LeaderboardPage({super.key});

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
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                    ),
                    const SizedBox(width: 16),
                    const Text(
                      'Liderlik Tablosu',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),

              // Leaderboard List
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: ListView.builder(
                    itemCount: _mockLeaderboard.length,
                    itemBuilder: (context, index) {
                      final player = _mockLeaderboard[index];
                      return _buildLeaderboardItem(player, index + 1);
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLeaderboardItem(Map<String, dynamic> player, int rank) {
    Color rankColor;
    IconData rankIcon;
    
    switch (rank) {
      case 1:
        rankColor = Colors.amber;
        rankIcon = Icons.emoji_events;
        break;
      case 2:
        rankColor = Colors.grey.shade300;
        rankIcon = Icons.emoji_events;
        break;
      case 3:
        rankColor = Colors.orange.shade300;
        rankIcon = Icons.emoji_events;
        break;
      default:
        rankColor = Colors.blue;
        rankIcon = Icons.person;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: rankColor.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  rankColor.withOpacity(0.15),
                  rankColor.withOpacity(0.05),
                ],
              ),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
                width: 1,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  // Rank
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: rankColor.withOpacity(0.3),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: rankColor,
                        width: 2,
                      ),
                    ),
                    child: Center(
                      child: rank <= 3
                          ? Icon(rankIcon, color: rankColor, size: 20)
                          : Text(
                              '$rank',
                              style: TextStyle(
                                color: rankColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                    ),
                  ),
                  
                  const SizedBox(width: 16),
                  
                  // Player Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          player['name'],
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          player['rank'],
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // XP
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.amber.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Colors.amber.withOpacity(0.5),
                      ),
                    ),
                    child: Text(
                      '${player['xp']} XP',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.amber,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  static final List<Map<String, dynamic>> _mockLeaderboard = [
    {'name': 'Ahmet Yılmaz', 'xp': 2450, 'rank': 'Uzman Yorumcu'},
    {'name': 'Ayşe Demir', 'xp': 2200, 'rank': 'Bilgi Paylaşıcısı'},
    {'name': 'Mehmet Can', 'xp': 1950, 'rank': 'Aktif Okuyucu'},
    {'name': 'Fatma Özkan', 'xp': 1750, 'rank': 'Aktif Okuyucu'},
    {'name': 'Ali Kaya', 'xp': 1650, 'rank': 'Aktif Okuyucu'},
    {'name': 'Zeynep Şahin', 'xp': 1550, 'rank': 'Yeni Üye'},
    {'name': 'Burak Çelik', 'xp': 1450, 'rank': 'Yeni Üye'},
    {'name': 'Elif Turan', 'xp': 1350, 'rank': 'Yeni Üye'},
  ];
}

