import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import 'dart:math';

import '../widgets/game_completion_dialog.dart';
import '../providers/gamification_provider.dart';

class FlappyBirdPage extends ConsumerStatefulWidget {
  const FlappyBirdPage({super.key});

  @override
  ConsumerState<FlappyBirdPage> createState() => _FlappyBirdPageState();
}

class _FlappyBirdPageState extends ConsumerState<FlappyBirdPage>
    with TickerProviderStateMixin {
  late AnimationController _birdController;
  late AnimationController _pipeController;
  late Animation<double> _birdAnimation;
  
  Timer? _gameTimer;
  double _birdY = 0.5;
  double _birdVelocity = 0;
  final List<Pipe> _pipes = [];
  int _score = 0;
  bool _gameStarted = false;
  bool _gameOver = false;
  int _timeElapsed = 0;
  
  static const double _gravity = 0.003;
  static const double _jumpStrength = -0.08;
  static const double _pipeWidth = 0.15;
  static const double _pipeGap = 0.3;
  static const int _maxScore = 1000;

  @override
  void initState() {
    super.initState();
    _birdController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _pipeController = AnimationController(
      duration: const Duration(milliseconds: 3000),
      vsync: this,
    );
    
    _birdAnimation = Tween<double>(begin: 0, end: 1).animate(_birdController);
    _initializeGame();
  }

  @override
  void dispose() {
    _birdController.dispose();
    _pipeController.dispose();
    _gameTimer?.cancel();
    super.dispose();
  }

  void _initializeGame() {
    _birdY = 0.5;
    _birdVelocity = 0;
    _pipes.clear();
    _score = 0;
    _gameStarted = false;
    _gameOver = false;
    _timeElapsed = 0;
    _gameTimer?.cancel();
  }

  void _startGame() {
    setState(() {
      _gameStarted = true;
    });
    
    _gameTimer = Timer.periodic(const Duration(milliseconds: 16), (timer) {
      if (!_gameOver) {
        _updateGame();
      }
    });
    
    // Add pipes periodically
    Timer.periodic(const Duration(milliseconds: 2000), (timer) {
      if (!_gameOver && _gameStarted) {
        _addPipe();
      } else {
        timer.cancel();
      }
    });
  }

  void _updateGame() {
    setState(() {
      // Update bird physics
      _birdVelocity += _gravity;
      _birdY += _birdVelocity;
      
      // Update pipes
      for (int i = _pipes.length - 1; i >= 0; i--) {
        _pipes[i].x -= 0.01;
        
        // Remove pipes that are off screen
        if (_pipes[i].x < -_pipeWidth) {
          _pipes.removeAt(i);
          _score += 10;
        }
      }
      
      // Check collisions
      _checkCollisions();
      
      _timeElapsed++;
    });
  }

  void _addPipe() {
    final random = Random();
    final gapY = random.nextDouble() * 0.4 + 0.2; // Gap between 0.2 and 0.6
    
    _pipes.add(Pipe(
      x: 1.0,
      gapY: gapY,
      gapHeight: _pipeGap,
    ));
  }

  void _jump() {
    if (!_gameStarted) {
      _startGame();
    }
    
    if (!_gameOver) {
      setState(() {
        _birdVelocity = _jumpStrength;
      });
      
      _birdController.forward().then((_) {
        _birdController.reverse();
      });
    }
  }

  void _checkCollisions() {
    // Check ground and ceiling collision
    if (_birdY > 1.0 || _birdY < 0.0) {
      _endGame();
      return;
    }
    
    // Check pipe collision
    for (final pipe in _pipes) {
      if (pipe.x < 0.6 && pipe.x > 0.4) { // Bird is at x = 0.5
        if (_birdY < pipe.gapY || _birdY > pipe.gapY + pipe.gapHeight) {
          _endGame();
          return;
        }
      }
    }
  }

  void _endGame() {
    setState(() {
      _gameOver = true;
    });
    
    _gameTimer?.cancel();
    
    // Calculate final score
    final finalScore = (_score * 2).clamp(0, _maxScore);
    
    // Award XP and update gamification
    final gamificationService = ref.read(gamificationServiceProvider);
    gamificationService.completeGame('flappy-aa-bird', finalScore, _maxScore);
    
    _showGameOverDialog();
  }

  void _showGameOverDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => GameCompletionDialog(
        title: 'Oyun Bitti!',
        gameTitle: 'Flappy AA Bird',
        score: _score * 2,
        maxScore: _maxScore,
        timeElapsed: Duration(milliseconds: _timeElapsed * 16),
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
      backgroundColor: const Color(0xFF87CEEB), // Sky blue
      body: GestureDetector(
        onTap: _jump,
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF87CEEB),
                Color(0xFF98D8E8),
              ],
            ),
          ),
          child: SafeArea(
            child: Stack(
              children: [
                // Game Header
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () => Navigator.of(context).pop(),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.arrow_back,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'Skor: $_score',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Bird
                AnimatedBuilder(
                  animation: _birdAnimation,
                  builder: (context, child) {
                    return Positioned(
                      left: MediaQuery.of(context).size.width * 0.4,
                      top: MediaQuery.of(context).size.height * _birdY,
                      child: Transform.rotate(
                        angle: _birdVelocity * 5,
                        child: Container(
                          width: 40,
                          height: 40,
                          decoration: const BoxDecoration(
                            color: Colors.yellow,
                            shape: BoxShape.circle,
                          ),
                          child: const Center(
                            child: Text(
                              '🐦',
                              style: TextStyle(fontSize: 24),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
                
                // Pipes
                ..._pipes.map((pipe) => _PipeWidget(pipe: pipe)),
                
                // Ground
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 50,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF228B22), Color(0xFF32CD32)],
                      ),
                    ),
                  ),
                ),
                
                // Start Instructions
                if (!_gameStarted)
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Flappy AA Bird',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                            ),
                          ),
                          SizedBox(height: 12),
                          Text(
                            'Ekrana dokunarak kuşu uçurun\nBoruları geçerek puan kazanın!',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.black87,
                            ),
                          ),
                          SizedBox(height: 16),
                          Text(
                            'Başlamak için dokunun',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.blue,
                              fontWeight: FontWeight.bold,
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
      ),
    );
  }
}

class _PipeWidget extends StatelessWidget {
  final Pipe pipe;
  static const double _pipeWidth = 0.15;

  const _PipeWidget({required this.pipe});

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;
    
    return Stack(
      children: [
        // Top pipe
        Positioned(
          left: screenWidth * pipe.x,
          top: 0,
          child: Container(
            width: screenWidth * _pipeWidth,
            height: screenHeight * pipe.gapY,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF228B22), Color(0xFF32CD32)],
              ),
            ),
          ),
        ),
        
        // Bottom pipe
        Positioned(
          left: screenWidth * pipe.x,
          top: screenHeight * (pipe.gapY + pipe.gapHeight),
          child: Container(
            width: screenWidth * _pipeWidth,
            height: screenHeight * (1 - pipe.gapY - pipe.gapHeight),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF228B22), Color(0xFF32CD32)],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class Pipe {
  double x;
  final double gapY;
  final double gapHeight;

  Pipe({
    required this.x,
    required this.gapY,
    required this.gapHeight,
  });
}
