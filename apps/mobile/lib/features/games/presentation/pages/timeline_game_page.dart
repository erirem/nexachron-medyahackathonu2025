import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:math';

import '../widgets/game_header.dart';
import '../widgets/game_completion_dialog.dart';
import '../providers/gamification_provider.dart';

class TimelineGamePage extends ConsumerStatefulWidget {
  const TimelineGamePage({super.key});

  @override
  ConsumerState<TimelineGamePage> createState() => _TimelineGamePageState();
}

class _TimelineGamePageState extends ConsumerState<TimelineGamePage> {
  List<TimelineEvent> _events = [];
  List<TimelineEvent> _userOrder = [];
  int _score = 0;
  bool _gameCompleted = false;
  int _timeElapsed = 0;
  int _attempts = 0;
  
  static const int _maxScore = 1000;

  @override
  void initState() {
    super.initState();
    _initializeGame();
  }

  void _initializeGame() {
    _events = _getTimelineEvents();
    _userOrder.clear();
    _score = 0;
    _gameCompleted = false;
    _timeElapsed = 0;
    _attempts = 0;
    
    // Shuffle events for user to sort
    _events.shuffle(Random());
  }

  List<TimelineEvent> _getTimelineEvents() {
    return [
      TimelineEvent(
        id: 1,
        title: 'COVID-19 Pandemisi Başladı',
        description: 'Dünya Sağlık Örgütü pandemi ilan etti',
        date: DateTime(2020, 3, 11),
        category: 'Sağlık',
      ),
      TimelineEvent(
        id: 2,
        title: 'İstanbul Havalimanı Açıldı',
        description: 'Dünyanın en büyük havalimanlarından biri hizmete girdi',
        date: DateTime(2018, 10, 29),
        category: 'Ulaştırma',
      ),
      TimelineEvent(
        id: 3,
        title: '15 Temmuz Darbe Girişimi',
        description: 'Türkiye\'de darbe girişimi yaşandı',
        date: DateTime(2016, 7, 15),
        category: 'Siyaset',
      ),
      TimelineEvent(
        id: 4,
        title: 'Kanal İstanbul Projesi Açıklandı',
        description: 'Büyük altyapı projesi kamuoyuna duyuruldu',
        date: DateTime(2021, 6, 26),
        category: 'İnşaat',
      ),
      TimelineEvent(
        id: 5,
        title: 'Türkiye Euro 2024\'e Katıldı',
        description: 'Milli takım Avrupa Şampiyonası\'nda mücadele etti',
        date: DateTime(2024, 6, 15),
        category: 'Spor',
      ),
      TimelineEvent(
        id: 6,
        title: 'Türk Lirası Dijital Para Birimi',
        description: 'Merkez Bankası dijital TL projesini başlattı',
        date: DateTime(2023, 1, 1),
        category: 'Ekonomi',
      ),
    ];
  }

  void _onReorder(int oldIndex, int newIndex) {
    setState(() {
      if (newIndex > oldIndex) {
        newIndex -= 1;
      }
      final item = _events.removeAt(oldIndex);
      _events.insert(newIndex, item);
    });
  }

  void _checkOrder() {
    _attempts++;
    
    // Create correct order
    final correctOrder = List<TimelineEvent>.from(_events)
      ..sort((a, b) => a.date.compareTo(b.date));
    
    // Check if user order matches correct order
    bool isCorrect = true;
    for (int i = 0; i < _events.length; i++) {
      if (_events[i].id != correctOrder[i].id) {
        isCorrect = false;
        break;
      }
    }
    
    if (isCorrect) {
      _completeGame();
    } else {
      // Show feedback
      _showFeedback(correctOrder);
    }
  }

  void _showFeedback(List<TimelineEvent> correctOrder) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1a2234),
        title: const Text(
          'Tekrar Dene!',
          style: TextStyle(color: Colors.white),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Doğru sıralama:',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...correctOrder.asMap().entries.map((entry) {
              final index = entry.key;
              final event = entry.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: const BoxDecoration(
                        color: Colors.blue,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '${index + 1}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            event.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            '${event.date.day}/${event.date.month}/${event.date.year}',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.7),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text(
              'Tamam',
              style: TextStyle(color: Colors.blue),
            ),
          ),
        ],
      ),
    );
  }

  void _completeGame() {
    // Calculate score based on attempts
    final baseScore = 500;
    final attemptPenalty = (_attempts - 1) * 100;
    final finalScore = (baseScore - attemptPenalty).clamp(0, _maxScore);
    
    setState(() {
      _gameCompleted = true;
      _score = finalScore;
    });

    // Award XP and update gamification
    final gamificationService = ref.read(gamificationServiceProvider);
    gamificationService.completeGame('timeline-game', _score, _maxScore);
    
    _showCompletionDialog();
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => GameCompletionDialog(
        gameTitle: 'Zaman Tüneli',
        score: _score,
        maxScore: _maxScore,
        timeElapsed: Duration(seconds: _timeElapsed),
        moves: _attempts,
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
                title: 'Zaman Tüneli',
                subtitle: 'Olayları kronolojik sıraya diz',
                score: _score,
                timeElapsed: Duration(seconds: _timeElapsed),
                moves: _attempts,
                onBack: () => Navigator.of(context).pop(),
              ),
              
              const SizedBox(height: 20),
              
              // Instructions
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.withOpacity(0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.blue),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Olayları en eskiden en yeniye doğru sıralayın',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 20),
              
              // Timeline Events
              Expanded(
                child: ReorderableListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: _events.length,
                  onReorder: _onReorder,
                  itemBuilder: (context, index) {
                    final event = _events[index];
                    return _TimelineEventCard(
                      key: ValueKey(event.id),
                      event: event,
                      index: index,
                    );
                  },
                ),
              ),
              
              // Check Button
              Padding(
                padding: const EdgeInsets.all(20),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _checkOrder,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0f6acd),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Sıralamayı Kontrol Et',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
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

class _TimelineEventCard extends StatelessWidget {
  final TimelineEvent event;
  final int index;

  const _TimelineEventCard({
    super.key,
    required this.event,
    required this.index,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withOpacity(0.1),
            Colors.white.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          // Order Number
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0f6acd), Color(0xFF1a8dff)],
              ),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '${index + 1}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ),
          
          const SizedBox(width: 16),
          
          // Event Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  event.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  event.description,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        event.category,
                        style: const TextStyle(
                          color: Colors.blue,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Drag Handle
          const Icon(
            Icons.drag_handle,
            color: Colors.white54,
          ),
        ],
      ),
    );
  }
}

class TimelineEvent {
  final int id;
  final String title;
  final String description;
  final DateTime date;
  final String category;

  TimelineEvent({
    required this.id,
    required this.title,
    required this.description,
    required this.date,
    required this.category,
  });
}
