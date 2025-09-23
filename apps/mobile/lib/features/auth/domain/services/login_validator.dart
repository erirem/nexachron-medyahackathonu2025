class LoginValidator {
  const LoginValidator();

  String? validateEmail(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return 'E-posta zorunlu';
    }
    if (trimmed.length < 5) {
      return 'E-posta en az 5 karakter olmalı';
    }
    final regex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (!regex.hasMatch(trimmed)) {
      return 'Geçerli bir e-posta gir';
    }
    return null;
  }

  String? validatePassword(String value) {
    if (value.isEmpty) {
      return 'Şifre zorunlu';
    }
    if (value.trim().length < 8) {
      return 'Şifren en az 8 karakter olmalı';
    }
    return null;
  }
}
