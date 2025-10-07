import 'dart:convert';

class NewsItem {
  final String id;
  final String title;
  final String summary;
  final String content;
  final String? categoryId;
  final String? category;
  final String? city;
  final String? imageUrl;
  final List<NewsImage> images;
  final bool isPopular;
  final DateTime createdAt;
  final DateTime? publishedAt;
  final String? mediaSummary;
  final List<MediaItem> media;

  NewsItem({
    required this.id,
    required this.title,
    required this.summary,
    required this.content,
    this.categoryId,
    this.category,
    this.city,
    this.imageUrl,
    this.images = const [],
    this.isPopular = false,
    required this.createdAt,
    this.publishedAt,
    this.mediaSummary,
    this.media = const [],
  });

  factory NewsItem.fromJson(Map<String, dynamic> json) {
    // Web/API dto: NewsWithMediaDto
    final dynamic primaryMedia = json['primaryMedia'];
    final String? primaryImageUrl = primaryMedia is Map<String, dynamic>
        ? primaryMedia['url'] as String?
        : json['image_url'] as String?;

    final List<dynamic> mediaListRaw =
        (json['media'] as List<dynamic>?) ??
        (json['images'] as List<dynamic>?) ??
        const [];

    final List<MediaItem> mediaItems = mediaListRaw
        .whereType<Map<String, dynamic>>()
        .map((e) => MediaItem.fromJson(_normalizeMediaJson(e)))
        .toList();

    final List<NewsImage> images = mediaItems
        .map((m) => NewsImage(url: m.url))
        .toList();

    final String? createdAtStr = _asString(
      json['createdAt'] ?? json['created_at'],
    );
    final String? publishedAtStr = _asString(
      json['publishedAt'] ?? json['published_at'],
    );

    // Category handling - API'den string olarak geliyor
    final String? categoryIdValue = _asString(json['categoryId']);
    final String? categoryValue = _asString(json['category']);

    return NewsItem(
      id: json['id'] as String,
      title: _asString(json['title']) ?? '',
      summary: _asString(json['summary']) ?? '',
      content: _asString(json['content']) ?? '',
      categoryId: categoryIdValue,
      category: categoryValue,
      city: _asString(json['city']),
      imageUrl: primaryImageUrl,
      images: images,
      isPopular:
          json['is_popular'] as bool? ?? json['isPopular'] as bool? ?? false,
      createdAt: createdAtStr != null
          ? DateTime.parse(createdAtStr)
          : DateTime.now(),
      publishedAt: publishedAtStr != null
          ? DateTime.parse(publishedAtStr)
          : null,
      mediaSummary: (() {
        final dynamic ms = json['media_summary'] ?? json['mediaSummary'];
        if (ms is String) return ms;
        if (ms is Map<String, dynamic> || ms is List) return jsonEncode(ms);
        return null;
      })(),
      media: mediaItems,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'summary': summary,
      'content': content,
      'categoryId': categoryId,
      'category': category,
      'city': city,
      'image_url': imageUrl,
      'images': images.map((e) => e.toJson()).toList(),
      'is_popular': isPopular,
      'created_at': createdAt.toIso8601String(),
      'published_at': publishedAt?.toIso8601String(),
      'media_summary': mediaSummary,
      'media': media.map((e) => e.toJson()).toList(),
    };
  }

  String get readingTime {
    final words = content.trim().split(RegExp(r'\s+'));
    final minutes = (words.length / 220).ceil().clamp(1, 999);
    return '$minutes dk okuma';
  }

  String get relativeTime {
    final now = DateTime.now();
    final diff = now.difference(createdAt);

    if (diff.inMinutes < 60) {
      return '${diff.inMinutes} dakika önce';
    } else if (diff.inHours < 24) {
      return '${diff.inHours} saat önce';
    } else if (diff.inDays < 7) {
      return '${diff.inDays} gün önce';
    } else {
      return '${(diff.inDays / 7).floor()} hafta önce';
    }
  }
}

class NewsImage {
  final String url;
  final String? alt;
  final String? caption;
  final String? credit;

  NewsImage({required this.url, this.alt, this.caption, this.credit});

  factory NewsImage.fromJson(Map<String, dynamic> json) {
    return NewsImage(
      url: json['url'] as String,
      alt: json['alt'] as String?,
      caption: json['caption'] as String?,
      credit: json['credit'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {'url': url, 'alt': alt, 'caption': caption, 'credit': credit};
  }
}

class MediaItem {
  final String id;
  final String url;
  final String type;
  final int? order;
  final String? caption;

  MediaItem({
    required this.id,
    required this.url,
    required this.type,
    this.order,
    this.caption,
  });

  factory MediaItem.fromJson(Map<String, dynamic> json) {
    return MediaItem(
      id: json['id'] as String? ?? json['media_id'] as String? ?? '',
      url: json['url'] as String? ?? json['media_url'] as String? ?? '',
      type: json['type'] as String? ?? json['media_type'] as String? ?? 'image',
      order: json['order'] as int? ?? json['order_index'] as int?,
      caption: json['caption'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'url': url,
      'type': type,
      'order': order,
      'caption': caption,
    };
  }
}

// Helpers
Map<String, dynamic> _normalizeMediaJson(Map<String, dynamic> json) {
  if (json.containsKey('media_url') || json.containsKey('media_type')) {
    return {
      'id': json['id'] ?? json['media_id'],
      'url': json['media_url'],
      'type': json['media_type'],
      'order': json['order_index'],
      'caption': json['caption'],
    };
  }
  return json;
}

// Safe string extractor for dynamic API fields
String? _asString(dynamic value) {
  if (value == null) return null;
  if (value is String) return value;
  // Some APIs might send numbers/booleans; stringify conservatively
  if (value is num || value is bool) return value.toString();
  // If it's a map/list, keep behavior consistent with media_summary (stringify)
  if (value is Map || value is List) return jsonEncode(value);
  return null;
}
