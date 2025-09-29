import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../domain/services/login_validator.dart';
import '../../domain/services/supabase_auth_gateway.dart';
import 'login_status.dart';

enum LoginMessageCode {
  invalidForm,
  submitting,
  successRedirect,
  invalidCredentials,
  emailNotConfirmed,
  genericError,
  unexpectedError,
}

LoginMessageCode _mapSupabaseLoginError(String message) {
  switch (message) {
    case 'Invalid login credentials':
      return LoginMessageCode.invalidCredentials;
    case 'Email not confirmed':
      return LoginMessageCode.emailNotConfirmed;
    default:
      return LoginMessageCode.genericError;
  }
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

  LoginEmailError? emailError;
  LoginPasswordError? passwordError;

  LoginStatus status = LoginStatus.idle;
  LoginMessageCode? messageCode;

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
      messageCode = LoginMessageCode.invalidForm;
      notifyListeners();
      return;
    }

    status = LoginStatus.submitting;
    messageCode = LoginMessageCode.submitting;
    notifyListeners();

    try {
      await _authGateway.signInWithPassword(email: _email, password: _password);

      // FCM entegrasyonu devre dışı (ileride yeniden eklenecek)

      status = LoginStatus.success;
      messageCode = LoginMessageCode.successRedirect;
    } on AuthException catch (error) {
      status = LoginStatus.error;
      messageCode = _mapSupabaseLoginError(error.message);
    } catch (_) {
      status = LoginStatus.error;
      messageCode = LoginMessageCode.unexpectedError;
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
      messageCode = null;
    }
  }
}
