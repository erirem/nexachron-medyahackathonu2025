import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:ui';

import '../../domain/services/multiplayer_service.dart';
import '../widgets/glassmorphic_button.dart';

final multiplayerServiceProvider = Provider<MultiplayerService>((ref) {
  return MultiplayerServiceImpl();
});

final availableRoomsProvider = FutureProvider<List<MultiplayerRoom>>((ref) async {
  final service = ref.read(multiplayerServiceProvider);
  return service.getAvailableRooms();
});

final currentRoomProvider = StreamProvider<MultiplayerRoom?>((ref) {
  final service = ref.read(multiplayerServiceProvider);
  return service.roomStream;
});

class MultiplayerLobbyPage extends ConsumerStatefulWidget {
  const MultiplayerLobbyPage({super.key});

  @override
  ConsumerState<MultiplayerLobbyPage> createState() => _MultiplayerLobbyPageState();
}

class _MultiplayerLobbyPageState extends ConsumerState<MultiplayerLobbyPage> {
  final TextEditingController _roomNameController = TextEditingController();
  String _selectedGameType = 'news_trivia';
  int _maxPlayers = 4;

  final Map<String, String> _gameTypes = {
    'news_trivia': 'Haber Trivia',
    'wordle': 'Kelime Oyunu',
    'memory_game': 'Hafıza Oyunu',
    'quiz': 'Genel Quiz',
  };

  @override
  void dispose() {
    _roomNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentRoomAsync = ref.watch(currentRoomProvider);
    
    return currentRoomAsync.when(
      data: (room) {
        if (room != null) {
          return _buildRoomView(room);
        }
        return _buildLobbyView();
      },
      loading: () => _buildLoadingView(),
      error: (error, stack) => _buildErrorView(error.toString()),
    );
  }

  Widget _buildLobbyView() {
    final availableRoomsAsync = ref.watch(availableRoomsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0F1624),
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topLeft,
            radius: 1.5,
            colors: [Color(0xFF162639), Color(0xFF1a2234), Color(0xFF0f1624)],
            stops: [0.0, 0.55, 1.0],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Çok Oyunculu',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'Arkadaşlarınla yarış!',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Create Room Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _buildCreateRoomCard(),
              ),

              const SizedBox(height: 24),

              // Available Rooms
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Mevcut Odalar',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Expanded(
                        child: availableRoomsAsync.when(
                          data: (rooms) => _buildRoomsList(rooms),
                          loading: () => const Center(
                            child: CircularProgressIndicator(color: Colors.white),
                          ),
                          error: (error, stack) => Center(
                            child: Text(
                              'Odalar yüklenirken hata oluştu',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.7),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCreateRoomCard() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.withOpacity(0.2),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.blue.withOpacity(0.15),
                  Colors.blue.withOpacity(0.05),
                ],
              ),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
                width: 1.5,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.add_circle_outline,
                        color: Colors.blue.shade300,
                        size: 24,
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Yeni Oda Oluştur',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Room Name
                  TextField(
                    controller: _roomNameController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Oda adı',
                      hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                      filled: true,
                      fillColor: Colors.white.withOpacity(0.1),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Game Type Selection
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: _selectedGameType,
                          style: const TextStyle(color: Colors.white),
                          dropdownColor: const Color(0xFF1a2234),
                          decoration: InputDecoration(
                            labelText: 'Oyun Türü',
                            labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
                            filled: true,
                            fillColor: Colors.white.withOpacity(0.1),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          items: _gameTypes.entries.map((entry) {
                            return DropdownMenuItem(
                              value: entry.key,
                              child: Text(entry.value),
                            );
                          }).toList(),
                          onChanged: (value) {
                            if (value != null) {
                              setState(() => _selectedGameType = value);
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 16),
                      
                      // Max Players
                      SizedBox(
                        width: 100,
                        child: DropdownButtonFormField<int>(
                          initialValue: _maxPlayers,
                          style: const TextStyle(color: Colors.white),
                          dropdownColor: const Color(0xFF1a2234),
                          decoration: InputDecoration(
                            labelText: 'Oyuncu',
                            labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
                            filled: true,
                            fillColor: Colors.white.withOpacity(0.1),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          items: [2, 3, 4, 6, 8].map((number) {
                            return DropdownMenuItem(
                              value: number,
                              child: Text('$number'),
                            );
                          }).toList(),
                          onChanged: (value) {
                            if (value != null) {
                              setState(() => _maxPlayers = value);
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 20),
                  
                  // Create Button
                  SizedBox(
                    width: double.infinity,
                    child: GlassmorphicButton(
                      text: 'Oda Oluştur',
                      primaryColor: Colors.blue,
                      icon: Icons.add,
                      onPressed: _createRoom,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoomsList(List<MultiplayerRoom> rooms) {
    if (rooms.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.people_outline,
              size: 64,
              color: Colors.white.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'Henüz aktif oda yok',
              style: TextStyle(
                fontSize: 18,
                color: Colors.white.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'İlk odayı sen oluştur!',
              style: TextStyle(
                fontSize: 14,
                color: Colors.white.withOpacity(0.5),
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: rooms.length,
      itemBuilder: (context, index) {
        final room = rooms[index];
        return _buildRoomCard(room);
      },
    );
  }

  Widget _buildRoomCard(MultiplayerRoom room) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withOpacity(0.15),
                  Colors.white.withOpacity(0.05),
                ],
              ),
              border: Border.all(
                color: Colors.white.withOpacity(0.2),
                width: 1,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              room.name,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _gameTypes[room.gameType] ?? room.gameType,
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.white.withOpacity(0.7),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: room.isFull 
                              ? Colors.red.withOpacity(0.2)
                              : Colors.green.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: room.isFull 
                                ? Colors.red.withOpacity(0.5)
                                : Colors.green.withOpacity(0.5),
                          ),
                        ),
                        child: Text(
                          '${room.players.length}/${room.maxPlayers}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: room.isFull ? Colors.red : Colors.green,
                          ),
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 12),
                  
                  // Players
                  Row(
                    children: [
                      Icon(
                        Icons.people,
                        size: 16,
                        color: Colors.white.withOpacity(0.7),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          room.players.map((p) => p.name).join(', '),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withOpacity(0.7),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      
                      // Join Button
                      GestureDetector(
                        onTap: room.isFull ? null : () => _joinRoom(room.id),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            gradient: room.isFull 
                                ? null
                                : LinearGradient(
                                    colors: [
                                      Colors.blue.withOpacity(0.3),
                                      Colors.blue.withOpacity(0.2),
                                    ],
                                  ),
                            color: room.isFull 
                                ? Colors.grey.withOpacity(0.2)
                                : null,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: room.isFull 
                                  ? Colors.grey.withOpacity(0.5)
                                  : Colors.blue.withOpacity(0.5),
                            ),
                          ),
                          child: Text(
                            room.isFull ? 'Dolu' : 'Katıl',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: room.isFull 
                                  ? Colors.grey
                                  : Colors.blue,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoomView(MultiplayerRoom room) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1624),
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topLeft,
            radius: 1.5,
            colors: [Color(0xFF162639), Color(0xFF1a2234), Color(0xFF0f1624)],
            stops: [0.0, 0.55, 1.0],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: _leaveRoom,
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            room.name,
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            _gameTypes[room.gameType] ?? room.gameType,
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _getStateColor(room.state).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _getStateColor(room.state).withOpacity(0.5),
                        ),
                      ),
                      child: Text(
                        _getStateText(room.state),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: _getStateColor(room.state),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Players List
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Oyuncular (${room.players.length}/${room.maxPlayers})',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Expanded(
                        child: ListView.builder(
                          itemCount: room.players.length,
                          itemBuilder: (context, index) {
                            final player = room.players[index];
                            return _buildPlayerCard(player, room.hostId == player.id);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Bottom Actions
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Expanded(
                      child: GlassmorphicButton(
                        text: 'Hazırım',
                        primaryColor: Colors.green,
                        icon: Icons.check,
                        onPressed: _setReady,
                      ),
                    ),
                    if (room.canStart) ...[
                      const SizedBox(width: 16),
                      Expanded(
                        child: GlassmorphicButton(
                          text: 'Başlat',
                          primaryColor: Colors.orange,
                          icon: Icons.play_arrow,
                          onPressed: _startGame,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlayerCard(MultiplayerPlayer player, bool isHost) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withOpacity(0.1),
            Colors.white.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: Colors.blue.withOpacity(0.3),
            child: Text(
              player.name[0].toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      player.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    if (isHost) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.amber.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'HOST',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.amber,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                Text(
                  _getPlayerStatusText(player.status),
                  style: TextStyle(
                    fontSize: 12,
                    color: _getPlayerStatusColor(player.status),
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: _getPlayerStatusColor(player.status),
              shape: BoxShape.circle,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingView() {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1624),
      body: const Center(
        child: CircularProgressIndicator(color: Colors.white),
      ),
    );
  }

  Widget _buildErrorView(String error) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1624),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 64,
            ),
            const SizedBox(height: 16),
            Text(
              'Bağlantı Hatası',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: TextStyle(
                fontSize: 14,
                color: Colors.white.withOpacity(0.7),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            GlassmorphicButton(
              text: 'Tekrar Dene',
              primaryColor: Colors.blue,
              onPressed: () {
                ref.invalidate(availableRoomsProvider);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _createRoom() async {
    if (_roomNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lütfen oda adı girin')),
      );
      return;
    }

    try {
      final service = ref.read(multiplayerServiceProvider);
      await service.createRoom(
        name: _roomNameController.text.trim(),
        gameType: _selectedGameType,
        maxPlayers: _maxPlayers,
      );
      _roomNameController.clear();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Oda oluşturulamadı: $e')),
      );
    }
  }

  Future<void> _joinRoom(String roomId) async {
    try {
      final service = ref.read(multiplayerServiceProvider);
      await service.joinRoom(roomId);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Odaya katılamadı: $e')),
      );
    }
  }

  Future<void> _leaveRoom() async {
    try {
      final service = ref.read(multiplayerServiceProvider);
      await service.leaveRoom();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Odadan çıkılamadı: $e')),
      );
    }
  }

  Future<void> _setReady() async {
    try {
      final service = ref.read(multiplayerServiceProvider);
      await service.setPlayerReady();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Hazır durumu ayarlanamadı: $e')),
      );
    }
  }

  Future<void> _startGame() async {
    try {
      final service = ref.read(multiplayerServiceProvider);
      await service.startGame();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Oyun başlatılamadı: $e')),
      );
    }
  }

  Color _getStateColor(MultiplayerGameState state) {
    switch (state) {
      case MultiplayerGameState.waiting:
        return Colors.orange;
      case MultiplayerGameState.starting:
        return Colors.blue;
      case MultiplayerGameState.inProgress:
        return Colors.green;
      case MultiplayerGameState.finished:
        return Colors.grey;
    }
  }

  String _getStateText(MultiplayerGameState state) {
    switch (state) {
      case MultiplayerGameState.waiting:
        return 'Bekliyor';
      case MultiplayerGameState.starting:
        return 'Başlıyor';
      case MultiplayerGameState.inProgress:
        return 'Oyunda';
      case MultiplayerGameState.finished:
        return 'Bitti';
    }
  }

  Color _getPlayerStatusColor(PlayerStatus status) {
    switch (status) {
      case PlayerStatus.connected:
        return Colors.blue;
      case PlayerStatus.disconnected:
        return Colors.red;
      case PlayerStatus.ready:
        return Colors.green;
      case PlayerStatus.playing:
        return Colors.purple;
    }
  }

  String _getPlayerStatusText(PlayerStatus status) {
    switch (status) {
      case PlayerStatus.connected:
        return 'Bağlı';
      case PlayerStatus.disconnected:
        return 'Bağlantı Kesildi';
      case PlayerStatus.ready:
        return 'Hazır';
      case PlayerStatus.playing:
        return 'Oynuyor';
    }
  }
}

