import 'package:flutter/material.dart';

import '../../../../core/l10n/l10n.dart';
import '../../../../core/l10n/language_switcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../widgets/animated_background.dart';
import '../widgets/hero_section.dart';
import '../widgets/showcase_carousel.dart';
import 'login_screen.dart';
import 'register_screen.dart';

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage>
    with TickerProviderStateMixin {
  late final AnimationController _introController;
  late final AnimationController _backgroundController;

  late final Animation<double> _badgeAnimation;
  late final Animation<double> _headlineAnimation;
  late final Animation<double> _descriptionAnimation;
  late final Animation<double> _actionsAnimation;

  @override
  void initState() {
    super.initState();
    _introController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..forward();
    _backgroundController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 18),
    )..repeat();

    _badgeAnimation = CurvedAnimation(
      parent: _introController,
      curve: const Interval(0.0, 0.25, curve: Curves.easeOut),
    );
    _headlineAnimation = CurvedAnimation(
      parent: _introController,
      curve: const Interval(0.1, 0.5, curve: Curves.easeOutCubic),
    );
    _descriptionAnimation = CurvedAnimation(
      parent: _introController,
      curve: const Interval(0.2, 0.6, curve: Curves.easeOutCubic),
    );
    _actionsAnimation = CurvedAnimation(
      parent: _introController,
      curve: const Interval(0.35, 0.75, curve: Curves.easeOutCubic),
    );
  }

  @override
  void dispose() {
    _introController.dispose();
    _backgroundController.dispose();
    super.dispose();
  }

  void _openLogin() {
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
  }

  void _openRegister() {
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => const RegisterScreen()));
  }

  Future<void> _showAuthSheet() async {
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: const Color(0xFF041127).withValues(alpha: 0.92),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                context.l10n.landingAuthSheetTitle,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(
                  Icons.person_add_alt_1_rounded,
                  color: AppColors.glowCyan,
                ),
                title: Text(
                  context.l10n.landingAuthSheetCreate,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                subtitle: Text(context.l10n.landingAuthSheetCreateSubtitle),
                onTap: () {
                  Navigator.of(context).pop();
                  _openRegister();
                },
              ),
              ListTile(
                leading: const Icon(Icons.login_rounded, color: Colors.white70),
                title: Text(
                  context.l10n.landingAuthSheetLogin,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                subtitle: Text(context.l10n.landingAuthSheetLoginSubtitle),
                onTap: () {
                  Navigator.of(context).pop();
                  _openLogin();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.midnight,
              AppColors.deepBlue,
              AppColors.royalBlue,
            ],
          ),
        ),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Positioned.fill(
              child: AnimatedBackground(
                animation: _backgroundController,
                warp: true,
              ),
            ),
            SafeArea(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final carouselHeight = (constraints.maxHeight * 0.34).clamp(
                    160.0,
                    220.0,
                  );

                  return SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 28,
                    ),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        minHeight: constraints.maxHeight,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: const [LanguageSwitcher()],
                          ),
                          const SizedBox(height: 24),
                          HeroSection(
                            badgeAnimation: _badgeAnimation,
                            headlineAnimation: _headlineAnimation,
                            descriptionAnimation: _descriptionAnimation,
                            actionsAnimation: _actionsAnimation,
                            onPrimaryTap: _showAuthSheet,
                            primaryLabel: context.l10n.landingPrimaryCtaLabel,
                            badgeLabel: context.l10n.landingHeroBadge,
                            title: context.l10n.landingHeroTitle,
                            description: context.l10n.landingHeroDescription,
                            onSecondaryTap: _openLogin,
                            secondaryLabel:
                                context.l10n.landingSecondaryCtaLabel,
                          ),
                          const SizedBox(height: 20),
                          Text(
                            context.l10n.landingShowcaseHeading,
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                          ),
                          const SizedBox(height: 10),
                          SizedBox(
                            height: carouselHeight,
                            child: ShowcaseCarousel(
                              data: ShowcaseCardData.localize(context.l10n),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            context.l10n.landingShowcaseDescription,
                            style: TextStyle(
                              fontSize: 13,
                              height: 1.5,
                              color: Colors.white.withValues(alpha: 0.72),
                            ),
                          ),
                          const SizedBox(height: 36),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
