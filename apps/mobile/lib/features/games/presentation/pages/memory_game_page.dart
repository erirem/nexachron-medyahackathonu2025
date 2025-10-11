import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:math';
import 'dart:async';

import '../../domain/entities/game_types.dart';
import '../providers/gamification_provider.dart';
import '../widgets/game_header.dart';
import '../widgets/game_completion_dialog.dart';

class MemoryGamePage extends ConsumerStatefulWidget {
  const MemoryGamePage({super.key});

  @override
  ConsumerState<MemoryGamePage> createState() => _MemoryGamePageState();
}

class _MemoryGamePageState extends ConsumerState<MemoryGamePage>
    with TickerProviderStateMixin {
  late AnimationController _flipController;
  late AnimationController _matchController;
  
  List<MemoryCard> _cards = [];
  final List<int> _flippedIndices = [];
  int _matches = 0;
  int _moves = 0;
  int _score = 0;
  bool _gameStarted = false;
  bool _gameCompleted = false;
  Timer? _gameTimer;
  int _timeElapsed = 0;
  
  // Game settings
  static const int _gridSize = 4; // 4x4 grid = 16 cards (8 pairs)
  static const int _maxScore = 1000;
  static const int _timeBonus = 500;
  static const int _movesPenalty = 10;

  @override
  void initState() {
    super.initState();
    _flipController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _matchController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _initializeGame();
  }

  @override
  void dispose() {
    _flipController.dispose();
    _matchController.dispose();
    _gameTimer?.cancel();
    super.dispose();
  }

  void _initializeGame() {
    _cards = _generateCards();
    _flippedIndices.clear();
    _matches = 0;
    _moves = 0;
    _score = 0;
    _gameStarted = false;
    _gameCompleted = false;
    _timeElapsed = 0;
    _gameTimer?.cancel();
  }

  List<MemoryCard> _generateCards() {
    // Sample news images - in real app, these would come from API
    final List<String> newsImages = [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=200&h=200&fit=crop',
    ];

    List<MemoryCard> cards = [];
    
    // Create pairs
    for (int i = 0; i < (_gridSize * _gridSize) ~/ 2; i++) {
      final imageUrl = newsImages[i % newsImages.length];
      cards.add(MemoryCard(id: i, imageUrl: imageUrl));
      cards.add(MemoryCard(id: i, imageUrl: imageUrl));
    }
    
    // Shuffle cards
    cards.shuffle(Random());
    
    return cards;
  }

  void _startGame() {
    setState(() {
      _gameStarted = true;
    });
    
    _gameTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _timeElapsed++;
      });
    });
  }

  void _onCardTap(int index) {
    if (!_gameStarted) {
      _startGame();
    }

    if (_flippedIndices.length >= 2 || 
        _flippedIndices.contains(index) || 
        _cards[index].isMatched) {
      return;
    }

    setState(() {
      _flippedIndices.add(index);
      _cards[index].isFlipped = true;
    });

    _flipController.forward();

    if (_flippedIndices.length == 2) {
      _moves++;
      _checkForMatch();
    }
  }

  void _checkForMatch() {
    final firstCard = _cards[_flippedIndices[0]];
    final secondCard = _cards[_flippedIndices[1]];

    if (firstCard.id == secondCard.id) {
      // Match found!
      _matchController.forward().then((_) {
        setState(() {
          _cards[_flippedIndices[0]].isMatched = true;
          _cards[_flippedIndices[1]].isMatched = true;
          _matches++;
          _score += 100 - (_moves * 2); // Score decreases with more moves
          _flippedIndices.clear();
        });
        
        _matchController.reset();
        
        if (_matches == (_gridSize * _gridSize) ~/ 2) {
          _completeGame();
        }
      });
    } else {
      // No match
      Timer(const Duration(milliseconds: 1000), () {
        setState(() {
          _cards[_flippedIndices[0]].isFlipped = false;
          _cards[_flippedIndices[1]].isFlipped = false;
          _flippedIndices.clear();
        });
        _flipController.reset();
      });
    }
  }

  void _completeGame() {
    _gameTimer?.cancel();
    
    // Calculate final score
    final timeBonus = _timeElapsed < 60 ? _timeBonus - (_timeElapsed * 5) : 0;
    final finalScore = (_score + timeBonus).clamp(0, _maxScore);
    
    setState(() {
      _gameCompleted = true;
      _score = finalScore;
    });

    // Award XP and update gamification
    final gamificationService = ref.read(gamificationServiceProvider);
    gamificationService.completeGame('memory-game', finalScore, _maxScore);
    
    // Show completion dialog
    _showCompletionDialog();
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => GameCompletionDialog(
        title: 'Başarılı!',
        gameTitle: 'Hafıza Oyunu',
        score: _score,
        maxScore: _maxScore,
        timeElapsed: Duration(seconds: _timeElapsed),
        moves: _moves,
        onPlayAgain: () {
          Navigator.of(context).pop();
          _initializeGame();
          setState(() {});
        },
        onExit: () {
          Navigator.of(context).pop();
          Navigator.of(context).pop();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
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
              GameHeader(
                title: 'Hafıza Oyunu',
                subtitle: 'Haber görsellerini eşleştir',
                score: _score,
                timeElapsed: Duration(seconds: _timeElapsed),
                moves: _moves,
                onBack: () => Navigator.of(context).pop(),
              ),
              
              const SizedBox(height: 20),
              
              // Game Stats
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _StatCard(
                      icon: Icons.psychology,
                      label: 'Eşleşme',
                      value: '$_matches/${(_gridSize * _gridSize) ~/ 2}',
                      color: Colors.purple,
                    ),
                    _StatCard(
                      icon: Icons.touch_app,
                      label: 'Hamle',
                      value: _moves.toString(),
                      color: Colors.blue,
                    ),
                    _StatCard(
                      icon: Icons.star,
                      label: 'Skor',
                      value: _score.toString(),
                      color: Colors.yellow,
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 30),
              
              // Game Grid
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: GridView.builder(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: _gridSize,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1,
                    ),
                    itemCount: _cards.length,
                    itemBuilder: (context, index) {
                      return _MemoryCardWidget(
                        card: _cards[index],
                        index: index,
                        onTap: () => _onCardTap(index),
                        flipAnimation: _flipController,
                        matchAnimation: _matchController,
                        isFlipped: _cards[index].isFlipped || _cards[index].isMatched,
                      );
                    },
                  ),
                ),
              ),
              
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }
}

class _MemoryCardWidget extends StatelessWidget {
  final MemoryCard card;
  final int index;
  final VoidCallback onTap;
  final AnimationController flipAnimation;
  final AnimationController matchAnimation;
  final bool isFlipped;

  const _MemoryCardWidget({
    required this.card,
    required this.index,
    required this.onTap,
    required this.flipAnimation,
    required this.matchAnimation,
    required this.isFlipped,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedBuilder(
        animation: Listenable.merge([flipAnimation, matchAnimation]),
        builder: (context, child) {
          final flipValue = flipAnimation.value;
          final matchValue = matchAnimation.value;
          
          return Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001)
              ..rotateY(isFlipped ? 0 : 3.14159)
              ..scale(card.isMatched ? 1.0 + (matchValue * 0.2) : 1.0),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: isFlipped
                    ? _buildCardFront()
                    : _buildCardBack(),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCardFront() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.purple.withOpacity(0.8),
            Colors.purple.withOpacity(0.6),
          ],
        ),
      ),
      child: card.imageUrl.isNotEmpty
          ? Image.network(
              card.imageUrl,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  color: Colors.purple.withOpacity(0.3),
                  child: const Icon(
                    Icons.image,
                    color: Colors.white,
                    size: 40,
                  ),
                );
              },
            )
          : Container(
              color: Colors.purple.withOpacity(0.3),
              child: Center(
                child: Text(
                  '${card.id + 1}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
    );
  }

  Widget _buildCardBack() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF0f6acd),
            const Color(0xFF1a8dff),
          ],
        ),
      ),
      child: const Center(
        child: Icon(
          Icons.psychology,
          color: Colors.white,
          size: 40,
        ),
      ),
    );
  }
}

class MemoryCard {
  final int id;
  final String imageUrl;
  bool isFlipped;
  bool isMatched;

  MemoryCard({
    required this.id,
    required this.imageUrl,
    this.isFlipped = false,
    this.isMatched = false,
  });
}
