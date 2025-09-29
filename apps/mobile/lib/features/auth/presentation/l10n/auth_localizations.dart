import 'package:mobile/l10n/gen/app_localizations.dart';

import '../../domain/services/login_validator.dart';
import '../../domain/services/profile_service.dart';
import '../../domain/services/register_validator.dart';
import '../controllers/login_controller.dart';
import '../controllers/register_controller.dart';

extension AuthLocalization on AppLocalizations {
  String loginEmailValidation(LoginEmailError error) {
    switch (error) {
      case LoginEmailError.requiredField:
        return loginEmailRequired;
      case LoginEmailError.minLength:
        return loginEmailMinLength;
      case LoginEmailError.invalidFormat:
        return loginEmailInvalid;
    }
  }

  String loginPasswordValidation(LoginPasswordError error) {
    switch (error) {
      case LoginPasswordError.requiredField:
        return loginPasswordRequired;
      case LoginPasswordError.minLength:
        return loginPasswordMinLength;
    }
  }

  String loginStatusMessage(LoginMessageCode code) {
    switch (code) {
      case LoginMessageCode.invalidForm:
        return loginStatusInvalidForm;
      case LoginMessageCode.submitting:
        return loginStatusSubmitting;
      case LoginMessageCode.successRedirect:
        return loginStatusSuccess;
      case LoginMessageCode.invalidCredentials:
        return loginStatusInvalidCredentials;
      case LoginMessageCode.emailNotConfirmed:
        return loginStatusEmailNotConfirmed;
      case LoginMessageCode.genericError:
        return loginStatusGenericError;
      case LoginMessageCode.unexpectedError:
        return loginStatusUnexpected;
    }
  }

  String registerNameValidation(RegisterNameError error) {
    switch (error) {
      case RegisterNameError.requiredField:
        return registerNameRequired;
      case RegisterNameError.minLength:
        return registerNameMinLength;
    }
  }

  String registerConfirmationValidation(RegisterConfirmationError error) {
    switch (error) {
      case RegisterConfirmationError.requiredField:
        return registerConfirmationRequired;
      case RegisterConfirmationError.mismatch:
        return registerConfirmationMismatch;
    }
  }

  String registerTermsValidation(RegisterTermsError error) {
    switch (error) {
      case RegisterTermsError.notAccepted:
        return registerTermsAgreement;
    }
  }

  String registerStatusMessage(RegisterMessageCode code) {
    switch (code) {
      case RegisterMessageCode.invalidForm:
        return registerStatusInvalidForm;
      case RegisterMessageCode.submitting:
        return registerStatusSubmitting;
      case RegisterMessageCode.successEmailVerification:
        return registerStatusSuccessEmail;
      case RegisterMessageCode.successRedirect:
        return registerStatusSuccessRedirect;
      case RegisterMessageCode.emailExists:
        return registerStatusEmailExists;
      case RegisterMessageCode.weakPassword:
        return registerStatusWeakPassword;
      case RegisterMessageCode.genericError:
        return registerStatusGenericError;
      case RegisterMessageCode.unexpectedError:
        return registerStatusUnexpected;
    }
  }

  String profileError(ProfileErrorCode? code) {
    return switch (code) {
      null => profileErrorGeneric,
      ProfileErrorCode.noSession => profileErrorNoSession,
      ProfileErrorCode.unauthorized => profileErrorSessionExpired,
      ProfileErrorCode.apiError => profileErrorGeneric,
      ProfileErrorCode.invalidResponse => profileErrorInvalidResponse,
      ProfileErrorCode.unknown => profileErrorGeneric,
    };
  }
}
