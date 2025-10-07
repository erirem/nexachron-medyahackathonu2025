import 'package:flutter/material.dart';
import '../../domain/entities/news_item.dart';

class EnhancedNewsCard extends StatefulWidget {
  final NewsItem news;
  final VoidCallback onTap;
  final int index;

  const EnhancedNewsCard({
    super.key,
    required this.news,
    required this.onTap,
    this.index = 0,
  });

  @override
  State<EnhancedNewsCard> createState() => _EnhancedNewsCardState();
}

class _EnhancedNewsCardState extends State<EnhancedNewsCard>
    with SingleTickerProviderStateMixin {
  bool _isHovered = false;
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _elevationAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.02,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    _elevationAnimation = Tween<double>(
      begin: 8.0,
      end: 16.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Color _getCategoryColor() {
    final categoryColors = {
      'gundem': const Color(0xFF4a90e2),
      'finans': const Color(0xFF3a83ff),
      'teknoloji': const Color(0xFF9c6bff),
      'savunma': const Color(0xFFff7d3a),
      'diplomasi': const Color(0xFF4f9dff),
      'enerji': const Color(0xFF30de7b),
      'saglik': const Color(0xFF20c9ba),
      'ekonomi': const Color(0xFFffad33),
      'spor': const Color(0xFF45c2ff),
    };

    return categoryColors[widget.news.categoryId?.toLowerCase()] ??
        const Color(0xFF5aa2ff);
  }

  IconData _getSentimentIcon() {
    if (widget.news.isPopular) return Icons.whatshot;
    return Icons.article;
  }

  Color _getSentimentIconColor() {
    if (widget.news.isPopular) return Colors.orange;
    return Colors.white.withOpacity(0.7);
  }

  @override
  Widget build(BuildContext context) {
    final categoryColor = _getCategoryColor();

    return GestureDetector(
      onTap: widget.onTap,
      onLongPressStart: (_) {
        setState(() => _isHovered = true);
        _controller.forward();
      },
      onLongPressEnd: (_) {
        setState(() => _isHovered = false);
        _controller.reverse();
      },
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(28),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    const Color(0xFF232a3b).withOpacity(0.8),
                    const Color(0xFF1b2130).withOpacity(0.9),
                    const Color(0xFF111826),
                  ],
                ),
                border: Border.all(
                  color: categoryColor.withOpacity(0.3),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.5),
                    blurRadius: _elevationAnimation.value,
                    offset: Offset(0, _elevationAnimation.value / 2),
                  ),
                  if (_isHovered)
                    BoxShadow(
                      color: categoryColor.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                ],
              ),
              child: Stack(
                children: [
                  // Background gradient overlay
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(28),
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Colors.white.withOpacity(0.08),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Hover overlay
                  if (_isHovered)
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(28),
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withOpacity(0.7),
                              Colors.black.withOpacity(0.85),
                              Colors.black.withOpacity(0.95),
                            ],
                          ),
                        ),
                      ),
                    ),

                  // Content
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Category and Time
                        Row(
                          children: [
                            if (widget.news.category != null)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: categoryColor.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: categoryColor.withOpacity(0.3),
                                  ),
                                ),
                                child: Text(
                                  widget.news.category!.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: categoryColor.withOpacity(0.9),
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1.2,
                                  ),
                                ),
                              ),
                            const Spacer(),
                            Icon(
                              _getSentimentIcon(),
                              size: 20,
                              color: _getSentimentIconColor(),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Title
                        Flexible(
                          child: Text(
                            widget.news.title,
                            maxLines: _isHovered ? 4 : 3,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: _isHovered ? 16 : 15,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              height: 1.3,
                            ),
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Image
                        if (widget.news.imageUrl != null)
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: Stack(
                                children: [
                                  Image.network(
                                    widget.news.imageUrl!,
                                    width: double.infinity,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Container(
                                        color: Colors.white.withOpacity(0.1),
                                        child: Center(
                                          child: Icon(
                                            Icons.image_not_supported,
                                            color: Colors.white.withOpacity(
                                              0.3,
                                            ),
                                            size: 48,
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                  // Image overlay
                                  Positioned.fill(
                                    child: Container(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          begin: Alignment.topCenter,
                                          end: Alignment.bottomCenter,
                                          colors: [
                                            Colors.transparent,
                                            Colors.black.withOpacity(0.6),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                  // Time badge on image removed per UX request
                                  if (widget.news.isPopular)
                                    Positioned(
                                      top: 8,
                                      right: 8,
                                      child: Container(
                                        padding: const EdgeInsets.all(6),
                                        decoration: BoxDecoration(
                                          color: Colors.orange.withOpacity(0.9),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                          Icons.trending_up,
                                          size: 16,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ),

                        const SizedBox(height: 12),

                        // Summary (only visible when not hovering)
                        if (!_isHovered && widget.news.summary.isNotEmpty)
                          Flexible(
                            child: Text(
                              widget.news.summary,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.white.withOpacity(0.7),
                                height: 1.4,
                              ),
                            ),
                          ),

                        // Hover content - AI summary style
                        if (_isHovered)
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // AI badge
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            categoryColor.withOpacity(0.3),
                                            categoryColor.withOpacity(0.2),
                                          ],
                                        ),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                          color: categoryColor.withOpacity(0.3),
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            Icons.auto_awesome,
                                            size: 12,
                                            color: categoryColor,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            'AI ile Özetlendi',
                                            style: TextStyle(
                                              fontSize: 10,
                                              color: categoryColor,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),

                                // Bullet points
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            '•',
                                            style: TextStyle(
                                              color: categoryColor,
                                              fontSize: 16,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              widget.news.summary,
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                fontSize: 13,
                                                color: Colors.white,
                                                height: 1.4,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),

                                // Action buttons
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    _ActionButton(
                                      icon: Icons.bookmark_outline,
                                      label: 'Kaydet',
                                      color: categoryColor,
                                    ),
                                    const SizedBox(width: 8),
                                    _ActionButton(
                                      icon: Icons.volume_up_outlined,
                                      label: 'Dinle',
                                      color: Colors.green,
                                    ),
                                    const SizedBox(width: 8),
                                    _ActionButton(
                                      icon: Icons.share_outlined,
                                      label: 'Paylaş',
                                      color: Colors.white.withOpacity(0.5),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                        // Bottom info
                        if (!_isHovered)
                          Row(
                            children: [
                              Icon(
                                Icons.access_time,
                                size: 14,
                                color: Colors.white.withOpacity(0.5),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                widget.news.readingTime,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.white.withOpacity(0.5),
                                ),
                              ),
                              if (widget.news.city != null) ...[
                                const SizedBox(width: 12),
                                Icon(
                                  Icons.location_on_outlined,
                                  size: 14,
                                  color: Colors.white.withOpacity(0.5),
                                ),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    widget.news.city!,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.white.withOpacity(0.5),
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ],
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
