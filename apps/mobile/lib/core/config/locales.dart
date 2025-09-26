import 'package:flutter/material.dart';

const List<String> supportedLocaleCodes = [
  'tr',
  'en',
  'ru',
  'fr',
  'es',
  'fa',
  'id',
  'bs',
  'sq',
  'mk',
];

const String defaultLocaleCode = 'tr';

const Map<String, String> localeLabels = {
  'tr': 'Türkçe',
  'en': 'English',
  'ru': 'Русский',
  'fr': 'Français',
  'es': 'Español',
  'fa': 'فارسی',
  'id': 'Bahasa Indonesia',
  'bs': 'Bosanski',
  'sq': 'Shqip',
  'mk': 'Македонски',
};

List<Locale> buildSupportedLocales() {
  return supportedLocaleCodes
      .map((code) => Locale(code))
      .toList(growable: false);
}

Locale resolveLocale(String code) {
  if (supportedLocaleCodes.contains(code)) {
    return Locale(code);
  }
  return Locale(defaultLocaleCode);
}
