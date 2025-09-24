import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../controllers/login_status.dart';
import '../controllers/register_controller.dart';
import '../widgets/animated_background.dart';
import '../widgets/register_form_card.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen>
    with TickerProviderStateMixin {
  late final RegisterController _controller;
  late final AnimationController _backgroundController;

  @override
  void initState() {
    super.initState();
    _controller = RegisterController()
      ..addListener(_handleStatusChange);
    _backgroundController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 14),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.removeListener(_handleStatusChange);
    _controller.dispose();
    _backgroundController.dispose();
    super.dispose();
  }

  void _openLogin() {
    Navigator.of(context).pop();
  }

  void _handleStatusChange() {
    if (!mounted) {
      return;
    }
    if (_controller.status == LoginStatus.success && _controller.sessionCreated) {
      Navigator.of(context).popUntil((route) => route.isFirst);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: const Text('Kayıt Ol'),
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
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 20,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Profilini oluştur, XP akışına katıl ve ilk rozetini kazan.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.75),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 420),
                        child: RegisterFormCard(
                          controller: _controller,
                          animation: const AlwaysStoppedAnimation<double>(1),
                          onLoginTap: _openLogin,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
