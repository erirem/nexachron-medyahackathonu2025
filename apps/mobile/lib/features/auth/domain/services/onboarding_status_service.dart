import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../core/network/nexachron_api_client.dart';
import '../entities/user_preferences.dart';

/// Onboarding durumunu kontrol eden servis
/// Web'deki checkOnboardingStatus fonksiyonuna benzer mantık
class OnboardingStatusService {
  OnboardingStatusService({
    SupabaseClient? supabaseClient,
    NexachronApiClient? apiClient,
  }) : _supabaseClient = supabaseClient ?? Supabase.instance.client,
       _apiClient = apiClient ?? NexachronApiClient();

  final SupabaseClient _supabaseClient;
  final NexachronApiClient _apiClient;

  /// Kullanıcının onboarding'i tamamlayıp tamamlamadığını kontrol eder
  /// Preferences hiç seçilmemişse veya boşsa onboarding gösterilir
  Future<OnboardingStatus?> checkOnboardingStatus() async {
    try {
      final session = _supabaseClient.auth.currentSession;

      if (session?.accessToken == null) {
        return null;
      }

      final response = await _apiClient.fetchPreferences(session!.accessToken);
      final data = response['data'] as Map<String, dynamic>?;

      if (data == null) {
        // Preferences hiç yoksa onboarding göster
        return const OnboardingStatus(
          hasCompletedOnboarding: false,
          isFirstTimeUser: true,
        );
      }

      final preferences = UserPreferences.fromJson(data);

      // Preferences varsa ama boşsa onboarding göster
      final hasCategories = preferences.categories.preferred.isNotEmpty;
      final hasMoods = preferences.targetMoods.prefer.isNotEmpty;
      final hasPersonalizationOptIn = preferences.personalizationOptIn;

      // Eğer personalizationOptIn false ise veya hiç kategori/mood seçilmemişse onboarding göster
      final shouldShowOnboarding =
          !hasPersonalizationOptIn || !hasCategories || !hasMoods;

      return OnboardingStatus(
        hasCompletedOnboarding: !shouldShowOnboarding,
        isFirstTimeUser: shouldShowOnboarding,
      );
    } catch (error) {
      // API hata verirse onboarding göster (güvenli taraf)
      return const OnboardingStatus(
        hasCompletedOnboarding: false,
        isFirstTimeUser: true,
      );
    }
  }

  /// Mevcut tercihleri getirir
  Future<UserPreferences?> getPreferences() async {
    try {
      final session = _supabaseClient.auth.currentSession;

      if (session?.accessToken == null) {
        return null;
      }

      final response = await _apiClient.fetchPreferences(session!.accessToken);
      final data = response['data'] as Map<String, dynamic>?;

      if (data == null) {
        return null;
      }

      return UserPreferences.fromJson(data);
    } catch (error) {
      return null;
    }
  }
}
