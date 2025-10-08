import 'package:flutter/material.dart';

class WordlePage extends StatefulWidget {
  const WordlePage({super.key});

  @override
  State<WordlePage> createState() => _WordlePageState();
}

class _WordlePageState extends State<WordlePage> {
  static const String _answer = 'ANKAR'; // 5 harf kısıtlı, demo amaçlı
  final List<String> _guesses = [];
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    final guess = _controller.text.trim().toUpperCase();
    if (guess.length != 5) return;
    setState(() {
      _guesses.add(guess);
      _controller.clear();
    });
    if (guess == _answer) {
      _showResult(true);
    } else if (_guesses.length >= 6) {
      _showResult(false);
    }
  }

  void _showResult(bool success) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(success ? 'Tebrikler!' : 'Denemeler bitti'),
        content: Text(
          success ? 'Kelimeyi bildiniz.' : 'Doğru kelime: $_answer',
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

  Color _boxColor(int row, int col) {
    if (row >= _guesses.length) return Colors.white12;
    final ch = _guesses[row][col];
    if (ch == _answer[col]) return Colors.green;
    if (_answer.contains(ch)) return Colors.orange;
    return Colors.grey;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Wordle (TR)')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // 6x5 grid
            AspectRatio(
              aspectRatio: 5 / 6,
              child: GridView.builder(
                itemCount: 30,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 5,
                  mainAxisSpacing: 6,
                  crossAxisSpacing: 6,
                ),
                itemBuilder: (context, index) {
                  final row = index ~/ 5;
                  final col = index % 5;
                  final letter = row < _guesses.length
                      ? _guesses[row][col]
                      : '';
                  return Container(
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: _boxColor(row, col).withOpacity(0.25),
                      border: Border.all(color: _boxColor(row, col)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      letter,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    textCapitalization: TextCapitalization.characters,
                    maxLength: 5,
                    decoration: const InputDecoration(
                      counterText: '',
                      hintText: '5 harf tahmin',
                    ),
                    onSubmitted: (_) => _submit(),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(onPressed: _submit, child: const Text('Tahmin')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
