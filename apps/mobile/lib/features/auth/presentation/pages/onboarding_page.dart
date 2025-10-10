import 'package:flutter/material.dart';

import '../controllers/onboarding_controller.dart';

/// Kategori tanımları - Web'deki categories array'ine benzer
class CategoryInfo {
  const CategoryInfo({
    required this.id,
    required this.label,
    required this.description,
    required this.icon,
  });

  final String id;
  final String label;
  final String description;
  final IconData icon;
}

/// Mood (okuma tarzı) tanımları - Web'deki moods array'ine benzer
class MoodInfo {
  const MoodInfo({
    required this.id,
    required this.label,
    required this.description,
    required this.icon,
  });

  final String id;
  final String label;
  final String description;
  final IconData icon;
}

const List<CategoryInfo> _categories = [
  CategoryInfo(
    id: 'teknoloji',
    label: 'Teknoloji',
    description: 'AI, yazılım, donanım haberleri',
    icon: Icons.computer,
  ),
  CategoryInfo(
    id: 'spor',
    label: 'Spor',
    description: 'Futbol, basketbol, olimpiyatlar',
    icon: Icons.sports_soccer,
  ),
  CategoryInfo(
    id: 'ekonomi',
    label: 'Ekonomi',
    description: 'Borsa, kripto, finans haberleri',
    icon: Icons.attach_money,
  ),
  CategoryInfo(
    id: 'siyaset',
    label: 'Siyaset',
    description: 'Politika, seçimler, hükümet',
    icon: Icons.account_balance,
  ),
  CategoryInfo(
    id: 'saglik',
    label: 'Sağlık',
    description: 'Tıp, sağlık, bilim haberleri',
    icon: Icons.favorite,
  ),
  CategoryInfo(
    id: 'kultur',
    label: 'Kültür',
    description: 'Sanat, müzik, sinema, edebiyat',
    icon: Icons.palette,
  ),
  CategoryInfo(
    id: 'dunya',
    label: 'Dünya',
    description: 'Uluslararası haberler',
    icon: Icons.public,
  ),
  CategoryInfo(
    id: 'turkiye',
    label: 'Türkiye',
    description: 'Yerel haberler ve gelişmeler',
    icon: Icons.location_on,
  ),
];

const List<MoodInfo> _moods = [
  MoodInfo(
    id: 'pozitif',
    label: 'Pozitif',
    description: 'Olumlu ve iyimser haberler',
    icon: Icons.sentiment_very_satisfied,
  ),
  MoodInfo(
    id: 'nötr',
    label: 'Dengeli',
    description: 'Tarafsız ve objektif haberler',
    icon: Icons.balance,
  ),
  MoodInfo(
    id: 'derinlemesine',
    label: 'Derinlemesine',
    description: 'Analiz ve detaylı haberler',
    icon: Icons.science,
  ),
  MoodInfo(
    id: 'hızlı',
    label: 'Hızlı',
    description: 'Kısa ve öz haberler',
    icon: Icons.flash_on,
  ),
];

/// Ana onboarding sayfası - Web'deki onboarding/page.tsx'e benzer
class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key, this.onComplete});

  final VoidCallback? onComplete;

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  late final OnboardingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = OnboardingController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _controller,
      builder: (context, child) {
        final state = _controller.state;

        return Scaffold(
          backgroundColor: const Color(0xFF0a0e1a),
          body: SafeArea(
            child: Stack(
              children: [
                Column(
                  children: [
                    // Top bar with skip button
                    _buildTopBar(context, state),

                    // Step indicator
                    _buildStepIndicator(state),

                    const SizedBox(height: 24),

                    // Content
                    Expanded(
                      child: IndexedStack(
                        index: state.currentStep - 1,
                        children: [
                          _buildWelcomePage(),
                          _buildCategoryPage(state),
                          _buildMoodPage(state),
                        ],
                      ),
                    ),

                    // Bottom navigation
                    _buildBottomNavigation(context, state),
                  ],
                ),

                // Loading overlay
                if (state.isLoading)
                  Container(
                    color: Colors.black.withOpacity(0.7),
                    child: const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(color: Color(0xFF6366f1)),
                          SizedBox(height: 16),
                          Text(
                            'Tercihleriniz kaydediliyor...',
                            style: TextStyle(color: Colors.white, fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  // Top bar with skip button
  Widget _buildTopBar(BuildContext context, OnboardingState state) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'NEXACHRON',
            style: TextStyle(
              color: Colors.white.withOpacity(0.5),
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 2,
            ),
          ),
          if (state.currentStep < 3)
            TextButton(
              onPressed: () async {
                // Atla butonuna basıldığında validasyon olmadan direkt tamamla
                final success = await _controller.completeOnboarding(
                  'tr',
                  skipValidation: true,
                );
                if (success && context.mounted) {
                  widget.onComplete?.call();
                }
              },
              child: const Text(
                'Atla',
                style: TextStyle(
                  color: Color(0xFF6366f1),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }

  // Step indicator dots
  Widget _buildStepIndicator(OnboardingState state) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(3, (index) {
          final stepNumber = index + 1;
          final isActive = state.currentStep == stepNumber;
          final isCompleted = state.currentStep > stepNumber;

          return AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            margin: const EdgeInsets.symmetric(horizontal: 4),
            height: 8,
            width: isActive ? 32 : 8,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              color: isCompleted || isActive
                  ? const Color(0xFF6366f1)
                  : Colors.white.withOpacity(0.2),
            ),
          );
        }),
      ),
    );
  }

  // Welcome page (Step 0)
  Widget _buildWelcomePage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 40),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF6366f1).withOpacity(0.2),
                  const Color(0xFF8b5cf6).withOpacity(0.2),
                ],
              ),
            ),
            child: const Icon(
              Icons.auto_awesome,
              color: Color(0xFF6366f1),
              size: 48,
            ),
          ),
          const SizedBox(height: 32),
          const Text(
            'Hoş Geldiniz!',
            style: TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.bold,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Size özel haber akışını oluşturmak için birkaç tercih belirleyelim.',
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 16,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 40),
          _buildFeatureItem(
            Icons.interests,
            'İlgi Alanlarınız',
            'Hangi konuları takip etmek istediğinizi seçin',
          ),
          const SizedBox(height: 24),
          _buildFeatureItem(
            Icons.mood,
            'Okuma Tarzınız',
            'Nasıl içerik tercih ettiğinizi belirleyin',
          ),
          const SizedBox(height: 24),
          _buildFeatureItem(
            Icons.update,
            'Değiştirilebilir',
            'Tercihlerinizi istediğiniz zaman güncelleyebilirsiniz',
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(IconData icon, String title, String description) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            color: Colors.white.withOpacity(0.05),
          ),
          child: Icon(icon, color: const Color(0xFF6366f1), size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Category selection page (Step 1)
  Widget _buildCategoryPage(OnboardingState state) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'İlgi Alanlarınız',
            style: TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'En az 3 kategori seçin',
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 24),
          ..._categories.map((category) {
            final isSelected = state.selectedCategories.contains(category.id);
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _buildSimpleCategoryCard(
                category: category,
                isSelected: isSelected,
                onTap: () => _controller.toggleCategory(category.id),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildSimpleCategoryCard({
    required CategoryInfo category,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: isSelected
              ? const Color(0xFF6366f1).withOpacity(0.1)
              : Colors.white.withOpacity(0.03),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF6366f1)
                : Colors.white.withOpacity(0.1),
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: isSelected
                    ? const Color(0xFF6366f1)
                    : Colors.white.withOpacity(0.05),
              ),
              child: Icon(
                category.icon,
                color: isSelected
                    ? Colors.white
                    : Colors.white.withOpacity(0.6),
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    category.label,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    category.description,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: Color(0xFF6366f1),
                size: 28,
              ),
          ],
        ),
      ),
    );
  }

  // Mood selection page (Step 2)
  Widget _buildMoodPage(OnboardingState state) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Okuma Tarzınız',
            style: TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'En az 1 okuma tarzı seçin',
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 24),
          ..._moods.map((mood) {
            final isSelected = state.selectedMoods.contains(mood.id);
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _buildSimpleMoodCard(
                mood: mood,
                isSelected: isSelected,
                onTap: () => _controller.toggleMood(mood.id),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildSimpleMoodCard({
    required MoodInfo mood,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: isSelected
              ? const Color(0xFF6366f1).withOpacity(0.1)
              : Colors.white.withOpacity(0.03),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF6366f1)
                : Colors.white.withOpacity(0.1),
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: isSelected
                    ? const Color(0xFF6366f1)
                    : Colors.white.withOpacity(0.05),
              ),
              child: Icon(
                mood.icon,
                color: isSelected
                    ? Colors.white
                    : Colors.white.withOpacity(0.6),
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    mood.label,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    mood.description,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: Color(0xFF6366f1),
                size: 28,
              ),
          ],
        ),
      ),
    );
  }

  // Bottom navigation
  Widget _buildBottomNavigation(BuildContext context, OnboardingState state) {
    // Step 1 (Welcome): Her zaman ilerleyebilir
    // Step 2 (Category): En az 3 kategori gerekli
    // Step 3 (Mood): En az 1 mood gerekli
    final canProceed = state.currentStep == 1
        ? true // Welcome page - her zaman ilerleyebilir
        : state.currentStep == 2
        ? state
              .canProceedFromStep1 // Category page - 3 kategori gerekli
        : state.canProceedFromStep2; // Mood page - 1 mood gerekli

    final buttonText = state.currentStep == 1
        ? 'Başlayalım'
        : state.currentStep == 2
        ? 'Devam Et'
        : 'Tamamla';

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF0a0e1a),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1))),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (state.error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.red.withOpacity(0.1),
                  border: Border.all(color: Colors.red.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: Colors.redAccent,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        state.error!,
                        style: const TextStyle(
                          color: Colors.redAccent,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          if (state.currentStep == 2)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                '${state.selectedCategories.length} kategori seçildi',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.5),
                  fontSize: 13,
                ),
              ),
            ),
          if (state.currentStep == 3)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                '${state.selectedMoods.length} okuma tarzı seçildi',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.5),
                  fontSize: 13,
                ),
              ),
            ),
          Row(
            children: [
              if (state.currentStep > 1)
                IconButton(
                  onPressed: _controller.previousStep,
                  icon: const Icon(Icons.arrow_back),
                  color: Colors.white.withOpacity(0.7),
                  iconSize: 24,
                ),
              if (state.currentStep > 1) const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton(
                  onPressed: canProceed && !state.isLoading
                      ? () async {
                          if (state.currentStep < 3) {
                            _controller.nextStep();
                          } else {
                            final success = await _controller
                                .completeOnboarding('tr');
                            if (success && context.mounted) {
                              widget.onComplete?.call();
                            }
                          }
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: canProceed
                        ? const Color(0xFF6366f1)
                        : Colors.white.withOpacity(0.1),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.white.withOpacity(0.1),
                    disabledForegroundColor: Colors.white.withOpacity(0.3),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        state.isLoading ? 'Kaydediliyor...' : buttonText,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (!state.isLoading && canProceed) ...[
                        const SizedBox(width: 8),
                        Icon(
                          state.currentStep == 3
                              ? Icons.check
                              : Icons.arrow_forward,
                          size: 20,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
