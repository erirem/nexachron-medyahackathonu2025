import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../domain/services/profile_service.dart';
import '../../domain/entities/user_profile.dart';

// Supabase client provider
final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

// Profile service provider
final profileServiceProvider = Provider<ProfileService>((ref) {
  return ProfileService();
});

// Current user provider
final currentUserProvider = StreamProvider<User?>((ref) {
  final supabase = ref.watch(supabaseClientProvider);
  return supabase.auth.onAuthStateChange.map((data) => data.session?.user);
});

// User profile provider
final userProfileProvider = FutureProvider<UserProfile?>((ref) async {
  final profileService = ref.watch(profileServiceProvider);
  
  try {
    return await profileService.fetchProfile();
  } catch (e) {
    // Hata durumunda null döndür
    return null;
  }
});

// Combined user data provider (Supabase user + backend profile)
final combinedUserDataProvider = FutureProvider<CombinedUserData?>((ref) async {
  final currentUser = await ref.watch(currentUserProvider.future);
  final userProfile = await ref.watch(userProfileProvider.future);
  
  if (currentUser == null) return null;
  
  return CombinedUserData(
    supabaseUser: currentUser,
    backendProfile: userProfile,
  );
});

class CombinedUserData {
  final User supabaseUser;
  final UserProfile? backendProfile;
  
  const CombinedUserData({
    required this.supabaseUser,
    this.backendProfile,
  });
  
  // Kullanıcı adını backend'den al, yoksa Supabase'den al
  String get displayName {
    return backendProfile?.username ?? 
           supabaseUser.userMetadata?['name'] ?? 
           supabaseUser.email?.split('@').first ?? 
           'Kullanıcı';
  }
  
  // Email'i Supabase'den al
  String? get email => supabaseUser.email;
  
  // Şehir bilgisini backend'den al
  String? get city => backendProfile?.city;
  
  // Katılım tarihini backend'den al
  DateTime? get joinDate => backendProfile?.createdAt;
}
