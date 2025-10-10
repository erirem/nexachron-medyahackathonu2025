import 'package:flutter/material.dart';

class CategoryChip extends StatelessWidget {
  final String label;
  final int? count;
  final bool isActive;
  final VoidCallback onTap;
  final bool compact;

  const CategoryChip({
    super.key,
    required this.label,
    this.count,
    required this.isActive,
    required this.onTap,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: compact ? 12 : 16,
            vertical: compact ? 8 : 12,
          ),
          decoration: BoxDecoration(
            gradient: isActive
                ? const LinearGradient(
                    colors: [Color(0xFF0f6acd), Color(0xFF1a8dff)],
                  )
                : null,
            color: isActive ? null : Colors.white.withOpacity(0.08),
            borderRadius: BorderRadius.circular(compact ? 18 : 24),
            border: Border.all(
              color: isActive
                  ? Colors.white.withOpacity(0.3)
                  : Colors.white.withOpacity(0.12),
            ),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: const Color(0xFF0f6acd).withOpacity(0.25),
                      blurRadius: compact ? 8 : 12,
                      offset: const Offset(0, 3),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: compact ? 13 : 14,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                  color: isActive
                      ? Colors.white
                      : Colors.white.withOpacity(0.75),
                ),
              ),
              if (count != null) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: isActive
                        ? Colors.white.withOpacity(0.2)
                        : Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    count.toString(),
                    style: TextStyle(
                      fontSize: compact ? 11 : 12,
                      fontWeight: FontWeight.w600,
                      color: isActive
                          ? Colors.white
                          : Colors.white.withOpacity(0.6),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
