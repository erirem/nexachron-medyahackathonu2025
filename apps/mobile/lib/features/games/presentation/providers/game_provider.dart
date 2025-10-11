import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../domain/entities/game_types.dart';
import '../../domain/repositories/game_repository.dart';
import '../../data/repositories/game_repository_impl.dart';
import '../services/game_api_service_impl.dart';
import 'gamification_provider.dart';

// Provider for GameRepository
final gameRepositoryProvider = Provider<GameRepository>((ref) {
  final prefs = ref.read(sharedPreferencesProvider);
  final apiService = ref.read(gameApiServiceProvider);
  
  return GameRepositoryImpl(
    apiService: apiService,
    prefs: prefs,
  );
});

// Provider for GameApiService
final gameApiServiceProvider = Provider((ref) {
  return GameApiServiceImpl();
});

// Games Provider
final gamesProvider = FutureProvider<List<Game>>((ref) async {
  final repository = ref.read(gameRepositoryProvider);
  return repository.getAllGames();
});

// Game by ID Provider
final gameByIdProvider = FutureProvider.family<Game?, String>((ref, gameId) async {
  final repository = ref.read(gameRepositoryProvider);
  return repository.getGameById(gameId);
});

// Games by Category Provider
final gamesByCategoryProvider = FutureProvider.family<List<Game>, GameCategory>((ref, category) async {
  final repository = ref.read(gameRepositoryProvider);
  return repository.getGamesByCategory(category);
});

// Game Results Provider
final gameResultsProvider = FutureProvider.family<List<GameResult>, String>((ref, gameId) async {
  final repository = ref.read(gameRepositoryProvider);
  return repository.getGameResults(gameId);
});

// Best Game Result Provider
final bestGameResultProvider = FutureProvider.family<GameResult?, String>((ref, gameId) async {
  final repository = ref.read(gameRepositoryProvider);
  return repository.getBestResult(gameId);
});

// Game Statistics Provider
final gameStatisticsProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, gameId) async {
  final repository = ref.read(gameRepositoryProvider);
  return repository.getGameStatistics(gameId);
});

// Active Game Session Provider
final activeGameSessionProvider = FutureProvider.family<GameSession?, String>((ref, gameId) async {
  final repository = ref.read(gameRepositoryProvider);
  return repository.getActiveGameSession(gameId);
});

// Game Preferences Provider
final gamePreferencesProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, gameId) async {
  final repository = ref.read(gameRepositoryProvider);
  return repository.getGamePreferences(gameId);
});

// Offline Available Games Provider
final offlineGamesProvider = FutureProvider<List<String>>((ref) async {
  final repository = ref.read(gameRepositoryProvider);
  final games = await repository.getAllGames();
  
  List<String> offlineGames = [];
  for (final game in games) {
    if (await repository.isGameAvailableOffline(game.id)) {
      offlineGames.add(game.id);
    }
  }
  
  return offlineGames;
});

// Game Service Provider - Main interface for games to use
final gameServiceProvider = Provider<GameService>((ref) {
  return GameService(ref);
});

class GameService {
  final Ref _ref;

  GameService(this._ref);

  Future<GameSession> startGame(String gameId) async {
    final repository = _ref.read(gameRepositoryProvider);
    return repository.startGameSession(gameId);
  }

  Future<void> updateGameSession(GameSession session) async {
    final repository = _ref.read(gameRepositoryProvider);
    await repository.updateGameSession(session);
  }

  Future<void> completeGame(String sessionId, GameResult result) async {
    final repository = _ref.read(gameRepositoryProvider);
    await repository.endGameSession(sessionId, result);
    
    // Also update gamification
    final gamificationNotifier = _ref.read(userProfileProvider.notifier);
    await gamificationNotifier.addXP('game_completed', result.score, gameId: result.gameId);
  }

  Future<List<Game>> getAllGames() async {
    final repository = _ref.read(gameRepositoryProvider);
    return repository.getAllGames();
  }

  Future<Game?> getGame(String gameId) async {
    final repository = _ref.read(gameRepositoryProvider);
    return repository.getGameById(gameId);
  }

  Future<List<GameResult>> getGameHistory(String gameId) async {
    final repository = _ref.read(gameRepositoryProvider);
    return repository.getGameResults(gameId);
  }

  Future<GameResult?> getBestScore(String gameId) async {
    final repository = _ref.read(gameRepositoryProvider);
    return repository.getBestResult(gameId);
  }

  Future<Map<String, dynamic>> getGameStats(String gameId) async {
    final repository = _ref.read(gameRepositoryProvider);
    return repository.getGameStatistics(gameId);
  }

  Future<void> cacheGameData(String gameId, Map<String, dynamic> data) async {
    final repository = _ref.read(gameRepositoryProvider);
    await repository.cacheGameData(gameId, data);
  }

  Future<Map<String, dynamic>?> getCachedGameData(String gameId) async {
    final repository = _ref.read(gameRepositoryProvider);
    return repository.getCachedGameData(gameId);
  }

  Future<bool> isGameAvailableOffline(String gameId) async {
    final repository = _ref.read(gameRepositoryProvider);
    return repository.isGameAvailableOffline(gameId);
  }
}

// Shared Preferences Provider (needs to be overridden in main.dart)
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden');
});
