import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../core/network/nexachron_api_client.dart';
import '../entities/user_profile.dart';

class ProfileException implements Exception {
  const ProfileException(this.message);

  final String message;
}

class ProfileService {
  ProfileService({SupabaseClient? supabaseClient, NexachronApiClient? apiClient})
    : _supabase = supabaseClient ?? Supabase.instance.client,
      _apiClient = apiClient ?? NexachronApiClient();

  final SupabaseClient _supabase;
  final NexachronApiClient _apiClient;

  Future<UserProfile> fetchProfile() async {
    final session = _supabase.auth.currentSession;

    if (session == null) {
      throw const ProfileException('Aktif bir Supabase oturumu bulunamadı.');
    }

    try {
      final payload = await _apiClient.fetchProfile(session.accessToken);
      return UserProfile.fromJson(payload);
    } on ApiException catch (error) {
      if (error.isUnauthorized) {
        await _supabase.auth.signOut();
        throw const ProfileException('Oturum süresi doldu. Lütfen yeniden giriş yap.');
      }
      throw ProfileException(error.message);
    } catch (_) {
      throw const ProfileException('Profil bilgileri yüklenemedi.');
    }
  }

  Future<void> logout() {
    return _supabase.auth.signOut();
  }
}
