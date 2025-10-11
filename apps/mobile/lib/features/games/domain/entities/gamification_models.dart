enum UserRank {
  newMember,
  activeReader,
  knowledgeSharer,
  expertCommenter,
  communityLeader,
}

enum League {
  bronze,
  silver,
  gold,
  platinum,
  diamond,
}

enum BadgeType {
  // Streak badges
  streak3,
  streak7,
  streak30,
  streak100,
  
  // Game badges
  quizMaster,
  wordWizard,
  memoryChampion,
  timelineExpert,
  spotMaster,
  
  // Achievement badges
  firstWin,
  perfectScore,
  speedDemon,
  consistent,
  explorer,
  
  // Special badges
  earlyBird,
  nightOwl,
  weekendWarrior,
  challenger,
  social,
}

class Badge {
  final BadgeType type;
  final String name;
  final String description;
  final String iconPath;
  final bool isEarned;
  final DateTime? earnedDate;
  final int rarity; // 1-5, 5 being rarest

  const Badge({
    required this.type,
    required this.name,
    required this.description,
    required this.iconPath,
    this.isEarned = false,
    this.earnedDate,
    required this.rarity,
  });

  Badge copyWith({
    BadgeType? type,
    String? name,
    String? description,
    String? iconPath,
    bool? isEarned,
    DateTime? earnedDate,
    int? rarity,
  }) {
    return Badge(
      type: type ?? this.type,
      name: name ?? this.name,
      description: description ?? this.description,
      iconPath: iconPath ?? this.iconPath,
      isEarned: isEarned ?? this.isEarned,
      earnedDate: earnedDate ?? this.earnedDate,
      rarity: rarity ?? this.rarity,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type.name,
      'name': name,
      'description': description,
      'iconPath': iconPath,
      'isEarned': isEarned,
      'earnedDate': earnedDate?.toIso8601String(),
      'rarity': rarity,
    };
  }

  factory Badge.fromJson(Map<String, dynamic> json) {
    return Badge(
      type: BadgeType.values.firstWhere((e) => e.name == json['type']),
      name: json['name'] as String,
      description: json['description'] as String,
      iconPath: json['iconPath'] as String,
      isEarned: json['isEarned'] as bool? ?? false,
      earnedDate: json['earnedDate'] != null
          ? DateTime.parse(json['earnedDate'] as String)
          : null,
      rarity: json['rarity'] as int,
    );
  }
}

class UserProfile {
  final String id;
  final String email;
  final String name;
  final String? avatar;
  final int xp;
  final UserRank currentRank;
  final League league;
  final int currentStreak;
  final int longestStreak;
  final List<Badge> badges;
  final int streakProtection;
  final DateTime joinDate;
  final DateTime lastActive;
  final List<String> followedTopics;
  final int weeklyXp;
  final int monthlyXp;
  final int seasonXp;

  const UserProfile({
    required this.id,
    required this.email,
    required this.name,
    this.avatar,
    required this.xp,
    required this.currentRank,
    required this.league,
    required this.currentStreak,
    required this.longestStreak,
    required this.badges,
    required this.streakProtection,
    required this.joinDate,
    required this.lastActive,
    required this.followedTopics,
    required this.weeklyXp,
    required this.monthlyXp,
    required this.seasonXp,
  });

  UserProfile copyWith({
    String? id,
    String? email,
    String? name,
    String? avatar,
    int? xp,
    UserRank? currentRank,
    League? league,
    int? currentStreak,
    int? longestStreak,
    List<Badge>? badges,
    int? streakProtection,
    DateTime? joinDate,
    DateTime? lastActive,
    List<String>? followedTopics,
    int? weeklyXp,
    int? monthlyXp,
    int? seasonXp,
  }) {
    return UserProfile(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      avatar: avatar ?? this.avatar,
      xp: xp ?? this.xp,
      currentRank: currentRank ?? this.currentRank,
      league: league ?? this.league,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      badges: badges ?? this.badges,
      streakProtection: streakProtection ?? this.streakProtection,
      joinDate: joinDate ?? this.joinDate,
      lastActive: lastActive ?? this.lastActive,
      followedTopics: followedTopics ?? this.followedTopics,
      weeklyXp: weeklyXp ?? this.weeklyXp,
      monthlyXp: monthlyXp ?? this.monthlyXp,
      seasonXp: seasonXp ?? this.seasonXp,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'avatar': avatar,
      'xp': xp,
      'currentRank': currentRank.name,
      'league': league.name,
      'currentStreak': currentStreak,
      'longestStreak': longestStreak,
      'badges': badges.map((b) => b.toJson()).toList(),
      'streakProtection': streakProtection,
      'joinDate': joinDate.toIso8601String(),
      'lastActive': lastActive.toIso8601String(),
      'followedTopics': followedTopics,
      'weeklyXp': weeklyXp,
      'monthlyXp': monthlyXp,
      'seasonXp': seasonXp,
    };
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      avatar: json['avatar'] as String?,
      xp: json['xp'] as int,
      currentRank: UserRank.values.firstWhere(
        (e) => e.name == json['currentRank'],
      ),
      league: League.values.firstWhere(
        (e) => e.name == json['league'],
      ),
      currentStreak: json['currentStreak'] as int,
      longestStreak: json['longestStreak'] as int,
      badges: (json['badges'] as List<dynamic>)
          .map((b) => Badge.fromJson(b as Map<String, dynamic>))
          .toList(),
      streakProtection: json['streakProtection'] as int,
      joinDate: DateTime.parse(json['joinDate'] as String),
      lastActive: DateTime.parse(json['lastActive'] as String),
      followedTopics: (json['followedTopics'] as List<dynamic>)
          .map((t) => t as String)
          .toList(),
      weeklyXp: json['weeklyXp'] as int,
      monthlyXp: json['monthlyXp'] as int,
      seasonXp: json['seasonXp'] as int,
    );
  }
}

class DailyChallenge {
  final String id;
  final String title;
  final String description;
  final String gameId;
  final Map<String, dynamic> requirements;
  final int xpReward;
  final DateTime startDate;
  final DateTime endDate;
  final bool isCompleted;
  final DateTime? completedAt;

  const DailyChallenge({
    required this.id,
    required this.title,
    required this.description,
    required this.gameId,
    required this.requirements,
    required this.xpReward,
    required this.startDate,
    required this.endDate,
    this.isCompleted = false,
    this.completedAt,
  });

  bool get isActive {
    final now = DateTime.now();
    return now.isAfter(startDate) && now.isBefore(endDate);
  }

  bool get isExpired => DateTime.now().isAfter(endDate);

  DailyChallenge copyWith({
    String? id,
    String? title,
    String? description,
    String? gameId,
    Map<String, dynamic>? requirements,
    int? xpReward,
    DateTime? startDate,
    DateTime? endDate,
    bool? isCompleted,
    DateTime? completedAt,
  }) {
    return DailyChallenge(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      gameId: gameId ?? this.gameId,
      requirements: requirements ?? this.requirements,
      xpReward: xpReward ?? this.xpReward,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      isCompleted: isCompleted ?? this.isCompleted,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'gameId': gameId,
      'requirements': requirements,
      'xpReward': xpReward,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'isCompleted': isCompleted,
      'completedAt': completedAt?.toIso8601String(),
    };
  }

  factory DailyChallenge.fromJson(Map<String, dynamic> json) {
    return DailyChallenge(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      gameId: json['gameId'] as String,
      requirements: json['requirements'] as Map<String, dynamic>,
      xpReward: json['xpReward'] as int,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: DateTime.parse(json['endDate'] as String),
      isCompleted: json['isCompleted'] as bool? ?? false,
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'] as String)
          : null,
    );
  }
}

class XPAction {
  final String type;
  final int value;
  final String description;
  final DateTime timestamp;
  final String? gameId;

  const XPAction({
    required this.type,
    required this.value,
    required this.description,
    required this.timestamp,
    this.gameId,
  });

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'value': value,
      'description': description,
      'timestamp': timestamp.toIso8601String(),
      'gameId': gameId,
    };
  }

  factory XPAction.fromJson(Map<String, dynamic> json) {
    return XPAction(
      type: json['type'] as String,
      value: json['value'] as int,
      description: json['description'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      gameId: json['gameId'] as String?,
    );
  }
}

// XP değerleri
class XPValues {
  static const Map<String, int> values = {
    'GAME_COMPLETE': 50,
    'PERFECT_SCORE': 100,
    'FIRST_TRY': 25,
    'SPEED_BONUS': 30,
    'STREAK_BONUS': 20,
    'DAILY_CHALLENGE': 75,
    'BADGE_EARNED': 150,
    'NEWS_READ': 10,
    'COMMENT_MADE': 15,
    'TOPIC_FOLLOW': 5,
  };
}

// Rank eşikleri
class RankThresholds {
  static const Map<UserRank, int> thresholds = {
    UserRank.newMember: 0,
    UserRank.activeReader: 100,
    UserRank.knowledgeSharer: 500,
    UserRank.expertCommenter: 1500,
    UserRank.communityLeader: 5000,
  };
}
