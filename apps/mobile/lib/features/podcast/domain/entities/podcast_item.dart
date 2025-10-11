import '../../../news/domain/entities/news_item.dart';

class PodcastItem {
  final String id;
  final String title;
  final String subtitle;
  final String imageUrl;
  final String duration;
  final String category;
  final String? audioUrl;
  final bool isPlaying;

  PodcastItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.duration,
    required this.category,
    this.audioUrl,
    this.isPlaying = false,
  });

  /// NewsItem'dan PodcastItem'a dönüştürme factory methodu
  factory PodcastItem.fromNewsItem(NewsItem newsItem) {
    // Süre tahmini: içerik uzunluğuna göre (web ile aynı mantık)
    final contentLength = newsItem.summary.length;
    final estimatedDuration = (contentLength / 100).ceil().clamp(5, 30);

    // Görsel URL'ini belirle
    String imageUrl = '';

    if (newsItem.media.isNotEmpty) {
      // İlk görseli al
      final firstImage = newsItem.media.firstWhere(
        (m) => m.type == 'image',
        orElse: () => newsItem.media.first,
      );
      imageUrl = firstImage.url;
    }

    // Fallback: imageUrl field'ı
    if (imageUrl.isEmpty && newsItem.imageUrl != null) {
      imageUrl = newsItem.imageUrl!;
    }

    // Son fallback: random image
    if (imageUrl.isEmpty) {
      imageUrl = 'https://picsum.photos/300/300?random=${newsItem.id}';
    }

    return PodcastItem(
      id: newsItem.id,
      title: newsItem.title,
      subtitle: newsItem.summary.isNotEmpty
          ? newsItem.summary
          : 'Haber detayları',
      imageUrl: imageUrl,
      duration: '$estimatedDuration dk',
      category: newsItem.category ?? 'Gündem',
    );
  }

  /// AudioUrl ile güncellenmiş kopya oluştur
  PodcastItem copyWith({String? audioUrl, bool? isPlaying}) {
    return PodcastItem(
      id: id,
      title: title,
      subtitle: subtitle,
      imageUrl: imageUrl,
      duration: duration,
      category: category,
      audioUrl: audioUrl ?? this.audioUrl,
      isPlaying: isPlaying ?? this.isPlaying,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'subtitle': subtitle,
      'imageUrl': imageUrl,
      'duration': duration,
      'category': category,
      'audioUrl': audioUrl,
      'isPlaying': isPlaying,
    };
  }

  factory PodcastItem.fromJson(Map<String, dynamic> json) {
    return PodcastItem(
      id: json['id'] as String,
      title: json['title'] as String,
      subtitle: json['subtitle'] as String,
      imageUrl: json['imageUrl'] as String,
      duration: json['duration'] as String,
      category: json['category'] as String,
      audioUrl: json['audioUrl'] as String?,
      isPlaying: json['isPlaying'] as bool? ?? false,
    );
  }
}
