import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../domain/services/login_validator.dart';
import '../../domain/services/supabase_auth_gateway.dart';
import 'login_status.dart';

const Map<String, String> _supabaseLoginErrorMap = {
  'Invalid login credentials': 'E-posta veya şifre hatalı.',
  'Email not confirmed': 'E-posta adresini onaylaman gerekiyor.',
};

String _mapSupabaseLoginError(String message) {
  return _supabaseLoginErrorMap[message] ?? 'Giriş sırasında bir hata oluştu.';
}

class LoginController extends ChangeNotifier {
  LoginController({LoginValidator? validator, SupabaseAuthGateway? authGateway})
    : _validator = validator ?? const LoginValidator(),
      _authGateway = authGateway ?? SupabaseAuthGateway();

  final LoginValidator _validator;
  final SupabaseAuthGateway _authGateway;

  String _email = '';
  String _password = '';
  bool rememberMe = true;

  String? emailError;
  String? passwordError;

  LoginStatus status = LoginStatus.idle;
  String? statusMessage;

  void updateEmail(String value) {
    _email = value;
    _clearStatusIfNeeded();
    emailError = null;
    notifyListeners();
  }

  void updatePassword(String value) {
    _password = value;
    _clearStatusIfNeeded();
    passwordError = null;
    notifyListeners();
  }

  void toggleRememberMe(bool value) {
    rememberMe = value;
    notifyListeners();
  }

  Future<void> submit({String? fcmToken}) async {
    if (status == LoginStatus.submitting) {
      return;
    }

    _validateFields();
    if (emailError != null || passwordError != null) {
      status = LoginStatus.error;
      statusMessage = 'Formu kontrol et';
      notifyListeners();
      return;
    }

    status = LoginStatus.submitting;
    statusMessage = 'Bilgiler kontrol ediliyor...';
    notifyListeners();

    try {
      await _authGateway.signInWithPassword(email: _email, password: _password);

      // FCM entegrasyonu devre dışı (ileride yeniden eklenecek)

      status = LoginStatus.success;
      statusMessage = 'Hoş geldin! Profil ekranına yönlendiriliyorsun...';
    } on AuthException catch (error) {
      status = LoginStatus.error;
      statusMessage = _mapSupabaseLoginError(error.message);
    } catch (_) {
      status = LoginStatus.error;
      statusMessage = 'Beklenmeyen bir hata oluştu. Lütfen tekrar dene.';
    }

    notifyListeners();
  }

  void _validateFields() {
    emailError = _validator.validateEmail(_email);
    passwordError = _validator.validatePassword(_password);
  }

  void _clearStatusIfNeeded() {
    if (status == LoginStatus.error || status == LoginStatus.success) {
      status = LoginStatus.idle;
      statusMessage = null;
    }
  }
}
