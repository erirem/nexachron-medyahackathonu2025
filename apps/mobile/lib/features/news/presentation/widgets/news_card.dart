import 'package:flutter/material.dart';
import '../../domain/entities/news_item.dart';

class NewsCard extends StatelessWidget {
  final NewsItem news;
  final VoidCallback onTap;

  const NewsCard({super.key, required this.news, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white.withOpacity(0.05),
              Colors.white.withOpacity(0.02),
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Expanded(
              flex: 3,
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(20),
                ),
                child: news.imageUrl != null
                    ? Image.network(
                        news.imageUrl!,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: Colors.white.withOpacity(0.1),
                            child: const Center(
                              child: Icon(
                                Icons.image_not_supported,
                                color: Colors.white38,
                                size: 32,
                              ),
                            ),
                          );
                        },
                      )
                    : Container(
                        color: Colors.white.withOpacity(0.1),
                        child: const Center(
                          child: Icon(
                            Icons.newspaper,
                            color: Colors.white38,
                            size: 32,
                          ),
                        ),
                      ),
              ),
            ),

            // Content
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category
                    if (news.category != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0f6acd).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: const Color(0xFF0f6acd).withOpacity(0.3),
                          ),
                        ),
                        child: Text(
                          news.category!,
                          style: const TextStyle(
                            fontSize: 10,
                            color: Color(0xFF9ee8c0),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),

                    const SizedBox(height: 8),

                    // Title
                    Expanded(
                      child: Text(
                        news.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                          height: 1.3,
                        ),
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Meta info
                    Row(
                      children: [
                        Icon(
                          Icons.access_time,
                          size: 12,
                          color: Colors.white.withOpacity(0.5),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            news.relativeTime,
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.white.withOpacity(0.5),
                            ),
                          ),
                        ),
                        if (news.isPopular)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.orange.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Icon(
                              Icons.trending_up,
                              size: 12,
                              color: Colors.orange,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
