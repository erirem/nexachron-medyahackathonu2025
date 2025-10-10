import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';

enum ApiErrorCode { unauthorized, httpError, invalidFormat, parseError }

class ApiException implements Exception {
  const ApiException(this.code, {this.statusCode, this.cause});

  final ApiErrorCode code;
  final int? statusCode;
  final Object? cause;
}

class NexachronApiClient {
  NexachronApiClient({http.Client? httpClient, String? baseUrl})
    : _client = httpClient ?? http.Client(),
      _baseUrl = baseUrl ?? AppConfig.apiBaseUrl;

  final http.Client _client;
  final String _baseUrl;

  Future<Map<String, dynamic>> fetchProfile(String accessToken) async {
    final uri = Uri.parse('$_baseUrl/api/me');
    final response = await _client.get(
      uri,
      headers: {
        'Authorization': 'Bearer $accessToken',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 401) {
      throw const ApiException(ApiErrorCode.unauthorized);
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        ApiErrorCode.httpError,
        statusCode: response.statusCode,
      );
    }

    try {
      final dynamic payload = jsonDecode(response.body);
      if (payload is Map<String, dynamic>) {
        return payload;
      }
      throw const ApiException(ApiErrorCode.invalidFormat);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException(ApiErrorCode.parseError, cause: error);
    }
  }

  Future<Map<String, dynamic>> fetchPreferences(String accessToken) async {
    final uri = Uri.parse('$_baseUrl/api/v1/user-data/preferences');
    final response = await _client.get(
      uri,
      headers: {
        'Authorization': 'Bearer $accessToken',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 401) {
      throw const ApiException(ApiErrorCode.unauthorized);
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        ApiErrorCode.httpError,
        statusCode: response.statusCode,
      );
    }

    try {
      final dynamic payload = jsonDecode(response.body);
      if (payload is Map<String, dynamic>) {
        return payload;
      }
      throw const ApiException(ApiErrorCode.invalidFormat);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException(ApiErrorCode.parseError, cause: error);
    }
  }

  Future<void> savePreferences(
    String accessToken,
    Map<String, dynamic> preferences,
  ) async {
    final uri = Uri.parse('$_baseUrl/api/v1/user-data/preferences');
    final response = await _client.put(
      uri,
      headers: {
        'Authorization': 'Bearer $accessToken',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(preferences),
    );

    if (response.statusCode == 401) {
      throw const ApiException(ApiErrorCode.unauthorized);
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        ApiErrorCode.httpError,
        statusCode: response.statusCode,
      );
    }
  }
}
