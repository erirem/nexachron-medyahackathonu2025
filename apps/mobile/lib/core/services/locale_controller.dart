import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/locales.dart';

class LocaleController extends ChangeNotifier {
  Locale? _locale;
  bool _initialized = false;

  Locale? get locale => _locale;
  bool get initialized => _initialized;

  static const String _prefsKey = 'preferred_locale';

  Future<void> loadSavedLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_prefsKey);

    if (saved != null && supportedLocaleCodes.contains(saved)) {
      _locale = Locale(saved);
    } else {
      _locale = null;
    }

    _initialized = true;
    notifyListeners();
  }

  Future<void> setLocale(Locale locale) async {
    if (!supportedLocaleCodes.contains(locale.languageCode)) {
      return;
    }

    if (_locale == locale) {
      return;
    }

    _locale = locale;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, locale.languageCode);
  }

  Future<void> clearSavedLocale() async {
    _locale = null;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_prefsKey);
  }
}
