import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/news_provider.dart';
import '../widgets/enhanced_news_card.dart';
import '../widgets/category_chip.dart';
import '../widgets/search_bar.dart';
import '../widgets/profile_dropdown_menu.dart';
import '../widgets/transparent_loading_overlay.dart';
import '../../../auth/domain/services/supabase_auth_gateway.dart';
import '../../../auth/presentation/pages/profile_screen.dart';
import '../../../auth/presentation/pages/landing_page.dart';
import 'news_detail_page.dart';

class DashboardPage extends ConsumerStatefulWidget {
  const DashboardPage({super.key});

  @override
  ConsumerState<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends ConsumerState<DashboardPage> {
  final ScrollController _scrollController = ScrollController();
  bool _showCategories = false;
  bool _showProfileMenu = false;
  bool _isRefreshing = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    // İlk yükleme - timeout ile
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadInitialWithTimeout();
    });
  }

  Future<void> _loadInitialWithTimeout() async {
    try {
      await ref
          .read(infiniteNewsProvider.notifier)
          .loadInitial()
          .timeout(
            const Duration(seconds: 15),
            onTimeout: () {
              print('⚠️ News loading timeout - continuing with empty state');
            },
          );
    } catch (e) {
      print('❌ Error loading initial news: $e');
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      ref.read(infiniteNewsProvider.notifier).loadMore();
    }
  }

  Future<void> _onRefresh() async {
    if (_isRefreshing) return;

    setState(() => _isRefreshing = true);

    try {
      // Refresh news list
      await ref.read(infiniteNewsProvider.notifier).loadInitial();

      // Refresh recommendations
      ref.invalidate(recommendationsProvider);

      // Add a small delay for better UX
      await Future.delayed(const Duration(milliseconds: 500));
    } catch (e) {
      print('Refresh error: $e');
    } finally {
      setState(() => _isRefreshing = false);
    }
  }

  void _showRecommendationsInfo(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF1a1f2e),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.white.withOpacity(0.2), width: 1),
          ),
          title: Row(
            children: [
              Icon(
                Icons.auto_awesome,
                color: Colors.white.withOpacity(0.9),
                size: 24,
              ),
              const SizedBox(width: 8),
              Text(
                'Sizin İçin Önerilenler',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Bu bölümde size özel olarak seçilmiş haberler bulunmaktadır.',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.8),
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.trending_up,
                    color: Colors.blue.withOpacity(0.8),
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Okuma geçmişinize göre kişiselleştirilmiş içerikler',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.schedule,
                    color: Colors.green.withOpacity(0.8),
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Güncel ve popüler haberlerden seçilmiş öneriler',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.refresh,
                    color: Colors.orange.withOpacity(0.8),
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Sayfayı yenilediğinizde farklı öneriler görürsünüz',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Anladım',
                style: TextStyle(
                  color: Colors.blue.withOpacity(0.8),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(categoriesProvider);
    final selectedCategory = ref.watch(selectedCategoryProvider);
    final infiniteNews = ref.watch(infiniteNewsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0F1624),
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                center: Alignment.topLeft,
                radius: 1.5,
                colors: [
                  Color(0xFF162639),
                  Color(0xFF1a2234),
                  Color(0xFF0f1624),
                ],
                stops: [0.0, 0.55, 1.0],
              ),
            ),
            child: TransparentLoadingOverlay(
              isLoading: _isRefreshing,
              child: Column(
                children: [
                  // App Bar
                  Container(
                    padding: EdgeInsets.only(
                      top: MediaQuery.of(context).padding.top + 10,
                      left: 16,
                      right: 16,
                      bottom: 10,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Nexachron',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(
                                Icons.notifications_outlined,
                                color: Colors.white,
                              ),
                              onPressed: () {},
                            ),
                            IconButton(
                              icon: const Icon(
                                Icons.account_circle_outlined,
                                color: Colors.white,
                              ),
                              onPressed: () {
                                setState(
                                  () => _showProfileMenu = !_showProfileMenu,
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Search Bar
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16.0, 0, 16.0, 16.0),
                    child: NewsSearchBar(
                      onSearch: (query) {
                        ref.read(searchQueryProvider.notifier).setQuery(query);
                      },
                    ),
                  ),

                  // Content
                  Expanded(
                    child: RefreshIndicator(
                      onRefresh: _onRefresh,
                      color: Colors.white.withOpacity(0.8),
                      backgroundColor: Colors.black.withOpacity(0.7),
                      child: CustomScrollView(
                        controller: _scrollController,
                        slivers: [
                          // Header
                          SliverToBoxAdapter(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16.0,
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'AA PANORAMASI',
                                    style: TextStyle(
                                      fontSize: 12,
                                      letterSpacing: 3,
                                      color: Colors.white.withOpacity(0.6),
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  // Başlık alanında otomatik dönen sabah/öğlen özeti
                                  const _BriefRotator(),
                                ],
                              ),
                            ),
                          ),

                          const SliverToBoxAdapter(child: SizedBox(height: 24)),
                          // Loading info banner for personalized feed
                          if (infiniteNews.items.isEmpty &&
                              infiniteNews.isLoading)
                            SliverToBoxAdapter(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.06),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: Colors.white.withOpacity(0.1),
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      const SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Text(
                                          'Sizin için kişisel haberler yükleniyor…',
                                          style: TextStyle(
                                            color: Colors.white.withOpacity(
                                              0.85,
                                            ),
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),

                          // Categories (collapsible)
                          SliverToBoxAdapter(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16.0,
                                  ),
                                  child: GestureDetector(
                                    onTap: () => setState(
                                      () => _showCategories = !_showCategories,
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          _showCategories
                                              ? Icons.keyboard_arrow_up
                                              : Icons.keyboard_arrow_down,
                                          color: Colors.white.withOpacity(0.8),
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Kategoriler',
                                          style: TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w600,
                                            color: Colors.white.withOpacity(
                                              0.85,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                AnimatedCrossFade(
                                  duration: const Duration(milliseconds: 200),
                                  crossFadeState: _showCategories
                                      ? CrossFadeState.showSecond
                                      : CrossFadeState.showFirst,
                                  firstChild: const SizedBox.shrink(),
                                  secondChild: categories.when(
                                    data: (cats) => SizedBox(
                                      height: 40,
                                      child: ListView.builder(
                                        scrollDirection: Axis.horizontal,
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 16,
                                        ),
                                        itemCount: cats.length + 1,
                                        itemBuilder: (context, index) {
                                          if (index == 0) {
                                            return CategoryChip(
                                              label: 'Senin için',
                                              isActive:
                                                  selectedCategory == null,
                                              compact: true,
                                              onTap: () {
                                                ref
                                                    .read(
                                                      selectedCategoryProvider
                                                          .notifier,
                                                    )
                                                    .clear();
                                                ref
                                                    .read(
                                                      infiniteNewsProvider
                                                          .notifier,
                                                    )
                                                    .loadInitial();
                                              },
                                            );
                                          }
                                          final category = cats[index - 1];
                                          return CategoryChip(
                                            label: category.label,
                                            count: category.total,
                                            isActive:
                                                selectedCategory == category.id,
                                            compact: true,
                                            onTap: () {
                                              ref
                                                  .read(
                                                    selectedCategoryProvider
                                                        .notifier,
                                                  )
                                                  .setCategory(category.id);
                                              ref
                                                  .read(
                                                    infiniteNewsProvider
                                                        .notifier,
                                                  )
                                                  .loadInitial(
                                                    categoryId: category.id,
                                                  );
                                            },
                                          );
                                        },
                                      ),
                                    ),
                                    loading: () => const Center(
                                      child: CircularProgressIndicator(),
                                    ),
                                    error: (error, stack) =>
                                        const SizedBox.shrink(),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const SliverToBoxAdapter(child: SizedBox(height: 24)),

                          // Recommendations Section Header
                          Consumer(
                            builder: (context, ref, child) {
                              final recommendations = ref.watch(
                                recommendationsProvider,
                              );
                              return recommendations.when(
                                data: (items) {
                                  if (items.isEmpty) {
                                    return const SliverToBoxAdapter(
                                      child: SizedBox.shrink(),
                                    );
                                  }

                                  return SliverToBoxAdapter(
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 16,
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(
                                            Icons.auto_awesome,
                                            color: Colors.white.withOpacity(
                                              0.8,
                                            ),
                                            size: 20,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            'Sizin İçin Önerilenler',
                                            style: TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white.withOpacity(
                                                0.9,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          GestureDetector(
                                            onTap: () =>
                                                _showRecommendationsInfo(
                                                  context,
                                                ),
                                            child: Container(
                                              padding: const EdgeInsets.all(4),
                                              decoration: BoxDecoration(
                                                color: Colors.white.withOpacity(
                                                  0.1,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                                border: Border.all(
                                                  color: Colors.white
                                                      .withOpacity(0.2),
                                                  width: 1,
                                                ),
                                              ),
                                              child: Icon(
                                                Icons.info_outline,
                                                size: 16,
                                                color: Colors.white.withOpacity(
                                                  0.7,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                                loading: () => const SliverToBoxAdapter(
                                  child: SizedBox.shrink(),
                                ),
                                error: (error, stack) =>
                                    const SliverToBoxAdapter(
                                      child: SizedBox.shrink(),
                                    ),
                              );
                            },
                          ),

                          // Recommendations List
                          Consumer(
                            builder: (context, ref, child) {
                              final recommendations = ref.watch(
                                recommendationsProvider,
                              );
                              return recommendations.when(
                                data: (items) {
                                  if (items.isEmpty) {
                                    return const SliverToBoxAdapter(
                                      child: SizedBox.shrink(),
                                    );
                                  }

                                  return SliverPadding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                    ),
                                    sliver: SliverList(
                                      delegate: SliverChildBuilderDelegate((
                                        context,
                                        index,
                                      ) {
                                        final news = items[index];
                                        return Padding(
                                          padding: const EdgeInsets.only(
                                            bottom: 12,
                                          ),
                                          child: EnhancedNewsCard(
                                            news: news,
                                            index: index,
                                            isListItem: true,
                                            onTap: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) =>
                                                      NewsDetailPage(
                                                        newsId: news.id,
                                                      ),
                                                ),
                                              );
                                            },
                                          ),
                                        );
                                      }, childCount: items.length),
                                    ),
                                  );
                                },
                                loading: () => const SliverToBoxAdapter(
                                  child: SizedBox.shrink(),
                                ),
                                error: (error, stack) =>
                                    const SliverToBoxAdapter(
                                      child: SizedBox.shrink(),
                                    ),
                              );
                            },
                          ),

                          // Spacing after recommendations
                          Consumer(
                            builder: (context, ref, child) {
                              final recommendations = ref.watch(
                                recommendationsProvider,
                              );
                              return recommendations.when(
                                data: (items) {
                                  if (items.isEmpty) {
                                    return const SliverToBoxAdapter(
                                      child: SizedBox.shrink(),
                                    );
                                  }
                                  return const SliverToBoxAdapter(
                                    child: SizedBox(height: 24),
                                  );
                                },
                                loading: () => const SliverToBoxAdapter(
                                  child: SizedBox.shrink(),
                                ),
                                error: (error, stack) =>
                                    const SliverToBoxAdapter(
                                      child: SizedBox.shrink(),
                                    ),
                              );
                            },
                          ),

                          // News List - Infinite Scroll (single column)
                          if (infiniteNews.items.isEmpty &&
                              infiniteNews.isLoading)
                            SliverPadding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                              ),
                              sliver: SliverList(
                                delegate: SliverChildBuilderDelegate(
                                  (context, index) => Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: _buildSkeletonCard(),
                                  ),
                                  childCount: 6,
                                ),
                              ),
                            )
                          else if (infiniteNews.items.isEmpty)
                            const SliverFillRemaining(
                              child: Center(
                                child: Text(
                                  'Bu kategoride haber bulunamadı',
                                  style: TextStyle(color: Colors.white70),
                                ),
                              ),
                            )
                          else
                            SliverPadding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                              ),
                              sliver: SliverList(
                                delegate: SliverChildBuilderDelegate((
                                  context,
                                  index,
                                ) {
                                  final news = infiniteNews.items[index];
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: EnhancedNewsCard(
                                      news: news,
                                      index: index,
                                      isListItem: true,
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) =>
                                                NewsDetailPage(newsId: news.id),
                                          ),
                                        );
                                      },
                                    ),
                                  );
                                }, childCount: infiniteNews.items.length),
                              ),
                            ),

                          // Loading Indicator
                          if (infiniteNews.isLoading &&
                              infiniteNews.items.isNotEmpty)
                            SliverToBoxAdapter(
                              child: Padding(
                                padding: const EdgeInsets.all(24.0),
                                child: Center(
                                  child: SizedBox(
                                    width: 32,
                                    height: 32,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 3,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white.withOpacity(0.7),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),

                          const SliverToBoxAdapter(child: SizedBox(height: 32)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Profile dropdown menu overlay
          if (_showProfileMenu)
            Positioned.fill(
              child: GestureDetector(
                onTap: () => setState(() => _showProfileMenu = false),
                child: Container(
                  color: Colors.black.withOpacity(0.3),
                  child: Stack(
                    children: [
                      Positioned(
                        top: 80 + MediaQuery.of(context).padding.top + 8,
                        right: 16,
                        child: ProfileDropdownMenu(
                          onClose: () =>
                              setState(() => _showProfileMenu = false),
                          onProfileTap: () {
                            setState(() => _showProfileMenu = false);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const ProfileScreen(),
                              ),
                            );
                          },
                          onLogoutTap: () async {
                            setState(() => _showProfileMenu = false);
                            try {
                              await SupabaseAuthGateway().signOut();
                              if (mounted) {
                                Navigator.of(context).pushAndRemoveUntil(
                                  MaterialPageRoute(
                                    builder: (context) => const LandingPage(),
                                  ),
                                  (route) => false,
                                );
                              }
                            } catch (e) {
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      'Çıkış yapılırken hata oluştu: $e',
                                    ),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSkeletonCard() {
    return SizedBox(
      height: 220,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Görsel placeholder
            Container(
              height: 140,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(20),
                ),
              ),
            ),
            // Metin placeholderları
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 12,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    height: 12,
                    width: 100,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Removed unused _Chip helper

class _BriefRotator extends StatefulWidget {
  const _BriefRotator();

  @override
  State<_BriefRotator> createState() => _BriefRotatorState();
}

class _BriefRotatorState extends State<_BriefRotator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeIn;
  int _index = 0;

  static const _briefs = [
    (
      'Sabah Özeti',
      'Güne başlarken: Piyasalar sakin, diplomasi trafiği yoğun. Teknoloji ve savunma gündeminde öne çıkan başlıklar özetlendi.',
    ),
    (
      'Öğlen Özeti',
      'Gün ortası: Piyasalarda hacim artarken dış politika gündemi ısınıyor. Saha gelişmeleri ve ekonomi manşetleri bir arada.',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeIn = CurvedAnimation(parent: _controller, curve: Curves.easeOut);

    // Döngü: her 6 sn'de bir özeti değiştir
    _startLoop();
  }

  void _startLoop() async {
    while (mounted) {
      if (!mounted) return;
      await _controller.forward();

      if (!mounted) return;
      await Future.delayed(const Duration(seconds: 5));

      if (!mounted) return;
      await _controller.reverse();

      if (!mounted) return;
      setState(() {
        _index = (_index + 1) % _briefs.length;
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final (title, baseBody) = _briefs[_index];
    final body = baseBody;
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Opacity(
          opacity: _fadeIn.value,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 8),
              // AI özet rozeti
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.white.withOpacity(0.12)),
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
                body,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white.withOpacity(0.75),
                  height: 1.5,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
