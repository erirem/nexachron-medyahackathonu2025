import 'package:flutter/widgets.dart';

class FadeSlideUp extends StatelessWidget {
  const FadeSlideUp({
    super.key,
    required this.animation,
    required this.child,
    this.offset = 40,
  });

  final Animation<double> animation;
  final Widget child;
  final double offset;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: animation,
      builder: (context, child) {
        final value = animation.value;
        return Opacity(
          opacity: value.clamp(0, 1),
          child: Transform.translate(
            offset: Offset(0, (1 - value) * offset),
            child: child,
          ),
        );
      },
      child: child,
    );
  }
}
