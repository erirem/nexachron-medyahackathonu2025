/// Kullanıcı tercihlerini temsil eden entity sınıfları
/// Web API ile uyumlu model yapısı

class CategoryPreferences {
  const CategoryPreferences({required this.preferred, required this.blocked});

  final List<String> preferred;
  final List<String> blocked;

  Map<String, dynamic> toJson() {
    return {'preferred': preferred, 'blocked': blocked};
  }

  factory CategoryPreferences.fromJson(Map<String, dynamic> json) {
    return CategoryPreferences(
      preferred: List<String>.from(json['preferred'] as List? ?? []),
      blocked: List<String>.from(json['blocked'] as List? ?? []),
    );
  }

  CategoryPreferences copyWith({
    List<String>? preferred,
    List<String>? blocked,
  }) {
    return CategoryPreferences(
      preferred: preferred ?? this.preferred,
      blocked: blocked ?? this.blocked,
    );
  }
}

class MoodPreferences {
  const MoodPreferences({required this.prefer, required this.avoid});

  final List<String> prefer;
  final List<String> avoid;

  Map<String, dynamic> toJson() {
    return {'prefer': prefer, 'avoid': avoid};
  }

  factory MoodPreferences.fromJson(Map<String, dynamic> json) {
    return MoodPreferences(
      prefer: List<String>.from(json['prefer'] as List? ?? []),
      avoid: List<String>.from(json['avoid'] as List? ?? []),
    );
  }

  MoodPreferences copyWith({List<String>? prefer, List<String>? avoid}) {
    return MoodPreferences(
      prefer: prefer ?? this.prefer,
      avoid: avoid ?? this.avoid,
    );
  }
}

class UserPreferences {
  const UserPreferences({
    required this.personalizationOptIn,
    required this.categories,
    required this.targetMoods,
    required this.language,
  });

  final bool personalizationOptIn;
  final CategoryPreferences categories;
  final MoodPreferences targetMoods;
  final String language;

  Map<String, dynamic> toJson() {
    return {
      'personalizationOptIn': personalizationOptIn,
      'categories': categories.toJson(),
      'targetMoods': targetMoods.toJson(),
      'language': language,
    };
  }

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      personalizationOptIn:
          json['personalizationOptIn'] as bool? ??
          json['personalization_opt_in'] as bool? ??
          false,
      categories: CategoryPreferences.fromJson(
        json['categories'] as Map<String, dynamic>? ?? {},
      ),
      targetMoods: MoodPreferences.fromJson(
        json['targetMoods'] as Map<String, dynamic>? ??
            json['target_moods'] as Map<String, dynamic>? ??
            {},
      ),
      language: json['language'] as String? ?? 'tr',
    );
  }

  UserPreferences copyWith({
    bool? personalizationOptIn,
    CategoryPreferences? categories,
    MoodPreferences? targetMoods,
    String? language,
  }) {
    return UserPreferences(
      personalizationOptIn: personalizationOptIn ?? this.personalizationOptIn,
      categories: categories ?? this.categories,
      targetMoods: targetMoods ?? this.targetMoods,
      language: language ?? this.language,
    );
  }
}

/// Onboarding status response
class OnboardingStatus {
  const OnboardingStatus({
    required this.hasCompletedOnboarding,
    required this.isFirstTimeUser,
  });

  final bool hasCompletedOnboarding;
  final bool isFirstTimeUser;

  factory OnboardingStatus.fromJson(Map<String, dynamic> json) {
    final meta = json['meta'] as Map<String, dynamic>?;
    final data = json['data'] as Map<String, dynamic>?;

    // Web'deki kontrol mantığı ile uyumlu
    final completedFromMeta = meta?['hasCompletedOnboarding'] as bool?;
    final firstTimeFromMeta = meta?['isFirstTimeUser'] as bool?;

    final hasCompleted =
        completedFromMeta ??
        (data?['personalization_opt_in'] as bool? ?? false);
    final isFirstTime = firstTimeFromMeta ?? !hasCompleted;

    return OnboardingStatus(
      hasCompletedOnboarding: hasCompleted,
      isFirstTimeUser: isFirstTime,
    );
  }
}
