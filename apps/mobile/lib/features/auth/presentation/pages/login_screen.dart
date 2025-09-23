import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../controllers/login_controller.dart';
import '../widgets/animated_background.dart';
import '../widgets/login_form_card.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with TickerProviderStateMixin {
  late final LoginController _controller;
  late final AnimationController _backgroundController;

  @override
  void initState() {
    super.initState();
    _controller = LoginController();
    _backgroundController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 14),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    _backgroundController.dispose();
    super.dispose();
  }

  void _openRegister() {
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => const RegisterScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: const Text('Giriş Yap'),
      ),
      extendBodyBehindAppBar: true,
      resizeToAvoidBottomInset: true,
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
                  final screenHeight = constraints.maxHeight;
                  final isVeryCompact = screenHeight < 650;

                  return Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: isVeryCompact ? 12 : 20,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (!isVeryCompact) ...[
                          Text(
                            'Tek tıkla oyunlaştırılmış haber deneyimine geri dön.',
                            style: Theme.of(context).textTheme.bodyMedium
                                ?.copyWith(
                                  color: Colors.white.withValues(alpha: 0.75),
                                ),
                          ),
                          SizedBox(height: isVeryCompact ? 12 : 20),
                        ],
                        Flexible(
                          child: Center(
                            child: ConstrainedBox(
                              constraints: const BoxConstraints(maxWidth: 420),
                              child: LoginFormCard(
                                controller: _controller,
                                animation: const AlwaysStoppedAnimation<double>(
                                  1,
                                ),
                                onRegisterTap: _openRegister,
                              ),
                            ),
                          ),
                        ),
                      ],
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
