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
    final bool listMode = widget.isListItem;

    return GestureDetector(
      onTap: widget.onTap,
      onLongPressStart: (_) {
        if (mounted) {
          setState(() => _isHovered = true);
          _controller.forward();
        }
      },
      onLongPressEnd: (_) {
        if (mounted) {
          setState(() => _isHovered = false);
          _controller.reverse();
        }
      },
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              height: listMode ? 320 : 380, // Kart yüksekliğini artırdık
              margin: EdgeInsets.symmetric(
                horizontal: listMode ? 8 : 12,
                vertical: listMode ? 6 : 8,
              ),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(
                  widget.isListItem ? 20 : 28,
                ),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    const Color(0xFF232a3b).withOpacity(listMode ? 0.8 : 0.9),
                    const Color(0xFF1b2130).withOpacity(listMode ? 0.9 : 0.95),
                    const Color(0xFF111826),
                    // Kategori renginden hafif bir ton ekle
                    categoryColor.withOpacity(0.05),
                  ],
                ),
                // Border yerine gradient border efekti
                // border: Border.all(
                //   color: categoryColor.withOpacity(0.5),
                //   width: 1.5,
                // ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(
                      0.7,
                    ), // Gölgeyi daha koyu yaptık
                    blurRadius: listMode ? 12 : _elevationAnimation.value + 4,
                    offset: Offset(
                      0,
                      (listMode ? 6 : _elevationAnimation.value / 2 + 2),
                    ),
                    spreadRadius: 1, // Gölge yayılmasını artırdık
                  ),
                  BoxShadow(
                    color: categoryColor.withOpacity(
                      0.15,
                    ), // Kategori renginde hafif gölge
                    blurRadius: listMode ? 8 : 12,
                    offset: const Offset(0, 4),
                    spreadRadius: 0.5,
                  ),
                  if (_isHovered)
                    BoxShadow(
                      color: categoryColor.withOpacity(0.4),
                      blurRadius: 25,
                      offset: const Offset(0, 12),
                      spreadRadius: 2,
                    ),
                ],
              ),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(
                    widget.isListItem ? 20 : 28,
                  ),
                  // Gradient border efekti
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      categoryColor.withOpacity(0.8), // Alt kısım daha belirgin
                      categoryColor.withOpacity(0.6),
                      categoryColor.withOpacity(0.4),
                      categoryColor.withOpacity(0.2),
                      categoryColor.withOpacity(0.1), // Üst kısım daha hafif
                    ],
                    stops: const [0.0, 0.3, 0.6, 0.8, 1.0],
                  ),
                ),
                child: Container(
                  margin: const EdgeInsets.all(
                    1.5,
                  ), // Border kalınlığı kadar margin
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(
                      widget.isListItem ? 18.5 : 26.5,
                    ),
                    color: const Color(0xFF111826), // Ana kart rengi
                  ),
                  child: Column(
                    children: [
                      // Resim kısmı - üstte sabit yükseklik
                      Expanded(
                        flex: 3,
                        child: Stack(
                          children: [
                            // Background image - gradyan şekilde aşağı doğru uzatılmış
                            if (widget.news.imageUrl != null)
                              Positioned.fill(
                                child: ClipRRect(
                                  borderRadius: BorderRadius.only(
                                    topLeft: Radius.circular(
                                      widget.isListItem ? 20 : 28,
                                    ),
                                    topRight: Radius.circular(
                                      widget.isListItem ? 20 : 28,
                                    ),
                                  ),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      image: DecorationImage(
                                        image: NetworkImage(
                                          widget.news.imageUrl!,
                                        ),
                                        fit: BoxFit.cover,
                                        onError: (exception, stackTrace) {
                                          // Hata durumunda varsayılan renk
                                        },
                                      ),
                                      gradient: LinearGradient(
                                        begin: Alignment.topCenter,
                                        end: Alignment.bottomCenter,
                                        colors: [
                                          Colors.transparent,
                                          Colors.transparent,
                                          Colors.black.withOpacity(0.1),
                                          Colors.black.withOpacity(0.4),
                                          Colors.black.withOpacity(0.7),
                                          Colors.black.withOpacity(0.9),
                                        ],
                                        stops: const [
                                          0.0,
                                          0.4,
                                          0.6,
                                          0.8,
                                          0.95,
                                          1.0,
                                        ],
                                      ),
                                    ),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          begin: Alignment.topCenter,
                                          end: Alignment.bottomCenter,
                                          colors: [
                                            Colors.transparent,
                                            Colors.transparent,
                                            Colors.black.withOpacity(0.2),
                                            Colors.black.withOpacity(0.5),
                                            Colors.black.withOpacity(0.8),
                                            Colors.black.withOpacity(0.95),
                                          ],
                                          stops: const [
                                            0.0,
                                            0.3,
                                            0.5,
                                            0.7,
                                            0.9,
                                            1.0,
                                          ],
                                        ),
                                      ),
                                    ),
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
                                  color: Colors.black.withOpacity(0.6),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: categoryColor.withOpacity(0.5),
                                    width: 1.2,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.3),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
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

                            // Kategori etiketi
                            if (widget.news.category != null)
                              Positioned(
                                top: 8,
                                left: 8,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: categoryColor.withOpacity(0.25),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: categoryColor.withOpacity(0.6),
                                      width: 1.2,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: categoryColor.withOpacity(0.2),
                                        blurRadius: 8,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        _getCategoryIcon(),
                                        size: 14,
                                        color: categoryColor.withOpacity(0.9),
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        widget.news.category!.toUpperCase(),
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: categoryColor.withOpacity(0.9),
                                          fontWeight: FontWeight.w700,
                                          letterSpacing: 1.2,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),

                            // Başlık - resmin alt kısmında
                            Positioned(
                              bottom: 8,
                              left: 8,
                              right: 8,
                              child: Text(
                                widget.news.title,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: listMode ? 16 : 18,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  height: 1.25,
                                  shadows: const [
                                    Shadow(
                                      color: Colors.black87,
                                      blurRadius: 10,
                                      offset: Offset(0, 2),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Metin içeriği alanı - sabit renkli arka plan
                      Expanded(
                        flex: 2,
                        child: Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.black.withOpacity(
                                  0.95,
                                ), // Daha koyu başlangıç
                                Colors.black.withOpacity(0.9),
                                const Color(0xFF1a1f2e),
                                const Color(0xFF151b2a), // Biraz daha koyu ton
                                const Color(
                                  0xFF0f141f,
                                ), // En alt kısım daha koyu
                              ],
                              stops: const [0.0, 0.1, 0.3, 0.7, 1.0],
                            ),
                            borderRadius: BorderRadius.only(
                              bottomLeft: Radius.circular(
                                widget.isListItem ? 20 : 28,
                              ),
                              bottomRight: Radius.circular(
                                widget.isListItem ? 20 : 28,
                              ),
                            ),
                          ),
                          padding: EdgeInsets.all(listMode ? 12 : 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Şehir bilgisi
                              if (widget.news.city != null &&
                                  widget.news.city!.isNotEmpty)
                                Container(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: Colors.white.withOpacity(0.2),
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.location_on_outlined,
                                        size: 12,
                                        color: Colors.white.withOpacity(0.8),
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        widget.news.city!,
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: Colors.white.withOpacity(0.8),
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),

                              // Açıklama metni - daha okunabilir
                              if (widget.news.summary.isNotEmpty)
                                Expanded(
                                  child: Text(
                                    widget.news.summary,
                                    maxLines: listMode ? 3 : 4,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: listMode ? 13 : 14,
                                      color: Colors.white.withOpacity(0.9),
                                      height: 1.4,
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
