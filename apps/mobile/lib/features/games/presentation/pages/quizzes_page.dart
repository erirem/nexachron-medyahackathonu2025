import 'package:flutter/material.dart';

class QuizzesPage extends StatefulWidget {
  const QuizzesPage({super.key});

  @override
  State<QuizzesPage> createState() => _QuizzesPageState();
}

class _QuizzesPageState extends State<QuizzesPage> {
  final List<_Question> _questions = const [
    _Question(
      text: 'Merkez Bankası politika faizini kim belirler?',
      answers: [
        'TCMB Para Politikası Kurulu',
        'Hazine ve Maliye Bakanlığı',
        'BDDK',
        'TBMM',
      ],
      correctIndex: 0,
    ),
    _Question(
      text: 'Borsa İstanbul\'da endeks kodu hangisidir?',
      answers: ['BIST100', 'XU100', 'BIS100', 'IST100'],
      correctIndex: 1,
    ),
    _Question(
      text: 'Enflasyon nedir?',
      answers: [
        'Genel fiyat seviyesindeki artış',
        'İşsizliğin artması',
        'İhracatın artması',
        'Döviz kurunun düşmesi',
      ],
      correctIndex: 0,
    ),
  ];

  int _current = 0;
  int _score = 0;
  int? _selectedIndex;

  void _submit() {
    if (_selectedIndex == null) return;
    if (_selectedIndex == _questions[_current].correctIndex) {
      _score++;
    }
    if (_current < _questions.length - 1) {
      setState(() {
        _current++;
        _selectedIndex = null;
      });
    } else {
      showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Sonuç'),
          content: Text('Skorunuz: $_score / ${_questions.length}'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              child: const Text('Kapat'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final question = _questions[_current];
    return Scaffold(
      appBar: AppBar(title: const Text('Haber Quizleri')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            LinearProgressIndicator(value: (_current + 1) / _questions.length),
            const SizedBox(height: 16),
            Text(
              question.text,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...List.generate(question.answers.length, (index) {
              final answer = question.answers[index];
              final isSelected = _selectedIndex == index;
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Colors.blue.withOpacity(0.1)
                      : Colors.white12,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? Colors.blue : Colors.white24,
                  ),
                ),
                child: ListTile(
                  title: Text(answer),
                  onTap: () => setState(() => _selectedIndex = index),
                ),
              );
            }),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _selectedIndex == null ? null : _submit,
                child: Text(
                  _current == _questions.length - 1 ? 'Bitir' : 'Devam',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Question {
  const _Question({
    required this.text,
    required this.answers,
    required this.correctIndex,
  });
  final String text;
  final List<String> answers;
  final int correctIndex;
}
