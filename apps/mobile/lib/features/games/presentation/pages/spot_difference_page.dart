import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:math' as math;

import '../widgets/game_header.dart';
import '../widgets/game_completion_dialog.dart';
import '../providers/gamification_provider.dart';

class SpotDifferencePage extends ConsumerStatefulWidget {
  const SpotDifferencePage({super.key});

  @override
  ConsumerState<SpotDifferencePage> createState() => _SpotDifferencePageState();
}

class _SpotDifferencePageState extends ConsumerState<SpotDifferencePage> {
  List<DifferencePoint> _differences = [];
  List<int> _foundDifferences = [];
  int _score = 0;
  bool _gameCompleted = false;
  int _timeElapsed = 0;
  int _wrongTaps = 0;
  
  static const int _maxScore = 1000;
  static const int _totalDifferences = 5;

  @override
  void initState() {
    super.initState();
    _initializeGame();
  }

  void _initializeGame() {
    _differences = _generateDifferences();
    _foundDifferences.clear();
    _score = 0;
    _gameCompleted = false;
    _timeElapsed = 0;
    _wrongTaps = 0;
  }

  List<DifferencePoint> _generateDifferences() {
    final random = math.Random();
    List<DifferencePoint> differences = [];
    
    // Generate random difference points
    for (int i = 0; i < _totalDifferences; i++) {
      differences.add(DifferencePoint(
        id: i,
        x: random.nextDouble() * 0.8 + 0.1, // Keep within bounds
        y: random.nextDouble() * 0.8 + 0.1,
        radius: 30.0,
      ));
    }
    
    return differences;
  }

  void _onImageTap(Offset localPosition, Size imageSize) {
    // Convert tap position to relative coordinates
    final relativeX = localPosition.dx / imageSize.width;
    final relativeY = localPosition.dy / imageSize.height;
    
    // Check if tap is near any unfound difference
    bool foundDifference = false;
    
    for (int i = 0; i < _differences.length; i++) {
      if (_foundDifferences.contains(i)) continue;
      
      final difference = _differences[i];
      final distance = sqrt(
        pow((relativeX - difference.x) * imageSize.width, 2) +
        pow((relativeY - difference.y) * imageSize.height, 2)
      );
      
      if (distance <= difference.radius) {
        setState(() {
          _foundDifferences.add(i);
          _score += 100 - (_wrongTaps * 10); // Score decreases with wrong taps
          foundDifference = true;
        });
        
        if (_foundDifferences.length == _totalDifferences) {
          _completeGame();
        }
        break;
      }
    }
    
    if (!foundDifference) {
      setState(() {
        _wrongTaps++;
      });
      
      // Show wrong tap feedback
      _showWrongTapFeedback(localPosition);
    }
  }

  void _showWrongTapFeedback(Offset position) {
    // You could add a red circle animation here
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Yanlış yer! Tekrar dene.'),
        duration: Duration(milliseconds: 1000),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _completeGame() {
    // Calculate final score
    final timeBonus = _timeElapsed < 120 ? 200 - _timeElapsed : 0;
    final finalScore = (_score + timeBonus).clamp(0, _maxScore);
    
    setState(() {
      _gameCompleted = true;
      _score = finalScore;
    });

    // Award XP and update gamification
    final gamificationService = ref.read(gamificationServiceProvider);
    gamificationService.completeGame('spot-the-difference', _score, _maxScore);
    
    _showCompletionDialog();
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => GameCompletionDialog(
        gameTitle: 'Farkı Bul',
        score: _score,
        maxScore: _maxScore,
        timeElapsed: Duration(seconds: _timeElapsed),
        onPlayAgain: () {
          Navigator.of(context).pop();
          _initializeGame();
          setState(() {});
        },
        onBackToGames: () {
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
                title: 'Farkı Bul',
                subtitle: 'İki resim arasındaki farkları keşfet',
                score: _score,
                timeElapsed: Duration(seconds: _timeElapsed),
                onBack: () => Navigator.of(context).pop(),
              ),
              
              const SizedBox(height: 20),
              
              // Progress Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Bulunan Farklar: ${_foundDifferences.length}/$_totalDifferences',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Yanlış: $_wrongTaps',
                          style: TextStyle(
                            color: _wrongTaps > 3 ? Colors.red : Colors.white.withOpacity(0.7),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: _foundDifferences.length / _totalDifferences,
                      backgroundColor: Colors.white.withOpacity(0.2),
                      valueColor: const AlwaysStoppedAnimation<Color>(Colors.green),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 20),
              
              // Images
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      // First Image
                      _ImageWidget(
                        imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
                        title: 'Resim 1',
                        differences: _differences,
                        foundDifferences: _foundDifferences,
                        onTap: _onImageTap,
                        showDifferences: true,
                      ),
                      
                      const SizedBox(height: 20),
                      
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Row(
                          children: [
                            Expanded(
                              child: Container(
                                height: 2,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      Colors.transparent,
                                      Colors.white.withOpacity(0.5),
                                      Colors.transparent,
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Text(
                                'VS',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.7),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Container(
                                height: 2,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      Colors.transparent,
                                      Colors.white.withOpacity(0.5),
                                      Colors.transparent,
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 20),
                      
                      // Second Image
                      _ImageWidget(
                        imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
                        title: 'Resim 2',
                        differences: _differences,
                        foundDifferences: _foundDifferences,
                        onTap: _onImageTap,
                        showDifferences: false, // This would be the modified image
                      ),
                      
                      const SizedBox(height: 20),
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
}

class _ImageWidget extends StatelessWidget {
  final String imageUrl;
  final String title;
  final List<DifferencePoint> differences;
  final List<int> foundDifferences;
  final Function(Offset, Size) onTap;
  final bool showDifferences;

  const _ImageWidget({
    required this.imageUrl,
    required this.title,
    required this.differences,
    required this.foundDifferences,
    required this.onTap,
    required this.showDifferences,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.2)),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: GestureDetector(
                onTapDown: (details) {
                  final RenderBox renderBox = context.findRenderObject() as RenderBox;
                  final localPosition = renderBox.globalToLocal(details.globalPosition);
                  final imageSize = Size(
                    MediaQuery.of(context).size.width - 40,
                    (MediaQuery.of(context).size.width - 40) * 0.75, // 4:3 aspect ratio
                  );
                  onTap(localPosition, imageSize);
                },
                child: Stack(
                  children: [
                    Image.network(
                      imageUrl,
                      width: double.infinity,
                      height: (MediaQuery.of(context).size.width - 40) * 0.75,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          width: double.infinity,
                          height: (MediaQuery.of(context).size.width - 40) * 0.75,
                          color: Colors.grey.withOpacity(0.3),
                          child: const Center(
                            child: Icon(
                              Icons.image,
                              color: Colors.white,
                              size: 50,
                            ),
                          ),
                        );
                      },
                    ),
                    
                    // Difference markers
                    ...differences.asMap().entries.map((entry) {
                      final index = entry.key;
                      final difference = entry.value;
                      final isFound = foundDifferences.contains(index);
                      
                      if (!isFound) return const SizedBox.shrink();
                      
                      return Positioned(
                        left: difference.x * (MediaQuery.of(context).size.width - 40) - difference.radius / 2,
                        top: difference.y * ((MediaQuery.of(context).size.width - 40) * 0.75) - difference.radius / 2,
                        child: Container(
                          width: difference.radius,
                          height: difference.radius,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Colors.green,
                              width: 3,
                            ),
                            color: Colors.green.withOpacity(0.3),
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.check,
                              color: Colors.green,
                              size: 16,
                            ),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class DifferencePoint {
  final int id;
  final double x; // Relative position (0.0 to 1.0)
  final double y; // Relative position (0.0 to 1.0)
  final double radius;

  DifferencePoint({
    required this.id,
    required this.x,
    required this.y,
    required this.radius,
  });
}

double sqrt(num x) => math.sqrt(x);
double pow(num x, num exponent) => math.pow(x, exponent).toDouble();
