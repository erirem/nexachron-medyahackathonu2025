import 'package:flutter/material.dart';
import '../../domain/entities/news_item.dart';

class EnhancedNewsCard extends StatefulWidget {
  final NewsItem news;
  final VoidCallback onTap;
  final int index;
  final bool isListItem;

  const EnhancedNewsCard({
    super.key,
    required this.news,
    required this.onTap,
    this.index = 0,
    this.isListItem = false,
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

  IconData _getCategoryIcon() {
    final id = widget.news.categoryId?.toLowerCase();
    switch (id) {
      case 'spor':
        return Icons.sports_soccer;
      case 'politika':
        return Icons.gavel;
      case 'ekonomi':
        return Icons.trending_up;
      case 'dunya':
        return Icons.public;
      case 'gundem':
        return Icons.newspaper;
      case 'teknoloji':
        return Icons.memory;
      case 'saglik':
        return Icons.health_and_safety;
      case 'kultur-sanat':
        return Icons.palette;
      case 'egitim':
        return Icons.school;
      case 'magazin':
        return Icons.star;
      default:
        return Icons.category;
    }
  }

  // Sentiment icon removed from UI to save space

  String _readingMinutesShort() {
    final rt = widget.news.readingTime; // e.g., "2 dk okuma"
    final match = RegExp(r'(\d+)').firstMatch(rt);
    final minutes = match != null ? match.group(1) : '1';
    return '$minutes dk';
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
                borderRadius: BorderRadius.circular(
                  widget.isListItem ? 20 : 28,
                ),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    const Color(
                      0xFF232a3b,
                    ).withOpacity(widget.isListItem ? 0.7 : 0.8),
                    const Color(
                      0xFF1b2130,
                    ).withOpacity(widget.isListItem ? 0.85 : 0.9),
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
                    blurRadius: widget.isListItem
                        ? 8
                        : _elevationAnimation.value,
                    offset: Offset(
                      0,
                      (widget.isListItem ? 4 : _elevationAnimation.value / 2),
                    ),
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
                  // Background image fills the card
                  if (widget.news.imageUrl != null)
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(
                          widget.isListItem ? 20 : 28,
                        ),
                        child: Image.network(
                          widget.news.imageUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: Colors.white.withOpacity(0.06),
                            );
                          },
                        ),
                      ),
                    ),
                  // Top-right reading time badge
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.35),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: categoryColor.withOpacity(0.35),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.access_time,
                            size: 12,
                            color: Colors.white.withOpacity(0.85),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _readingMinutesShort(),
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.white.withOpacity(0.9),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Background gradient overlay
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(
                          widget.isListItem ? 20 : 28,
                        ),
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Colors.black.withOpacity(0.5),
                            Colors.black.withOpacity(0.15),
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
                          borderRadius: BorderRadius.circular(
                            widget.isListItem ? 20 : 28,
                          ),
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
                    padding: EdgeInsets.all(widget.isListItem ? 14 : 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Category row (shows label when there's enough space)
                        LayoutBuilder(
                          builder: (context, constraints) {
                            final bool showCategoryText =
                                constraints.maxWidth >= 180;
                            return Row(
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
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          _getCategoryIcon(),
                                          size: 14,
                                          color: categoryColor.withOpacity(0.9),
                                        ),
                                        if (showCategoryText) ...[
                                          const SizedBox(width: 6),
                                          Text(
                                            widget.news.category!.toUpperCase(),
                                            style: TextStyle(
                                              fontSize: 10,
                                              color: categoryColor.withOpacity(
                                                0.9,
                                              ),
                                              fontWeight: FontWeight.w700,
                                              letterSpacing: 1.2,
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                const Spacer(),
                              ],
                            );
                          },
                        ),

                        const SizedBox(height: 8),

                        // Title overlay at bottom (with semi-transparent backdrop)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.45),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            widget.news.title,
                            maxLines: widget.isListItem ? 2 : 3,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              height: 1.2,
                              shadows: [
                                Shadow(
                                  color: Colors.black87,
                                  blurRadius: 10,
                                  offset: Offset(0, 2),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Context line under title: category • city (compact)
                        if ((widget.news.category != null &&
                                widget.news.category!.isNotEmpty) ||
                            (widget.news.city != null &&
                                widget.news.city!.isNotEmpty))
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (widget.news.category != null &&
                                    widget.news.category!.isNotEmpty) ...[
                                  Icon(
                                    _getCategoryIcon(),
                                    size: 12,
                                    color: Colors.white.withOpacity(0.9),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    widget.news.category!,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.white.withOpacity(0.9),
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                                if (widget.news.city != null &&
                                    widget.news.city!.isNotEmpty) ...[
                                  if (widget.news.category != null &&
                                      widget.news.category!.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 6,
                                      ),
                                      child: Text(
                                        '•',
                                        style: TextStyle(
                                          color: Colors.white.withOpacity(0.6),
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                  Icon(
                                    Icons.location_on_outlined,
                                    size: 12,
                                    color: Colors.white.withOpacity(0.8),
                                  ),
                                  const SizedBox(width: 4),
                                  ConstrainedBox(
                                    constraints: const BoxConstraints(
                                      maxWidth: 140,
                                    ),
                                    child: Text(
                                      widget.news.city!,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Colors.white.withOpacity(0.8),
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),

                        // One-line compact summary to avoid overflow
                        if (widget.news.summary.isNotEmpty)
                          Container(
                            margin: const EdgeInsets.only(top: 8),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.32),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              widget.news.summary,
                              maxLines: widget.isListItem ? 2 : 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: widget.isListItem ? 14 : 13,
                                color: Colors.white.withOpacity(0.95),
                                height: 1.35,
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

                        // Bottom info removed to save space (moved reading time top-right)
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
