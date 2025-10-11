import '../entities/game_types.dart';
import '../entities/gamification_models.dart';

abstract class GameRepository {
  // Game management
  Future<List<Game>> getAllGames();
  Future<Game?> getGameById(String id);
  Future<List<Game>> getGamesByCategory(GameCategory category);
  Future<void> updateGameProgress(String gameId, GameResult result);
  
  // Game sessions
  Future<GameSession> startGameSession(String gameId);
  Future<void> updateGameSession(GameSession session);
  Future<void> endGameSession(String sessionId, GameResult? result);
  Future<GameSession?> getActiveGameSession(String gameId);
  
  // Game results and statistics
  Future<List<GameResult>> getGameResults(String gameId);
  Future<GameResult?> getBestResult(String gameId);
  Future<Map<String, dynamic>> getGameStatistics(String gameId);
  
  // Offline support
  Future<void> cacheGameData(String gameId, Map<String, dynamic> data);
  Future<Map<String, dynamic>?> getCachedGameData(String gameId);
  Future<bool> isGameAvailableOffline(String gameId);
  
  // User preferences
  Future<Map<String, dynamic>> getGamePreferences(String gameId);
  Future<void> updateGamePreferences(String gameId, Map<String, dynamic> preferences);
}

abstract class GamificationRepository {
  // User profile
  Future<UserProfile?> getUserProfile();
  Future<void> updateUserProfile(UserProfile profile);
  
  // XP management
  Future<void> addXP(String type, int amount, {String? gameId});
  Future<List<XPAction>> getXPHistory({int? limit});
  
  // Badges
  Future<List<Badge>> getAllBadges();
  Future<List<Badge>> getEarnedBadges();
  Future<void> awardBadge(BadgeType badgeType);
  Future<bool> checkBadgeEligibility(BadgeType badgeType);
  
  // Streaks
  Future<void> updateStreak();
  Future<bool> useStreakProtection();
  Future<int> getStreakProtectionCount();
  
  // Daily challenges
  Future<List<DailyChallenge>> getDailyChallenges();
  Future<void> completeDailyChallenge(String challengeId);
  Future<DailyChallenge?> getTodaysChallenge(String gameId);
  
  // Leaderboards
  Future<List<UserProfile>> getLeaderboard({int? limit});
  Future<int> getUserRank();
  
  // Social features
  Future<void> shareScore(String gameId, int score);
  Future<List<GameResult>> getFriendsScores(String gameId);
}
