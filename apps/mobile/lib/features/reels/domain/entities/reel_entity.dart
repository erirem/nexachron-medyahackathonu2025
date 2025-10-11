class ReelEntity {
  final String id;
  final String title;
  final String summary;
  final String category;
  final String videoUrl;
  final String thumbUrl;
  final int durationSec;
  final String? hrefId;
  final String? publishedAt;
  final String? createdAt;
  final double engagementScore;
  final String status;

  const ReelEntity({
    required this.id,
    required this.title,
    required this.summary,
    required this.category,
    required this.videoUrl,
    required this.thumbUrl,
    required this.durationSec,
    this.hrefId,
    this.publishedAt,
    this.createdAt,
    this.engagementScore = 0.0,
    this.status = 'active',
  });

  factory ReelEntity.fromJson(Map<String, dynamic> json) {
    return ReelEntity(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      summary: json['summary'] as String? ?? '',
      category: json['category'] as String? ?? '',
      videoUrl: json['videoUrl'] as String? ?? '',
      thumbUrl: json['thumbUrl'] as String? ?? '',
      durationSec: json['durationSec'] as int? ?? 0,
      hrefId: json['hrefId'] as String?,
      publishedAt: json['publishedAt'] as String?,
      createdAt: json['createdAt'] as String?,
      engagementScore: (json['engagementScore'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] as String? ?? 'active',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'summary': summary,
      'category': category,
      'videoUrl': videoUrl,
      'thumbUrl': thumbUrl,
      'durationSec': durationSec,
      'hrefId': hrefId,
      'publishedAt': publishedAt,
      'createdAt': createdAt,
      'engagementScore': engagementScore,
      'status': status,
    };
  }

  ReelEntity copyWith({
    String? id,
    String? title,
    String? summary,
    String? category,
    String? videoUrl,
    String? thumbUrl,
    int? durationSec,
    String? hrefId,
    String? publishedAt,
    String? createdAt,
    double? engagementScore,
    String? status,
  }) {
    return ReelEntity(
      id: id ?? this.id,
      title: title ?? this.title,
      summary: summary ?? this.summary,
      category: category ?? this.category,
      videoUrl: videoUrl ?? this.videoUrl,
      thumbUrl: thumbUrl ?? this.thumbUrl,
      durationSec: durationSec ?? this.durationSec,
      hrefId: hrefId ?? this.hrefId,
      publishedAt: publishedAt ?? this.publishedAt,
      createdAt: createdAt ?? this.createdAt,
      engagementScore: engagementScore ?? this.engagementScore,
      status: status ?? this.status,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ReelEntity && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'ReelEntity(id: $id, title: $title, category: $category)';
  }
}

class ExploreFeedResponse {
  final List<ReelEntity> items;
  final String? nextCursor;
  final bool hasMore;

  const ExploreFeedResponse({
    required this.items,
    this.nextCursor,
    required this.hasMore,
  });

  factory ExploreFeedResponse.fromJson(Map<String, dynamic> json) {
    return ExploreFeedResponse(
      items:
          (json['items'] as List<dynamic>?)
              ?.map((item) => ReelEntity.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
      nextCursor: json['nextCursor'] as String?,
      hasMore: json['hasMore'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'items': items.map((item) => item.toJson()).toList(),
      'nextCursor': nextCursor,
      'hasMore': hasMore,
    };
  }
}

class NextReelResponse {
  final ReelEntity item;

  const NextReelResponse({required this.item});

  factory NextReelResponse.fromJson(Map<String, dynamic> json) {
    return NextReelResponse(
      item: ReelEntity.fromJson(json['item'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {'item': item.toJson()};
  }
}

// Web'deki API tiplerini ekle
class ReelListItem {
  final String id;
  final String title;
  final String description;
  final String? videoUrl;
  final String? thumbnailUrl;
  final int durationSeconds;
  final String category;
  final String createdAt;
  final String status;

  const ReelListItem({
    required this.id,
    required this.title,
    required this.description,
    this.videoUrl,
    this.thumbnailUrl,
    required this.durationSeconds,
    required this.category,
    required this.createdAt,
    required this.status,
  });

  factory ReelListItem.fromJson(Map<String, dynamic> json) {
    return ReelListItem(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      videoUrl: json['video_url'] as String?,
      thumbnailUrl: json['thumbnail_url'] as String?,
      durationSeconds: json['duration_seconds'] as int,
      category: json['category'] as String,
      createdAt: json['created_at'] as String,
      status: json['status'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'video_url': videoUrl,
      'thumbnail_url': thumbnailUrl,
      'duration_seconds': durationSeconds,
      'category': category,
      'created_at': createdAt,
      'status': status,
    };
  }
}

class ReelListResponse {
  final List<ReelListItem> reels;
  final int total;
  final int limit;
  final int offset;
  final bool hasMore;

  const ReelListResponse({
    required this.reels,
    required this.total,
    required this.limit,
    required this.offset,
    required this.hasMore,
  });

  factory ReelListResponse.fromJson(Map<String, dynamic> json) {
    return ReelListResponse(
      reels:
          (json['reels'] as List<dynamic>?)
              ?.map(
                (reel) => ReelListItem.fromJson(reel as Map<String, dynamic>),
              )
              .toList() ??
          [],
      total: json['total'] as int,
      limit: json['limit'] as int,
      offset: json['offset'] as int,
      hasMore: json['hasMore'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'reels': reels.map((reel) => reel.toJson()).toList(),
      'total': total,
      'limit': limit,
      'offset': offset,
      'hasMore': hasMore,
    };
  }
}

class ReelDetail {
  final String id;
  final ReelContent content;
  final ReelAssets assets;
  final int durationSeconds;
  final String category;
  final double engagementScore;
  final String publishedAt;
  final String createdAt;
  final String newsId;
  final String status;

  const ReelDetail({
    required this.id,
    required this.content,
    required this.assets,
    required this.durationSeconds,
    required this.category,
    required this.engagementScore,
    required this.publishedAt,
    required this.createdAt,
    required this.newsId,
    required this.status,
  });

  factory ReelDetail.fromJson(Map<String, dynamic> json) {
    return ReelDetail(
      id: json['id'] as String,
      content: ReelContent.fromJson(json['content'] as Map<String, dynamic>),
      assets: ReelAssets.fromJson(json['assets'] as Map<String, dynamic>),
      durationSeconds: json['duration_seconds'] as int,
      category: json['category'] as String,
      engagementScore: (json['engagement_score'] as num).toDouble(),
      publishedAt: json['published_at'] as String,
      createdAt: json['created_at'] as String,
      newsId: json['news_id'] as String,
      status: json['status'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content.toJson(),
      'assets': assets.toJson(),
      'duration_seconds': durationSeconds,
      'category': category,
      'engagement_score': engagementScore,
      'published_at': publishedAt,
      'created_at': createdAt,
      'news_id': newsId,
      'status': status,
    };
  }
}

class ReelContent {
  final String headline;
  final List<String>? summarySentences;
  final String? captions;
  final List<String>? hashtags;

  const ReelContent({
    required this.headline,
    this.summarySentences,
    this.captions,
    this.hashtags,
  });

  factory ReelContent.fromJson(Map<String, dynamic> json) {
    return ReelContent(
      headline: json['headline'] as String,
      summarySentences: (json['summary_sentences'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      captions: json['captions'] as String?,
      hashtags: (json['hashtags'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'headline': headline,
      'summary_sentences': summarySentences,
      'captions': captions,
      'hashtags': hashtags,
    };
  }
}

class ReelAssets {
  final String? videoUrl;
  final String? thumbnailUrl;
  final String? backgroundImage;

  const ReelAssets({this.videoUrl, this.thumbnailUrl, this.backgroundImage});

  factory ReelAssets.fromJson(Map<String, dynamic> json) {
    return ReelAssets(
      videoUrl: json['video_url'] as String?,
      thumbnailUrl: json['thumbnail_url'] as String?,
      backgroundImage: json['background_image'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'video_url': videoUrl,
      'thumbnail_url': thumbnailUrl,
      'background_image': backgroundImage,
    };
  }
}
