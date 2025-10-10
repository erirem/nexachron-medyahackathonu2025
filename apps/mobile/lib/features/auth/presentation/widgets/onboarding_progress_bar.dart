import 'package:flutter/material.dart';

/// Onboarding ilerleme göstergesi
class OnboardingProgressBar extends StatelessWidget {
  const OnboardingProgressBar({
    super.key,
    required this.currentStep,
    required this.totalSteps,
  });

  final int currentStep;
  final int totalSteps;

  @override
  Widget build(BuildContext context) {
    final progress = currentStep / totalSteps;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Container(
          height: 4,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(2),
            color: Colors.white.withOpacity(0.1),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: progress,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(2),
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF4f8cff),
                    Color(0xFF8f61ff),
                    Color(0xFFff7ab8),
                  ],
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'İlerleme %${(progress * 100).round()}',
          style: TextStyle(
            color: Colors.white.withOpacity(0.5),
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}

/// Adım göstergesi kartı
class OnboardingStepIndicator extends StatelessWidget {
  const OnboardingStepIndicator({
    super.key,
    required this.stepNumber,
    required this.title,
    required this.caption,
    required this.icon,
    required this.isActive,
    required this.isCompleted,
  });

  final int stepNumber;
  final String title;
  final String caption;
  final IconData icon;
  final bool isActive;
  final bool isCompleted;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive
              ? const Color(0xFF8fb7ff).withOpacity(0.6)
              : isCompleted
                  ? Colors.white.withOpacity(0.15)
                  : Colors.white.withOpacity(0.1),
        ),
        gradient: isActive
            ? LinearGradient(
                colors: [
                  Colors.white.withOpacity(0.2),
                  Colors.white.withOpacity(0.1),
                ],
              )
            : isCompleted
                ? LinearGradient(
                    colors: [
                      Colors.white.withOpacity(0.1),
                      Colors.white.withOpacity(0.05),
                    ],
                  )
                : LinearGradient(
                    colors: [
                      Colors.white.withOpacity(0.05),
                      Colors.white.withOpacity(0.02),
                    ],
                  ),
        boxShadow: isActive
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
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: isCompleted
                  ? const LinearGradient(
                      colors: [Color(0xFF8fb7ff), Color(0xFF8fb7ff)],
                    )
                  : isActive
                      ? const LinearGradient(
                          colors: [Color(0xFF4f8cff), Color(0xFF8f61ff)],
                        )
                      : null,
              color: isCompleted || isActive
                  ? null
                  : Colors.white.withOpacity(0.1),
            ),
            child: Center(
              child: isCompleted
                  ? const Icon(
                      Icons.check,
                      color: Color(0xFF0b1629),
                      size: 20,
                    )
                  : Icon(
                      icon,
                      color: isActive
                          ? Colors.white
                          : Colors.white.withOpacity(0.7),
                      size: 20,
                    ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  caption,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

