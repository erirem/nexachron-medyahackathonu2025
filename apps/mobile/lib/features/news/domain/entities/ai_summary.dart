/// AI Summary entity for managing AI-generated summaries
/// Clean code: Single responsibility, immutable data structure
class AiSummary {
  final String id;
  final String originalText;
  final String summaryText;
  final AiSummaryStatus status;
  final DateTime createdAt;
  final String? errorMessage;

  const AiSummary({
    required this.id,
    required this.originalText,
    required this.summaryText,
    required this.status,
    required this.createdAt,
    this.errorMessage,
  });

  /// Factory constructor for beta/demo summary
  factory AiSummary.beta() {
    return AiSummary(
      id: 'beta_demo',
      originalText: 'Demo haber içeriği',
      summaryText: _getBetaSummaryText(),
      status: AiSummaryStatus.beta,
      createdAt: DateTime.now(),
    );
  }

  /// Factory constructor for successful summary
  factory AiSummary.success({
    required String id,
    required String originalText,
    required String summaryText,
  }) {
    return AiSummary(
      id: id,
      originalText: originalText,
      summaryText: summaryText,
      status: AiSummaryStatus.success,
      createdAt: DateTime.now(),
    );
  }

  /// Factory constructor for failed summary
  factory AiSummary.failed({
    required String id,
    required String originalText,
    required String errorMessage,
  }) {
    return AiSummary(
      id: id,
      originalText: originalText,
      summaryText: '',
      status: AiSummaryStatus.failed,
      createdAt: DateTime.now(),
      errorMessage: errorMessage,
    );
  }

  /// Copy with method for state updates
  AiSummary copyWith({
    String? id,
    String? originalText,
    String? summaryText,
    AiSummaryStatus? status,
    DateTime? createdAt,
    String? errorMessage,
  }) {
    return AiSummary(
      id: id ?? this.id,
      originalText: originalText ?? this.originalText,
      summaryText: summaryText ?? this.summaryText,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  /// Check if summary is in beta state
  bool get isBeta => status == AiSummaryStatus.beta;

  /// Check if summary is successful
  bool get isSuccess => status == AiSummaryStatus.success;

  /// Check if summary failed
  bool get isFailed => status == AiSummaryStatus.failed;

  /// Check if summary is processing
  bool get isProcessing => status == AiSummaryStatus.processing;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AiSummary && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'AiSummary(id: $id, status: $status, createdAt: $createdAt)';
  }
}

/// Status enum for AI summary states
enum AiSummaryStatus {
  beta,
  processing,
  success,
  failed,
}

/// Extension for status display names
extension AiSummaryStatusExtension on AiSummaryStatus {
  String get displayName {
    switch (this) {
      case AiSummaryStatus.beta:
        return 'Beta';
      case AiSummaryStatus.processing:
        return 'İşleniyor';
      case AiSummaryStatus.success:
        return 'Tamamlandı';
      case AiSummaryStatus.failed:
        return 'Hata';
    }
  }

  String get description {
    switch (this) {
      case AiSummaryStatus.beta:
        return 'Bu özellik şu an Beta aşamasında';
      case AiSummaryStatus.processing:
        return 'AI özetinizi hazırlıyor...';
      case AiSummaryStatus.success:
        return 'Özet başarıyla oluşturuldu';
      case AiSummaryStatus.failed:
        return 'Özet oluşturulurken hata oluştu';
    }
  }
}

/// Beta demo summary text
String _getBetaSummaryText() {
  return '''Haberin devamında teknoloji şirketi yeni yapay zeka modelini tanıttı. Model, doğal dil işleme alanında önemli gelişmeler sunuyor.

Şirket CEO'su yaptığı açıklamada, bu teknolojinin eğitim ve sağlık sektörlerinde devrim yaratacağını belirtti. Yatırımcılar bu açıklamaların ardından şirket hisselerinde artış bekliyor.

Uzmanlar, bu gelişmenin sektördeki rekabeti artıracağını ve benzer teknolojilerin hızla geliştirileceğini öngörüyor.''';
}
