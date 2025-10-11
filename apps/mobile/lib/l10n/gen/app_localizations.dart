import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_bs.dart';
import 'app_localizations_en.dart';
import 'app_localizations_es.dart';
import 'app_localizations_fa.dart';
import 'app_localizations_fr.dart';
import 'app_localizations_id.dart';
import 'app_localizations_mk.dart';
import 'app_localizations_ru.dart';
import 'app_localizations_sq.dart';
import 'app_localizations_tr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'gen/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('bs'),
    Locale('en'),
    Locale('es'),
    Locale('fa'),
    Locale('fr'),
    Locale('id'),
    Locale('mk'),
    Locale('ru'),
    Locale('sq'),
    Locale('tr'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In tr, this message translates to:
  /// **'Nexachron'**
  String get appTitle;

  /// No description provided for @commonLanguage.
  ///
  /// In tr, this message translates to:
  /// **'Dil'**
  String get commonLanguage;

  /// No description provided for @commonRetry.
  ///
  /// In tr, this message translates to:
  /// **'Tekrar dene'**
  String get commonRetry;

  /// No description provided for @landingAuthSheetTitle.
  ///
  /// In tr, this message translates to:
  /// **'Nexachron\'a katıl'**
  String get landingAuthSheetTitle;

  /// No description provided for @landingAuthSheetCreate.
  ///
  /// In tr, this message translates to:
  /// **'Hesap oluştur'**
  String get landingAuthSheetCreate;

  /// No description provided for @landingAuthSheetCreateSubtitle.
  ///
  /// In tr, this message translates to:
  /// **'XP akışına katıl, ilk bonusunu kazan.'**
  String get landingAuthSheetCreateSubtitle;

  /// No description provided for @landingAuthSheetLogin.
  ///
  /// In tr, this message translates to:
  /// **'Giriş yap'**
  String get landingAuthSheetLogin;

  /// No description provided for @landingAuthSheetLoginSubtitle.
  ///
  /// In tr, this message translates to:
  /// **'Kaldığın yerden devam et, streak\'ini koru.'**
  String get landingAuthSheetLoginSubtitle;

  /// No description provided for @landingPrimaryCtaLabel.
  ///
  /// In tr, this message translates to:
  /// **'Hemen başla'**
  String get landingPrimaryCtaLabel;

  /// No description provided for @landingSecondaryCtaLabel.
  ///
  /// In tr, this message translates to:
  /// **'Zaten üyeyim'**
  String get landingSecondaryCtaLabel;

  /// No description provided for @landingHeroBadge.
  ///
  /// In tr, this message translates to:
  /// **'Anadolu Ajansı İçin Özel'**
  String get landingHeroBadge;

  /// No description provided for @landingHeroDescription.
  ///
  /// In tr, this message translates to:
  /// **'Anadolu Ajansı\'nın güvenilir haberlerinden beslenen Nexachron, okuma ritmini XP ile ödüllendirir, quiz\'lerle gündemi pekiştirir ve kart koleksiyonu ile gazetecilik kariyerini parlatır.'**
  String get landingHeroDescription;

  /// No description provided for @landingShowcaseHeading.
  ///
  /// In tr, this message translates to:
  /// **'Nexachron dünyasına dal'**
  String get landingShowcaseHeading;

  /// No description provided for @landingShowcaseDescription.
  ///
  /// In tr, this message translates to:
  /// **'Gamification, haberleri okurken seni motive eder. Kart koleksiyonunu tamamla, XP kazan ve liderlik tablosunda parılda.'**
  String get landingShowcaseDescription;

  /// No description provided for @landingShowcaseLiveBadge.
  ///
  /// In tr, this message translates to:
  /// **'XP AKIŞI'**
  String get landingShowcaseLiveBadge;

  /// No description provided for @landingShowcaseLiveTitle.
  ///
  /// In tr, this message translates to:
  /// **'Canlı ödüller'**
  String get landingShowcaseLiveTitle;

  /// No description provided for @landingShowcaseLiveDescription.
  ///
  /// In tr, this message translates to:
  /// **'Okudukça XP çarpanı artar. Gündemle yarışta avantaj kazan.'**
  String get landingShowcaseLiveDescription;

  /// No description provided for @landingShowcaseDailyBadge.
  ///
  /// In tr, this message translates to:
  /// **'GÜNLÜK GÖREV'**
  String get landingShowcaseDailyBadge;

  /// No description provided for @landingShowcaseDailyTitle.
  ///
  /// In tr, this message translates to:
  /// **'Süreklilik bonusu'**
  String get landingShowcaseDailyTitle;

  /// No description provided for @landingShowcaseDailyDescription.
  ///
  /// In tr, this message translates to:
  /// **'Her gününü tamamla, kart desteni güçlendir ve ekstra XP yakala.'**
  String get landingShowcaseDailyDescription;

  /// No description provided for @landingShowcaseAiBadge.
  ///
  /// In tr, this message translates to:
  /// **'AI ÖNERİLERİ'**
  String get landingShowcaseAiBadge;

  /// No description provided for @landingShowcaseAiTitle.
  ///
  /// In tr, this message translates to:
  /// **'Sezgisel akış'**
  String get landingShowcaseAiTitle;

  /// No description provided for @landingShowcaseAiDescription.
  ///
  /// In tr, this message translates to:
  /// **'Yapay zeka sana merak ettiğin başlıkları öne çıkarır.'**
  String get landingShowcaseAiDescription;

  /// No description provided for @landingShowcaseCommunityBadge.
  ///
  /// In tr, this message translates to:
  /// **'TOPLULUK'**
  String get landingShowcaseCommunityBadge;

  /// No description provided for @landingShowcaseCommunityTitle.
  ///
  /// In tr, this message translates to:
  /// **'Sosyal etkileşim'**
  String get landingShowcaseCommunityTitle;

  /// No description provided for @landingShowcaseCommunityDescription.
  ///
  /// In tr, this message translates to:
  /// **'Yorum yap, paylaş ve topluluk görevleriyle bonus XP kazan.'**
  String get landingShowcaseCommunityDescription;

  /// No description provided for @landingShowcaseRewardsBadge.
  ///
  /// In tr, this message translates to:
  /// **'ÖDÜL MAĞAZASI'**
  String get landingShowcaseRewardsBadge;

  /// No description provided for @landingShowcaseRewardsTitle.
  ///
  /// In tr, this message translates to:
  /// **'Kart pazarı'**
  String get landingShowcaseRewardsTitle;

  /// No description provided for @landingShowcaseRewardsDescription.
  ///
  /// In tr, this message translates to:
  /// **'Kartlarını takas et, desteni güçlendir ve nadir rozetler topla.'**
  String get landingShowcaseRewardsDescription;

  /// No description provided for @loginAppBarTitle.
  ///
  /// In tr, this message translates to:
  /// **'Giriş Yap'**
  String get loginAppBarTitle;

  /// No description provided for @loginTagline.
  ///
  /// In tr, this message translates to:
  /// **'Tek tıkla oyunlaştırılmış haber deneyimine geri dön.'**
  String get loginTagline;

  /// No description provided for @loginPanelDescription.
  ///
  /// In tr, this message translates to:
  /// **'Güvenilir ajans haberlerine eriş, ritmini koru ve liderlik tablosunda yüksel.'**
  String get loginPanelDescription;

  /// No description provided for @loginFieldEmailLabel.
  ///
  /// In tr, this message translates to:
  /// **'E-POSTA'**
  String get loginFieldEmailLabel;

  /// No description provided for @loginFieldEmailPlaceholder.
  ///
  /// In tr, this message translates to:
  /// **'ornek@aa.com.tr'**
  String get loginFieldEmailPlaceholder;

  /// No description provided for @loginFieldPasswordLabel.
  ///
  /// In tr, this message translates to:
  /// **'ŞİFRE'**
  String get loginFieldPasswordLabel;

  /// No description provided for @loginFieldPasswordPlaceholder.
  ///
  /// In tr, this message translates to:
  /// **'••••••••'**
  String get loginFieldPasswordPlaceholder;

  /// No description provided for @loginRememberMe.
  ///
  /// In tr, this message translates to:
  /// **'Beni hatırla'**
  String get loginRememberMe;

  /// No description provided for @loginForgotPassword.
  ///
  /// In tr, this message translates to:
  /// **'Şifremi unuttum?'**
  String get loginForgotPassword;

  /// No description provided for @loginSubmitLoading.
  ///
  /// In tr, this message translates to:
  /// **'Kontrol ediliyor'**
  String get loginSubmitLoading;

  /// No description provided for @loginSubmit.
  ///
  /// In tr, this message translates to:
  /// **'Giriş yap'**
  String get loginSubmit;

  /// No description provided for @loginBadge.
  ///
  /// In tr, this message translates to:
  /// **'Kişiselleştirilmiş haberler ve oyunlar '**
  String get loginBadge;

  /// No description provided for @loginHeading.
  ///
  /// In tr, this message translates to:
  /// **'Nexachron\'a Giriş'**
  String get loginHeading;

  /// No description provided for @loginXpReady.
  ///
  /// In tr, this message translates to:
  /// **'+10 XP hazır'**
  String get loginXpReady;

  /// No description provided for @loginNoAccountPrompt.
  ///
  /// In tr, this message translates to:
  /// **'Hesabın yok mu?'**
  String get loginNoAccountPrompt;

  /// No description provided for @loginRegisterCta.
  ///
  /// In tr, this message translates to:
  /// **'Hemen Kayıt Ol'**
  String get loginRegisterCta;

  /// No description provided for @loginEmailRequired.
  ///
  /// In tr, this message translates to:
  /// **'E-posta zorunlu'**
  String get loginEmailRequired;

  /// No description provided for @loginEmailMinLength.
  ///
  /// In tr, this message translates to:
  /// **'E-posta en az 5 karakter olmalı'**
  String get loginEmailMinLength;

  /// No description provided for @loginEmailInvalid.
  ///
  /// In tr, this message translates to:
  /// **'Geçerli bir e-posta gir'**
  String get loginEmailInvalid;

  /// No description provided for @loginPasswordRequired.
  ///
  /// In tr, this message translates to:
  /// **'Şifre zorunlu'**
  String get loginPasswordRequired;

  /// No description provided for @loginPasswordMinLength.
  ///
  /// In tr, this message translates to:
  /// **'Şifren en az 8 karakter olmalı'**
  String get loginPasswordMinLength;

  /// No description provided for @loginStatusInvalidForm.
  ///
  /// In tr, this message translates to:
  /// **'Formu kontrol et'**
  String get loginStatusInvalidForm;

  /// No description provided for @loginStatusSubmitting.
  ///
  /// In tr, this message translates to:
  /// **'Bilgiler kontrol ediliyor...'**
  String get loginStatusSubmitting;

  /// No description provided for @loginStatusSuccess.
  ///
  /// In tr, this message translates to:
  /// **'Hoş geldin! Profil ekranına yönlendiriliyorsun...'**
  String get loginStatusSuccess;

  /// No description provided for @loginStatusInvalidCredentials.
  ///
  /// In tr, this message translates to:
  /// **'E-posta veya şifre hatalı.'**
  String get loginStatusInvalidCredentials;

  /// No description provided for @loginStatusEmailNotConfirmed.
  ///
  /// In tr, this message translates to:
  /// **'E-posta adresini onaylaman gerekiyor.'**
  String get loginStatusEmailNotConfirmed;

  /// No description provided for @loginStatusGenericError.
  ///
  /// In tr, this message translates to:
  /// **'Giriş sırasında bir hata oluştu.'**
  String get loginStatusGenericError;

  /// No description provided for @loginStatusUnexpected.
  ///
  /// In tr, this message translates to:
  /// **'Beklenmeyen bir hata oluştu. Lütfen tekrar dene.'**
  String get loginStatusUnexpected;

  /// No description provided for @registerAppBarTitle.
  ///
  /// In tr, this message translates to:
  /// **'Kayıt Ol'**
  String get registerAppBarTitle;

  /// No description provided for @registerTagline.
  ///
  /// In tr, this message translates to:
  /// **'Profilini oluştur, XP akışına katıl ve ilk rozetini kazan.'**
  String get registerTagline;

  /// No description provided for @registerHeading.
  ///
  /// In tr, this message translates to:
  /// **'Nexachron\'a kayıt'**
  String get registerHeading;

  /// No description provided for @registerDescription.
  ///
  /// In tr, this message translates to:
  /// **'Sana özel haber rafı oluştur, XP ve kart ödülleriyle liderlik tablosunda yerini al.'**
  String get registerDescription;

  /// No description provided for @registerFieldNameLabel.
  ///
  /// In tr, this message translates to:
  /// **'İSİM'**
  String get registerFieldNameLabel;

  /// No description provided for @registerFieldNamePlaceholder.
  ///
  /// In tr, this message translates to:
  /// **'Ad Soyad'**
  String get registerFieldNamePlaceholder;

  /// No description provided for @registerFieldConfirmationLabel.
  ///
  /// In tr, this message translates to:
  /// **'ŞİFRE TEKRAR'**
  String get registerFieldConfirmationLabel;

  /// No description provided for @registerTerms.
  ///
  /// In tr, this message translates to:
  /// **'Kullanım koşullarını ve gizlilik politikasını okudum, onaylıyorum.'**
  String get registerTerms;

  /// No description provided for @registerSubmitLoading.
  ///
  /// In tr, this message translates to:
  /// **'Gönderiliyor'**
  String get registerSubmitLoading;

  /// No description provided for @registerSubmit.
  ///
  /// In tr, this message translates to:
  /// **'Kayıt Ol'**
  String get registerSubmit;

  /// No description provided for @registerExistingPrompt.
  ///
  /// In tr, this message translates to:
  /// **'Zaten hesabın var mı?'**
  String get registerExistingPrompt;

  /// No description provided for @registerLoginCta.
  ///
  /// In tr, this message translates to:
  /// **'Giriş yap'**
  String get registerLoginCta;

  /// No description provided for @registerBadge.
  ///
  /// In tr, this message translates to:
  /// **'Yeni nesil haber üyeliği'**
  String get registerBadge;

  /// No description provided for @registerNameRequired.
  ///
  /// In tr, this message translates to:
  /// **'İsim zorunlu'**
  String get registerNameRequired;

  /// No description provided for @registerNameMinLength.
  ///
  /// In tr, this message translates to:
  /// **'İsmin en az 3 karakter olmalı'**
  String get registerNameMinLength;

  /// No description provided for @registerConfirmationRequired.
  ///
  /// In tr, this message translates to:
  /// **'Şifre tekrarını gir'**
  String get registerConfirmationRequired;

  /// No description provided for @registerConfirmationMismatch.
  ///
  /// In tr, this message translates to:
  /// **'Şifreler eşleşmiyor'**
  String get registerConfirmationMismatch;

  /// No description provided for @registerTermsAgreement.
  ///
  /// In tr, this message translates to:
  /// **'Koşulları onaylaman gerekiyor'**
  String get registerTermsAgreement;

  /// No description provided for @registerStatusInvalidForm.
  ///
  /// In tr, this message translates to:
  /// **'Formu kontrol et'**
  String get registerStatusInvalidForm;

  /// No description provided for @registerStatusSubmitting.
  ///
  /// In tr, this message translates to:
  /// **'Bilgiler doğrulanıyor...'**
  String get registerStatusSubmitting;

  /// No description provided for @registerStatusSuccessEmail.
  ///
  /// In tr, this message translates to:
  /// **'Kayıt tamam! E-posta kutunu kontrol ederek üyeliğini doğrula.'**
  String get registerStatusSuccessEmail;

  /// No description provided for @registerStatusSuccessRedirect.
  ///
  /// In tr, this message translates to:
  /// **'Hoş geldin! Profil ekranına yönlendiriliyorsun...'**
  String get registerStatusSuccessRedirect;

  /// No description provided for @registerStatusEmailExists.
  ///
  /// In tr, this message translates to:
  /// **'Bu e-posta ile kayıtlı bir hesap mevcut.'**
  String get registerStatusEmailExists;

  /// No description provided for @registerStatusWeakPassword.
  ///
  /// In tr, this message translates to:
  /// **'Şifren en az 6 karakter olmalı.'**
  String get registerStatusWeakPassword;

  /// No description provided for @registerStatusGenericError.
  ///
  /// In tr, this message translates to:
  /// **'Kayıt işlemi sırasında bir hata oluştu.'**
  String get registerStatusGenericError;

  /// No description provided for @registerStatusUnexpected.
  ///
  /// In tr, this message translates to:
  /// **'Kayıt sırasında beklenmeyen bir hata oluştu.'**
  String get registerStatusUnexpected;

  /// No description provided for @bookmarksTitle.
  ///
  /// In tr, this message translates to:
  /// **'Kaydedilenler'**
  String get bookmarksTitle;

  /// No description provided for @profileAppBarTitle.
  ///
  /// In tr, this message translates to:
  /// **'Profil'**
  String get profileAppBarTitle;

  /// No description provided for @profileLogoutTooltip.
  ///
  /// In tr, this message translates to:
  /// **'Çıkış yap'**
  String get profileLogoutTooltip;

  /// No description provided for @profileErrorGeneric.
  ///
  /// In tr, this message translates to:
  /// **'Profil bilgileri yüklenemedi.'**
  String get profileErrorGeneric;

  /// No description provided for @profileErrorNoSession.
  ///
  /// In tr, this message translates to:
  /// **'Aktif bir Supabase oturumu bulunamadı.'**
  String get profileErrorNoSession;

  /// No description provided for @profileErrorSessionExpired.
  ///
  /// In tr, this message translates to:
  /// **'Oturum süresi doldu. Lütfen yeniden giriş yap.'**
  String get profileErrorSessionExpired;

  /// No description provided for @profileErrorInvalidResponse.
  ///
  /// In tr, this message translates to:
  /// **'Profil yanıtı beklenen formatta değil.'**
  String get profileErrorInvalidResponse;

  /// No description provided for @profileErrorMissing.
  ///
  /// In tr, this message translates to:
  /// **'Profil bulunamadı.'**
  String get profileErrorMissing;

  /// No description provided for @profileFallbackUsername.
  ///
  /// In tr, this message translates to:
  /// **'Kullanıcı'**
  String get profileFallbackUsername;

  /// No description provided for @profileFallbackEmail.
  ///
  /// In tr, this message translates to:
  /// **'E-posta tanımlı değil'**
  String get profileFallbackEmail;

  /// No description provided for @profileFallbackCity.
  ///
  /// In tr, this message translates to:
  /// **'Şehir seçilmedi'**
  String get profileFallbackCity;

  /// No description provided for @profileStatsTitle.
  ///
  /// In tr, this message translates to:
  /// **'Kullanıcı İstatistikleri'**
  String get profileStatsTitle;

  /// No description provided for @profileStatsXp.
  ///
  /// In tr, this message translates to:
  /// **'XP'**
  String get profileStatsXp;

  /// No description provided for @profileStatsStreak.
  ///
  /// In tr, this message translates to:
  /// **'Streak'**
  String get profileStatsStreak;

  /// No description provided for @profileStatsRank.
  ///
  /// In tr, this message translates to:
  /// **'Rank'**
  String get profileStatsRank;

  /// No description provided for @profileLastSeenNever.
  ///
  /// In tr, this message translates to:
  /// **'Son giriş kaydı bulunmuyor'**
  String get profileLastSeenNever;

  /// No description provided for @profileLastSeen.
  ///
  /// In tr, this message translates to:
  /// **'Son giriş: {date} • {time}'**
  String profileLastSeen(Object date, Object time);

  /// No description provided for @gamificationRankNewMember.
  ///
  /// In tr, this message translates to:
  /// **'Yeni Katılımcı'**
  String get gamificationRankNewMember;

  /// No description provided for @gamificationRankActiveReader.
  ///
  /// In tr, this message translates to:
  /// **'Aktif Okur'**
  String get gamificationRankActiveReader;

  /// No description provided for @gamificationRankKnowledgeSharer.
  ///
  /// In tr, this message translates to:
  /// **'Bilgi Paylaşımcısı'**
  String get gamificationRankKnowledgeSharer;

  /// No description provided for @gamificationRankExpertCommenter.
  ///
  /// In tr, this message translates to:
  /// **'Uzman Yorumcu'**
  String get gamificationRankExpertCommenter;

  /// No description provided for @gamificationRankCommunityLeader.
  ///
  /// In tr, this message translates to:
  /// **'Topluluk Lideri'**
  String get gamificationRankCommunityLeader;

  /// No description provided for @gamificationLeagueBronze.
  ///
  /// In tr, this message translates to:
  /// **'Bronz'**
  String get gamificationLeagueBronze;

  /// No description provided for @gamificationLeagueSilver.
  ///
  /// In tr, this message translates to:
  /// **'Gümüş'**
  String get gamificationLeagueSilver;

  /// No description provided for @gamificationLeagueGold.
  ///
  /// In tr, this message translates to:
  /// **'Altın'**
  String get gamificationLeagueGold;

  /// No description provided for @gamificationLeaguePlatinum.
  ///
  /// In tr, this message translates to:
  /// **'Platin'**
  String get gamificationLeaguePlatinum;

  /// No description provided for @gamificationLeagueDiamond.
  ///
  /// In tr, this message translates to:
  /// **'Elmas'**
  String get gamificationLeagueDiamond;

  /// No description provided for @gamificationXPProgress.
  ///
  /// In tr, this message translates to:
  /// **'XP İlerlemesi'**
  String get gamificationXPProgress;

  /// No description provided for @gamificationStreak.
  ///
  /// In tr, this message translates to:
  /// **'Streak'**
  String get gamificationStreak;

  /// No description provided for @gamificationSeasonXP.
  ///
  /// In tr, this message translates to:
  /// **'Sezon XP'**
  String get gamificationSeasonXP;

  /// No description provided for @gamificationWeekly.
  ///
  /// In tr, this message translates to:
  /// **'Haftalık'**
  String get gamificationWeekly;

  /// No description provided for @gamificationMonthly.
  ///
  /// In tr, this message translates to:
  /// **'Aylık'**
  String get gamificationMonthly;

  /// No description provided for @gamificationFollowing.
  ///
  /// In tr, this message translates to:
  /// **'Takip'**
  String get gamificationFollowing;

  /// No description provided for @gamificationBadges.
  ///
  /// In tr, this message translates to:
  /// **'Rozetler'**
  String get gamificationBadges;

  /// No description provided for @gamificationStreakProtection.
  ///
  /// In tr, this message translates to:
  /// **'Streak Koruması'**
  String get gamificationStreakProtection;

  /// No description provided for @gamificationDays.
  ///
  /// In tr, this message translates to:
  /// **'gün'**
  String get gamificationDays;

  /// No description provided for @gamificationPoints.
  ///
  /// In tr, this message translates to:
  /// **'puan'**
  String get gamificationPoints;

  /// No description provided for @gamificationItems.
  ///
  /// In tr, this message translates to:
  /// **'adet'**
  String get gamificationItems;

  /// No description provided for @landingHeroTitle.
  ///
  /// In tr, this message translates to:
  /// **'Nexachron ile habere giriş yap, haberi <highlight>oyunlaştırılmış</highlight> bir deneyimle yaşa.'**
  String get landingHeroTitle;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>[
    'bs',
    'en',
    'es',
    'fa',
    'fr',
    'id',
    'mk',
    'ru',
    'sq',
    'tr',
  ].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'bs':
      return AppLocalizationsBs();
    case 'en':
      return AppLocalizationsEn();
    case 'es':
      return AppLocalizationsEs();
    case 'fa':
      return AppLocalizationsFa();
    case 'fr':
      return AppLocalizationsFr();
    case 'id':
      return AppLocalizationsId();
    case 'mk':
      return AppLocalizationsMk();
    case 'ru':
      return AppLocalizationsRu();
    case 'sq':
      return AppLocalizationsSq();
    case 'tr':
      return AppLocalizationsTr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
