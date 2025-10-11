class TTSAudioResponse {
  final String id;
  final String newsId;
  final String contentType;
  final String voice;
  final double speed;
  final String audioUrl;
  final int fileSizeBytes;
  final int durationSeconds;
  final String status;
  final String? errorMessage;
  final DateTime createdAt;
  final DateTime updatedAt;

  TTSAudioResponse({
    required this.id,
    required this.newsId,
    required this.contentType,
    required this.voice,
    required this.speed,
    required this.audioUrl,
    required this.fileSizeBytes,
    required this.durationSeconds,
    required this.status,
    this.errorMessage,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TTSAudioResponse.fromJson(Map<String, dynamic> json) {
    return TTSAudioResponse(
      id: json['id'] as String,
      newsId: json['newsId'] as String,
      contentType: json['contentType'] as String,
      voice: json['voice'] as String,
      speed: (json['speed'] as num).toDouble(),
      audioUrl: json['audioUrl'] as String,
      fileSizeBytes: json['fileSizeBytes'] as int,
      durationSeconds: json['durationSeconds'] as int,
      status: json['status'] as String,
      errorMessage: json['errorMessage'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'newsId': newsId,
      'contentType': contentType,
      'voice': voice,
      'speed': speed,
      'audioUrl': audioUrl,
      'fileSizeBytes': fileSizeBytes,
      'durationSeconds': durationSeconds,
      'status': status,
      'errorMessage': errorMessage,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// TTS başarıyla tamamlandı mı?
  bool get isCompleted => status == 'completed';

  /// TTS işlemi devam ediyor mu?
  bool get isProcessing => status == 'pending' || status == 'processing';

  /// TTS işlemi başarısız mı?
  bool get isFailed => status == 'failed';
}
