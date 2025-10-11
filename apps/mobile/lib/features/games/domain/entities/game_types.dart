enum GameCategory {
  educational,
  memory,
  word,
  trivia,
  timeline,
  visual,
  arcade,
}

enum GameDifficulty {
  easy,
  medium,
  hard,
}

enum GameStatus {
  available,
  locked,
  comingSoon,
}

class Game {
  final String id;
  final String title;
  final String description;
  final String iconPath;
  final GameCategory category;
  final GameDifficulty difficulty;
  final int xpReward;
  final GameStatus status;
  final String estimatedTime;
  final bool isCompleted;
  final double completionRate;
  final int? bestScore;
  final DateTime? lastPlayed;
  final int timesPlayed;

  const Game({
    required this.id,
    required this.title,
    required this.description,
    required this.iconPath,
    required this.category,
    required this.difficulty,
    required this.xpReward,
    required this.status,
    required this.estimatedTime,
    this.isCompleted = false,
    this.completionRate = 0.0,
    this.bestScore,
    this.lastPlayed,
    this.timesPlayed = 0,
  });

  Game copyWith({
    String? id,
    String? title,
    String? description,
    String? iconPath,
    GameCategory? category,
    GameDifficulty? difficulty,
    int? xpReward,
    GameStatus? status,
    String? estimatedTime,
    bool? isCompleted,
    double? completionRate,
    int? bestScore,
    DateTime? lastPlayed,
    int? timesPlayed,
  }) {
    return Game(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      iconPath: iconPath ?? this.iconPath,
      category: category ?? this.category,
      difficulty: difficulty ?? this.difficulty,
      xpReward: xpReward ?? this.xpReward,
      status: status ?? this.status,
      estimatedTime: estimatedTime ?? this.estimatedTime,
      isCompleted: isCompleted ?? this.isCompleted,
      completionRate: completionRate ?? this.completionRate,
      bestScore: bestScore ?? this.bestScore,
      lastPlayed: lastPlayed ?? this.lastPlayed,
      timesPlayed: timesPlayed ?? this.timesPlayed,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'iconPath': iconPath,
      'category': category.name,
      'difficulty': difficulty.name,
      'xpReward': xpReward,
      'status': status.name,
      'estimatedTime': estimatedTime,
      'isCompleted': isCompleted,
      'completionRate': completionRate,
      'bestScore': bestScore,
      'lastPlayed': lastPlayed?.toIso8601String(),
      'timesPlayed': timesPlayed,
    };
  }

  factory Game.fromJson(Map<String, dynamic> json) {
    return Game(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      iconPath: json['iconPath'] as String,
      category: GameCategory.values.firstWhere(
        (e) => e.name == json['category'],
      ),
      difficulty: GameDifficulty.values.firstWhere(
        (e) => e.name == json['difficulty'],
      ),
      xpReward: json['xpReward'] as int,
      status: GameStatus.values.firstWhere(
        (e) => e.name == json['status'],
      ),
      estimatedTime: json['estimatedTime'] as String,
      isCompleted: json['isCompleted'] as bool? ?? false,
      completionRate: (json['completionRate'] as num?)?.toDouble() ?? 0.0,
      bestScore: json['bestScore'] as int?,
      lastPlayed: json['lastPlayed'] != null
          ? DateTime.parse(json['lastPlayed'] as String)
          : null,
      timesPlayed: json['timesPlayed'] as int? ?? 0,
    );
  }
}

enum AchievementType {
  firstWin,
  perfectScore,
  speedRun,
  comboMaster,
  streakWarrior,
  categoryExpert,
}

class Achievement {
  final String id;
  final AchievementType type;
  final String title;
  final String description;
  final String iconPath;
  final int xpReward;
  final DateTime unlockedAt;

  const Achievement({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.iconPath,
    required this.xpReward,
    required this.unlockedAt,
  });

  factory Achievement.fromJson(Map<String, dynamic> json) {
    return Achievement(
      id: json['id'],
      type: AchievementType.values.firstWhere((e) => e.name == json['type']),
      title: json['title'],
      description: json['description'],
      iconPath: json['iconPath'],
      xpReward: json['xpReward'],
      unlockedAt: DateTime.parse(json['unlockedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'title': title,
      'description': description,
      'iconPath': iconPath,
      'xpReward': xpReward,
      'unlockedAt': unlockedAt.toIso8601String(),
    };
  }
}

class GameResult {
  final String gameId;
  final int score;
  final int maxScore;
  final int xpEarned;
  final Duration timeTaken;
  final DateTime completedAt;
  final Map<String, dynamic>? metadata;
  final int streakBonus;
  final int comboMultiplier;
  final List<Achievement> achievementsUnlocked;

  const GameResult({
    required this.gameId,
    required this.score,
    required this.maxScore,
    required this.xpEarned,
    required this.timeTaken,
    required this.completedAt,
    this.metadata,
    this.streakBonus = 0,
    this.comboMultiplier = 1,
    this.achievementsUnlocked = const [],
  });

  double get scorePercentage => maxScore > 0 ? (score / maxScore) * 100 : 0;
  int get totalScore => score + streakBonus;
  int get totalXP => (xpEarned * comboMultiplier) + (streakBonus ~/ 10);

  Map<String, dynamic> toJson() {
    return {
      'gameId': gameId,
      'score': score,
      'maxScore': maxScore,
      'xpEarned': xpEarned,
      'timeTaken': timeTaken.inSeconds,
      'completedAt': completedAt.toIso8601String(),
      'metadata': metadata,
      'streakBonus': streakBonus,
      'comboMultiplier': comboMultiplier,
      'achievementsUnlocked': achievementsUnlocked.map((e) => e.toJson()).toList(),
    };
  }

  factory GameResult.fromJson(Map<String, dynamic> json) {
    return GameResult(
      gameId: json['gameId'] as String,
      score: json['score'] as int,
      maxScore: json['maxScore'] as int,
      xpEarned: json['xpEarned'] as int,
      timeTaken: Duration(seconds: json['timeTaken'] as int),
      completedAt: DateTime.parse(json['completedAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
      streakBonus: json['streakBonus'] as int? ?? 0,
      comboMultiplier: json['comboMultiplier'] as int? ?? 1,
      achievementsUnlocked: (json['achievementsUnlocked'] as List<dynamic>?)
          ?.map((e) => Achievement.fromJson(e))
          .toList() ?? [],
    );
  }
}

class GameSession {
  final String id;
  final String gameId;
  final DateTime startedAt;
  final DateTime? endedAt;
  final bool isActive;
  final Map<String, dynamic> gameState;

  const GameSession({
    required this.id,
    required this.gameId,
    required this.startedAt,
    this.endedAt,
    required this.isActive,
    required this.gameState,
  });

  Duration? get duration {
    if (endedAt == null) return null;
    return endedAt!.difference(startedAt);
  }

  GameSession copyWith({
    String? id,
    String? gameId,
    DateTime? startedAt,
    DateTime? endedAt,
    bool? isActive,
    Map<String, dynamic>? gameState,
  }) {
    return GameSession(
      id: id ?? this.id,
      gameId: gameId ?? this.gameId,
      startedAt: startedAt ?? this.startedAt,
      endedAt: endedAt ?? this.endedAt,
      isActive: isActive ?? this.isActive,
      gameState: gameState ?? this.gameState,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'gameId': gameId,
      'startedAt': startedAt.toIso8601String(),
      'endedAt': endedAt?.toIso8601String(),
      'isActive': isActive,
      'gameState': gameState,
    };
  }

  factory GameSession.fromJson(Map<String, dynamic> json) {
    return GameSession(
      id: json['id'] as String,
      gameId: json['gameId'] as String,
      startedAt: DateTime.parse(json['startedAt'] as String),
      endedAt: json['endedAt'] != null
          ? DateTime.parse(json['endedAt'] as String)
          : null,
      isActive: json['isActive'] as bool,
      gameState: json['gameState'] as Map<String, dynamic>,
    );
  }
}
