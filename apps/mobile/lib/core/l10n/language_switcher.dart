import 'package:flutter/material.dart';

import '../config/locales.dart';
import '../services/locale_scope.dart';
import 'l10n.dart';

class LanguageSwitcher extends StatelessWidget {
  const LanguageSwitcher({
    super.key,
    this.backgroundColor,
    this.foregroundColor,
    this.padding,
  });

  final Color? backgroundColor;
  final Color? foregroundColor;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    final controller = LocaleScope.of(context);
    final currentCode = controller.locale?.languageCode ?? defaultLocaleCode;
    final label = localeLabels[currentCode] ?? currentCode.toUpperCase();
    final fg = foregroundColor ?? Colors.white;
    final bg =
        backgroundColor ??
        Colors.white.withValues(
          alpha: Theme.of(context).brightness == Brightness.dark ? 0.08 : 0.12,
        );

    return PopupMenuButton<String>(
      initialValue: currentCode,
      tooltip: context.l10n.commonLanguage,
      onSelected: (code) {
        controller.setLocale(resolveLocale(code));
      },
      itemBuilder: (context) {
        return supportedLocaleCodes
            .map(
              (code) => PopupMenuItem<String>(
                value: code,
                child: Text(localeLabels[code] ?? code.toUpperCase()),
              ),
            )
            .toList();
      },
      child: Container(
        padding:
            padding ?? const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          color: bg,
          border: Border.all(color: fg.withValues(alpha: 0.18)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.language_rounded, size: 16, color: fg),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: fg,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
