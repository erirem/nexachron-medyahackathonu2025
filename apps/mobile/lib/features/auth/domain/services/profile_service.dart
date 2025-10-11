import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../core/network/nexachron_api_client.dart';
import '../entities/user_profile.dart';

enum ProfileErrorCode {
  noSession,
  unauthorized,
  apiError,
  invalidResponse,
  unknown,
}

class ProfileException implements Exception {
  const ProfileException(this.code, {this.details});

  final ProfileErrorCode code;
  final Object? details;
}

class ProfileService {
  ProfileService({
    SupabaseClient? supabaseClient,
    NexachronApiClient? apiClient,
  }) : _supabase = supabaseClient ?? Supabase.instance.client,
       _apiClient = apiClient ?? NexachronApiClient();

  final SupabaseClient _supabase;
  final NexachronApiClient _apiClient;

  Future<UserProfile> fetchProfile() async {
    final session = _supabase.auth.currentSession;

    if (session == null) {
      throw const ProfileException(ProfileErrorCode.noSession);
    }

    try {
      final payload = await _apiClient.fetchProfile(session.accessToken);
      return UserProfile.fromJson(payload);
    } on ApiException catch (error) {
      if (error.code == ApiErrorCode.unauthorized) {
        await _supabase.auth.signOut();
        throw const ProfileException(ProfileErrorCode.unauthorized);
      }
      if (error.code == ApiErrorCode.invalidFormat ||
          error.code == ApiErrorCode.parseError) {
        throw const ProfileException(ProfileErrorCode.invalidResponse);
      }
      throw ProfileException(
        ProfileErrorCode.apiError,
        details: error.statusCode,
      );
    } catch (error) {
      throw ProfileException(ProfileErrorCode.unknown, details: error);
    }
  }

  Future<void> logout() {
    return _supabase.auth.signOut();
  }
}
