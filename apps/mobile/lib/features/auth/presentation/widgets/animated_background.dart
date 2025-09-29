import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

class AnimatedBackground extends StatelessWidget {
  const AnimatedBackground({
    super.key,
    required this.animation,
    this.warp = false,
  });

  final Animation<double> animation;
  final bool warp;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: animation,
      builder: (context, child) {
        final progress = animation.value;
        final size = MediaQuery.sizeOf(context);
        return Stack(
          clipBehavior: Clip.none,
          children: [
            if (warp) ...[
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        AppColors.glowCyanDimmed.withValues(alpha: 0.05),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                top: -size.height * 0.55,
                left: -size.width * 0.25,
                child: Container(
                  width: size.width * 1.5,
                  height: size.height,
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      colors: [
                        AppColors.glowCyan.withValues(alpha: 0.15),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                bottom: -size.height * 0.5,
                right: -size.width * 0.3,
                child: Container(
                  width: size.width * 1.4,
                  height: size.height * 1.1,
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      colors: [
                        AppColors.glowCyanDimmed.withValues(alpha: 0.18),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
            ],
            _buildBlob(
              top: -140,
              right: -100,
              size: 260,
              color: AppColors.glowCyan.withValues(alpha: 0.25),
              offsetY: math.sin(progress * 2 * math.pi) * 12,
            ),
            _buildBlob(
              bottom: -160,
              left: -80,
              size: 300,
              color: AppColors.royalBlue.withValues(alpha: 0.26),
              offsetY: math.cos(progress * 2 * math.pi) * 10,
            ),
            _buildBlob(
              top: 160,
              left: 32,
              size: 160,
              color: AppColors.glowCyan.withValues(alpha: 0.16),
              offsetY: math.sin(progress * 4 * math.pi) * 14,
            ),
            _buildBlob(
              bottom: 120,
              right: 40,
              size: 180,
              color: AppColors.glowCyanDimmed.withValues(alpha: 0.18),
              offsetY: math.cos(progress * 4 * math.pi) * 18,
            ),
          ],
        );
      },
    );
  }

  Widget _buildBlob({
    double? top,
    double? bottom,
    double? left,
    double? right,
    required double size,
    required Color color,
    double offsetY = 0,
  }) {
    return Positioned(
      top: top != null ? top + offsetY : null,
      bottom: bottom != null ? bottom - offsetY : null,
      left: left,
      right: right,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(shape: BoxShape.circle, color: color),
      ),
    );
  }
}
