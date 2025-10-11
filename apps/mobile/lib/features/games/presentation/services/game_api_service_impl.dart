import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../domain/entities/game_types.dart';
import '../../domain/services/game_api_service.dart';

class GameApiServiceImpl implements GameApiService {
  static const String baseUrl = 'https://your-api-url.com/api'; // Replace with actual API URL
  
  final http.Client _client;
  
  GameApiServiceImpl({http.Client? client}) : _client = client ?? http.Client();

  @override
  Future<List<Game>> fetchGames() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/games'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((item) => Game.fromJson(item)).toList();
      }
      throw Exception('Failed to fetch games');
    } catch (e) {
      throw Exception('Failed to fetch games: $e');
    }
  }

  @override
  Future<Game?> fetchGameById(String id) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/games/$id'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Game.fromJson(data);
      }
      return null;
    } catch (e) {
      throw Exception('Failed to fetch game: $e');
    }
  }

  @override
  Future<GameSession> startGame(String gameId, {Map<String, dynamic>? config}) async {
    try {
      final body = {
        'gameId': gameId,
        if (config != null) 'config': config,
      };

      final response = await _client.post(
        Uri.parse('$baseUrl/games/$gameId/start'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return GameSession.fromJson(data);
      }
      throw Exception('Failed to start game');
    } catch (e) {
      throw Exception('Failed to start game: $e');
    }
  }

  @override
  Future<void> submitGameResult(String sessionId, GameResult result) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/games/sessions/$sessionId/result'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(result.toJson()),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to submit game result');
      }
    } catch (e) {
      throw Exception('Failed to submit game result: $e');
    }
  }

  @override
  Future<void> updateGameSession(String sessionId, Map<String, dynamic> state) async {
    try {
      final response = await _client.put(
        Uri.parse('$baseUrl/games/sessions/$sessionId'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'gameState': state}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to update game session');
      }
    } catch (e) {
      throw Exception('Failed to update game session: $e');
    }
  }

  @override
  Future<List<Map<String, dynamic>>> fetchGameQuestions(String gameId, {int? limit}) async {
    try {
      final uri = Uri.parse('$baseUrl/games/$gameId/questions');
      final queryParams = <String, String>{};
      if (limit != null) {
        queryParams['limit'] = limit.toString();
      }

      final response = await _client.get(
        uri.replace(queryParameters: queryParams),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch game questions: $e');
    }
  }

  @override
  Future<List<Map<String, dynamic>>> fetchNewsTrivia({int? limit}) async {
    try {
      final uri = Uri.parse('$baseUrl/games/news-trivia/questions');
      final queryParams = <String, String>{};
      if (limit != null) {
        queryParams['limit'] = limit.toString();
      }

      final response = await _client.get(
        uri.replace(queryParameters: queryParams),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch news trivia: $e');
    }
  }

  @override
  Future<List<Map<String, dynamic>>> fetchWordPuzzleWords({String? category}) async {
    try {
      final uri = Uri.parse('$baseUrl/games/word-puzzle/words');
      final queryParams = <String, String>{};
      if (category != null) {
        queryParams['category'] = category;
      }

      final response = await _client.get(
        uri.replace(queryParameters: queryParams),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch word puzzle words: $e');
    }
  }

  @override
  Future<List<Map<String, dynamic>>> fetchTimelineEvents({String? category}) async {
    try {
      final uri = Uri.parse('$baseUrl/games/timeline/events');
      final queryParams = <String, String>{};
      if (category != null) {
        queryParams['category'] = category;
      }

      final response = await _client.get(
        uri.replace(queryParameters: queryParams),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch timeline events: $e');
    }
  }

  @override
  Future<List<Map<String, dynamic>>> fetchSpotDifferenceImages() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/games/spot-difference/images'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch spot difference images: $e');
    }
  }

  @override
  Future<bool> validateAnswer(String sessionId, String questionId, String answer) async {
    try {
      final body = {
        'questionId': questionId,
        'answer': answer,
      };

      final response = await _client.post(
        Uri.parse('$baseUrl/games/sessions/$sessionId/validate'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['isCorrect'] ?? false;
      }
      return false;
    } catch (e) {
      throw Exception('Failed to validate answer: $e');
    }
  }

  @override
  Future<Map<String, dynamic>> checkGameCompletion(String sessionId) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/games/sessions/$sessionId/completion'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {};
    } catch (e) {
      throw Exception('Failed to check game completion: $e');
    }
  }

  @override
  Future<List<Map<String, dynamic>>> fetchLeaderboard(String gameId, {int? limit}) async {
    try {
      final uri = Uri.parse('$baseUrl/games/$gameId/leaderboard');
      final queryParams = <String, String>{};
      if (limit != null) {
        queryParams['limit'] = limit.toString();
      }

      final response = await _client.get(
        uri.replace(queryParameters: queryParams),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch leaderboard: $e');
    }
  }

  @override
  Future<int> getUserRank(String gameId) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/games/$gameId/user-rank'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['rank'] ?? 0;
      }
      return 0;
    } catch (e) {
      throw Exception('Failed to fetch user rank: $e');
    }
  }

  @override
  Future<String> createMultiplayerRoom(String gameId) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/games/$gameId/multiplayer/create'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['roomId'];
      }
      throw Exception('Failed to create multiplayer room');
    } catch (e) {
      throw Exception('Failed to create multiplayer room: $e');
    }
  }

  @override
  Future<void> joinMultiplayerRoom(String roomId) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/games/multiplayer/$roomId/join'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to join multiplayer room');
      }
    } catch (e) {
      throw Exception('Failed to join multiplayer room: $e');
    }
  }

  @override
  Future<void> leaveMultiplayerRoom(String roomId) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/games/multiplayer/$roomId/leave'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to leave multiplayer room');
      }
    } catch (e) {
      throw Exception('Failed to leave multiplayer room: $e');
    }
  }

  @override
  Future<void> sendMultiplayerAction(String roomId, Map<String, dynamic> action) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/games/multiplayer/$roomId/action'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(action),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to send multiplayer action');
      }
    } catch (e) {
      throw Exception('Failed to send multiplayer action: $e');
    }
  }
}
