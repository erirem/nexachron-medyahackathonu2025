import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../domain/entities/floating_card_info.dart';
import '../../../../core/theme/app_colors.dart';

class FloatingCardsPanel extends StatelessWidget {
  const FloatingCardsPanel({
    super.key,
    required this.cards,
    required this.animation,
  });

  final List<FloatingCardInfo> cards;
  final Animation<double> animation;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final amplitude = width < 360 ? 6.0 : 12.0;

    return AnimatedBuilder(
      animation: animation,
      builder: (context, child) {
        return Wrap(
          spacing: 16,
          runSpacing: 16,
          alignment: WrapAlignment.center,
          children: [
            for (var entry in cards.asMap().entries)
              Transform.translate(
                offset: Offset(
                  0,
                  math.sin((animation.value + entry.key * 0.18) * 2 * math.pi) *
                      amplitude,
                ),
                child: _FloatingCard(info: entry.value),
              ),
          ],
        );
      },
    );
  }
}

class _FloatingCard extends StatelessWidget {
  const _FloatingCard({required this.info});

  final FloatingCardInfo info;

  @override
  Widget build(BuildContext context) {
    final palette = _palette(info.variant);

    return Container(
      width: 148,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: palette.border),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: palette.gradient,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x33000A1A),
            blurRadius: 24,
            offset: Offset(0, 16),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (info.capture != null)
            Text(
              info.capture!,
              style: TextStyle(
                fontSize: 10,
                letterSpacing: 2.4,
                fontWeight: FontWeight.w700,
                color: palette.accent,
              ),
            ),
          if (info.capture != null) const SizedBox(height: 6),
          Text(
            info.title,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          Text(
            info.description,
            style: TextStyle(
              fontSize: 11.5,
              height: 1.4,
              color: Colors.white.withValues(alpha: 0.78),
            ),
          ),
        ],
      ),
    );
  }
}

class _CardPalette {
  const _CardPalette({
    required this.border,
    required this.gradient,
    required this.accent,
  });

  final Color border;
  final List<Color> gradient;
  final Color accent;
}

_CardPalette _palette(FloatingCardVariant variant) {
  switch (variant) {
    case FloatingCardVariant.xp:
      return const _CardPalette(
        border: Color(0x4DFFC971),
        gradient: [Color(0x33FFC971), Color(0x1AFF824C)],
        accent: AppColors.glowAmber,
      );
    case FloatingCardVariant.card:
      return const _CardPalette(
        border: Color(0x4DC4A0FF),
        gradient: [Color(0x33C4A0FF), Color(0x1A6C63FF)],
        accent: AppColors.glowPurple,
      );
    case FloatingCardVariant.ai:
      return const _CardPalette(
        border: Color(0x4D7DDCFF),
        gradient: [Color(0x337DDCFF), Color(0x1A63B3FF)],
        accent: AppColors.glowCyan,
      );
    case FloatingCardVariant.quiz:
      return const _CardPalette(
        border: Color(0x4D60F2A0),
        gradient: [Color(0x3360F2A0), Color(0x1A1EAE72)],
        accent: AppColors.glowEmerald,
      );
    case FloatingCardVariant.streak:
      return const _CardPalette(
        border: Color(0x4DF4D35B),
        gradient: [Color(0x33F4D35B), Color(0x1ACB982E)],
        accent: AppColors.glowAmber,
      );
    case FloatingCardVariant.emoji:
      return const _CardPalette(
        border: Color(0x4DF79CC3),
        gradient: [Color(0x33F79CC3), Color(0x1AB64C87)],
        accent: AppColors.glowRose,
      );
  }
}
