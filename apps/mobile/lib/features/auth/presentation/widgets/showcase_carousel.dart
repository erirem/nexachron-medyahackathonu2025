import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:mobile/l10n/gen/app_localizations.dart';

import '../../../../core/theme/app_colors.dart';

class ShowcaseCarousel extends StatefulWidget {
  const ShowcaseCarousel({super.key, required this.data});

  final List<ShowcaseCardData> data;

  @override
  State<ShowcaseCarousel> createState() => _ShowcaseCarouselState();
}

class _ShowcaseCarouselState extends State<ShowcaseCarousel> {
  late final PageController _controller;
  Timer? _autoTimer;

  @override
  void initState() {
    super.initState();
    _controller = PageController(viewportFraction: 0.82);
    _autoTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      final totalCards = widget.data.length;
      if (totalCards < 2 ||
          !_controller.hasClients ||
          !_controller.position.haveDimensions) {
        return;
      }
      final currentPage = _controller.page?.round() ?? _controller.initialPage;
      final nextPage = (currentPage + 1) % totalCards;
      _controller.animateToPage(
        nextPage,
        duration: const Duration(milliseconds: 650),
        curve: Curves.easeOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _autoTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.data.isEmpty) {
      return const SizedBox.shrink();
    }

    return SizedBox(
      height: 220,
      child: PageView.builder(
        controller: _controller,
        itemCount: widget.data.length,
        physics: const BouncingScrollPhysics(),
        itemBuilder: (context, index) {
          return AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              double page = 0;
              if (_controller.hasClients &&
                  _controller.position.haveDimensions) {
                page = _controller.page ?? _controller.initialPage.toDouble();
              }
              final delta = (page - index).abs().clamp(0.0, 1.0);
              final scale = lerpDouble(0.9, 1.0, 1 - delta)!;
              final verticalOffset = lerpDouble(24, 0, 1 - delta)!;

              return Transform.translate(
                offset: Offset(0, verticalOffset),
                child: Transform.scale(scale: scale, child: child),
              );
            },
            child: _ShowcaseCard(data: widget.data[index]),
          );
        },
      ),
    );
  }

  double? lerpDouble(double a, double b, double t) {
    return a + (b - a) * t;
  }
}

class _ShowcaseCard extends StatelessWidget {
  const _ShowcaseCard({required this.data});

  final ShowcaseCardData data;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 1.0, sigmaY: 1.0),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(28),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: data.gradient,
            ),
            border: Border.all(color: data.borderColor.withValues(alpha: 0.15)),
            boxShadow: [
              // Ana gölge - daha yumuşak ve büyük
              BoxShadow(
                color: data.borderColor.withValues(alpha: 0.08),
                blurRadius: 60,
                spreadRadius: -5,
                offset: const Offset(0, 20),
              ),
              // İç gölge benzeri efekt
              BoxShadow(
                color: data.borderColor.withValues(alpha: 0.12),
                blurRadius: 20,
                spreadRadius: -8,
                offset: const Offset(0, 10),
              ),
              // Ambient light - üstten yumuşak aydınlatma
              BoxShadow(
                color: Colors.white.withValues(alpha: 0.03),
                blurRadius: 15,
                spreadRadius: -2,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                data.badge,
                style: TextStyle(
                  fontSize: 12,
                  letterSpacing: 2.2,
                  fontWeight: FontWeight.w700,
                  color: data.badgeColor,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                data.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                data.description,
                style: TextStyle(
                  fontSize: 13.5,
                  height: 1.6,
                  color: Colors.white.withValues(alpha: 0.78),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ShowcaseCardData {
  const ShowcaseCardData({
    required this.badge,
    required this.title,
    required this.description,
    required this.gradient,
    required this.borderColor,
    required this.badgeColor,
  });

  final String badge;
  final String title;
  final String description;
  final List<Color> gradient;
  final Color borderColor;
  final Color badgeColor;
  static List<ShowcaseCardData> localize(AppLocalizations l10n) {
    return [
      ShowcaseCardData(
        badge: l10n.landingShowcaseLiveBadge,
        title: l10n.landingShowcaseLiveTitle,
        description: l10n.landingShowcaseLiveDescription,
        gradient: const [
          Color(0x1A9AD7FF),
          Color(0x15123F7A),
          Color(0x0A051937),
        ],
        borderColor: AppColors.glowCyan,
        badgeColor: AppColors.glowCyan,
      ),
      ShowcaseCardData(
        badge: l10n.landingShowcaseDailyBadge,
        title: l10n.landingShowcaseDailyTitle,
        description: l10n.landingShowcaseDailyDescription,
        gradient: const [
          Color(0x1A86FFC4),
          Color(0x101F6034),
          Color(0x080B2F1C),
        ],
        borderColor: AppColors.glowEmerald,
        badgeColor: AppColors.glowEmerald,
      ),
      ShowcaseCardData(
        badge: l10n.landingShowcaseAiBadge,
        title: l10n.landingShowcaseAiTitle,
        description: l10n.landingShowcaseAiDescription,
        gradient: const [
          Color(0x1AC9A6FF),
          Color(0x101B2F5A),
          Color(0x080A1F3C),
        ],
        borderColor: AppColors.glowPurple,
        badgeColor: AppColors.glowPurple,
      ),
      ShowcaseCardData(
        badge: l10n.landingShowcaseCommunityBadge,
        title: l10n.landingShowcaseCommunityTitle,
        description: l10n.landingShowcaseCommunityDescription,
        gradient: const [
          Color(0x1AFFC8E2),
          Color(0x1057113A),
          Color(0x08190514),
        ],
        borderColor: AppColors.glowRose,
        badgeColor: AppColors.glowRose,
      ),
      ShowcaseCardData(
        badge: l10n.landingShowcaseRewardsBadge,
        title: l10n.landingShowcaseRewardsTitle,
        description: l10n.landingShowcaseRewardsDescription,
        gradient: const [
          Color(0x1AFFF0A5),
          Color(0x10665022),
          Color(0x081F1504),
        ],
        borderColor: AppColors.glowAmber,
        badgeColor: AppColors.glowAmber,
      ),
    ];
  }
}
