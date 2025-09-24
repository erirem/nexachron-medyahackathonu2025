import 'package:flutter/foundation.dart';

import '../../domain/entities/user_profile.dart';
import '../../domain/services/profile_service.dart';

enum ProfileStatus { idle, loading, loaded, error }

class ProfileController extends ChangeNotifier {
  ProfileController({ProfileService? service})
    : _service = service ?? ProfileService();

  final ProfileService _service;

  ProfileStatus status = ProfileStatus.idle;
  String? errorMessage;
  UserProfile? profile;

  Future<void> loadProfile() async {
    status = ProfileStatus.loading;
    errorMessage = null;
    notifyListeners();

    try {
      profile = await _service.fetchProfile();
      status = ProfileStatus.loaded;
    } on ProfileException catch (error) {
      status = ProfileStatus.error;
      errorMessage = error.message;
      profile = null;
    } catch (_) {
      status = ProfileStatus.error;
      errorMessage = 'Profil bilgileri yüklenemedi.';
      profile = null;
    }

    notifyListeners();
  }

  Future<void> refresh() {
    return loadProfile();
  }

  Future<void> logout() {
    return _service.logout();
  }
}
