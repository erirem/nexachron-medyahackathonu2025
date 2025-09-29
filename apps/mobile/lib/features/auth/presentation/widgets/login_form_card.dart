import 'package:flutter/material.dart';

import '../../../../core/l10n/l10n.dart';
import '../../../../core/presentation/widgets/fade_slide_up.dart';
import '../../../../core/theme/app_colors.dart';
import '../controllers/login_controller.dart';
import '../controllers/login_status.dart';
import '../l10n/auth_localizations.dart';

class LoginFormCard extends StatefulWidget {
  const LoginFormCard({
    super.key,
    required this.controller,
    required this.animation,
    required this.onRegisterTap,
    this.onLoginSubmitted,
  });

  final LoginController controller;
  final Animation<double> animation;
  final VoidCallback onRegisterTap;
  final VoidCallback? onLoginSubmitted;

  @override
  State<LoginFormCard> createState() => _LoginFormCardState();
}

class _LoginFormCardState extends State<LoginFormCard> {
  LoginStatus? _lastStatus;

  @override
  void initState() {
    super.initState();
    _lastStatus = widget.controller.status;
    widget.controller.addListener(_handleStatusChange);
  }

  void _handleStatusChange() {
    if (_lastStatus == widget.controller.status) {
      return;
    }
    _lastStatus = widget.controller.status;

    if (widget.controller.status == LoginStatus.success &&
        widget.onLoginSubmitted != null) {
      widget.onLoginSubmitted!();
    }
  }

  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _emailFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();

  bool _obscurePassword = true;
  bool _compact = false;

  @override
  void dispose() {
    widget.controller.removeListener(_handleStatusChange);
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocusNode.dispose();
    _passwordFocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.of(context).size.height;
    _compact = height < 750;

    return FadeSlideUp(
      animation: widget.animation,
      child: AnimatedBuilder(
        animation: widget.controller,
        builder: (context, _) {
          final controller = widget.controller;

          return Form(
            key: _formKey,
            child: Container(
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
                  _Badge(),
                  SizedBox(height: _compact ? 12 : 20),
                  _HeaderRow(),
                  SizedBox(height: _compact ? 8 : 12),
                  Text(
                    context.l10n.loginPanelDescription,
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.6,
                      color: Colors.white.withValues(alpha: 0.72),
                    ),
                  ),
                  SizedBox(height: _compact ? 12 : 20),
                  _FieldLabel(text: context.l10n.loginFieldEmailLabel),
                  const SizedBox(height: 8),
                  _buildEmailField(controller),
                  if (controller.emailError != null) ...[
                    const SizedBox(height: 6),
                    _ErrorMessage(
                      message: context.l10n.loginEmailValidation(
                        controller.emailError!,
                      ),
                    ),
                  ],
                  SizedBox(height: _compact ? 10 : 16),
                  _FieldLabel(text: context.l10n.loginFieldPasswordLabel),
                  const SizedBox(height: 8),
                  _buildPasswordField(controller),
                  if (controller.passwordError != null) ...[
                    const SizedBox(height: 6),
                    _ErrorMessage(
                      message: context.l10n.loginPasswordValidation(
                        controller.passwordError!,
                      ),
                    ),
                  ],
                  SizedBox(height: _compact ? 8 : 12),
                  _buildOptionsRow(controller),
                  SizedBox(height: _compact ? 6 : 10),
                  _StatusBanner(controller: controller),
                  SizedBox(height: _compact ? 4 : 6),
                  _buildSubmitButton(controller),
                  SizedBox(height: _compact ? 6 : 12),
                  _FooterLinks(onRegisterTap: widget.onRegisterTap),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmailField(LoginController controller) {
    return TextFormField(
      controller: _emailController,
      focusNode: _emailFocusNode,
      keyboardType: TextInputType.emailAddress,
      textInputAction: TextInputAction.next,
      onChanged: controller.updateEmail,
      decoration: InputDecoration(
        prefixIcon: const Icon(Icons.mail_outline),
        hintText: context.l10n.loginFieldEmailPlaceholder,
      ),
    );
  }

  Widget _buildPasswordField(LoginController controller) {
    return TextFormField(
      controller: _passwordController,
      focusNode: _passwordFocusNode,
      textInputAction: TextInputAction.done,
      onChanged: controller.updatePassword,
      obscureText: _obscurePassword,
      decoration: InputDecoration(
        prefixIcon: const Icon(Icons.lock_outline),
        hintText: context.l10n.loginFieldPasswordPlaceholder,
        suffixIcon: IconButton(
          onPressed: () {
            setState(() {
              _obscurePassword = !_obscurePassword;
            });
          },
          icon: Icon(
            _obscurePassword
                ? Icons.visibility_outlined
                : Icons.visibility_off_outlined,
          ),
        ),
      ),
    );
  }

  Widget _buildOptionsRow(LoginController controller) {
    return Row(
      children: [
        Checkbox(
          value: controller.rememberMe,
          onChanged: (value) => controller.toggleRememberMe(value ?? false),
        ),
        const SizedBox(width: 10),
        Text(
          context.l10n.loginRememberMe,
          style: TextStyle(
            fontSize: 13,
            color: Colors.white.withValues(alpha: 0.8),
          ),
        ),
        const Spacer(),
        TextButton(
          onPressed: () {},
          child: Text(
            context.l10n.loginForgotPassword,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.78)),
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton(LoginController controller) {
    final isSubmitting = controller.status == LoginStatus.submitting;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () {
          FocusScope.of(context).unfocus();
          controller.submit();
        },
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
              isSubmitting
                  ? context.l10n.loginSubmitLoading
                  : context.l10n.loginSubmit,
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

class _Badge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.bolt_rounded, size: 16, color: AppColors.glowAmber),
          const SizedBox(width: 8),
          Text(
            context.l10n.loginBadge,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _HeaderRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            context.l10n.loginHeading,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            gradient: const LinearGradient(
              colors: [Color(0xFF163860), Color(0xFF295383)],
            ),
          ),
          child: Text(
            context.l10n.loginXpReady,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.glowCyan,
            ),
          ),
        ),
      ],
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

class _ErrorMessage extends StatelessWidget {
  const _ErrorMessage({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Text(
      message,
      style: const TextStyle(
        fontSize: 12,
        color: Color(0xFFFF99A1),
        fontWeight: FontWeight.w500,
      ),
    );
  }
}

class _StatusBanner extends StatelessWidget {
  const _StatusBanner({required this.controller});

  final LoginController controller;

  @override
  Widget build(BuildContext context) {
    final code = controller.messageCode;
    if (controller.status == LoginStatus.idle || code == null) {
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
              context.l10n.loginStatusMessage(code),
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

class _FooterLinks extends StatelessWidget {
  const _FooterLinks({required this.onRegisterTap});

  final VoidCallback onRegisterTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          context.l10n.loginNoAccountPrompt,
          style: TextStyle(
            fontSize: 13,
            color: Colors.white.withValues(alpha: 0.75),
          ),
        ),
        TextButton(
          onPressed: onRegisterTap,
          child: Text(context.l10n.loginRegisterCta),
        ),
      ],
    );
  }
}
