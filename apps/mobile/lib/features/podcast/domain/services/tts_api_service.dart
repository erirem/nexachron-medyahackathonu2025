import 'dart:convert';
import 'package:http/http.dart' as http;
import '../entities/tts_response.dart';
import '../../../../core/config/app_config.dart';

class TTSApiService {
  final String baseUrl = AppConfig.apiBaseUrl;

  Map<String, String> _getHeaders() {
    return {'Content-Type': 'application/json', 'Accept': 'application/json'};
  }

  /// TTS ses oluştur
  Future<TTSAudioResponse> generateTTS({
    required String newsId,
    String contentType = 'summary',
    String voice = 'alloy',
    double speed = 1.0,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/api/tts/generate');

      final requestBody = {
        'newsId': newsId,
        'contentType': contentType,
        'voice': voice,
        'speed': speed,
      };

      print('🎵 Generating TTS for news: $newsId');
      print('📡 Request body: ${jsonEncode(requestBody)}');

      final response = await http
          .post(uri, headers: _getHeaders(), body: jsonEncode(requestBody))
          .timeout(
            const Duration(seconds: 30), // TTS işlemi uzun sürebilir
            onTimeout: () {
              throw Exception('TTS generation timeout');
            },
          );

      print('📥 TTS response status: ${response.statusCode}');
      print('📦 TTS response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        final ttsResponse = TTSAudioResponse.fromJson(data);
        print('✅ TTS generated successfully: ${ttsResponse.audioUrl}');
        return ttsResponse;
      } else {
        throw Exception(
          'TTS generation failed: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      print('❌ Error generating TTS: $e');
      rethrow;
    }
  }

  /// Mevcut TTS ses dosyasını al
  Future<TTSAudioResponse> getTTSAudio(String id) async {
    try {
      final uri = Uri.parse('$baseUrl/api/tts/$id');

      print('🎵 Getting TTS audio: $id');

      final response = await http
          .get(uri, headers: _getHeaders())
          .timeout(
            const Duration(seconds: 10),
            onTimeout: () {
              throw Exception('Request timeout');
            },
          );

      print('📥 TTS get response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final ttsResponse = TTSAudioResponse.fromJson(data);
        print('✅ TTS audio retrieved: ${ttsResponse.audioUrl}');
        return ttsResponse;
      } else {
        throw Exception(
          'Failed to get TTS audio: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      print('❌ Error getting TTS audio: $e');
      rethrow;
    }
  }
}
