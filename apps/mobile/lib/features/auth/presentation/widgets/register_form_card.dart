import 'package:flutter/material.dart';

import '../../../../core/presentation/widgets/fade_slide_up.dart';
import '../../../../core/theme/app_colors.dart';
import '../controllers/login_status.dart';
import '../controllers/register_controller.dart';

class RegisterFormCard extends StatefulWidget {
  const RegisterFormCard({
    super.key,
    required this.controller,
    required this.animation,
    required this.onLoginTap,
  });

  final RegisterController controller;
  final Animation<double> animation;
  final VoidCallback onLoginTap;

  @override
  State<RegisterFormCard> createState() => _RegisterFormCardState();
}

class _RegisterFormCardState extends State<RegisterFormCard> {
  final _nameController = TextEditingController();
  bool _compact = false;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  final _nameFocus = FocusNode();
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  final _confirmFocus = FocusNode();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    _nameFocus.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    _confirmFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.of(context).size.height;
    _compact = height < 800;

    return FadeSlideUp(
      animation: widget.animation,
      child: AnimatedBuilder(
        animation: widget.controller,
        builder: (context, _) {
          final controller = widget.controller;

          return Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: Colors.white.withValues(alpha: 0.14)),
              gradient: LinearGradient(
                colors: [
                  Colors.white.withValues(alpha: 0.18),
                  Colors.white.withValues(alpha: 0.08),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x44051837),
                  blurRadius: 48,
                  offset: Offset(0, 32),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const _RegisterBadge(),
                const SizedBox(height: 20),
                Text(
                  'Nexachron\'a kayıt',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Sana özel haber rafı oluştur, XP ve kart ödülleriyle liderlik tablosunda yerini al.',
                  style: TextStyle(
                    fontSize: 13,
                    height: 1.6,
                    color: Colors.white.withValues(alpha: 0.72),
                  ),
                ),
                SizedBox(height: _compact ? 18 : 24),
                _FieldLabel(text: 'İSİM'),
                const SizedBox(height: 8),
                TextField(
                  controller: _nameController,
                  focusNode: _nameFocus,
                  textInputAction: TextInputAction.next,
                  onChanged: controller.updateDisplayName,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.person_outline),
                    hintText: 'Ad Soyad',
                    errorText: controller.nameError,
                  ),
                ),
                SizedBox(height: _compact ? 14 : 18),
                _FieldLabel(text: 'E-POSTA'),
                const SizedBox(height: 8),
                TextField(
                  controller: _emailController,
                  focusNode: _emailFocus,
                  textInputAction: TextInputAction.next,
                  keyboardType: TextInputType.emailAddress,
                  onChanged: controller.updateEmail,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.mail_outline),
                    hintText: 'ornek@aa.com.tr',
                    errorText: controller.emailError,
                  ),
                ),
                SizedBox(height: _compact ? 14 : 18),
                _FieldLabel(text: 'ŞİFRE'),
                const SizedBox(height: 8),
                TextField(
                  controller: _passwordController,
                  focusNode: _passwordFocus,
                  textInputAction: TextInputAction.next,
                  obscureText: true,
                  onChanged: controller.updatePassword,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.lock_outline),
                    hintText: '••••••••',
                    errorText: controller.passwordError,
                  ),
                ),
                SizedBox(height: _compact ? 14 : 18),
                _FieldLabel(text: 'ŞİFRE TEKRAR'),
                const SizedBox(height: 8),
                TextField(
                  controller: _confirmController,
                  focusNode: _confirmFocus,
                  textInputAction: TextInputAction.done,
                  obscureText: true,
                  onChanged: controller.updateConfirmation,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.lock_person_outlined),
                    hintText: '••••••••',
                    errorText: controller.confirmationError,
                  ),
                ),
                SizedBox(height: _compact ? 12 : 16),
                _TermsCheckbox(controller: controller),
                if (controller.termsError != null) ...[
                  SizedBox(height: _compact ? 4 : 6),
                  Text(
                    controller.termsError!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFFFF99A1),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
                SizedBox(height: _compact ? 12 : 16),
                _StatusBanner(controller: controller),
                SizedBox(height: _compact ? 6 : 12),
                _SubmitButton(controller: controller),
                SizedBox(height: _compact ? 12 : 16),
                _Footer(onLoginTap: widget.onLoginTap),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 11,
        letterSpacing: 1.2,
        fontWeight: FontWeight.w600,
        color: Colors.white.withValues(alpha: 0.6),
      ),
    );
  }
}

class _RegisterBadge extends StatelessWidget {
  const _RegisterBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.14)),
        color: Colors.white.withValues(alpha: 0.12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: const [
          Icon(Icons.auto_awesome, size: 16, color: AppColors.glowPurple),
          SizedBox(width: 8),
          Text(
            'Yeni nesil haber üyeliği',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _TermsCheckbox extends StatelessWidget {
  const _TermsCheckbox({required this.controller});

  final RegisterController controller;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Checkbox(
          value: controller.acceptTerms,
          onChanged: (value) => controller.toggleAcceptTerms(value ?? false),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            'Kullanım koşullarını ve gizlilik politikasını okudum, onaylıyorum.',
            style: TextStyle(
              fontSize: 12.5,
              color: Colors.white.withValues(alpha: 0.75),
              height: 1.4,
            ),
          ),
        ),
      ],
    );
  }
}

class _StatusBanner extends StatelessWidget {
  const _StatusBanner({required this.controller});

  final RegisterController controller;

  @override
  Widget build(BuildContext context) {
    final message = controller.statusMessage;
    if (message == null) {
      return const SizedBox.shrink();
    }

    Color accent;
    switch (controller.status) {
      case LoginStatus.success:
        accent = const Color(0xFF6EE7B7);
        break;
      case LoginStatus.error:
        accent = const Color(0xFFFF99A1);
        break;
      case LoginStatus.submitting:
        accent = Colors.white.withValues(alpha: 0.7);
        break;
      case LoginStatus.idle:
        accent = Colors.white.withValues(alpha: 0.0);
        break;
    }

    return AnimatedOpacity(
      opacity: controller.status == LoginStatus.idle ? 0 : 1,
      duration: const Duration(milliseconds: 250),
      child: Row(
        children: [
          Icon(
            controller.status == LoginStatus.success
                ? Icons.check_circle_outline
                : controller.status == LoginStatus.error
                ? Icons.error_outline
                : Icons.sync,
            size: 18,
            color: accent,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontSize: 12,
                color: accent,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SubmitButton extends StatelessWidget {
  const _SubmitButton({required this.controller});

  final RegisterController controller;

  @override
  Widget build(BuildContext context) {
    final isSubmitting = controller.status == LoginStatus.submitting;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: controller.submit,
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          backgroundColor: AppColors.glowCyan,
          foregroundColor: const Color(0xFF082246),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(32),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              isSubmitting ? 'Gönderiliyor' : 'Kayıt Ol',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            if (isSubmitting) ...[
              const SizedBox(width: 12),
              const SizedBox(
                height: 18,
                width: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF082246)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _Footer extends StatelessWidget {
  const _Footer({required this.onLoginTap});

  final VoidCallback onLoginTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Zaten hesabın var mı?',
          style: TextStyle(
            fontSize: 13,
            color: Colors.white.withValues(alpha: 0.75),
          ),
        ),
        TextButton(onPressed: onLoginTap, child: const Text('Giriş yap')),
      ],
    );
  }
}
