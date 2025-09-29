class UserStats {
  const UserStats({
    required this.xp,
    required this.streak,
    required this.rankLevel,
    required this.createdAt,
    required this.updatedAt,
    this.lastSeen,
  });

  final int xp;
  final int streak;
  final int rankLevel;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastSeen;

  factory UserStats.fromMap(Map<String, dynamic> map) {
    DateTime? parseNullable(String? value) => value == null || value.isEmpty
        ? null
        : DateTime.tryParse(value)?.toLocal();

    return UserStats(
      xp: map['xp'] as int? ?? 0,
      streak: map['streak'] as int? ?? 0,
      rankLevel: map['rankLevel'] as int? ?? map['rank_level'] as int? ?? 1,
      lastSeen: parseNullable(
        map['lastSeen'] as String? ?? map['last_seen'] as String?,
      ),
      createdAt:
          DateTime.tryParse(
            map['createdAt'] as String? ?? map['created_at'] as String? ?? '',
          )?.toLocal() ??
          DateTime.now(),
      updatedAt:
          DateTime.tryParse(
            map['updatedAt'] as String? ?? map['updated_at'] as String? ?? '',
          )?.toLocal() ??
          DateTime.now(),
    );
  }
}

class UserProfile {
  const UserProfile({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.stats,
    this.email,
    this.username,
    this.city,
  });

  final String id;
  final String? email;
  final String? username;
  final String? city;
  final DateTime createdAt;
  final DateTime updatedAt;
  final UserStats stats;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic> userMap =
        (json['user'] as Map<String, dynamic>? ?? <String, dynamic>{});
    final Map<String, dynamic> statsMap =
        (json['stats'] as Map<String, dynamic>? ?? <String, dynamic>{});

    DateTime parseDate(String? value) =>
        DateTime.tryParse(value ?? '')?.toLocal() ?? DateTime.now();

    return UserProfile(
      id: userMap['id'] as String? ?? '',
      email: userMap['email'] as String?,
      username: userMap['username'] as String?,
      city: userMap['city'] as String?,
      createdAt: parseDate(
        userMap['createdAt'] as String? ?? userMap['created_at'] as String?,
      ),
      updatedAt: parseDate(
        userMap['updatedAt'] as String? ?? userMap['updated_at'] as String?,
      ),
      stats: UserStats.fromMap(statsMap),
    );
  }
}
