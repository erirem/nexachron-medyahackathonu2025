import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.isUnauthorized = false, this.cause});

  final String message;
  final bool isUnauthorized;
  final Object? cause;
}

class NexachronApiClient {
  NexachronApiClient({http.Client? httpClient, String? baseUrl})
    : _client = httpClient ?? http.Client(),
      _baseUrl = baseUrl ?? AppConfig.apiBaseUrl;

  final http.Client _client;
  final String _baseUrl;

  Future<Map<String, dynamic>> fetchProfile(String accessToken) async {
    final uri = Uri.parse('$_baseUrl/me');
    final response = await _client.get(uri, headers: {
      'Authorization': 'Bearer $accessToken',
      'Accept': 'application/json',
    });

    if (response.statusCode == 401) {
      throw const ApiException('Oturum süresi doldu. Yeniden giriş yap.', isUnauthorized: true);
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException('Profil çağrısı başarısız oldu (${response.statusCode}).');
    }

    try {
      final dynamic payload = jsonDecode(response.body);
      if (payload is Map<String, dynamic>) {
        return payload;
      }
      throw const ApiException('Profil yanıtı beklenen formatta değil.');
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException('Profil yanıtı çözümlenemedi.', cause: error);
    }
  }
}
