import 'login_validator.dart';

class RegisterValidator extends LoginValidator {
  const RegisterValidator();

  String? validateDisplayName(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return 'İsim zorunlu';
    }
    if (trimmed.length < 3) {
      return 'İsmin en az 3 karakter olmalı';
    }
    return null;
  }

  String? validatePasswordConfirmation(String password, String confirmation) {
    if (confirmation.isEmpty) {
      return 'Şifre tekrarını gir';
    }
    if (password != confirmation) {
      return 'Şifreler eşleşmiyor';
    }
    return null;
  }

  String? validateTerms(bool accepted) {
    if (!accepted) {
      return 'Koşulları onaylaman gerekiyor';
    }
    return null;
  }
}
