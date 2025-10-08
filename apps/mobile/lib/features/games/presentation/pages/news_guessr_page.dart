import 'package:flutter/material.dart';

class NewsGuessrPage extends StatefulWidget {
  const NewsGuessrPage({super.key});

  @override
  State<NewsGuessrPage> createState() => _NewsGuessrPageState();
}

class _NewsGuessrPageState extends State<NewsGuessrPage> {
  static const List<String> _cities = [
    'İstanbul',
    'Ankara',
    'İzmir',
    'Bursa',
    'Antalya',
    'Adana',
  ];
  final String _answer = 'Ankara';
  String? _selected;

  void _check() {
    if (_selected == null) return;
    final success = _selected == _answer;
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(success ? 'Doğru!' : 'Yanlış'),
        content: Text(
          success ? 'Tebrikler, doğru şehir.' : 'Doğru cevap: $_answer',
        ),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Haber Tahmin')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Haberin hangi şehirden geldiğini tahmin edin:',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                for (final city in _cities)
                  ChoiceChip(
                    selected: _selected == city,
                    label: Text(city),
                    onSelected: (_) => setState(() => _selected = city),
                  ),
              ],
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _selected == null ? null : _check,
                child: const Text('Kontrol Et'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
