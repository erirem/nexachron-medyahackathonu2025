import 'dart:async';

import 'package:flutter/foundation.dart';

import '../../domain/services/login_validator.dart';
import 'login_status.dart';

class LoginController extends ChangeNotifier {
  LoginController({LoginValidator? validator})
    : _validator = validator ?? const LoginValidator();

  final LoginValidator _validator;

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

  Future<void> submit() async {
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

    await Future<void>.delayed(const Duration(milliseconds: 650));

    status = LoginStatus.success;
    statusMessage = 'Demo: Giriş için Supabase bağlantısı bekleniyor';
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
