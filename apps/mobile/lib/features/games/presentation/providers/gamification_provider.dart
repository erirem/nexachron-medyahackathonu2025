import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../domain/entities/gamification_models.dart';
import '../../domain/repositories/game_repository.dart';
import '../../data/repositories/gamification_repository_impl.dart';
import '../services/gamification_api_service_impl.dart';

// Provider for SharedPreferences - Mock implementation
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  // Mock SharedPreferences implementation for development
  return MockSharedPreferences();
});

// Mock SharedPreferences class
class MockSharedPreferences implements SharedPreferences {
  final Map<String, dynamic> _prefs = {};

  @override
  Future<bool> clear() async => true;

  @override
  Future<bool> commit() async => true;

  @override
  bool containsKey(String key) => _prefs.containsKey(key);

  @override
  dynamic get(String key) => _prefs[key];

  @override
  bool? getBool(String key) => _prefs[key] as bool?;

  @override
  double? getDouble(String key) => _prefs[key] as double?;

  @override
  int? getInt(String key) => _prefs[key] as int?;

  @override
  Set<String> getKeys() => _prefs.keys.toSet();

  @override
  String? getString(String key) => _prefs[key] as String?;

  @override
  List<String>? getStringList(String key) => _prefs[key] as List<String>?;

  @override
  Future<void> reload() async {}

  @override
  Future<bool> remove(String key) async {
    _prefs.remove(key);
    return true;
  }

  @override
  Future<bool> setBool(String key, bool value) async {
    _prefs[key] = value;
    return true;
  }

  @override
  Future<bool> setDouble(String key, double value) async {
    _prefs[key] = value;
    return true;
  }

  @override
  Future<bool> setInt(String key, int value) async {
    _prefs[key] = value;
    return true;
  }

  @override
  Future<bool> setString(String key, String value) async {
    _prefs[key] = value;
    return true;
  }

  @override
  Future<bool> setStringList(String key, List<String> value) async {
    _prefs[key] = value;
    return true;
  }
}

// Provider for GamificationRepository
final gamificationRepositoryProvider = Provider<GamificationRepository>((ref) {
  final prefs = ref.read(sharedPreferencesProvider);
  final apiService = ref.read(gamificationApiServiceProvider);
  
  return GamificationRepositoryImpl(
    apiService: apiService,
    prefs: prefs,
  );
});

// Provider for GamificationApiService
final gamificationApiServiceProvider = Provider((ref) {
  return GamificationApiServiceImpl();
});

// User Profile Provider
final userProfileProvider = AsyncNotifierProvider<UserProfileNotifier, UserProfile?>(() {
  return UserProfileNotifier();
});

class UserProfileNotifier extends AsyncNotifier<UserProfile?> {
  late GamificationRepository _repository;

  @override
  Future<UserProfile?> build() async {
    _repository = ref.read(gamificationRepositoryProvider);
    return await _loadUserProfile();
  }

  Future<UserProfile?> _loadUserProfile() async {
    try {
      final profile = await _repository.getUserProfile();
      return profile;
    } catch (error, stackTrace) {
      throw AsyncError(error, stackTrace);
    }
  }

  Future<void> addXP(String type, int amount, {String? gameId}) async {
    await _repository.addXP(type, amount, gameId: gameId);
    ref.invalidateSelf(); // Refresh profile
  }

  Future<void> updateStreak() async {
    await _repository.updateStreak();
    ref.invalidateSelf(); // Refresh profile
  }

  Future<void> awardBadge(BadgeType badgeType) async {
    await _repository.awardBadge(badgeType);
    ref.invalidateSelf(); // Refresh profile
  }

  Future<bool> useStreakProtection() async {
    final success = await _repository.useStreakProtection();
    if (success) {
      ref.invalidateSelf(); // Refresh profile
    }
    return success;
  }

  Future<void> updateProfile(UserProfile profile) async {
    await _repository.updateUserProfile(profile);
    ref.invalidateSelf(); // Refresh profile
  }
}

// XP History Provider
final xpHistoryProvider = FutureProvider.family<List<XPAction>, int?>((ref, limit) async {
  final repository = ref.read(gamificationRepositoryProvider);
  return repository.getXPHistory(limit: limit);
});

// Badges Provider
final badgesProvider = FutureProvider<List<Badge>>((ref) async {
  final repository = ref.read(gamificationRepositoryProvider);
  return repository.getAllBadges();
});

// Earned Badges Provider
final earnedBadgesProvider = FutureProvider<List<Badge>>((ref) async {
  final repository = ref.read(gamificationRepositoryProvider);
  return repository.getEarnedBadges();
});

// Daily Challenges Provider
final dailyChallengesProvider = FutureProvider<List<DailyChallenge>>((ref) async {
  final repository = ref.read(gamificationRepositoryProvider);
  return repository.getDailyChallenges();
});

// Today's Challenge Provider
final todaysChallengeProvider = FutureProvider.family<DailyChallenge?, String>((ref, gameId) async {
  final repository = ref.read(gamificationRepositoryProvider);
  return repository.getTodaysChallenge(gameId);
});

// Leaderboard Provider
final leaderboardProvider = FutureProvider.family<List<UserProfile>, int?>((ref, limit) async {
  final repository = ref.read(gamificationRepositoryProvider);
  return repository.getLeaderboard(limit: limit);
});

// User Rank Provider
final userRankProvider = FutureProvider<int>((ref) async {
  final repository = ref.read(gamificationRepositoryProvider);
  return repository.getUserRank();
});

// Streak Protection Count Provider
final streakProtectionCountProvider = FutureProvider<int>((ref) async {
  final repository = ref.read(gamificationRepositoryProvider);
  return repository.getStreakProtectionCount();
});

// Badge Eligibility Provider
final badgeEligibilityProvider = FutureProvider.family<bool, BadgeType>((ref, badgeType) async {
  final repository = ref.read(gamificationRepositoryProvider);
  return repository.checkBadgeEligibility(badgeType);
});

// Gamification Service Provider - Main interface for games to use
final gamificationServiceProvider = Provider<GamificationService>((ref) {
  return GamificationService(ref);
});

class GamificationService {
  final Ref _ref;

  GamificationService(this._ref);

  // Easy access methods for games
  Future<void> completeGame(String gameId, int score, int maxScore) async {
    final notifier = _ref.read(userProfileProvider.notifier);
    
    // Award base XP for completion
    await notifier.addXP('GAME_COMPLETE', 50, gameId: gameId);
    
    // Award perfect score bonus
    if (score == maxScore) {
      await notifier.addXP('PERFECT_SCORE', 100, gameId: gameId);
    }
    
    // Check for first win badge
    final repository = _ref.read(gamificationRepositoryProvider);
    if (await repository.checkBadgeEligibility(BadgeType.firstWin)) {
      await notifier.awardBadge(BadgeType.firstWin);
    }
    
    // Update daily streak
    await notifier.updateStreak();
  }

  Future<void> awardSpeedBonus(int timeBonus) async {
    final notifier = _ref.read(userProfileProvider.notifier);
    await notifier.addXP('SPEED_BONUS', timeBonus);
  }

  Future<void> completeDailyChallenge(String challengeId) async {
    final repository = _ref.read(gamificationRepositoryProvider);
    await repository.completeDailyChallenge(challengeId);
    
    final notifier = _ref.read(userProfileProvider.notifier);
    await notifier.addXP('DAILY_CHALLENGE', 75);
  }

  Future<UserProfile?> getCurrentUser() async {
    final profileAsync = _ref.read(userProfileProvider);
    return profileAsync.when(
      data: (profile) => profile,
      loading: () => null,
      error: (_, __) => null,
    );
  }

  Future<List<Badge>> getEarnedBadges() async {
    final repository = _ref.read(gamificationRepositoryProvider);
    return repository.getEarnedBadges();
  }

  Future<DailyChallenge?> getTodaysChallenge(String gameId) async {
    final repository = _ref.read(gamificationRepositoryProvider);
    return repository.getTodaysChallenge(gameId);
  }

  Future<bool> hasStreakProtection() async {
    final repository = _ref.read(gamificationRepositoryProvider);
    final count = await repository.getStreakProtectionCount();
    return count > 0;
  }

  Future<bool> useStreakProtection() async {
    final notifier = _ref.read(userProfileProvider.notifier);
    return notifier.useStreakProtection();
  }
}
