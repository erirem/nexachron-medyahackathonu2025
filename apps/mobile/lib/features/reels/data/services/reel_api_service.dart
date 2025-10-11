import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../../core/config/app_config.dart';
import '../../domain/entities/reel_entity.dart';
import '../../domain/repositories/reel_repository.dart';

class ReelApiService implements ReelRepository {
  final String _baseUrl = AppConfig.apiBaseUrl;

  @override
  Future<ExploreFeedResponse> getExploreFeed({
    int? limit,
    String? cursor,
    String? category,
    String? userId,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (limit != null) queryParams['limit'] = limit.toString();
      if (cursor != null) queryParams['cursor'] = cursor;
      if (category != null) queryParams['category'] = category;
      if (userId != null) queryParams['userId'] = userId;

      // Web'deki API endpoint'ini kullan - backend'deki doğru endpoint
      final uri = Uri.parse(
        '$_baseUrl/api/reels/explore',
      ).replace(queryParameters: queryParams);

      print('🎬 Fetching reels from: $uri');
      print('🎬 Base URL: $_baseUrl');

      final response = await http
          .get(uri)
          .timeout(
            const Duration(seconds: 10),
            onTimeout: () {
              throw Exception('Reels request timeout');
            },
          );

      print('📥 Reels response status: ${response.statusCode}');
      print(
        '📦 Reels response body: ${response.body.substring(0, response.body.length > 200 ? 200 : response.body.length)}...',
      );

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body) as Map<String, dynamic>;
        print('✅ Reels loaded successfully');

        // Debug: Log video URLs
        if (jsonData['items'] != null) {
          final items = jsonData['items'] as List<dynamic>;
          for (int i = 0; i < items.length && i < 3; i++) {
            final item = items[i] as Map<String, dynamic>;
            print('🎬 Reel ${i + 1}: ${item['title']}');
            print('🎬 Video URL: ${item['videoUrl']}');
            print('🎬 Thumb URL: ${item['thumbUrl']}');
          }
        }

        return ExploreFeedResponse.fromJson(jsonData);
      } else {
        print('❌ Reels API error: ${response.statusCode} - ${response.body}');
        throw Exception('Failed to load explore feed: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Error fetching explore feed: $e');
      throw Exception('Error fetching explore feed: $e');
    }
  }

  @override
  Future<ReelEntity> getReelById(String id) async {
    try {
      final uri = Uri.parse('$_baseUrl/api/reels/$id');
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body) as Map<String, dynamic>;
        return ReelEntity.fromJson(jsonData);
      } else {
        throw Exception('Failed to load reel: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching reel by ID: $e');
    }
  }

  @override
  Future<NextReelResponse> getNextReel(
    String currentId, {
    String? direction,
    String? category,
    String? userId,
  }) async {
    try {
      final queryParams = <String, String>{'dir': direction ?? 'up'};
      if (category != null) queryParams['category'] = category;
      if (userId != null) queryParams['userId'] = userId;

      final uri = Uri.parse(
        '$_baseUrl/api/reels/$currentId/next',
      ).replace(queryParameters: queryParams);

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body) as Map<String, dynamic>;
        return NextReelResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load next reel: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching next reel: $e');
    }
  }

  @override
  Future<List<ReelEntity>> getReelsList({
    int? limit,
    int? offset,
    String? status,
    String? category,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (limit != null) queryParams['limit'] = limit.toString();
      if (offset != null) queryParams['offset'] = offset.toString();
      if (status != null) queryParams['status'] = status;
      if (category != null) queryParams['category'] = category;

      final uri = Uri.parse(
        '$_baseUrl/api/reels/list',
      ).replace(queryParameters: queryParams);

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body) as Map<String, dynamic>;
        final reelsList = jsonData['reels'] as List<dynamic>;
        return reelsList
            .map((reel) => ReelEntity.fromJson(reel as Map<String, dynamic>))
            .toList();
      } else {
        throw Exception('Failed to load reels list: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching reels list: $e');
    }
  }

  // Web'deki reels API'lerini ekle
  @override
  Future<ReelListResponse> fetchReelsList({
    int? limit,
    int? offset,
    String? status,
    String? category,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (limit != null) queryParams['limit'] = limit.toString();
      if (offset != null) queryParams['offset'] = offset.toString();
      if (status != null) queryParams['status'] = status;
      if (category != null) queryParams['category'] = category;

      final uri = Uri.parse(
        '$_baseUrl/api/reels/list',
      ).replace(queryParameters: queryParams);

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body) as Map<String, dynamic>;
        return ReelListResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load reels list: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching reels list: $e');
    }
  }

  @override
  Future<ReelDetail> fetchReelById(String id) async {
    try {
      final uri = Uri.parse('$_baseUrl/api/reels/$id');
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body) as Map<String, dynamic>;
        return ReelDetail.fromJson(jsonData);
      } else {
        throw Exception('Failed to load reel: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching reel by ID: $e');
    }
  }

  @override
  Future<NextReelResponse> fetchNextReel(
    String currentId, {
    String? direction,
    String? category,
    String? userId,
  }) async {
    try {
      final queryParams = <String, String>{'dir': direction ?? 'up'};
      if (category != null) queryParams['category'] = category;
      if (userId != null) queryParams['userId'] = userId;

      final uri = Uri.parse(
        '$_baseUrl/api/reels/$currentId/next',
      ).replace(queryParameters: queryParams);

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body) as Map<String, dynamic>;
        return NextReelResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to load next reel: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching next reel: $e');
    }
  }
}
