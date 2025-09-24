import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../domain/services/register_validator.dart';
import '../../domain/services/supabase_auth_gateway.dart';
import 'login_status.dart';

const Map<String, String> _supabaseRegisterErrorMap = {
  'User already registered': 'Bu e-posta ile kayıtlı bir hesap mevcut.',
  'Password should be at least 6 characters': 'Şifren en az 6 karakter olmalı.',
};

String _mapSupabaseRegisterError(String message) {
  return _supabaseRegisterErrorMap[message] ??
      'Kayıt işlemi sırasında bir hata oluştu.';
}

class RegisterController extends ChangeNotifier {
  RegisterController({
    RegisterValidator? validator,
    SupabaseAuthGateway? authGateway,
  }) : _validator = validator ?? const RegisterValidator(),
       _authGateway = authGateway ?? SupabaseAuthGateway();

  final RegisterValidator _validator;
  final SupabaseAuthGateway _authGateway;

  String _displayName = '';
  String _email = '';
  String _password = '';
  String _confirmation = '';
  bool acceptTerms = false;

  String? nameError;
  String? emailError;
  String? passwordError;
  String? confirmationError;
  String? termsError;

  LoginStatus status = LoginStatus.idle;
  String? statusMessage;
  bool sessionCreated = false;

  void updateDisplayName(String value) {
    _displayName = value;
    _clearStatusIfNeeded();
    nameError = null;
    notifyListeners();
  }

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

  void updateConfirmation(String value) {
    _confirmation = value;
    _clearStatusIfNeeded();
    confirmationError = null;
    notifyListeners();
  }

  void toggleAcceptTerms(bool value) {
    acceptTerms = value;
    _clearStatusIfNeeded();
    termsError = null;
    notifyListeners();
  }

  Future<void> submit({String? fcmToken}) async {
    if (status == LoginStatus.submitting) {
      return;
    }

    _validateFields();
    if (nameError != null ||
        emailError != null ||
        passwordError != null ||
        confirmationError != null ||
        termsError != null) {
      status = LoginStatus.error;
      statusMessage = 'Formu kontrol et';
      notifyListeners();
      return;
    }

    status = LoginStatus.submitting;
    statusMessage = 'Bilgiler doğrulanıyor...';
    sessionCreated = false;
    notifyListeners();

    try {
      final response = await _authGateway.signUp(
        email: _email,
        password: _password,
        data: {'username': _displayName},
        emailRedirectTo: null,
      );

      // FCM entegrasyonu devre dışı (ileride yeniden eklenecek)

      if (response.session == null) {
        status = LoginStatus.success;
        statusMessage =
            'Kayıt tamam! E-posta kutunu kontrol ederek üyeliğini doğrula.';
        sessionCreated = false;
      } else {
        status = LoginStatus.success;
        statusMessage = 'Hoş geldin! Profil ekranına yönlendiriliyorsun...';
        sessionCreated = true;
      }
    } on AuthException catch (error) {
      status = LoginStatus.error;
      statusMessage = _mapSupabaseRegisterError(error.message);
      sessionCreated = false;
    } catch (_) {
      status = LoginStatus.error;
      statusMessage = 'Kayıt sırasında beklenmeyen bir hata oluştu.';
      sessionCreated = false;
    }

    notifyListeners();
  }

  void _validateFields() {
    nameError = _validator.validateDisplayName(_displayName);
    emailError = _validator.validateEmail(_email);
    passwordError = _validator.validatePassword(_password);
    confirmationError = _validator.validatePasswordConfirmation(
      _password,
      _confirmation,
    );
    termsError = _validator.validateTerms(acceptTerms);
  }

  void _clearStatusIfNeeded() {
    if (status == LoginStatus.error || status == LoginStatus.success) {
      status = LoginStatus.idle;
      statusMessage = null;
    }
  }
}
