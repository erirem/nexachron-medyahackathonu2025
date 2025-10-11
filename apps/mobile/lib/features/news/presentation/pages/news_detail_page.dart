import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/news_provider.dart';
import '../../domain/entities/news_item.dart';
import '../../domain/entities/ai_summary.dart';
import '../widgets/inline_media_widget.dart';
import '../widgets/interactive_image_viewer.dart';
import '../widgets/comments_section.dart';
import '../widgets/ai_summary_button.dart';
import '../widgets/ai_summary_bottom_sheet.dart';
import '../../data/sample_comments.dart';

class NewsDetailPage extends ConsumerWidget {
  final String newsId;

  const NewsDetailPage({super.key, required this.newsId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final newsAsync = ref.watch(newsByIdProvider(newsId));

    return Scaffold(
      backgroundColor: const Color(0xFF0F1624),
      body: newsAsync.when(
        data: (news) => _buildContent(context, news),
        loading: () => const SizedBox.shrink(),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.white.withOpacity(0.5),
              ),
              const SizedBox(height: 16),
              Text(
                'Haber yüklenirken bir sorun oluştu',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(newsByIdProvider(newsId)),
                child: const Text('Yeniden Dene'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, NewsItem news) {
    final scrollController = ScrollController();
    
    // Filter images to exclude primary image and get leftover images
    final inlineImages = _getInlineImages(news);
    final leftoverImages = _getLeftoverImages(inlineImages, news.content);

    return Container(
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          center: Alignment.topLeft,
          radius: 1.5,
          colors: [Color(0xFF162639), Color(0xFF1a2234), Color(0xFF0f1624)],
          stops: [0.0, 0.55, 1.0],
        ),
      ),
      child: CustomScrollView(
        controller: scrollController,
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            backgroundColor: const Color(0xFF0F1624),
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white),
              ),
              onPressed: () => Navigator.pop(context),
            ),
            actions: [
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.bookmark_outline,
                    color: Colors.white,
                  ),
                ),
                onPressed: () {},
              ),
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.share, color: Colors.white),
                ),
                onPressed: () {},
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (news.imageUrl != null)
                    Image.network(
                      news.imageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: Colors.white.withOpacity(0.1),
                          child: const Center(
                            child: Icon(
                              Icons.image_not_supported,
                              color: Colors.white38,
                              size: 64,
                            ),
                          ),
                        );
                      },
                    )
                  else
                    Container(
                      color: Colors.white.withOpacity(0.1),
                      child: const Center(
                        child: Icon(
                          Icons.newspaper,
                          color: Colors.white38,
                          size: 64,
                        ),
                      ),
                    ),
                  // Gradient overlay
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          const Color(0xFF0F1624).withOpacity(0.9),
                        ],
                        stops: const [0.5, 1.0],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 680),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Category and date
                      Row(
                        children: [
                          if (news.category != null)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [
                                    Color(0xFF0f6acd),
                                    Color(0xFF1a8dff),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                news.category!,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          const SizedBox(width: 12),
                          Text(
                            news.relativeTime,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.white.withOpacity(0.6),
                            ),
                          ),
                          if (news.isPopular) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.orange.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Row(
                                children: const [
                                  Icon(
                                    Icons.trending_up,
                                    size: 14,
                                    color: Colors.orange,
                                  ),
                                  SizedBox(width: 4),
                                  Text(
                                    'Popüler',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.orange,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),

                      const SizedBox(height: 20),

                      // Title
                      Text(
                        news.title,
                        style: const TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          height: 1.25,
                          letterSpacing: 0.15,
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Meta info
                      Row(
                        children: [
                          if (news.city != null) ...[
                            Icon(
                              Icons.location_on_outlined,
                              size: 16,
                              color: Colors.white.withOpacity(0.5),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              news.city!,
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.white.withOpacity(0.5),
                              ),
                            ),
                            const SizedBox(width: 16),
                          ],
                          Icon(
                            Icons.access_time,
                            size: 16,
                            color: Colors.white.withOpacity(0.5),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            news.readingTime,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white.withOpacity(0.5),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Summary with AI badge
                      if (news.summary.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.1),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.08),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Colors.white.withOpacity(0.12),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.auto_awesome,
                                      size: 14,
                                      color: Colors.white.withOpacity(0.9),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'AI ile derlendi',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white.withOpacity(0.9),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                news.summary,
                                textAlign: TextAlign.start,
                                strutStyle: const StrutStyle(
                                  forceStrutHeight: true,
                                  height: 1.6,
                                  leading: 0.2,
                                  fontSize: 17,
                                ),
                                style: TextStyle(
                                  fontSize: 17,
                                  color: Colors.white.withOpacity(0.94),
                                  height: 1.6,
                                  letterSpacing: 0.1,
                                  wordSpacing: 0.4,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),

                      const SizedBox(height: 24),

                      // Content
                      _ArticleBody(
                        text: news.content,
                        images: news.images,
                        scrollController: scrollController,
                      ),

                      const SizedBox(height: 32),

                      // Additional images gallery (only leftover images)
                      if (leftoverImages.isNotEmpty)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Galeri',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white.withOpacity(0.9),
                              ),
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              height: 200,
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                itemCount: leftoverImages.length,
                                itemBuilder: (context, index) {
                                  final image = leftoverImages[index];
                                  return Padding(
                                    padding: const EdgeInsets.only(right: 12),
                                    child: GestureDetector(
                                      onTap: () => _openImageViewer(context, image),
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(12),
                                        child: Stack(
                                          children: [
                                            Image.network(
                                              image.url,
                                              width: 300,
                                              fit: BoxFit.cover,
                                              errorBuilder:
                                                  (context, error, stackTrace) {
                                                    return Container(
                                                      width: 300,
                                                      color: Colors.white.withOpacity(
                                                        0.1,
                                                      ),
                                                      child: const Center(
                                                        child: Icon(
                                                          Icons.image_not_supported,
                                                          color: Colors.white38,
                                                          size: 32,
                                                        ),
                                                      ),
                                                    );
                                                  },
                                            ),
                                            // Tap indicator overlay
                                            Positioned(
                                              top: 8,
                                              right: 8,
                                              child: Container(
                                                padding: const EdgeInsets.all(4),
                                                decoration: BoxDecoration(
                                                  color: Colors.black.withOpacity(0.6),
                                                  borderRadius: BorderRadius.circular(12),
                                                ),
                                                child: const Icon(
                                                  Icons.zoom_in,
                                                  color: Colors.white,
                                                  size: 14,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                            const SizedBox(height: 32),
                          ],
                        ),

                      // Comments Section
                      CommentsSection(
                        articleId: news.id,
                        comments: getCommentsForArticle(news.id),
                        currentUser: currentUser,
                        onCommentSubmit: (content) {
                          // Handle comment submission
                          print('New comment: $content');
                        },
                        onReplySubmit: (commentId, content) {
                          // Handle reply submission
                          print('New reply to $commentId: $content');
                        },
                        onCommentLike: (commentId) {
                          // Handle comment like
                          print('Liked comment: $commentId');
                        },
                        onReplyLike: (replyId) {
                          // Handle reply like
                          print('Liked reply: $replyId');
                        },
                      ),

                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Helper function to filter inline images (excludes primary image)
  /// Follows clean code: pure function, single responsibility
  List<NewsImage> _getInlineImages(NewsItem news) {
    if (news.images.isEmpty) return [];

    final uniqueImages = <NewsImage>[];
    final seenUrls = <String>{};

    for (final image in news.images) {
      // Skip if already seen or if it's the primary image
      if (seenUrls.contains(image.url) || image.url == news.imageUrl) {
        continue;
      }

      seenUrls.add(image.url);
      uniqueImages.add(image);
    }

    return uniqueImages;
  }

  /// Helper function to calculate leftover images
  /// Images are distributed to paragraphs, extras become leftovers
  List<NewsImage> _getLeftoverImages(List<NewsImage> images, String content) {
    if (images.isEmpty) return [];

    // Count paragraphs in content
    final paragraphCount = _countParagraphs(content);

    // Images beyond paragraph count become leftovers
    if (images.length <= paragraphCount) {
      return [];
    }

    return images.sublist(paragraphCount);
  }

  /// Helper to count paragraphs in content
  int _countParagraphs(String content) {
    final normalized = content.replaceAll('\r\n', '\n').trim();
    if (normalized.isEmpty) return 0;

    // Use same logic as _ArticleBody
    if (normalized.contains('\n\n')) {
      return normalized
          .split('\n\n')
          .where((p) => p.trim().isNotEmpty)
          .length;
    }

    // Estimate based on sentence grouping
    final sentences = normalized
        .split(RegExp(r'(?<=[.!?])\s+(?=[A-ZÇĞIÖŞÜ])'))
        .where((s) => s.trim().isNotEmpty)
        .length;

    // Approximate: 3-5 sentences per paragraph
    return (sentences / 4).ceil();
  }

  /// Opens the interactive image viewer for gallery images
  void _openImageViewer(BuildContext context, NewsImage image) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => InteractiveImageViewer(
          image: image,
          title: image.caption ?? 'Galeri Resmi',
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.15)),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.white.withOpacity(0.8), size: 24),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.white.withOpacity(0.8),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ArticleBody extends StatefulWidget {
  final String text;
  final List<NewsImage> images;
  final ScrollController scrollController;

  const _ArticleBody({
    required this.text,
    required this.images,
    required this.scrollController,
  });

  @override
  State<_ArticleBody> createState() => _ArticleBodyState();
}

class _ArticleBodyState extends State<_ArticleBody> {
  List<String> paragraphs = [];
  List<NewsImage?> paragraphImages = []; // Image assigned to each paragraph
  int visibleParagraphs = 3; // Başlangıçta 3 paragraf göster
  
  // AI Summary Button State
  bool showAiSummaryButton = false;
  final double summaryButtonThreshold = 0.3; // %30 scroll threshold (uzun cümlelerin ortası)
  int summaryButtonPosition = 2; // Show button after 2nd paragraph (daha erken)
  final int minWordCount = 1000; // Minimum kelime sayısı (uzun haber kontrolü)

  @override
  void initState() {
    super.initState();
    _initializeParagraphs();
    _assignImagesToParagraphs();
    widget.scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    widget.scrollController.removeListener(_onScroll);
    super.dispose();
  }

  void _initializeParagraphs() {
    // Akıllı paragraf bölme: cümleler ve mantıksal yapılar
    String content = widget.text.replaceAll('\r\n', '\n').trim();

    // Eğer metin \n\n ile zaten bölünmüşse, önce onları kullan
    if (content.contains('\n\n')) {
      paragraphs = content
          .split('\n\n')
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList();
    } else {
      // Yoksa, cümleleri grupla (her 3-5 cümle bir paragraf)
      final sentences = content
          .split(RegExp(r'(?<=[.!?])\s+(?=[A-ZÇĞIÖŞÜ])'))
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList();

      paragraphs = [];
      String currentParagraph = '';
      int sentenceCount = 0;

      for (final sentence in sentences) {
        currentParagraph += (currentParagraph.isEmpty ? '' : ' ') + sentence;
        sentenceCount++;

        // Her 3-5 cümle veya 300+ karakter bir paragraf yap
        if (sentenceCount >= 3 && currentParagraph.length > 200 ||
            sentenceCount >= 5 ||
            currentParagraph.length > 400) {
          paragraphs.add(currentParagraph);
          currentParagraph = '';
          sentenceCount = 0;
        }
      }

      // Kalan metni ekle
      if (currentParagraph.isNotEmpty) {
        paragraphs.add(currentParagraph);
      }
    }

    // Eğer hiç paragraf oluşmadıysa, tüm metni tek paragraf yap
    if (paragraphs.isEmpty && content.isNotEmpty) {
      paragraphs = [content];
    }
  }

  void _onScroll() {
    // Sayfa sonuna yaklaşınca daha fazla paragraf yükle
    if (!widget.scrollController.hasClients) return;

    // Infinite scroll logic
    if (widget.scrollController.position.pixels >=
        widget.scrollController.position.maxScrollExtent * 0.8) {
      if (visibleParagraphs < paragraphs.length) {
        setState(() {
          visibleParagraphs = (visibleParagraphs + 2).clamp(
            0,
            paragraphs.length,
          );
        });
      }
    }

    // AI Summary Button visibility logic
    final scrollPosition = widget.scrollController.position.pixels;
    final maxScrollExtent = widget.scrollController.position.maxScrollExtent;
    
    if (maxScrollExtent > 0) {
      final scrollPercentage = scrollPosition / maxScrollExtent;
      
      // Show button when user scrolls past threshold AND content is long enough
      if (scrollPercentage >= summaryButtonThreshold && 
          !showAiSummaryButton && 
          _isContentLongEnough()) {
        setState(() {
          showAiSummaryButton = true;
        });
      }
    }
  }

  /// Assign images to paragraphs following web app's strategy
  /// Clean code: pure logic, testable, single responsibility
  void _assignImagesToParagraphs() {
    // Filter out primary image and duplicates
    final inlineImages = _filterInlineImages();
    
    // Assign one image per paragraph (up to paragraph count)
    paragraphImages = List.generate(
      paragraphs.length,
      (index) => index < inlineImages.length ? inlineImages[index] : null,
    );
  }

  /// Filter inline images (exclude primary image and duplicates)
  List<NewsImage> _filterInlineImages() {
    if (widget.images.isEmpty) return [];

    final uniqueImages = <NewsImage>[];
    final seenUrls = <String>{};

    for (final image in widget.images) {
      // Skip duplicates
      if (seenUrls.contains(image.url)) continue;

      seenUrls.add(image.url);
      uniqueImages.add(image);
    }

    return uniqueImages;
  }

  /// Check if content is long enough to show AI summary button
  bool _isContentLongEnough() {
    // Kelime sayısını hesapla (boşluklarla ayrılmış kelimeler)
    final words = widget.text.trim().split(RegExp(r'\s+'));
    final wordCount = words.where((word) => word.isNotEmpty).length;
    return wordCount >= minWordCount;
  }

  /// Show AI Summary Bottom Sheet
  void _showAiSummaryBottomSheet(BuildContext context) {
    AiSummaryBottomSheet.show(
      context: context,
      summary: AiSummary.beta(),
      onClose: () {
        // Optional: Track user interaction
        print('AI Summary bottom sheet closed');
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (
          int i = 0;
          i < visibleParagraphs.clamp(0, paragraphs.length);
          i++
        ) ...[
          // Paragraph text
          AnimatedOpacity(
            duration: const Duration(milliseconds: 250),
            opacity: 1.0,
            child: Text(
              paragraphs[i],
              textAlign: TextAlign.start,
              strutStyle: const StrutStyle(
                forceStrutHeight: true,
                height: 1.7,
                leading: 0.2,
                fontSize: 18,
              ),
              style: TextStyle(
                fontSize: 18,
                height: 1.7,
                color: Colors.white.withOpacity(0.94),
                letterSpacing: 0.05,
                wordSpacing: 0.45,
              ),
            ),
          ),
          
          // Spacing after paragraph
          if (i != paragraphs.length - 1) const SizedBox(height: 18),
          
          // Inline image for this paragraph (if assigned)
          if (i < paragraphImages.length && paragraphImages[i] != null)
            InlineMediaWidget(image: paragraphImages[i]!),
          
          // AI Summary Button - Show after specified paragraph position
          if (i == summaryButtonPosition - 1 && showAiSummaryButton && _isContentLongEnough())
            AiSummaryButton(
              onTap: () => _showAiSummaryBottomSheet(context),
              isVisible: showAiSummaryButton,
            ),
        ],
        if (visibleParagraphs < paragraphs.length) ...[
          const SizedBox(height: 24),
        ],
      ],
    );
  }
}
