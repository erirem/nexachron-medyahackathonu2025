class Comment {
  final String id;
  final User user;
  final String content;
  final String timestamp;
  final int likes;
  final List<Reply>? replies;

  Comment({
    required this.id,
    required this.user,
    required this.content,
    required this.timestamp,
    required this.likes,
    this.replies,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      content: json['content'] as String,
      timestamp: json['timestamp'] as String,
      likes: json['likes'] as int? ?? 0,
      replies: json['replies'] != null
          ? (json['replies'] as List<dynamic>)
              .map((reply) => Reply.fromJson(reply as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user': user.toJson(),
      'content': content,
      'timestamp': timestamp,
      'likes': likes,
      'replies': replies?.map((reply) => reply.toJson()).toList(),
    };
  }

  Comment copyWith({
    String? id,
    User? user,
    String? content,
    String? timestamp,
    int? likes,
    List<Reply>? replies,
  }) {
    return Comment(
      id: id ?? this.id,
      user: user ?? this.user,
      content: content ?? this.content,
      timestamp: timestamp ?? this.timestamp,
      likes: likes ?? this.likes,
      replies: replies ?? this.replies,
    );
  }
}

class Reply {
  final String id;
  final User user;
  final String content;
  final String timestamp;
  final int likes;

  Reply({
    required this.id,
    required this.user,
    required this.content,
    required this.timestamp,
    required this.likes,
  });

  factory Reply.fromJson(Map<String, dynamic> json) {
    return Reply(
      id: json['id'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      content: json['content'] as String,
      timestamp: json['timestamp'] as String,
      likes: json['likes'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user': user.toJson(),
      'content': content,
      'timestamp': timestamp,
      'likes': likes,
    };
  }

  Reply copyWith({
    String? id,
    User? user,
    String? content,
    String? timestamp,
    int? likes,
  }) {
    return Reply(
      id: id ?? this.id,
      user: user ?? this.user,
      content: content ?? this.content,
      timestamp: timestamp ?? this.timestamp,
      likes: likes ?? this.likes,
    );
  }
}

class User {
  final String name;
  final String avatar;
  final bool verified;
  final String? badge;

  User({
    required this.name,
    required this.avatar,
    required this.verified,
    this.badge,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      name: json['name'] as String,
      avatar: json['avatar'] as String,
      verified: json['verified'] as bool? ?? false,
      badge: json['badge'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'avatar': avatar,
      'verified': verified,
      'badge': badge,
    };
  }

  User copyWith({
    String? name,
    String? avatar,
    bool? verified,
    String? badge,
  }) {
    return User(
      name: name ?? this.name,
      avatar: avatar ?? this.avatar,
      verified: verified ?? this.verified,
      badge: badge ?? this.badge,
    );
  }
}
