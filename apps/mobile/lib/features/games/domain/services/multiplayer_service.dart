import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';


enum MultiplayerGameState {
  waiting,
  starting,
  inProgress,
  finished,
}

enum PlayerStatus {
  connected,
  disconnected,
  ready,
  playing,
}

class MultiplayerPlayer {
  final String id;
  final String name;
  final String avatar;
  final PlayerStatus status;
  final int score;
  final int currentQuestion;

  const MultiplayerPlayer({
    required this.id,
    required this.name,
    required this.avatar,
    required this.status,
    this.score = 0,
    this.currentQuestion = 0,
  });

  MultiplayerPlayer copyWith({
    String? id,
    String? name,
    String? avatar,
    PlayerStatus? status,
    int? score,
    int? currentQuestion,
  }) {
    return MultiplayerPlayer(
      id: id ?? this.id,
      name: name ?? this.name,
      avatar: avatar ?? this.avatar,
      status: status ?? this.status,
      score: score ?? this.score,
      currentQuestion: currentQuestion ?? this.currentQuestion,
    );
  }

  factory MultiplayerPlayer.fromJson(Map<String, dynamic> json) {
    return MultiplayerPlayer(
      id: json['id'],
      name: json['name'],
      avatar: json['avatar'],
      status: PlayerStatus.values.firstWhere((e) => e.name == json['status']),
      score: json['score'] ?? 0,
      currentQuestion: json['currentQuestion'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'avatar': avatar,
      'status': status.name,
      'score': score,
      'currentQuestion': currentQuestion,
    };
  }
}

class MultiplayerRoom {
  final String id;
  final String name;
  final String hostId;
  final String gameType;
  final List<MultiplayerPlayer> players;
  final MultiplayerGameState state;
  final int maxPlayers;
  final DateTime createdAt;
  final Map<String, dynamic>? gameSettings;

  const MultiplayerRoom({
    required this.id,
    required this.name,
    required this.hostId,
    required this.gameType,
    required this.players,
    required this.state,
    this.maxPlayers = 4,
    required this.createdAt,
    this.gameSettings,
  });

  bool get isFull => players.length >= maxPlayers;
  bool get canStart => players.length >= 2 && players.every((p) => p.status == PlayerStatus.ready);

  MultiplayerRoom copyWith({
    String? id,
    String? name,
    String? hostId,
    String? gameType,
    List<MultiplayerPlayer>? players,
    MultiplayerGameState? state,
    int? maxPlayers,
    DateTime? createdAt,
    Map<String, dynamic>? gameSettings,
  }) {
    return MultiplayerRoom(
      id: id ?? this.id,
      name: name ?? this.name,
      hostId: hostId ?? this.hostId,
      gameType: gameType ?? this.gameType,
      players: players ?? this.players,
      state: state ?? this.state,
      maxPlayers: maxPlayers ?? this.maxPlayers,
      createdAt: createdAt ?? this.createdAt,
      gameSettings: gameSettings ?? this.gameSettings,
    );
  }

  factory MultiplayerRoom.fromJson(Map<String, dynamic> json) {
    return MultiplayerRoom(
      id: json['id'],
      name: json['name'],
      hostId: json['hostId'],
      gameType: json['gameType'],
      players: (json['players'] as List)
          .map((p) => MultiplayerPlayer.fromJson(p))
          .toList(),
      state: MultiplayerGameState.values.firstWhere((e) => e.name == json['state']),
      maxPlayers: json['maxPlayers'] ?? 4,
      createdAt: DateTime.parse(json['createdAt']),
      gameSettings: json['gameSettings'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'hostId': hostId,
      'gameType': gameType,
      'players': players.map((p) => p.toJson()).toList(),
      'state': state.name,
      'maxPlayers': maxPlayers,
      'createdAt': createdAt.toIso8601String(),
      'gameSettings': gameSettings,
    };
  }
}

abstract class MultiplayerService {
  // Connection management
  Future<void> connect();
  Future<void> disconnect();
  bool get isConnected;

  // Room management
  Future<MultiplayerRoom> createRoom({
    required String name,
    required String gameType,
    int maxPlayers = 4,
    Map<String, dynamic>? gameSettings,
  });
  
  Future<void> joinRoom(String roomId);
  Future<void> leaveRoom();
  Future<List<MultiplayerRoom>> getAvailableRooms();
  
  // Game flow
  Future<void> setPlayerReady();
  Future<void> startGame();
  Future<void> submitAnswer(String questionId, String answer);
  Future<void> sendGameAction(Map<String, dynamic> action);
  
  // Streams
  Stream<MultiplayerRoom?> get roomStream;
  Stream<Map<String, dynamic>> get gameEventStream;
  Stream<List<MultiplayerPlayer>> get playersStream;
}

class MultiplayerServiceImpl implements MultiplayerService {
  WebSocketChannel? _channel;
  final StreamController<MultiplayerRoom?> _roomController = StreamController.broadcast();
  final StreamController<Map<String, dynamic>> _gameEventController = StreamController.broadcast();
  final StreamController<List<MultiplayerPlayer>> _playersController = StreamController.broadcast();
  
  MultiplayerRoom? _currentRoom;
  String? _playerId;
  
  static const String _wsUrl = 'wss://your-websocket-url.com/ws'; // Replace with actual URL

  @override
  bool get isConnected => _channel != null;

  @override
  Stream<MultiplayerRoom?> get roomStream => _roomController.stream;

  @override
  Stream<Map<String, dynamic>> get gameEventStream => _gameEventController.stream;

  @override
  Stream<List<MultiplayerPlayer>> get playersStream => _playersController.stream;

  @override
  Future<void> connect() async {
    if (_channel != null) return;

    try {
      _channel = WebSocketChannel.connect(Uri.parse(_wsUrl));
      
      _channel!.stream.listen(
        _handleMessage,
        onError: _handleError,
        onDone: _handleDisconnection,
      );
      
      // Send connection message
      _sendMessage({
        'type': 'connect',
        'timestamp': DateTime.now().toIso8601String(),
      });
      
    } catch (e) {
      throw Exception('Failed to connect to multiplayer server: $e');
    }
  }

  @override
  Future<void> disconnect() async {
    await _channel?.sink.close();
    _channel = null;
    _currentRoom = null;
    _playerId = null;
  }

  @override
  Future<MultiplayerRoom> createRoom({
    required String name,
    required String gameType,
    int maxPlayers = 4,
    Map<String, dynamic>? gameSettings,
  }) async {
    if (!isConnected) await connect();

    final completer = Completer<MultiplayerRoom>();
    
    _sendMessage({
      'type': 'create_room',
      'data': {
        'name': name,
        'gameType': gameType,
        'maxPlayers': maxPlayers,
        'gameSettings': gameSettings,
      },
    });

    // Mock implementation - in real app, wait for server response
    await Future.delayed(const Duration(milliseconds: 500));
    
    final room = MultiplayerRoom(
      id: 'room_${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      hostId: _playerId ?? 'player_1',
      gameType: gameType,
      players: [
        MultiplayerPlayer(
          id: _playerId ?? 'player_1',
          name: 'You',
          avatar: 'default_avatar',
          status: PlayerStatus.connected,
        ),
      ],
      state: MultiplayerGameState.waiting,
      maxPlayers: maxPlayers,
      createdAt: DateTime.now(),
      gameSettings: gameSettings,
    );

    _currentRoom = room;
    _roomController.add(room);
    
    return room;
  }

  @override
  Future<void> joinRoom(String roomId) async {
    if (!isConnected) await connect();

    _sendMessage({
      'type': 'join_room',
      'data': {'roomId': roomId},
    });
  }

  @override
  Future<void> leaveRoom() async {
    if (_currentRoom == null) return;

    _sendMessage({
      'type': 'leave_room',
      'data': {'roomId': _currentRoom!.id},
    });

    _currentRoom = null;
    _roomController.add(null);
  }

  @override
  Future<List<MultiplayerRoom>> getAvailableRooms() async {
    if (!isConnected) await connect();

    _sendMessage({
      'type': 'get_rooms',
    });

    // Mock implementation
    await Future.delayed(const Duration(milliseconds: 300));
    
    return [
      MultiplayerRoom(
        id: 'room_1',
        name: 'Hızlı Trivia',
        hostId: 'player_2',
        gameType: 'news_trivia',
        players: [
          const MultiplayerPlayer(
            id: 'player_2',
            name: 'Ahmet',
            avatar: 'avatar_1',
            status: PlayerStatus.ready,
          ),
        ],
        state: MultiplayerGameState.waiting,
        maxPlayers: 4,
        createdAt: DateTime.now().subtract(const Duration(minutes: 2)),
      ),
      MultiplayerRoom(
        id: 'room_2',
        name: 'Kelime Ustası',
        hostId: 'player_3',
        gameType: 'wordle',
        players: [
          const MultiplayerPlayer(
            id: 'player_3',
            name: 'Ayşe',
            avatar: 'avatar_2',
            status: PlayerStatus.ready,
          ),
          const MultiplayerPlayer(
            id: 'player_4',
            name: 'Mehmet',
            avatar: 'avatar_3',
            status: PlayerStatus.connected,
          ),
        ],
        state: MultiplayerGameState.waiting,
        maxPlayers: 4,
        createdAt: DateTime.now().subtract(const Duration(minutes: 5)),
      ),
    ];
  }

  @override
  Future<void> setPlayerReady() async {
    if (_currentRoom == null) return;

    _sendMessage({
      'type': 'player_ready',
      'data': {'roomId': _currentRoom!.id},
    });
  }

  @override
  Future<void> startGame() async {
    if (_currentRoom == null) return;

    _sendMessage({
      'type': 'start_game',
      'data': {'roomId': _currentRoom!.id},
    });
  }

  @override
  Future<void> submitAnswer(String questionId, String answer) async {
    if (_currentRoom == null) return;

    _sendMessage({
      'type': 'submit_answer',
      'data': {
        'roomId': _currentRoom!.id,
        'questionId': questionId,
        'answer': answer,
        'timestamp': DateTime.now().toIso8601String(),
      },
    });
  }

  @override
  Future<void> sendGameAction(Map<String, dynamic> action) async {
    if (_currentRoom == null) return;

    _sendMessage({
      'type': 'game_action',
      'data': {
        'roomId': _currentRoom!.id,
        'action': action,
      },
    });
  }

  void _sendMessage(Map<String, dynamic> message) {
    if (_channel == null) return;
    _channel!.sink.add(jsonEncode(message));
  }

  void _handleMessage(dynamic message) {
    try {
      final data = jsonDecode(message as String) as Map<String, dynamic>;
      final type = data['type'] as String;

      switch (type) {
        case 'room_updated':
          _handleRoomUpdate(data['data']);
          break;
        case 'game_event':
          _gameEventController.add(data['data']);
          break;
        case 'player_joined':
        case 'player_left':
        case 'player_ready':
          _handlePlayerUpdate(data['data']);
          break;
        case 'game_started':
          _handleGameStart(data['data']);
          break;
        case 'connected':
          _playerId = data['data']['playerId'];
          break;
      }
    } catch (e) {
      print('Error handling message: $e');
    }
  }

  void _handleRoomUpdate(Map<String, dynamic> data) {
    if (data['room'] != null) {
      _currentRoom = MultiplayerRoom.fromJson(data['room']);
      _roomController.add(_currentRoom);
      _playersController.add(_currentRoom!.players);
    }
  }

  void _handlePlayerUpdate(Map<String, dynamic> data) {
    if (_currentRoom != null && data['players'] != null) {
      final players = (data['players'] as List)
          .map((p) => MultiplayerPlayer.fromJson(p))
          .toList();
      
      _currentRoom = _currentRoom!.copyWith(players: players);
      _roomController.add(_currentRoom);
      _playersController.add(players);
    }
  }

  void _handleGameStart(Map<String, dynamic> data) {
    if (_currentRoom != null) {
      _currentRoom = _currentRoom!.copyWith(state: MultiplayerGameState.inProgress);
      _roomController.add(_currentRoom);
    }
    _gameEventController.add({'type': 'game_started', 'data': data});
  }

  void _handleError(error) {
    print('WebSocket error: $error');
    _gameEventController.add({'type': 'error', 'error': error.toString()});
  }

  void _handleDisconnection() {
    print('WebSocket disconnected');
    _channel = null;
    _currentRoom = null;
    _playerId = null;
    _roomController.add(null);
    _gameEventController.add({'type': 'disconnected'});
  }

  void dispose() {
    _roomController.close();
    _gameEventController.close();
    _playersController.close();
    disconnect();
  }
}

