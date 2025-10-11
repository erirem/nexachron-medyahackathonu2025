import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

import '../../domain/entities/gamification_models.dart';
import '../../domain/entities/game_types.dart';
import '../../domain/repositories/game_repository.dart';
import '../../domain/services/game_api_service.dart';

class GamificationRepositoryImpl implements GamificationRepository {
  final GamificationApiService _apiService;
  final SharedPreferences _prefs;

  GamificationRepositoryImpl({
    required GamificationApiService apiService,
    required SharedPreferences prefs,
  })  : _apiService = apiService,
        _prefs = prefs;

  @override
  Future<UserProfile?> getUserProfile() async {
    try {
      // Try to fetch from API first
      final profile = await _apiService.fetchUserProfile();
      if (profile != null) {
        // Cache the profile locally
        await _prefs.setString('user_profile', jsonEncode(profile.toJson()));
        return profile;
      }
    } catch (e) {
      // Fallback to cached profile
      final cachedProfileJson = _prefs.getString('user_profile');
      if (cachedProfileJson != null) {
        return UserProfile.fromJson(jsonDecode(cachedProfileJson));
      }
    }
    
    // Return default profile if no cache
    return _getDefaultUserProfile();
  }

  @override
  Future<void> updateUserProfile(UserProfile profile) async {
    try {
      await _apiService.updateUserProfile(profile);
    } catch (e) {
      // Handle API error
    }
    
    // Always update local cache
    await _prefs.setString('user_profile', jsonEncode(profile.toJson()));
  }

  @override
  Future<void> addXP(String type, int amount, {String? gameId}) async {
    final profile = await getUserProfile();
    if (profile == null) return;

    final xpAction = XPAction(
      type: type,
      value: amount,
      description: _getXPDescription(type, amount),
      timestamp: DateTime.now(),
      gameId: gameId,
    );

    // Update profile XP
    final updatedProfile = profile.copyWith(
      xp: profile.xp + amount,
      weeklyXp: profile.weeklyXp + amount,
      monthlyXp: profile.monthlyXp + amount,
      seasonXp: profile.seasonXp + amount,
      currentRank: _calculateRank(profile.xp + amount),
      league: _calculateLeague(profile.seasonXp + amount),
      lastActive: DateTime.now(),
    );

    await updateUserProfile(updatedProfile);

    // Store XP action in history
    final historyKey = 'xp_history';
    final existingHistory = _prefs.getString(historyKey);
    List<XPAction> history = [];

    if (existingHistory != null) {
      final List<dynamic> historyList = jsonDecode(existingHistory);
      history = historyList.map((h) => XPAction.fromJson(h)).toList();
    }

    history.add(xpAction);

    // Keep only last 100 actions
    if (history.length > 100) {
      history = history.sublist(history.length - 100);
    }

    final historyJson = history.map((h) => h.toJson()).toList();
    await _prefs.setString(historyKey, jsonEncode(historyJson));

    try {
      await _apiService.awardXP(type, amount, gameId: gameId);
    } catch (e) {
      // Handle API error
    }
  }

  @override
  Future<List<XPAction>> getXPHistory({int? limit}) async {
    final historyJson = _prefs.getString('xp_history');
    if (historyJson != null) {
      final List<dynamic> historyList = jsonDecode(historyJson);
      List<XPAction> history = historyList.map((h) => XPAction.fromJson(h)).toList();
      
      // Sort by timestamp descending
      history.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      
      if (limit != null && history.length > limit) {
        history = history.sublist(0, limit);
      }
      
      return history;
    }
    return [];
  }

  @override
  Future<List<Badge>> getAllBadges() async {
    try {
      return await _apiService.fetchAvailableBadges();
    } catch (e) {
      return _getDefaultBadges();
    }
  }

  @override
  Future<List<Badge>> getEarnedBadges() async {
    final profile = await getUserProfile();
    if (profile != null) {
      return profile.badges.where((badge) => badge.isEarned).toList();
    }
    return [];
  }

  @override
  Future<void> awardBadge(BadgeType badgeType) async {
    final profile = await getUserProfile();
    if (profile == null) return;

    final badges = List<Badge>.from(profile.badges);
    final badgeIndex = badges.indexWhere((b) => b.type == badgeType);

    if (badgeIndex != -1 && !badges[badgeIndex].isEarned) {
      badges[badgeIndex] = badges[badgeIndex].copyWith(
        isEarned: true,
        earnedDate: DateTime.now(),
      );

      final updatedProfile = profile.copyWith(badges: badges);
      await updateUserProfile(updatedProfile);

      // Award XP for earning badge
      await addXP('BADGE_EARNED', XPValues.values['BADGE_EARNED']!);

      try {
        await _apiService.awardBadge(badgeType);
      } catch (e) {
        // Handle API error
      }
    }
  }

  @override
  Future<bool> checkBadgeEligibility(BadgeType badgeType) async {
    final profile = await getUserProfile();
    if (profile == null) return false;

    switch (badgeType) {
      case BadgeType.streak3:
        return profile.currentStreak >= 3;
      case BadgeType.streak7:
        return profile.currentStreak >= 7;
      case BadgeType.streak30:
        return profile.currentStreak >= 30;
      case BadgeType.streak100:
        return profile.currentStreak >= 100;
      case BadgeType.firstWin:
        // Check if user has any completed games
        final completedGames = await _getCompletedGamesCount();
        return completedGames >= 1;
      default:
        return false;
    }
  }

  @override
  Future<void> updateStreak() async {
    final profile = await getUserProfile();
    if (profile == null) return;

    final now = DateTime.now();
    final lastActive = profile.lastActive;
    final daysDifference = now.difference(lastActive).inDays;

    int newStreak = profile.currentStreak;
    int newLongestStreak = profile.longestStreak;

    if (daysDifference == 1) {
      // Consecutive day - increment streak
      newStreak++;
      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }
      
      // Award streak bonus XP
      final bonusXP = _calculateStreakBonus(newStreak);
      await addXP('STREAK_BONUS', bonusXP);
      
    } else if (daysDifference > 1) {
      // Streak broken - reset to 1
      newStreak = 1;
    }
    // If daysDifference == 0, same day - no change

    final updatedProfile = profile.copyWith(
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActive: now,
    );

    await updateUserProfile(updatedProfile);

    // Check for streak badges
    if (newStreak >= 3) await awardBadge(BadgeType.streak3);
    if (newStreak >= 7) await awardBadge(BadgeType.streak7);
    if (newStreak >= 30) await awardBadge(BadgeType.streak30);
    if (newStreak >= 100) await awardBadge(BadgeType.streak100);

    try {
      await _apiService.updateDailyStreak();
    } catch (e) {
      // Handle API error
    }
  }

  @override
  Future<bool> useStreakProtection() async {
    final profile = await getUserProfile();
    if (profile == null || profile.streakProtection <= 0) return false;

    final updatedProfile = profile.copyWith(
      streakProtection: profile.streakProtection - 1,
    );

    await updateUserProfile(updatedProfile);

    try {
      return await _apiService.useStreakProtection();
    } catch (e) {
      return true; // Assume success if API fails
    }
  }

  @override
  Future<int> getStreakProtectionCount() async {
    final profile = await getUserProfile();
    return profile?.streakProtection ?? 0;
  }

  @override
  Future<List<DailyChallenge>> getDailyChallenges() async {
    try {
      return await _apiService.fetchDailyChallenges();
    } catch (e) {
      return _getDefaultDailyChallenges();
    }
  }

  @override
  Future<void> completeDailyChallenge(String challengeId) async {
    // Mark challenge as completed locally
    final challengesKey = 'completed_challenges';
    final completedChallenges = _prefs.getStringList(challengesKey) ?? [];
    
    if (!completedChallenges.contains(challengeId)) {
      completedChallenges.add(challengeId);
      await _prefs.setStringList(challengesKey, completedChallenges);
    }

    try {
      await _apiService.completeDailyChallenge(challengeId);
    } catch (e) {
      // Handle API error
    }
  }

  @override
  Future<DailyChallenge?> getTodaysChallenge(String gameId) async {
    final challenges = await getDailyChallenges();
    final today = DateTime.now();
    
    try {
      return challenges.where((challenge) => 
        challenge.gameId == gameId && 
        challenge.isActive &&
        challenge.startDate.day == today.day &&
        challenge.startDate.month == today.month &&
        challenge.startDate.year == today.year
      ).first;
    } catch (e) {
      return null;
    }
  }

  @override
  Future<List<UserProfile>> getLeaderboard({int? limit}) async {
    try {
      final leaderboardData = await _apiService.fetchLeaderboard(limit: limit);
      return leaderboardData.map((data) => UserProfile.fromJson(data as Map<String, dynamic>)).toList();
    } catch (e) {
      return [];
    }
  }

  @override
  Future<int> getUserRank() async {
    final profile = await getUserProfile();
    if (profile == null) return 0;

    try {
      final leaderboard = await getLeaderboard();
      final userIndex = leaderboard.indexWhere((p) => p.id == profile.id);
      return userIndex != -1 ? userIndex + 1 : 0;
    } catch (e) {
      return 0;
    }
  }

  @override
  Future<void> shareScore(String gameId, int score) async {
    // Implementation for sharing score (could be social media, etc.)
    // For now, just store locally
    final sharesKey = 'shared_scores';
    final existingShares = _prefs.getString(sharesKey);
    List<Map<String, dynamic>> shares = [];

    if (existingShares != null) {
      shares = List<Map<String, dynamic>>.from(jsonDecode(existingShares));
    }

    shares.add({
      'gameId': gameId,
      'score': score,
      'timestamp': DateTime.now().toIso8601String(),
    });

    await _prefs.setString(sharesKey, jsonEncode(shares));
  }

  @override
  Future<List<GameResult>> getFriendsScores(String gameId) async {
    // Implementation for fetching friends' scores
    // For now, return empty list
    return [];
  }

  // Helper methods
  UserRank _calculateRank(int xp) {
    if (xp >= RankThresholds.thresholds[UserRank.communityLeader]!) {
      return UserRank.communityLeader;
    } else if (xp >= RankThresholds.thresholds[UserRank.expertCommenter]!) {
      return UserRank.expertCommenter;
    } else if (xp >= RankThresholds.thresholds[UserRank.knowledgeSharer]!) {
      return UserRank.knowledgeSharer;
    } else if (xp >= RankThresholds.thresholds[UserRank.activeReader]!) {
      return UserRank.activeReader;
    }
    return UserRank.newMember;
  }

  League _calculateLeague(int seasonXp) {
    if (seasonXp >= 5000) return League.diamond;
    if (seasonXp >= 3000) return League.platinum;
    if (seasonXp >= 2000) return League.gold;
    if (seasonXp >= 1000) return League.silver;
    return League.bronze;
  }

  int _calculateStreakBonus(int streakDays) {
    if (streakDays < 7) return streakDays * 5;
    if (streakDays < 30) return streakDays * 10;
    return streakDays * 20;
  }

  String _getXPDescription(String type, int amount) {
    switch (type) {
      case 'GAME_COMPLETE':
        return 'Oyun tamamlandı';
      case 'PERFECT_SCORE':
        return 'Mükemmel skor!';
      case 'FIRST_TRY':
        return 'İlk denemede başarı';
      case 'SPEED_BONUS':
        return 'Hız bonusu';
      case 'STREAK_BONUS':
        return 'Seri bonusu';
      case 'DAILY_CHALLENGE':
        return 'Günlük görev tamamlandı';
      case 'BADGE_EARNED':
        return 'Rozet kazanıldı';
      default:
        return 'XP kazanıldı';
    }
  }

  Future<int> _getCompletedGamesCount() async {
    // This would typically check game completion from game repository
    // For now, return a mock value
    return 0;
  }

  UserProfile _getDefaultUserProfile() {
    // Web'deki mock verilere benzer şekilde zengin mock profil
    final mockBadges = _getMockBadges();
    
    return UserProfile(
      id: 'user-123',
      email: 'ahmet.yilmaz@example.com',
      name: 'Ahmet Yılmaz',
      xp: 1250,
      currentRank: UserRank.activeReader,
      league: League.silver,
      currentStreak: 5,
      longestStreak: 12,
      badges: mockBadges,
      streakProtection: 2,
      joinDate: DateTime(2024, 1, 15),
      lastActive: DateTime.now(),
      followedTopics: ['Teknoloji', 'Ekonomi'],
      weeklyXp: 320,
      monthlyXp: 1250,
      seasonXp: 1250,
    );
  }

  List<Badge> _getMockBadges() {
    return [
      // Kazanılmış rozetler (web'deki mock verilere göre)
      Badge(
        type: BadgeType.streak3,
        name: '3 Gün Streak',
        description: '3 gün üst üste giriş yap',
        iconPath: '🔥',
        isEarned: true,
        earnedDate: DateTime(2024, 1, 20),
        rarity: 1,
      ),
      Badge(
        type: BadgeType.streak7,
        name: '7 Gün Streak',
        description: '1 hafta boyunca giriş yap',
        iconPath: '🏏',
        isEarned: true,
        earnedDate: DateTime(2024, 1, 25),
        rarity: 2,
      ),
      Badge(
        type: BadgeType.quizMaster,
        name: 'Quiz Ustası',
        description: '10 quiz\'i doğru çöz',
        iconPath: '🧠',
        isEarned: true,
        earnedDate: DateTime(2024, 2, 1),
        rarity: 2,
      ),
      Badge(
        type: BadgeType.explorer,
        name: 'Trend Takipçisi',
        description: '5 trend konuyu takip et',
        iconPath: '📈',
        isEarned: true,
        earnedDate: DateTime(2024, 2, 5),
        rarity: 1,
      ),
      Badge(
        type: BadgeType.earlyBird,
        name: 'İlk 1000',
        description: 'Platforma ilk 1000 kullanıcıdan biri ol',
        iconPath: '👑',
        isEarned: true,
        earnedDate: DateTime(2024, 1, 15),
        rarity: 5,
      ),
      Badge(
        type: BadgeType.perfectScore,
        name: 'Mükemmel Hafta',
        description: '7 gün boyunca her gün en az 100 XP kazan',
        iconPath: '⭐',
        isEarned: true,
        earnedDate: DateTime(2024, 2, 10),
        rarity: 4,
      ),
      Badge(
        type: BadgeType.speedDemon,
        name: 'Haber Kaşifi',
        description: '100 farklı kategoriden haber oku',
        iconPath: '🗺️',
        isEarned: true,
        earnedDate: DateTime(2024, 2, 15),
        rarity: 3,
      ),
      // Henüz kazanılmamış rozetler
      const Badge(
        type: BadgeType.streak30,
        name: '30 Gün Streak',
        description: '1 ay boyunca giriş yap',
        iconPath: '🏅',
        rarity: 3,
      ),
      const Badge(
        type: BadgeType.streak100,
        name: '100 Gün Streak',
        description: '100 gün üst üste giriş yap',
        iconPath: '⚡',
        rarity: 5,
      ),
      const Badge(
        type: BadgeType.challenger,
        name: 'Topluluk Şampiyonu',
        description: 'Aylık liderlik tablosunda 1. ol',
        iconPath: '🏆',
        rarity: 5,
      ),
    ];
  }

  List<Badge> _getDefaultBadges() {
    return _getMockBadges();
  }

  List<DailyChallenge> _getDefaultDailyChallenges() {
    final today = DateTime.now();
    final tomorrow = today.add(const Duration(days: 1));
    
    return [
      DailyChallenge(
        id: 'daily_quiz_${today.day}${today.month}',
        title: 'Günlük Quiz',
        description: 'Bugün 3 quiz oyunu tamamla',
        gameId: 'quizzes',
        requirements: {'gamesCompleted': 3},
        xpReward: 75,
        startDate: DateTime(today.year, today.month, today.day),
        endDate: DateTime(tomorrow.year, tomorrow.month, tomorrow.day),
      ),
    ];
  }
}
