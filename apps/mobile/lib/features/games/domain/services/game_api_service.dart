import '../entities/game_types.dart';
import '../entities/gamification_models.dart';

abstract class GameApiService {
  // Game data
  Future<List<Game>> fetchGames();
  Future<Game?> fetchGameById(String id);
  
  // Game sessions
  Future<GameSession> startGame(String gameId, {Map<String, dynamic>? config});
  Future<void> submitGameResult(String sessionId, GameResult result);
  Future<void> updateGameSession(String sessionId, Map<String, dynamic> state);
  
  // Questions and content
  Future<List<Map<String, dynamic>>> fetchGameQuestions(String gameId, {int? limit});
  Future<List<Map<String, dynamic>>> fetchNewsTrivia({int? limit});
  Future<List<Map<String, dynamic>>> fetchWordPuzzleWords({String? category});
  Future<List<Map<String, dynamic>>> fetchTimelineEvents({String? category});
  Future<List<Map<String, dynamic>>> fetchSpotDifferenceImages();
  
  // Validation
  Future<bool> validateAnswer(String sessionId, String questionId, String answer);
  Future<Map<String, dynamic>> checkGameCompletion(String sessionId);
  
  // Leaderboards
  Future<List<Map<String, dynamic>>> fetchLeaderboard(String gameId, {int? limit});
  Future<int> getUserRank(String gameId);
  
  // Multiplayer (for News Guessr)
  Future<String> createMultiplayerRoom(String gameId);
  Future<void> joinMultiplayerRoom(String roomId);
  Future<void> leaveMultiplayerRoom(String roomId);
  Future<void> sendMultiplayerAction(String roomId, Map<String, dynamic> action);
}

abstract class GamificationApiService {
  // User profile
  Future<UserProfile?> fetchUserProfile();
  Future<void> updateUserProfile(UserProfile profile);
  
  // XP and progression
  Future<void> awardXP(String type, int amount, {String? gameId});
  Future<List<XPAction>> fetchXPHistory({int? limit});
  
  // Badges
  Future<List<Badge>> fetchUserBadges();
  Future<void> awardBadge(BadgeType badgeType);
  Future<List<Badge>> fetchAvailableBadges();
  
  // Streaks
  Future<void> updateDailyStreak();
  Future<bool> useStreakProtection();
  
  // Daily challenges
  Future<List<DailyChallenge>> fetchDailyChallenges();
  Future<void> completeDailyChallenge(String challengeId);
  
  // Social features
  Future<List<UserProfile>> fetchLeaderboard({int? limit});
  Future<void> shareGameResult(String gameId, GameResult result);
}

abstract class NotificationService {
  // Local notifications
  Future<void> scheduleGameReminder(String gameId, DateTime scheduledTime);
  Future<void> scheduleStreakReminder(DateTime scheduledTime);
  Future<void> scheduleDailyChallengeReminder(DateTime scheduledTime);
  
  // Instant notifications
  Future<void> showXPEarnedNotification(int xp);
  Future<void> showBadgeEarnedNotification(Badge badge);
  Future<void> showStreakLostWarning();
  Future<void> showChallengeCompletedNotification(DailyChallenge challenge);
  
  // Permission management
  Future<bool> requestNotificationPermission();
  Future<bool> areNotificationsEnabled();
  Future<void> updateNotificationSettings(Map<String, bool> settings);
}

abstract class HapticService {
  // Feedback types
  Future<void> lightImpact();
  Future<void> mediumImpact();
  Future<void> heavyImpact();
  Future<void> selectionClick();
  Future<void> successFeedback();
  Future<void> warningFeedback();
  Future<void> errorFeedback();
  
  // Game-specific feedback
  Future<void> correctAnswerFeedback();
  Future<void> wrongAnswerFeedback();
  Future<void> gameCompleteFeedback();
  Future<void> badgeEarnedFeedback();
  Future<void> levelUpFeedback();
  
  // Settings
  Future<bool> isHapticEnabled();
  Future<void> setHapticEnabled(bool enabled);
}

abstract class CacheService {
  // Game data caching
  Future<void> cacheGameData(String key, Map<String, dynamic> data);
  Future<Map<String, dynamic>?> getCachedGameData(String key);
  Future<void> clearGameCache(String gameId);
  
  // Image caching
  Future<void> cacheGameImages(String gameId, List<String> imageUrls);
  Future<String?> getCachedImagePath(String imageUrl);
  
  // Offline availability
  Future<void> markGameAvailableOffline(String gameId);
  Future<bool> isGameAvailableOffline(String gameId);
  Future<List<String>> getOfflineAvailableGames();
  
  // Cache management
  Future<void> clearAllCache();
  Future<int> getCacheSize();
  Future<void> optimizeCache();
}
