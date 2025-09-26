enum FloatingCardVariant { xp, card, ai, quiz, streak, emoji }

class FloatingCardInfo {
  const FloatingCardInfo({
    required this.title,
    required this.description,
    required this.variant,
    this.capture,
  });

  final String title;
  final String description;
  final FloatingCardVariant variant;
  final String? capture;
}
