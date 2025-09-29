import 'login_validator.dart';

enum RegisterNameError { requiredField, minLength }

enum RegisterConfirmationError { requiredField, mismatch }

enum RegisterTermsError { notAccepted }

class RegisterValidator extends LoginValidator {
  const RegisterValidator();

  RegisterNameError? validateDisplayName(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) {
      return RegisterNameError.requiredField;
    }
    if (trimmed.length < 3) {
      return RegisterNameError.minLength;
    }
    return null;
  }

  RegisterConfirmationError? validatePasswordConfirmation(
    String password,
    String confirmation,
  ) {
    if (confirmation.isEmpty) {
      return RegisterConfirmationError.requiredField;
    }
    if (password != confirmation) {
      return RegisterConfirmationError.mismatch;
    }
    return null;
  }

  RegisterTermsError? validateTerms(bool accepted) {
    if (!accepted) {
      return RegisterTermsError.notAccepted;
    }
    return null;
  }
}
