import 'package:flutter/foundation.dart';

import '../../domain/entities/user_preferences.dart';
import '../../domain/services/preferences_api_service.dart';

/// Onboarding state
class OnboardingState {
  const OnboardingState({
    required this.currentStep,
    required this.selectedCategories,
    required this.selectedMoods,
    required this.isLoading,
    this.error,
  });

  final int currentStep;
  final List<String> selectedCategories;
  final List<String> selectedMoods;
  final bool isLoading;
  final String? error;

  bool get canProceedFromStep1 => selectedCategories.length >= 3;
  bool get canProceedFromStep2 => selectedMoods.isNotEmpty;

  OnboardingState copyWith({
    int? currentStep,
    List<String>? selectedCategories,
    List<String>? selectedMoods,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) {
    return OnboardingState(
      currentStep: currentStep ?? this.currentStep,
      selectedCategories: selectedCategories ?? this.selectedCategories,
      selectedMoods: selectedMoods ?? this.selectedMoods,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

/// Onboarding controller - Web'deki PreferencesOnboarding component'ine benzer
class OnboardingController extends ChangeNotifier {
  OnboardingController({PreferencesApiService? preferencesService})
    : _preferencesService = preferencesService ?? PreferencesApiService(),
      _state = const OnboardingState(
        currentStep: 1,
        selectedCategories: [],
        selectedMoods: [],
        isLoading: false,
      );

  final PreferencesApiService _preferencesService;
  OnboardingState _state;

  OnboardingState get state => _state;

  void toggleCategory(String categoryId) {
    final categories = List<String>.from(_state.selectedCategories);
    if (categories.contains(categoryId)) {
      categories.remove(categoryId);
    } else {
      categories.add(categoryId);
    }
    _state = _state.copyWith(selectedCategories: categories, clearError: true);
    notifyListeners();
  }

  void toggleMood(String moodId) {
    final moods = List<String>.from(_state.selectedMoods);
    if (moods.contains(moodId)) {
      moods.remove(moodId);
    } else {
      moods.add(moodId);
    }
    _state = _state.copyWith(selectedMoods: moods, clearError: true);
    notifyListeners();
  }

  void nextStep() {
    if (_state.currentStep < 3) {
      _state = _state.copyWith(currentStep: _state.currentStep + 1);
      notifyListeners();
    }
  }

  void previousStep() {
    if (_state.currentStep > 1) {
      _state = _state.copyWith(currentStep: _state.currentStep - 1);
      notifyListeners();
    }
  }

  Future<bool> completeOnboarding(
    String language, {
    bool skipValidation = false,
  }) async {
    // Skip butonuna basıldığında validasyon atlanır
    if (!skipValidation && !_state.canProceedFromStep2) {
      return false;
    }

    _state = _state.copyWith(isLoading: true, clearError: true);
    notifyListeners();

    try {
      // Eğer hiç seçim yapılmamışsa varsayılan değerler kullan
      final categories = _state.selectedCategories.isNotEmpty
          ? _state.selectedCategories
          : ['teknoloji', 'dunya', 'turkiye']; // Varsayılan kategoriler

      final moods = _state.selectedMoods.isNotEmpty
          ? _state.selectedMoods
          : ['nötr']; // Varsayılan okuma tarzı

      final preferences = UserPreferences(
        personalizationOptIn: true,
        categories: CategoryPreferences(preferred: categories, blocked: []),
        targetMoods: MoodPreferences(prefer: moods, avoid: []),
        language: language,
      );

      await _preferencesService.savePreferences(preferences);

      _state = _state.copyWith(isLoading: false);
      notifyListeners();
      return true;
    } catch (error) {
      _state = _state.copyWith(
        isLoading: false,
        error: 'Tercihler kaydedilemedi. Lütfen tekrar deneyin.',
      );
      notifyListeners();
      return false;
    }
  }
}
