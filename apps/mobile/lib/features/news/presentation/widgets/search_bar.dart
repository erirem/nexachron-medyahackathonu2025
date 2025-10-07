import 'package:flutter/material.dart';

class NewsSearchBar extends StatefulWidget {
  final Function(String) onSearch;

  const NewsSearchBar({super.key, required this.onSearch});

  @override
  State<NewsSearchBar> createState() => _NewsSearchBarState();
}

class _NewsSearchBarState extends State<NewsSearchBar> {
  final TextEditingController _controller = TextEditingController();
  bool _isFocused = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: _isFocused
            ? Colors.white.withOpacity(0.15)
            : Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: _isFocused
              ? Colors.white.withOpacity(0.4)
              : Colors.white.withOpacity(0.2),
        ),
        boxShadow: _isFocused
            ? [
                BoxShadow(
                  color: const Color(0xFF0f6acd).withOpacity(0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: TextField(
        controller: _controller,
        onChanged: widget.onSearch,
        onTap: () => setState(() => _isFocused = true),
        onSubmitted: (value) => setState(() => _isFocused = false),
        style: const TextStyle(color: Colors.white, fontSize: 14),
        decoration: InputDecoration(
          hintText: 'Haber, şirket veya bölge ara',
          hintStyle: TextStyle(
            color: Colors.white.withOpacity(0.6),
            fontSize: 14,
          ),
          prefixIcon: Icon(
            Icons.search,
            color: Colors.white.withOpacity(0.6),
            size: 20,
          ),
          suffixIcon: _controller.text.isNotEmpty
              ? IconButton(
                  icon: Icon(
                    Icons.clear,
                    color: Colors.white.withOpacity(0.6),
                    size: 20,
                  ),
                  onPressed: () {
                    _controller.clear();
                    widget.onSearch('');
                    setState(() {});
                  },
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 14,
          ),
        ),
      ),
    );
  }
}
