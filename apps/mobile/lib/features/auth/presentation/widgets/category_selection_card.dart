import 'package:flutter/material.dart';

/// Kategori seçim kartı - Web'deki category selection button'a benzer
class CategorySelectionCard extends StatelessWidget {
  const CategorySelectionCard({
    super.key,
    required this.categoryId,
    required this.label,
    required this.description,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  final String categoryId;
  final String label;
  final String description;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF8fb7ff).withOpacity(0.7)
                : Colors.white.withOpacity(0.1),
            width: 1,
          ),
          gradient: isSelected
              ? LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.white.withOpacity(0.2),
                    Colors.white.withOpacity(0.1),
                  ],
                )
              : LinearGradient(
                  colors: [
                    Colors.white.withOpacity(0.05),
                    Colors.white.withOpacity(0.02),
                  ],
                ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF4f8cff).withOpacity(0.25),
                    blurRadius: 45,
                    spreadRadius: 0,
                    offset: const Offset(0, 18),
                  ),
                ]
              : null,
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected
                          ? Colors.transparent
                          : Colors.white.withOpacity(0.1),
                    ),
                    color: isSelected
                        ? const Color(0xFF0e1a33).withOpacity(0.7)
                        : Colors.white.withOpacity(0.05),
                  ),
                  child: Icon(
                    icon,
                    color: isSelected
                        ? const Color(0xFFa7c9ff)
                        : Colors.white.withOpacity(0.6),
                    size: 24,
                  ),
                ),
                const Spacer(),
                if (isSelected)
                  Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFF8fb7ff),
                    ),
                    child: const Icon(
                      Icons.check,
                      color: Color(0xFF0b1629),
                      size: 16,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              description,
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 14,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

