import 'package:flutter/material.dart';

class TransparentLoadingOverlay extends StatelessWidget {
  final bool isLoading;
  final Widget child;

  const TransparentLoadingOverlay({
    super.key,
    required this.isLoading,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (isLoading)
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  const Color(0xFF1a2234).withOpacity(0.2),
                  const Color(0xFF162639).withOpacity(0.3),
                  const Color(0xFF0f1624).withOpacity(0.4),
                  const Color(0xFF1a2234).withOpacity(0.5),
                ],
                stops: const [0.0, 0.3, 0.7, 1.0],
              ),
            ),
            child: Center(
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      const Color(0xFF1a2234).withOpacity(0.6),
                      const Color(0xFF162639).withOpacity(0.7),
                      const Color(0xFF0f1624).withOpacity(0.8),
                      const Color(0xFF1a2234).withOpacity(0.9),
                    ],
                    stops: const [0.0, 0.3, 0.7, 1.0],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFF4a90e2).withOpacity(0.5),
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF4a90e2).withOpacity(0.4),
                      blurRadius: 25,
                      offset: const Offset(0, 8),
                      spreadRadius: 3,
                    ),
                    BoxShadow(
                      color: const Color(0xFF1a2234).withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 4),
                      spreadRadius: 1,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      width: 40,
                      height: 40,
                      child: CircularProgressIndicator(
                        strokeWidth: 3,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          const Color(0xFF4a90e2).withOpacity(0.9),
                        ),
                        backgroundColor: Colors.white.withOpacity(0.1),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Yeni içerikler yükleniyor...',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.95),
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        shadows: [
                          Shadow(
                            color: const Color(0xFF4a90e2).withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}
