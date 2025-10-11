import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../domain/entities/gamification_models.dart';
import '../../domain/entities/game_types.dart';
import '../../domain/services/game_api_service.dart';

class GamificationApiServiceImpl implements GamificationApiService {
  static const String baseUrl = 'https://your-api-url.com/api'; // Replace with actual API URL
  
  final http.Client _client;
  
  GamificationApiServiceImpl({http.Client? client}) : _client = client ?? http.Client();

  @override
  Future<UserProfile?> fetchUserProfile() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/user/profile'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return UserProfile.fromJson(data);
      }
      return null;
    } catch (e) {
      throw Exception('Failed to fetch user profile: $e');
    }
  }

  @override
  Future<void> updateUserProfile(UserProfile profile) async {
    try {
      final response = await _client.put(
        Uri.parse('$baseUrl/user/profile'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(profile.toJson()),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to update user profile');
      }
    } catch (e) {
      throw Exception('Failed to update user profile: $e');
    }
  }

  @override
  Future<void> awardXP(String type, int amount, {String? gameId}) async {
    try {
      final body = {
        'type': type,
        'amount': amount,
        if (gameId != null) 'gameId': gameId,
      };

      final response = await _client.post(
        Uri.parse('$baseUrl/user/xp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to award XP');
      }
    } catch (e) {
      throw Exception('Failed to award XP: $e');
    }
  }

  @override
  Future<List<XPAction>> fetchXPHistory({int? limit}) async {
    try {
      final uri = Uri.parse('$baseUrl/user/xp/history');
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
        return data.map((item) => XPAction.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch XP history: $e');
    }
  }

  @override
  Future<List<Badge>> fetchUserBadges() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/user/badges'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((item) => Badge.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch user badges: $e');
    }
  }

  @override
  Future<void> awardBadge(BadgeType badgeType) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/user/badges'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'badgeType': badgeType.name}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to award badge');
      }
    } catch (e) {
      throw Exception('Failed to award badge: $e');
    }
  }

  @override
  Future<List<Badge>> fetchAvailableBadges() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/badges'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((item) => Badge.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch available badges: $e');
    }
  }

  @override
  Future<void> updateDailyStreak() async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/user/streak'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to update daily streak');
      }
    } catch (e) {
      throw Exception('Failed to update daily streak: $e');
    }
  }

  @override
  Future<bool> useStreakProtection() async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/user/streak/protection'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['success'] ?? false;
      }
      return false;
    } catch (e) {
      throw Exception('Failed to use streak protection: $e');
    }
  }

  @override
  Future<List<DailyChallenge>> fetchDailyChallenges() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/challenges/daily'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((item) => DailyChallenge.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch daily challenges: $e');
    }
  }

  @override
  Future<void> completeDailyChallenge(String challengeId) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/challenges/daily/$challengeId/complete'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to complete daily challenge');
      }
    } catch (e) {
      throw Exception('Failed to complete daily challenge: $e');
    }
  }

  @override
  Future<List<UserProfile>> fetchLeaderboard({int? limit}) async {
    try {
      final uri = Uri.parse('$baseUrl/leaderboard');
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
        return data.map((item) => UserProfile.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch leaderboard: $e');
    }
  }

  @override
  Future<void> shareGameResult(String gameId, GameResult result) async {
    try {
      final body = {
        'gameId': gameId,
        'result': result.toJson(),
      };

      final response = await _client.post(
        Uri.parse('$baseUrl/games/$gameId/share'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to share game result');
      }
    } catch (e) {
      throw Exception('Failed to share game result: $e');
    }
  }
}
