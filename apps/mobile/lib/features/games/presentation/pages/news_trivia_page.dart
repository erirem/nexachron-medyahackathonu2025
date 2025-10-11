import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import 'dart:ui';

import '../widgets/game_header.dart';
import '../widgets/game_completion_dialog.dart';
import '../widgets/related_news_card.dart';
import '../providers/gamification_provider.dart';

class NewsTriviaPage extends ConsumerStatefulWidget {
  const NewsTriviaPage({super.key});

  @override
  ConsumerState<NewsTriviaPage> createState() => _NewsTriviaPageState();
}

class _NewsTriviaPageState extends ConsumerState<NewsTriviaPage> {
  List<TriviaQuestion> _questions = [];
  List<NewsArticle> _relatedNews = [];
  int _currentQuestionIndex = 0;
  int _score = 0;
  int _correctAnswers = 0;
  bool _gameCompleted = false;
  bool _questionAnswered = false;
  int? _selectedAnswerIndex;
  Timer? _gameTimer;
  int _timeElapsed = 0;
  int _questionTimeLeft = 15;
  bool _showNewsSection = false;
  
  static const int _maxScore = 1000;
  static const int _questionTimeLimit = 15;

  @override
  void initState() {
    super.initState();
    _initializeGame();
  }

  @override
  void dispose() {
    _gameTimer?.cancel();
    super.dispose();
  }

  void _initializeGame() {
    _questions = _generateQuestions();
    _relatedNews = _generateRelatedNews();
    _currentQuestionIndex = 0;
    _score = 0;
    _correctAnswers = 0;
    _gameCompleted = false;
    _questionAnswered = false;
    _selectedAnswerIndex = null;
    _timeElapsed = 0;
    _questionTimeLeft = _questionTimeLimit;
    _showNewsSection = false;
    _startQuestionTimer();
  }

  List<TriviaQuestion> _generateQuestions() {
    return [
      TriviaQuestion(
        question: 'Türkiye\'nin başkenti neresidir?',
        options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'],
        correctAnswer: 1,
        category: 'Genel',
      ),
      TriviaQuestion(
        question: 'Hangi gezegen Güneş\'e en yakındır?',
        options: ['Venüs', 'Mars', 'Merkür', 'Dünya'],
        correctAnswer: 2,
        category: 'Genel',
      ),
      TriviaQuestion(
        question: 'İlk bilgisayar ne zaman icat edildi?',
        options: ['1940\'lar', '1950\'ler', '1930\'lar', '1960\'lar'],
        correctAnswer: 0,
        category: 'Teknoloji',
      ),
      TriviaQuestion(
        question: 'Osmanlı İmparatorluğu ne zaman kuruldu?',
        options: ['1299', '1453', '1326', '1389'],
        correctAnswer: 0,
        category: 'Tarih',
      ),
      TriviaQuestion(
        question: 'Galatasaray hangi yıl UEFA Kupası kazandı?',
        options: ['1998', '2000', '2002', '2004'],
        correctAnswer: 1,
        category: 'Spor',
      ),
    ];
  }

  List<NewsArticle> _generateRelatedNews() {
    return [
      const NewsArticle(
        id: '1',
        title: 'Türkiye Ekonomisinde Son Gelişmeler',
        summary: 'Ekonomi alanında yaşanan önemli değişiklikler ve etkileri...',
        category: 'Ekonomi',
        publishedAt: '2 saat önce',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
      ),
      const NewsArticle(
        id: '2',
        title: 'Teknoloji Sektöründe Yeni Atılımlar',
        summary: 'Yerli teknoloji şirketlerinin başarıları ve gelecek planları...',
        category: 'Teknoloji',
        publishedAt: '4 saat önce',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
      ),
      const NewsArticle(
        id: '3',
        title: 'Spor Dünyasından Haberler',
        summary: 'Milli takımların performansı ve yaklaşan müsabakalar...',
        category: 'Spor',
        publishedAt: '6 saat önce',
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
      ),
    ];
  }

  void _startQuestionTimer() {
    _gameTimer?.cancel();
    _questionTimeLeft = _questionTimeLimit;
    
    _gameTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_questionTimeLeft > 0) {
          _questionTimeLeft--;
          _timeElapsed++;
        } else {
          _timeUp();
        }
      });
    });
  }

  void _timeUp() {
    if (!_questionAnswered) {
      _answerQuestion(-1); // Time up, no answer selected
    }
  }

  void _answerQuestion(int selectedIndex) {
    if (_questionAnswered) return;
    
    setState(() {
      _questionAnswered = true;
      _selectedAnswerIndex = selectedIndex;
      _showNewsSection = true; // Show news section after answering
    });
    
    _gameTimer?.cancel();
    
    final currentQuestion = _questions[_currentQuestionIndex];
    final isCorrect = selectedIndex == currentQuestion.correctAnswer;
    
    if (isCorrect) {
      _correctAnswers++;
      // Score based on time left
      final timeBonus = (_questionTimeLeft * 10).clamp(0, 100);
      _score += 100 + timeBonus;
    }
    
    // Wait 3 seconds then move to next question (longer to allow reading news)
    Timer(const Duration(seconds: 3), () {
      _nextQuestion();
    });
  }

  void _nextQuestion() {
    if (_currentQuestionIndex < _questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
        _questionAnswered = false;
        _selectedAnswerIndex = null;
        _showNewsSection = false; // Hide news section for new question
      });
      _startQuestionTimer();
    } else {
      _completeGame();
    }
  }

  void _completeGame() {
    _gameTimer?.cancel();
    
    setState(() {
      _gameCompleted = true;
    });

    // Award XP
    final xpEarned = (_score * 0.1).round();
    ref.read(userProfileProvider.notifier).addXP('news_trivia_completed', xpEarned);

    // Show completion dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => GameCompletionDialog(
        title: 'Haber Trivia Tamamlandı!',
        score: _score,
        maxScore: _maxScore,
        correctAnswers: _correctAnswers,
        totalQuestions: _questions.length,
        xpEarned: xpEarned,
        timeElapsed: Duration(seconds: _timeElapsed),
        onPlayAgain: () {
          Navigator.of(context).pop();
          _initializeGame();
        },
        onExit: () {
          Navigator.of(context).pop();
          Navigator.of(context).pop();
        },
      ),
    );
  }

  String _getScoreMessage() {
    final percentage = (_correctAnswers / _questions.length * 100).round();
    if (percentage >= 80) {
      return 'Mükemmel! 🏆';
    } else if (percentage >= 60) {
      return 'İyi iş! 👏';
    } else if (percentage >= 40) {
      return 'Fena değil! 👍';
    } else {
      return 'Daha çok pratik lazım! 💪';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_gameCompleted) {
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
          child: const Center(
            child: CircularProgressIndicator(color: Colors.white),
          ),
        ),
      );
    }

    final currentQuestion = _questions[_currentQuestionIndex];

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
                title: 'Haber Trivia',
                subtitle: 'Güncel sorulara cevap ver',
                score: _score,
                timeElapsed: Duration(seconds: _timeElapsed),
                onBack: () => Navigator.of(context).pop(),
              ),
              
              const SizedBox(height: 20),
              
              // Progress and Timer
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Soru ${_currentQuestionIndex + 1}/${_questions.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: _questionTimeLeft <= 5 
                                ? Colors.red.withOpacity(0.2)
                                : Colors.blue.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _questionTimeLeft <= 5 
                                  ? Colors.red.withOpacity(0.5)
                                  : Colors.blue.withOpacity(0.5),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.timer,
                                size: 16,
                                color: _questionTimeLeft <= 5 
                                    ? Colors.red
                                    : Colors.blue,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '$_questionTimeLeft',
                                style: TextStyle(
                                  color: _questionTimeLeft <= 5 
                                      ? Colors.red
                                      : Colors.blue,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    LinearProgressIndicator(
                      value: (_currentQuestionIndex + 1) / _questions.length,
                      backgroundColor: Colors.white.withOpacity(0.2),
                      valueColor: const AlwaysStoppedAnimation<Color>(Colors.blue),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 30),
              
              // Question Card
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      // Question Container with Glassmorphism
                      Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.blue.withOpacity(0.2),
                              blurRadius: 20,
                              spreadRadius: 0,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(24),
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
                                  width: 1.5,
                                ),
                                borderRadius: BorderRadius.circular(24),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(24),
                                child: Column(
                                  children: [
                                    // Category badge
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 16,
                                        vertical: 8,
                                      ),
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            _getCategoryColor(currentQuestion.category).withOpacity(0.3),
                                            _getCategoryColor(currentQuestion.category).withOpacity(0.2),
                                          ],
                                        ),
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(
                                          color: _getCategoryColor(currentQuestion.category).withOpacity(0.5),
                                          width: 1,
                                        ),
                                      ),
                                      child: Text(
                                        currentQuestion.category,
                                        style: TextStyle(
                                          color: _getCategoryColor(currentQuestion.category),
                                          fontWeight: FontWeight.w600,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 20),
                                    
                                    // Question text
                                    Text(
                                      currentQuestion.question,
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                        height: 1.4,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                    const SizedBox(height: 30),
                                    
                                    // Answer options
                                    ...currentQuestion.options.asMap().entries.map((entry) {
                                      final index = entry.key;
                                      final option = entry.value;
                                      final isSelected = _selectedAnswerIndex == index;
                                      final isCorrect = index == currentQuestion.correctAnswer;
                                      final showResult = _questionAnswered;
                                      
                                      Color backgroundColor;
                                      Color borderColor;
                                      Color textColor = Colors.white;
                                      
                                      if (showResult) {
                                        if (isCorrect) {
                                          backgroundColor = Colors.green.withOpacity(0.3);
                                          borderColor = Colors.green;
                                        } else if (isSelected) {
                                          backgroundColor = Colors.red.withOpacity(0.3);
                                          borderColor = Colors.red;
                                        } else {
                                          backgroundColor = Colors.white.withOpacity(0.1);
                                          borderColor = Colors.white.withOpacity(0.3);
                                          textColor = Colors.white.withOpacity(0.6);
                                        }
                                      } else {
                                        backgroundColor = Colors.white.withOpacity(0.1);
                                        borderColor = Colors.white.withOpacity(0.3);
                                      }
                                      
                                      return Container(
                                        width: double.infinity,
                                        margin: const EdgeInsets.only(bottom: 12),
                                        child: GestureDetector(
                                          onTap: showResult ? null : () => _answerQuestion(index),
                                          child: AnimatedContainer(
                                            duration: const Duration(milliseconds: 300),
                                            decoration: BoxDecoration(
                                              gradient: LinearGradient(
                                                colors: [
                                                  backgroundColor,
                                                  backgroundColor.withOpacity(0.5),
                                                ],
                                              ),
                                              borderRadius: BorderRadius.circular(16),
                                              border: Border.all(
                                                color: borderColor,
                                                width: 2,
                                              ),
                                              boxShadow: showResult && isCorrect ? [
                                                BoxShadow(
                                                  color: Colors.green.withOpacity(0.3),
                                                  blurRadius: 8,
                                                  offset: const Offset(0, 4),
                                                ),
                                              ] : null,
                                            ),
                                            child: Padding(
                                              padding: const EdgeInsets.symmetric(
                                                horizontal: 20,
                                                vertical: 16,
                                              ),
                                              child: Row(
                                                children: [
                                                  Container(
                                                    width: 24,
                                                    height: 24,
                                                    decoration: BoxDecoration(
                                                      shape: BoxShape.circle,
                                                      border: Border.all(
                                                        color: textColor,
                                                        width: 2,
                                                      ),
                                                    ),
                                                    child: Center(
                                                      child: Text(
                                                        String.fromCharCode(65 + index), // A, B, C, D
                                                        style: TextStyle(
                                                          color: textColor,
                                                          fontWeight: FontWeight.bold,
                                                          fontSize: 12,
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                  const SizedBox(width: 16),
                                                  Expanded(
                                                    child: Text(
                                                      option,
                                                      style: TextStyle(
                                                        fontSize: 16,
                                                        fontWeight: FontWeight.w500,
                                                        color: textColor,
                                                      ),
                                                    ),
                                                  ),
                                                  if (showResult && isCorrect)
                                                    const Icon(
                                                      Icons.check_circle,
                                                      color: Colors.green,
                                                      size: 24,
                                                    ),
                                                  if (showResult && isSelected && !isCorrect)
                                                    const Icon(
                                                      Icons.cancel,
                                                      color: Colors.red,
                                                      size: 24,
                                                    ),
                                                ],
                                              ),
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
                        ),
                      ),
                      
                      // Related News Section
                      if (_showNewsSection) ...[
                        const SizedBox(height: 32),
                        Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.purple.withOpacity(0.2),
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
                                      Colors.purple.withOpacity(0.15),
                                      Colors.purple.withOpacity(0.05),
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
                                            Icons.newspaper,
                                            color: Colors.purple.shade300,
                                            size: 24,
                                          ),
                                          const SizedBox(width: 12),
                                          const Text(
                                            'İlgili Haberler',
                                            style: TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 16),
                                      ..._relatedNews.take(2).map((article) {
                                        return RelatedNewsCard(
                                          article: article,
                                          onTap: () => _navigateToNews(article),
                                        );
                                      }),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                      
                      const SizedBox(height: 32),
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

  Color _getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'genel':
        return Colors.blue;
      case 'teknoloji':
        return Colors.cyan;
      case 'spor':
        return Colors.orange;
      case 'tarih':
        return Colors.purple;
      case 'coğrafya':
        return Colors.green;
      default:
        return Colors.blue;
    }
  }

  void _navigateToNews(NewsArticle article) {
    // Navigate to news detail page
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${article.title} haberi açılıyor...'),
        backgroundColor: Colors.blue.withOpacity(0.8),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}

class TriviaQuestion {
  final String question;
  final List<String> options;
  final int correctAnswer;
  final String category;

  TriviaQuestion({
    required this.question,
    required this.options,
    required this.correctAnswer,
    required this.category,
  });
}