import 'package:flutter/material.dart';
import 'dart:ui';

class GlassmorphicButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final Color primaryColor;
  final Color? secondaryColor;
  final IconData? icon;
  final double? width;
  final double height;
  final bool isLoading;
  final bool enabled;

  const GlassmorphicButton({
    super.key,
    required this.text,
    this.onPressed,
    this.primaryColor = Colors.blue,
    this.secondaryColor,
    this.icon,
    this.width,
    this.height = 56,
    this.isLoading = false,
    this.enabled = true,
  });

  @override
  State<GlassmorphicButton> createState() => _GlassmorphicButtonState();
}

class _GlassmorphicButtonState extends State<GlassmorphicButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails details) {
    if (widget.enabled && !widget.isLoading) {
      setState(() => _isPressed = true);
      _controller.forward();
    }
  }

  void _onTapUp(TapUpDetails details) {
    if (widget.enabled && !widget.isLoading) {
      setState(() => _isPressed = false);
      _controller.reverse();
    }
  }

  void _onTapCancel() {
    if (widget.enabled && !widget.isLoading) {
      setState(() => _isPressed = false);
      _controller.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDisabled = !widget.enabled || widget.isLoading;
    final secondaryColor = widget.secondaryColor ?? widget.primaryColor.withOpacity(0.7);

    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: GestureDetector(
            onTapDown: _onTapDown,
            onTapUp: _onTapUp,
            onTapCancel: _onTapCancel,
            onTap: isDisabled ? null : widget.onPressed,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: widget.width,
              height: widget.height,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  if (!isDisabled) ...[
                    BoxShadow(
                      color: widget.primaryColor.withOpacity(0.4),
                      blurRadius: _isPressed ? 8 : 16,
                      spreadRadius: _isPressed ? 0 : 2,
                      offset: Offset(0, _isPressed ? 2 : 8),
                    ),
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: _isPressed ? 4 : 8,
                      offset: Offset(0, _isPressed ? 1 : 4),
                    ),
                  ],
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: isDisabled
                            ? [
                                Colors.grey.withOpacity(0.2),
                                Colors.grey.withOpacity(0.1),
                              ]
                            : [
                                widget.primaryColor.withOpacity(_isPressed ? 0.4 : 0.3),
                                secondaryColor.withOpacity(_isPressed ? 0.3 : 0.2),
                                Colors.white.withOpacity(0.1),
                              ],
                        stops: const [0.0, 0.7, 1.0],
                      ),
                      border: Border.all(
                        color: isDisabled
                            ? Colors.grey.withOpacity(0.3)
                            : Colors.white.withOpacity(_isPressed ? 0.4 : 0.3),
                        width: 1.5,
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Stack(
                      children: [
                        // Glassmorphism overlay
                        Positioned.fill(
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  Colors.white.withOpacity(_isPressed ? 0.15 : 0.2),
                                  Colors.white.withOpacity(_isPressed ? 0.05 : 0.1),
                                  Colors.transparent,
                                ],
                              ),
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                        ),
                        
                        // Content
                        Center(
                          child: widget.isLoading
                              ? SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.white.withOpacity(0.8),
                                    ),
                                  ),
                                )
                              : Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    if (widget.icon != null) ...[
                                      Icon(
                                        widget.icon,
                                        color: Colors.white.withOpacity(isDisabled ? 0.5 : 0.9),
                                        size: 20,
                                      ),
                                      const SizedBox(width: 8),
                                    ],
                                    Text(
                                      widget.text,
                                      style: TextStyle(
                                        color: Colors.white.withOpacity(isDisabled ? 0.5 : 0.9),
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        shadows: [
                                          Shadow(
                                            offset: const Offset(0, 1),
                                            blurRadius: 2,
                                            color: Colors.black.withOpacity(0.3),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

