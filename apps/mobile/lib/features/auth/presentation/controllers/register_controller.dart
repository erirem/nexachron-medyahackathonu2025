import 'dart:async';

import 'package:flutter/foundation.dart';

import '../../domain/services/register_validator.dart';
import 'login_status.dart';

class RegisterController extends ChangeNotifier {
  RegisterController({RegisterValidator? validator})
    : _validator = validator ?? const RegisterValidator();

  final RegisterValidator _validator;

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

  Future<void> submit() async {
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
    notifyListeners();

    await Future<void>.delayed(const Duration(milliseconds: 750));

    status = LoginStatus.success;
    statusMessage = 'Demo: Kayıt işlemi için Supabase bağlantısı bekleniyor';
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
