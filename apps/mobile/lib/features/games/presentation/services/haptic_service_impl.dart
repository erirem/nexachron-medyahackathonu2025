import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../domain/services/game_api_service.dart';

class HapticServiceImpl implements HapticService {
  final SharedPreferences _prefs;
  
  HapticServiceImpl({required SharedPreferences prefs}) : _prefs = prefs;

  @override
  Future<void> lightImpact() async {
    if (await isHapticEnabled()) {
      HapticFeedback.lightImpact();
    }
  }

  @override
  Future<void> mediumImpact() async {
    if (await isHapticEnabled()) {
      HapticFeedback.mediumImpact();
    }
  }

  @override
  Future<void> heavyImpact() async {
    if (await isHapticEnabled()) {
      HapticFeedback.heavyImpact();
    }
  }

  @override
  Future<void> selectionClick() async {
    if (await isHapticEnabled()) {
      HapticFeedback.selectionClick();
    }
  }

  @override
  Future<void> successFeedback() async {
    if (await isHapticEnabled()) {
      HapticFeedback.lightImpact();
      await Future.delayed(const Duration(milliseconds: 100));
      HapticFeedback.lightImpact();
    }
  }

  @override
  Future<void> warningFeedback() async {
    if (await isHapticEnabled()) {
      HapticFeedback.mediumImpact();
    }
  }

  @override
  Future<void> errorFeedback() async {
    if (await isHapticEnabled()) {
      HapticFeedback.heavyImpact();
    }
  }

  @override
  Future<void> correctAnswerFeedback() async {
    await successFeedback();
  }

  @override
  Future<void> wrongAnswerFeedback() async {
    await errorFeedback();
  }

  @override
  Future<void> gameCompleteFeedback() async {
    if (await isHapticEnabled()) {
      // Triple light impact for game completion
      HapticFeedback.lightImpact();
      await Future.delayed(const Duration(milliseconds: 100));
      HapticFeedback.lightImpact();
      await Future.delayed(const Duration(milliseconds: 100));
      HapticFeedback.lightImpact();
    }
  }

  @override
  Future<void> badgeEarnedFeedback() async {
    if (await isHapticEnabled()) {
      // Medium impact followed by light impacts
      HapticFeedback.mediumImpact();
      await Future.delayed(const Duration(milliseconds: 150));
      HapticFeedback.lightImpact();
      await Future.delayed(const Duration(milliseconds: 100));
      HapticFeedback.lightImpact();
    }
  }

  @override
  Future<void> levelUpFeedback() async {
    if (await isHapticEnabled()) {
      // Ascending impact pattern
      HapticFeedback.lightImpact();
      await Future.delayed(const Duration(milliseconds: 100));
      HapticFeedback.mediumImpact();
      await Future.delayed(const Duration(milliseconds: 100));
      HapticFeedback.heavyImpact();
    }
  }

  @override
  Future<bool> isHapticEnabled() async {
    return _prefs.getBool('haptic_enabled') ?? true;
  }

  @override
  Future<void> setHapticEnabled(bool enabled) async {
    await _prefs.setBool('haptic_enabled', enabled);
  }
}
