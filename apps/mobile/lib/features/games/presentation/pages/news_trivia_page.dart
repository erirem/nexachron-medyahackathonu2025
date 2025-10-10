import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import 'dart:math';

import '../widgets/game_header.dart';
import '../widgets/game_completion_dialog.dart';
import '../providers/gamification_provider.dart';

class NewsTriviaPage extends ConsumerStatefulWidget {
  const NewsTriviaPage({super.key});

  @override
  ConsumerState<NewsTriviaPage> createState() => _NewsTriviaPageState();
}

class _NewsTriviaPageState extends ConsumerState<NewsTriviaPage> {
  List<TriviaQuestion> _questions = [];
  int _currentQuestionIndex = 0;
  int _score = 0;
  int _correctAnswers = 0;
  bool _gameCompleted = false;
  bool _questionAnswered = false;
  int? _selectedAnswerIndex;
  Timer? _gameTimer;
  int _timeElapsed = 0;
  int _questionTimeLeft = 15;
  
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
    _currentQuestionIndex = 0;
    _score = 0;
    _correctAnswers = 0;
    _gameCompleted = false;
    _questionAnswered = false;
    _selectedAnswerIndex = null;
    _timeElapsed = 0;
    _questionTimeLeft = _questionTimeLimit;
    _startQuestionTimer();
  }

  List<TriviaQuestion> _generateQuestions() {
    return [
      TriviaQuestion(
        question: 'Türkiye\'nin başkenti neresidir?',
        options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'],
        correctAnswer: 1,
        category: 'Genel Kültür',
      ),
      TriviaQuestion(
        question: 'Hangi yıl COVID-19 pandemisi başladı?',
        options: ['2019', '2020', '2021', '2018'],
        correctAnswer: 1,
        category: 'Sağlık',
      ),
      TriviaQuestion(
        question: 'Türkiye\'nin en uzun nehri hangisidir?',
        options: ['Fırat', 'Dicle', 'Kızılırmak', 'Sakarya'],
        correctAnswer: 2,
        category: 'Coğrafya',
      ),
      TriviaQuestion(
        question: 'İstanbul Havalimanı hangi yılda açıldı?',
        options: ['2017', '2018', '2019', '2020'],
        correctAnswer: 1,
        category: 'Ulaştırma',
      ),
      TriviaQuestion(
        question: 'Türkiye\'nin AB\'ye üyelik müzakereleri ne zaman başladı?',
        options: ['2003', '2005', '2007', '2010'],
        correctAnswer: 1,
        category: 'Siyaset',
      ),
      TriviaQuestion(
        question: 'Hangi şehir 2023 yılında büyük deprem yaşadı?',
        options: ['İstanbul', 'Ankara', 'Kahramanmaraş', 'İzmir'],
        correctAnswer: 2,
        category: 'Güncel',
      ),
      TriviaQuestion(
        question: 'Türkiye\'nin ilk milli elektrikli otomobili hangisidir?',
        options: ['TOGG', 'Devrim', 'Anadol', 'Tofaş'],
        correctAnswer: 0,
        category: 'Teknoloji',
      ),
      TriviaQuestion(
        question: 'Galatasaray hangi yıl UEFA Kupası kazandı?',
        options: ['1998', '2000', '2002', '2004'],
        correctAnswer: 1,
        category: 'Spor',
      ),
    ];
  }

  void _startQuestionTimer() {
    _gameTimer?.cancel();
    _questionTimeLeft = _questionTimeLimit;
    
    _gameTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _timeElapsed++;
        _questionTimeLeft--;
      });
      
      if (_questionTimeLeft <= 0) {
        _timeUp();
      }
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
    
    // Wait 2 seconds then move to next question
    Timer(const Duration(seconds: 2), () {
      _nextQuestion();
    });
  }

  void _nextQuestion() {
    if (_currentQuestionIndex < _questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
        _questionAnswered = false;
        _selectedAnswerIndex = null;
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

    // Award XP and update gamification
    final gamificationService = ref.read(gamificationServiceProvider);
    gamificationService.completeGame('news-trivia', _score, _maxScore);
    
    _showCompletionDialog();
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => GameCompletionDialog(
        gameTitle: 'Haber Trivia',
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
    if (_questions.isEmpty) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
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
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      // Category
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.orange.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          currentQuestion.category,
                          style: const TextStyle(
                            color: Colors.orange,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 20),
                      
                      // Question
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.white.withOpacity(0.1),
                              Colors.white.withOpacity(0.05),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.2),
                          ),
                        ),
                        child: Text(
                          currentQuestion.question,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            height: 1.4,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      
                      const SizedBox(height: 30),
                      
                      // Answer Options
                      Expanded(
                        child: ListView.builder(
                          itemCount: currentQuestion.options.length,
                          itemBuilder: (context, index) {
                            final option = currentQuestion.options[index];
                            final isSelected = _selectedAnswerIndex == index;
                            final isCorrect = index == currentQuestion.correctAnswer;
                            
                            Color? backgroundColor;
                            Color? borderColor;
                            
                            if (_questionAnswered) {
                              if (isCorrect) {
                                backgroundColor = Colors.green.withOpacity(0.2);
                                borderColor = Colors.green;
                              } else if (isSelected && !isCorrect) {
                                backgroundColor = Colors.red.withOpacity(0.2);
                                borderColor = Colors.red;
                              } else {
                                backgroundColor = Colors.white.withOpacity(0.05);
                                borderColor = Colors.white.withOpacity(0.2);
                              }
                            } else {
                              backgroundColor = Colors.white.withOpacity(0.1);
                              borderColor = Colors.white.withOpacity(0.3);
                            }
                            
                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: GestureDetector(
                                onTap: () => _answerQuestion(index),
                                child: Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: backgroundColor,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: borderColor!),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 30,
                                        height: 30,
                                        decoration: BoxDecoration(
                                          color: borderColor.withOpacity(0.2),
                                          shape: BoxShape.circle,
                                        ),
                                        child: Center(
                                          child: Text(
                                            String.fromCharCode(65 + index), // A, B, C, D
                                            style: TextStyle(
                                              color: borderColor,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      Expanded(
                                        child: Text(
                                          option,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 16,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                      if (_questionAnswered && isCorrect)
                                        const Icon(
                                          Icons.check_circle,
                                          color: Colors.green,
                                        )
                                      else if (_questionAnswered && isSelected && !isCorrect)
                                        const Icon(
                                          Icons.cancel,
                                          color: Colors.red,
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
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
