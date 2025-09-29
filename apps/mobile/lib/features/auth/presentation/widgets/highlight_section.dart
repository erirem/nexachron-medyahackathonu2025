import 'package:flutter/material.dart';

import '../../domain/entities/login_highlight.dart';
import '../../../../core/presentation/widgets/fade_slide_up.dart';

class HighlightSection extends StatelessWidget {
  const HighlightSection({
    super.key,
    required this.highlights,
    required this.animation,
  });

  final List<LoginHighlight> highlights;
  final Animation<double> animation;

  @override
  Widget build(BuildContext context) {
    return FadeSlideUp(
      animation: animation,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth;
          final isTwoColumn = width >= 480;
          final itemWidth = isTwoColumn ? (width - 16) / 2 : width;

          return Wrap(
            spacing: 16,
            runSpacing: 16,
            children: highlights
                .map(
                  (highlight) => SizedBox(
                    width: itemWidth,
                    child: _HighlightCard(highlight: highlight),
                  ),
                )
                .toList(),
          );
        },
      ),
    );
  }
}

class _HighlightCard extends StatelessWidget {
  const _HighlightCard({required this.highlight});

  final LoginHighlight highlight;

  @override
  Widget build(BuildContext context) {
    final baseColor = Colors.white.withValues(alpha: 0.08);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [baseColor, Colors.white.withValues(alpha: 0.03)],
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x22051837),
            blurRadius: 24,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(highlight.icon, style: const TextStyle(fontSize: 24)),
          const SizedBox(height: 12),
          Text(
            highlight.title,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            highlight.description,
            style: TextStyle(
              fontSize: 13,
              height: 1.5,
              color: Colors.white.withValues(alpha: 0.7),
            ),
          ),
        ],
      ),
    );
  }
}
