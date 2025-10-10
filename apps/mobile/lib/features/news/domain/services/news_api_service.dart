import 'dart:convert';
import 'package:http/http.dart' as http;
import '../entities/news_item.dart';
import '../entities/category.dart';
import '../../../../core/config/app_config.dart';

class NewsApiService {
  final String baseUrl = AppConfig.apiBaseUrl;

  Map<String, String> _getHeaders() {
    return {'Content-Type': 'application/json', 'Accept': 'application/json'};
  }

  Future<List<NewsItem>> fetchNewsList({
    int page = 1,
    int pageSize = 10,
    String? categoryId,
    String? city,
    bool? isPopular,
  }) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'pageSize': pageSize.toString(),
      };

      if (categoryId != null) {
        queryParams['categoryId'] = categoryId;
      }
      if (city != null) {
        queryParams['city'] = city;
      }
      if (isPopular != null) {
        queryParams['isPopular'] = isPopular.toString();
      }

      final uri = Uri.parse(
        '$baseUrl/api/news',
      ).replace(queryParameters: queryParams);

      print('📡 Fetching news from: $uri');

      final response = await http
          .get(uri, headers: _getHeaders())
          .timeout(
            const Duration(seconds: 10),
            onTimeout: () {
              throw Exception('Request timeout');
            },
          );

      print('📥 Response status: ${response.statusCode}');
      print(
        '📦 Response body: ${response.body.substring(0, response.body.length > 200 ? 200 : response.body.length)}...',
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final items = data['data']['items'] as List<dynamic>;
          print('✅ Loaded ${items.length} news items');
          return items.map((item) => NewsItem.fromJson(item)).toList();
        }
        throw Exception('Invalid response format');
      } else {
        throw Exception(
          'Failed to load news: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      print('❌ Error fetching news: $e');
      rethrow;
    }
  }

  Future<List<NewsItem>> fetchDashboardNews() async {
    try {
      final uri = Uri.parse('$baseUrl/api/news/dashboard');
      print('📡 Fetching dashboard news from: $uri');

      final response = await http
          .get(uri, headers: _getHeaders())
          .timeout(
            const Duration(seconds: 10),
            onTimeout: () {
              throw Exception('Request timeout');
            },
          );

      print('📥 Dashboard response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final items = data['data']['items'] as List<dynamic>;
          print('✅ Loaded ${items.length} dashboard news items');

          // İlk öğenin yapısını logla
          if (items.isNotEmpty) {
            print('🔍 First item structure: ${json.encode(items.first)}');
          }

          return items.map((item) => NewsItem.fromJson(item)).toList();
        }
        throw Exception('Invalid response format');
      } else {
        throw Exception(
          'Failed to load dashboard news: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      print('❌ Error fetching dashboard news: $e');
      rethrow;
    }
  }

  Future<NewsItem> fetchNewsById(String id) async {
    try {
      final uri = Uri.parse('$baseUrl/api/news/$id');
      print('📡 Fetching news by ID from: $uri');

      final response = await http
          .get(uri, headers: _getHeaders())
          .timeout(
            const Duration(seconds: 10),
            onTimeout: () {
              throw Exception('Request timeout');
            },
          );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null) {
          print('✅ Loaded news item: ${data['data']['title']}');
          return NewsItem.fromJson(data['data']);
        }
        throw Exception('Invalid response format');
      } else {
        throw Exception(
          'Failed to load news: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      print('❌ Error fetching news by ID: $e');
      rethrow;
    }
  }

  Future<List<NewsCategory>> fetchCategories() async {
    final uri = Uri.parse('$baseUrl/api/news/categories');
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['success'] == true && data['data'] != null) {
        if (data['data']['categories'] != null) {
          final categories = data['data']['categories'] as List<dynamic>;
          return categories.map((cat) => NewsCategory.fromJson(cat)).toList();
        }
      }
      throw Exception('Invalid response format');
    } else {
      throw Exception('Failed to load categories: ${response.statusCode}');
    }
  }

  Future<List<NewsItem>> fetchPopularNews({int limit = 10}) async {
    final uri = Uri.parse(
      '$baseUrl/api/news/popular',
    ).replace(queryParameters: {'limit': limit.toString()});
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['success'] == true && data['data'] != null) {
        final items = data['data']['items'] as List<dynamic>;
        return items.map((item) => NewsItem.fromJson(item)).toList();
      }
      throw Exception('Invalid response format');
    } else {
      throw Exception('Failed to load popular news: ${response.statusCode}');
    }
  }

  Future<List<NewsItem>> searchNews(String query, {int limit = 20}) async {
    final uri = Uri.parse(
      '$baseUrl/api/news/search',
    ).replace(queryParameters: {'q': query, 'limit': limit.toString()});
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['success'] == true && data['data'] != null) {
        final items = data['data']['items'] as List<dynamic>;
        return items.map((item) => NewsItem.fromJson(item)).toList();
      }
      throw Exception('Invalid response format');
    } else {
      throw Exception('Failed to search news: ${response.statusCode}');
    }
  }

  Future<List<NewsItem>> fetchRecommendations({int limit = 5}) async {
    try {
      final uri = Uri.parse(
        '$baseUrl/api/v1/recommendations',
      ).replace(queryParameters: {'limit': limit.toString()});

      print('📡 Fetching recommendations from: $uri');

      final response = await http
          .get(uri, headers: _getHeaders())
          .timeout(
            const Duration(seconds: 10),
            onTimeout: () {
              throw Exception('Request timeout');
            },
          );

      print('📥 Recommendations response status: ${response.statusCode}');
      print('📦 Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        // API response format: { ok: true, items: [...] }
        if (data['ok'] == true && data['items'] != null) {
          final items = data['items'] as List<dynamic>;
          print('✅ Loaded ${items.length} recommendation items');
          return items.map((item) => NewsItem.fromJson(item)).toList();
        }
        
        // Fallback: check for success/data format
        if (data['success'] == true && data['data'] != null) {
          final items = data['data']['items'] as List<dynamic>;
          print('✅ Loaded ${items.length} recommendation items');
          return items.map((item) => NewsItem.fromJson(item)).toList();
        }
        
        throw Exception('Invalid response format');
      } else {
        throw Exception(
          'Failed to load recommendations: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('❌ Error fetching recommendations: $e');
      // Fallback: random news if recommendations fail
      return await fetchNewsList(page: 1, pageSize: limit);
    }
  }
}
