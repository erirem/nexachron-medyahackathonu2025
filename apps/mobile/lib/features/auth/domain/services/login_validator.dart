enum LoginEmailError { requiredField, minLength, invalidFormat }

enum LoginPasswordError { requiredField, minLength }

class LoginValidator {
  const LoginValidator();

  LoginEmailError? validateEmail(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return LoginEmailError.requiredField;
    }
    if (trimmed.length < 5) {
      return LoginEmailError.minLength;
    }
    final regex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (!regex.hasMatch(trimmed)) {
      return LoginEmailError.invalidFormat;
    }
    return null;
  }

  LoginPasswordError? validatePassword(String value) {
    if (value.isEmpty) {
      return LoginPasswordError.requiredField;
    }
    if (value.trim().length < 8) {
      return LoginPasswordError.minLength;
    }
    return null;
  }
}
