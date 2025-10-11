import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:math';

import '../widgets/game_header.dart';
import '../widgets/game_completion_dialog.dart';
import '../providers/gamification_provider.dart';

class WordPuzzlePage extends ConsumerStatefulWidget {
  const WordPuzzlePage({super.key});

  @override
  ConsumerState<WordPuzzlePage> createState() => _WordPuzzlePageState();
}

class _WordPuzzlePageState extends ConsumerState<WordPuzzlePage> {
  List<String> _words = [];
  final List<String> _foundWords = [];
  List<List<String>> _grid = [];
  String _selectedWord = '';
  final List<Position> _selectedPositions = [];
  int _score = 0;
  bool _gameCompleted = false;
  int _timeElapsed = 0;
  
  static const int _gridSize = 12;
  static const int _maxScore = 1000;

  @override
  void initState() {
    super.initState();
    _initializeGame();
  }

  void _initializeGame() {
    _words = _getNewsWords();
    _foundWords.clear();
    _selectedWord = '';
    _selectedPositions.clear();
    _score = 0;
    _gameCompleted = false;
    _timeElapsed = 0;
    _generateGrid();
  }

  List<String> _getNewsWords() {
    return [
      'HABER', 'GAZETE', 'BASIN', 'MEDYA', 'RÖPORTAJ',
      'MAKALE', 'KÖŞE', 'EDİTÖR', 'MUHABIR', 'YAYINCI',
      'DERGI', 'RADYO', 'TELEVİZYON', 'İNTERNET', 'SOSYAL'
    ];
  }

  void _generateGrid() {
    // Initialize empty grid
    _grid = List.generate(_gridSize, 
        (i) => List.generate(_gridSize, (j) => ''));
    
    // Place words in grid
    final random = Random();
    final shuffledWords = List<String>.from(_words)..shuffle();
    
    for (final word in shuffledWords.take(8)) { // Place 8 words
      bool placed = false;
      int attempts = 0;
      
      while (!placed && attempts < 50) {
        final direction = random.nextInt(4); // 0: horizontal, 1: vertical, 2: diagonal-right, 3: diagonal-left
        final startRow = random.nextInt(_gridSize);
        final startCol = random.nextInt(_gridSize);
        
        if (_canPlaceWord(word, startRow, startCol, direction)) {
          _placeWord(word, startRow, startCol, direction);
          placed = true;
        }
        attempts++;
      }
    }
    
    // Fill empty cells with random letters
    final letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÇĞIİÖŞÜ';
    for (int i = 0; i < _gridSize; i++) {
      for (int j = 0; j < _gridSize; j++) {
        if (_grid[i][j].isEmpty) {
          _grid[i][j] = letters[random.nextInt(letters.length)];
        }
      }
    }
  }

  bool _canPlaceWord(String word, int row, int col, int direction) {
    final directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal-right
      [1, -1],  // diagonal-left
    ];
    
    final dr = directions[direction][0];
    final dc = directions[direction][1];
    
    for (int i = 0; i < word.length; i++) {
      final newRow = row + (dr * i);
      final newCol = col + (dc * i);
      
      if (newRow < 0 || newRow >= _gridSize || 
          newCol < 0 || newCol >= _gridSize) {
        return false;
      }
      
      if (_grid[newRow][newCol].isNotEmpty && 
          _grid[newRow][newCol] != word[i]) {
        return false;
      }
    }
    
    return true;
  }

  void _placeWord(String word, int row, int col, int direction) {
    final directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal-right
      [1, -1],  // diagonal-left
    ];
    
    final dr = directions[direction][0];
    final dc = directions[direction][1];
    
    for (int i = 0; i < word.length; i++) {
      final newRow = row + (dr * i);
      final newCol = col + (dc * i);
      _grid[newRow][newCol] = word[i];
    }
  }

  void _onCellTap(int row, int col) {
    final position = Position(row, col);
    
    if (_selectedPositions.isEmpty) {
      // Start new selection
      _selectedPositions.add(position);
      _selectedWord = _grid[row][col];
    } else {
      // Check if this position continues the line
      if (_isValidNextPosition(position)) {
        _selectedPositions.add(position);
        _selectedWord += _grid[row][col];
      } else {
        // Reset selection
        _selectedPositions.clear();
        _selectedPositions.add(position);
        _selectedWord = _grid[row][col];
      }
    }
    
    setState(() {});
  }

  bool _isValidNextPosition(Position pos) {
    if (_selectedPositions.isEmpty) return true;
    
    final last = _selectedPositions.last;
    final first = _selectedPositions.first;
    
    if (_selectedPositions.length == 1) {
      // Any adjacent position is valid for second position
      final rowDiff = (pos.row - last.row).abs();
      final colDiff = (pos.col - last.col).abs();
      return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff == 0 && colDiff == 0);
    }
    
    // Check if position continues the established direction
    final dirRow = last.row - first.row;
    final dirCol = last.col - first.col;
    final length = _selectedPositions.length - 1;
    
    final expectedRow = first.row + ((dirRow ~/ length) * _selectedPositions.length);
    final expectedCol = first.col + ((dirCol ~/ length) * _selectedPositions.length);
    
    return pos.row == expectedRow && pos.col == expectedCol;
  }

  void _onSelectionEnd() {
    if (_selectedWord.length >= 3 && _words.contains(_selectedWord)) {
      if (!_foundWords.contains(_selectedWord)) {
        setState(() {
          _foundWords.add(_selectedWord);
          _score += _selectedWord.length * 10;
        });
        
        if (_foundWords.length == _words.take(8).length) {
          _completeGame();
        }
      }
    }
    
    setState(() {
      _selectedPositions.clear();
      _selectedWord = '';
    });
  }

  void _completeGame() {
    setState(() {
      _gameCompleted = true;
    });

    // Award XP and update gamification
    final gamificationService = ref.read(gamificationServiceProvider);
    gamificationService.completeGame('word-puzzle', _score, _maxScore);
    
    _showCompletionDialog();
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => GameCompletionDialog(
        title: 'Harika!',
        gameTitle: 'Kelime Bulmaca',
        score: _score,
        maxScore: _maxScore,
        timeElapsed: Duration(seconds: _timeElapsed),
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
                title: 'Kelime Bulmaca',
                subtitle: 'Haber kelimelerini bul',
                score: _score,
                timeElapsed: Duration(seconds: _timeElapsed),
                onBack: () => Navigator.of(context).pop(),
              ),
              
              // Found Words
              Container(
                height: 60,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _words.take(8).length,
                  itemBuilder: (context, index) {
                    final word = _words[index];
                    final isFound = _foundWords.contains(word);
                    
                    return Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isFound 
                            ? Colors.green.withOpacity(0.2)
                            : Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isFound 
                              ? Colors.green.withOpacity(0.5)
                              : Colors.white.withOpacity(0.2),
                        ),
                      ),
                      child: Text(
                        word,
                        style: TextStyle(
                          color: isFound ? Colors.green : Colors.white.withOpacity(0.7),
                          fontWeight: isFound ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    );
                  },
                ),
              ),
              
              const SizedBox(height: 20),
              
              // Game Grid
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: GestureDetector(
                    onPanEnd: (_) => _onSelectionEnd(),
                    child: GridView.builder(
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: _gridSize,
                        crossAxisSpacing: 2,
                        mainAxisSpacing: 2,
                      ),
                      itemCount: _gridSize * _gridSize,
                      itemBuilder: (context, index) {
                        final row = index ~/ _gridSize;
                        final col = index % _gridSize;
                        final position = Position(row, col);
                        final isSelected = _selectedPositions.contains(position);
                        
                        return GestureDetector(
                          onTap: () => _onCellTap(row, col),
                          child: Container(
                            decoration: BoxDecoration(
                              color: isSelected 
                                  ? Colors.blue.withOpacity(0.5)
                                  : Colors.white.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.2),
                              ),
                            ),
                            child: Center(
                              child: Text(
                                _grid[row][col],
                                style: TextStyle(
                                  color: isSelected ? Colors.white : Colors.white.withOpacity(0.8),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),
              
              // Current Selection
              if (_selectedWord.isNotEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.blue.withOpacity(0.3)),
                  ),
                  child: Text(
                    'Seçilen: $_selectedWord',
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
    );
  }
}

class Position {
  final int row;
  final int col;

  Position(this.row, this.col);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Position && runtimeType == other.runtimeType &&
          row == other.row && col == other.col;

  @override
  int get hashCode => row.hashCode ^ col.hashCode;
}
