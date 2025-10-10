import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../core/network/nexachron_api_client.dart';
import '../entities/user_preferences.dart';

/// Kullanıcı tercihlerini kaydetme servisi
/// Web'deki preferences API çağrılarına benzer
class PreferencesApiService {
  PreferencesApiService({
    SupabaseClient? supabaseClient,
    NexachronApiClient? apiClient,
  })  : _supabaseClient = supabaseClient ?? Supabase.instance.client,
        _apiClient = apiClient ?? NexachronApiClient();

  final SupabaseClient _supabaseClient;
  final NexachronApiClient _apiClient;

  /// Kullanıcı tercihlerini backend'e kaydeder
  Future<void> savePreferences(UserPreferences preferences) async {
    final session = _supabaseClient.auth.currentSession;
    
    if (session?.accessToken == null) {
      throw Exception('No active session');
    }

    await _apiClient.savePreferences(
      session!.accessToken,
      preferences.toJson(),
    );
  }
}

