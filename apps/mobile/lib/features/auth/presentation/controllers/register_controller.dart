import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../domain/services/login_validator.dart';
import '../../domain/services/register_validator.dart';
import '../../domain/services/supabase_auth_gateway.dart';
import 'login_status.dart';

enum RegisterMessageCode {
  invalidForm,
  submitting,
  successEmailVerification,
  successRedirect,
  emailExists,
  weakPassword,
  genericError,
  unexpectedError,
}

RegisterMessageCode _mapSupabaseRegisterError(String message) {
  switch (message) {
    case 'User already registered':
      return RegisterMessageCode.emailExists;
    case 'Password should be at least 6 characters':
      return RegisterMessageCode.weakPassword;
    default:
      return RegisterMessageCode.genericError;
  }
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

  RegisterNameError? nameError;
  LoginEmailError? emailError;
  LoginPasswordError? passwordError;
  RegisterConfirmationError? confirmationError;
  RegisterTermsError? termsError;

  LoginStatus status = LoginStatus.idle;
  RegisterMessageCode? messageCode;
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
      messageCode = RegisterMessageCode.invalidForm;
      notifyListeners();
      return;
    }

    status = LoginStatus.submitting;
    messageCode = RegisterMessageCode.submitting;
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
        messageCode = RegisterMessageCode.successEmailVerification;
        sessionCreated = false;
      } else {
        status = LoginStatus.success;
        messageCode = RegisterMessageCode.successRedirect;
        sessionCreated = true;
      }
    } on AuthException catch (error) {
      status = LoginStatus.error;
      messageCode = _mapSupabaseRegisterError(error.message);
      sessionCreated = false;
    } catch (_) {
      status = LoginStatus.error;
      messageCode = RegisterMessageCode.unexpectedError;
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
      messageCode = null;
    }
  }
}
