import 'package:flutter/material.dart';

import '../../../../core/presentation/widgets/fade_slide_up.dart';
import '../../../../core/theme/app_colors.dart';

class HeroSection extends StatelessWidget {
  const HeroSection({
    super.key,
    required this.badgeAnimation,
    required this.headlineAnimation,
    required this.descriptionAnimation,
    required this.actionsAnimation,
    required this.onPrimaryTap,
    required this.primaryLabel,
    this.onSecondaryTap,
    this.secondaryLabel,
  });

  final Animation<double> badgeAnimation;
  final Animation<double> headlineAnimation;
  final Animation<double> descriptionAnimation;
  final Animation<double> actionsAnimation;
  final VoidCallback onPrimaryTap;
  final String primaryLabel;
  final VoidCallback? onSecondaryTap;
  final String? secondaryLabel;

  @override
  Widget build(BuildContext context) {
    final muted = Colors.white.withValues(alpha: 0.65);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        FadeSlideUp(
          animation: badgeAnimation,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 1,
                width: 36,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.6),
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Anadolu Ajansı İçin Özel',
                style: TextStyle(
                  fontSize: 11,
                  letterSpacing: 4,
                  fontWeight: FontWeight.w600,
                  color: muted,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        FadeSlideUp(
          animation: headlineAnimation,
          child: Text.rich(
            TextSpan(
              children: [
                const TextSpan(text: 'Nexachron ile habere giriş yap, haberi '),
                TextSpan(
                  text: 'oyunlaştırılmış',
                  style: TextStyle(
                    foreground: Paint()
                      ..shader = const LinearGradient(
                        colors: [
                          Color(0xFF9AD7FF),
                          Color(0xFF63B3FF),
                          Color(0xFFA5D8FF),
                        ],
                      ).createShader(const Rect.fromLTWH(0, 0, 240, 40)),
                  ),
                ),
                const TextSpan(text: ' bir deneyimle yaşa.'),
              ],
            ),
            style: const TextStyle(
              fontSize: 30,
              height: 1.25,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        const SizedBox(height: 16),
        FadeSlideUp(
          animation: descriptionAnimation,
          child: Text(
            'Anadolu Ajansı\'nın güvenilir haberlerinden beslenen Nexachron, okuma ritmini XP ile ödüllendirir, quiz\'lerle gündemi pekiştirir ve kart koleksiyonu ile gazetecilik kariyerini parlatır.',
            style: TextStyle(
              fontSize: 14,
              height: 1.6,
              color: Colors.white.withValues(alpha: 0.72),
            ),
          ),
        ),
        const SizedBox(height: 24),
        FadeSlideUp(
          animation: actionsAnimation,
          child: Wrap(
            spacing: 12,
            runSpacing: 12,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              _PrimaryCtaButton(label: primaryLabel, onPressed: onPrimaryTap),
              if (secondaryLabel != null && onSecondaryTap != null)
                OutlinedButton(
                  onPressed: onSecondaryTap,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: BorderSide(
                      color: Colors.white.withValues(alpha: 0.25),
                    ),
                    backgroundColor: Colors.white.withValues(alpha: 0.08),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 14,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.login_rounded,
                        size: 16,
                        color: AppColors.glowCyan,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        secondaryLabel!,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PrimaryCtaButton extends StatelessWidget {
  const _PrimaryCtaButton({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        gradient: const LinearGradient(
          colors: [Colors.white, Color(0xFFE5F4FF)],
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x33031224),
            offset: Offset(0, 18),
            blurRadius: 36,
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          foregroundColor: const Color(0xFF0A2141),
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(999),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward_rounded, size: 18),
          ],
        ),
      ),
    );
  }
}
