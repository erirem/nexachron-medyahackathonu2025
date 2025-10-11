import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

import '../../domain/entities/game_types.dart';
import '../../domain/repositories/game_repository.dart';
import '../../domain/services/game_api_service.dart';

class GameRepositoryImpl implements GameRepository {
  final GameApiService _apiService;
  final SharedPreferences _prefs;

  GameRepositoryImpl({
    required GameApiService apiService,
    required SharedPreferences prefs,
  })  : _apiService = apiService,
        _prefs = prefs;

  @override
  Future<List<Game>> getAllGames() async {
    try {
      // Try to fetch from API first
      final games = await _apiService.fetchGames();
      
      // Cache the games locally
      final gamesJson = games.map((g) => g.toJson()).toList();
      await _prefs.setString('cached_games', jsonEncode(gamesJson));
      
      return games;
    } catch (e) {
      // Fallback to cached data if available
      final cachedGames = _prefs.getString('cached_games');
      if (cachedGames != null) {
        final gamesList = (jsonDecode(cachedGames) as List)
            .map((gameJson) => Game.fromJson(gameJson))
            .toList();
        return gamesList;
      }
      
      // If no cache available, return mock games
      return _getMockGames();
    }
  }

  @override
  Future<Game?> getGameById(String id) async {
    try {
      return await _apiService.fetchGameById(id);
    } catch (e) {
      // Fallback to cached games
      final games = await getAllGames();
      try {
        return games.firstWhere((game) => game.id == id);
      } catch (e) {
        return null;
      }
    }
  }

  @override
  Future<List<Game>> getGamesByCategory(GameCategory category) async {
    final allGames = await getAllGames();
    return allGames.where((game) => game.category == category).toList();
  }

  @override
  Future<void> updateGameProgress(String gameId, GameResult result) async {
    // Store game progress locally
    final progressKey = 'game_progress_$gameId';
    final existingProgress = _prefs.getString(progressKey);
    
    List<Map<String, dynamic>> progress = [];
    if (existingProgress != null) {
      progress = List<Map<String, dynamic>>.from(jsonDecode(existingProgress));
    }
    
    progress.add(result.toJson());
    await _prefs.setString(progressKey, jsonEncode(progress));
  }

  @override
  Future<GameSession> startGameSession(String gameId) async {
    final sessionId = DateTime.now().millisecondsSinceEpoch.toString();
    final session = GameSession(
      id: sessionId,
      gameId: gameId,
      startedAt: DateTime.now(),
      isActive: true,
      gameState: {},
    );
    
    // Store active session
    await _prefs.setString('active_session_$gameId', jsonEncode(session.toJson()));
    
    return session;
  }

  @override
  Future<void> updateGameSession(GameSession session) async {
    await _prefs.setString('active_session_${session.gameId}', jsonEncode(session.toJson()));
  }

  @override
  Future<void> endGameSession(String sessionId, GameResult? result) async {
    // Remove active session
    final keys = _prefs.getKeys().where((key) => key.startsWith('active_session_'));
    for (final key in keys) {
      final sessionData = _prefs.getString(key);
      if (sessionData != null) {
        final session = GameSession.fromJson(jsonDecode(sessionData));
        if (session.id == sessionId) {
          await _prefs.remove(key);
          break;
        }
      }
    }
    
    // Store result if provided
    if (result != null) {
      await updateGameProgress(result.gameId, result);
    }
  }

  @override
  Future<GameSession?> getActiveGameSession(String gameId) async {
    final sessionData = _prefs.getString('active_session_$gameId');
    if (sessionData != null) {
      return GameSession.fromJson(jsonDecode(sessionData));
    }
    return null;
  }

  @override
  Future<List<GameResult>> getGameResults(String gameId) async {
    final progressKey = 'game_progress_$gameId';
    final progressData = _prefs.getString(progressKey);
    
    if (progressData != null) {
      final progress = List<Map<String, dynamic>>.from(jsonDecode(progressData));
      return progress.map((data) => GameResult.fromJson(data)).toList();
    }
    
    return [];
  }

  @override
  Future<GameResult?> getBestResult(String gameId) async {
    final results = await getGameResults(gameId);
    if (results.isEmpty) return null;
    
    // Return the result with highest score
    results.sort((a, b) => b.score.compareTo(a.score));
    return results.first;
  }

  @override
  Future<Map<String, dynamic>> getGameStatistics(String gameId) async {
    final results = await getGameResults(gameId);
    
    if (results.isEmpty) {
      return {
        'totalPlayed': 0,
        'averageScore': 0.0,
        'bestScore': 0,
        'totalTime': 0,
      };
    }
    
    final totalScore = results.fold<int>(0, (sum, result) => sum + result.score);
    final totalTime = results.fold<int>(0, (sum, result) => sum + result.timeTaken.inMilliseconds);
    final bestScore = results.map((r) => r.score).reduce((a, b) => a > b ? a : b);
    
    return {
      'totalPlayed': results.length,
      'averageScore': totalScore / results.length,
      'bestScore': bestScore,
      'totalTime': totalTime,
    };
  }

  @override
  Future<void> cacheGameData(String gameId, Map<String, dynamic> data) async {
    await _prefs.setString('game_cache_$gameId', jsonEncode(data));
  }

  @override
  Future<Map<String, dynamic>?> getCachedGameData(String gameId) async {
    final cachedData = _prefs.getString('game_cache_$gameId');
    if (cachedData != null) {
      return jsonDecode(cachedData);
    }
    return null;
  }

  @override
  Future<bool> isGameAvailableOffline(String gameId) async {
    final cachedData = await getCachedGameData(gameId);
    return cachedData != null;
  }

  @override
  Future<Map<String, dynamic>> getGamePreferences(String gameId) async {
    final prefsData = _prefs.getString('game_prefs_$gameId');
    if (prefsData != null) {
      return jsonDecode(prefsData);
    }
    return {};
  }

  @override
  Future<void> updateGamePreferences(String gameId, Map<String, dynamic> preferences) async {
    await _prefs.setString('game_prefs_$gameId', jsonEncode(preferences));
  }

  List<Game> _getMockGames() {
    return [
      const Game(
        id: 'quizzes',
        title: 'Haber Quizleri',
        description: 'Güncel haberlerle ilgili bilginizi test edin',
        iconPath: 'assets/icons/quiz.svg',
        category: GameCategory.educational,
        difficulty: GameDifficulty.easy,
        xpReward: 30,
        status: GameStatus.available,
        estimatedTime: '5-10 dk',
      ),
      const Game(
        id: 'wordle',
        title: 'Wordle',
        description: '5 harfli Türkçe kelimeyi 6 denemede bulun',
        iconPath: 'assets/icons/wordle.svg',
        category: GameCategory.word,
        difficulty: GameDifficulty.medium,
        xpReward: 35,
        status: GameStatus.available,
        estimatedTime: '3-5 dk',
      ),
      const Game(
        id: 'news-guessr',
        title: 'Haber Tahmin',
        description: 'Haberin hangi şehirden geldiğini haritada bul',
        iconPath: 'assets/icons/map.svg',
        category: GameCategory.trivia,
        difficulty: GameDifficulty.medium,
        xpReward: 30,
        status: GameStatus.available,
        estimatedTime: '5-8 dk',
      ),
      const Game(
        id: 'memory-game',
        title: 'Hafıza Oyunu',
        description: 'Haber görsellerini eşleştirin',
        iconPath: 'assets/icons/memory.svg',
        category: GameCategory.memory,
        difficulty: GameDifficulty.medium,
        xpReward: 25,
        status: GameStatus.available,
        estimatedTime: '5 dk',
      ),
      const Game(
        id: 'word-puzzle',
        title: 'Kelime Bulmaca',
        description: 'Haberlerden kelimeleri bulun',
        iconPath: 'assets/icons/word_puzzle.svg',
        category: GameCategory.word,
        difficulty: GameDifficulty.medium,
        xpReward: 20,
        status: GameStatus.available,
        estimatedTime: '4-10 dk',
      ),
      const Game(
        id: 'timeline-game',
        title: 'Zaman Tüneli',
        description: 'Haberleri kronolojik sıraya koyun',
        iconPath: 'assets/icons/timeline.svg',
        category: GameCategory.timeline,
        difficulty: GameDifficulty.hard,
        xpReward: 40,
        status: GameStatus.available,
        estimatedTime: '8-10 dk',
      ),
      const Game(
        id: 'spot-the-difference',
        title: 'Farkı Bul',
        description: 'Haber fotoğraflarında farkları keşfedin',
        iconPath: 'assets/icons/spot_difference.svg',
        category: GameCategory.visual,
        difficulty: GameDifficulty.medium,
        xpReward: 30,
        status: GameStatus.available,
        estimatedTime: '5-12 dk',
      ),
      const Game(
        id: 'flappy-aa-bird',
        title: 'Flappy AA Bird',
        description: 'Haber temalı engelleri aşın',
        iconPath: 'assets/icons/flappy_bird.svg',
        category: GameCategory.arcade,
        difficulty: GameDifficulty.medium,
        xpReward: 20,
        status: GameStatus.available,
        estimatedTime: '2-5 dk',
      ),
      const Game(
        id: 'news-trivia',
        title: 'Haber Trivia',
        description: 'Güncel gelişmeler hakkında kısa sorular',
        iconPath: 'assets/icons/trivia.svg',
        category: GameCategory.trivia,
        difficulty: GameDifficulty.easy,
        xpReward: 15,
        status: GameStatus.available,
        estimatedTime: '2-5 dk',
      ),
    ];
  }
}