import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../core/l10n/l10n.dart';
import '../../../../core/l10n/language_switcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../widgets/rank_badge.dart';
import '../widgets/league_badge.dart';
import '../widgets/profile_stat_card.dart';
import '../providers/auth_provider.dart';
import '../../../games/presentation/providers/gamification_provider.dart'
    as gamification;
import '../../../games/domain/entities/gamification_models.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  Future<void> _logout() async {
    try {
      await Supabase.instance.client.auth.signOut();
      if (!mounted) {
        return;
      }
      Navigator.of(context).popUntil((route) => route.isFirst);
    } catch (e) {
      if (!mounted) {
        return;
      }
      Navigator.of(context).popUntil((route) => route.isFirst);
    }
  }

  @override
  Widget build(BuildContext context) {
    final combinedUserData = ref.watch(combinedUserDataProvider);
    final gamificationProfile = ref.watch(gamification.userProfileProvider);

    return Scaffold(
      backgroundColor: AppColors.midnight,
      appBar: AppBar(
        title: Text(context.l10n.profileAppBarTitle),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: LanguageSwitcher(
              backgroundColor: Colors.white.withValues(alpha: 0.1),
            ),
          ),
          IconButton(
            onPressed: () => _logout(),
            icon: const Icon(Icons.logout),
            tooltip: context.l10n.profileLogoutTooltip,
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.midnight,
              AppColors.deepBlue,
              AppColors.royalBlue,
            ],
          ),
        ),
        child: combinedUserData.when(
          data: (userData) {
            if (userData == null) {
              return _ErrorView(
                message: context.l10n.profileErrorMissing,
                onRetry: () async =>
                    await ref.refresh(combinedUserDataProvider),
              );
            }

            return gamificationProfile.when(
              data: (profile) {
                return RefreshIndicator(
                  onRefresh: () async {
                    // ignore: discarded_futures
                    ref.refresh(combinedUserDataProvider);
                    // ignore: discarded_futures
                    ref.refresh(gamification.userProfileProvider);
                  },
                  child: ListView(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 24,
                    ),
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      _DetailedProfileHeader(
                        userData: userData,
                        gamificationProfile: profile,
                      ),
                      const SizedBox(height: 20),
                      if (profile != null) ...[
                        _XPProgressCard(profile: profile),
                        const SizedBox(height: 20),
                        _StreakAndSeasonGrid(profile: profile),
                        const SizedBox(height: 20),
                        _StatisticsGrid(profile: profile),
                        const SizedBox(height: 20),
                        _BadgesSection(profile: profile),
                        if (profile.streakProtection > 0) ...[
                          const SizedBox(height: 20),
                          _StreakProtectionCard(profile: profile),
                        ],
                      ],
                      const SizedBox(height: 20),
                      _UserDetailsCard(userData: userData),
                      const SizedBox(height: 20),
                      _AccountInfoCard(userData: userData),
                    ],
                  ),
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.glowCyan),
              ),
              error: (error, stackTrace) => _ErrorView(
                message: 'Gamification verileri yüklenemedi: $error',
                onRetry: () async =>
                    await ref.refresh(gamification.userProfileProvider),
              ),
            );
          },
          loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.glowCyan),
          ),
          error: (error, stackTrace) => _ErrorView(
            message: 'Kullanıcı bilgileri yüklenemedi: $error',
            onRetry: () async => await ref.refresh(combinedUserDataProvider),
          ),
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});

  final String message;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              message,
              style: const TextStyle(color: Colors.white70),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: Text(context.l10n.commonRetry),
            ),
          ],
        ),
      ),
    );
  }
}

// Detailed Profile Header
class _DetailedProfileHeader extends StatelessWidget {
  const _DetailedProfileHeader({
    required this.userData,
    this.gamificationProfile,
  });

  final CombinedUserData userData;
  final UserProfile? gamificationProfile;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withValues(alpha: 0.14)),
        gradient: LinearGradient(
          colors: [
            Colors.white.withValues(alpha: 0.18),
            Colors.white.withValues(alpha: 0.08),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Profil resmi - placeholder icon
              CircleAvatar(
                radius: 40,
                backgroundColor: AppColors.glowCyan.withOpacity(0.2),
                child: Icon(
                  Icons.person_outline,
                  size: 40,
                  color: AppColors.glowCyan,
                ),
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      userData.displayName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (userData.email != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        userData.email!,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 14,
                        ),
                      ),
                    ],
                    if (userData.city != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.location_on,
                            size: 16,
                            color: Colors.white.withOpacity(0.6),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            userData.city!,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.6),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 12),
                    if (gamificationProfile != null) ...[
                      Row(
                        children: [
                          RankBadge(
                            rank: gamificationProfile!.currentRank,
                            size: 18,
                          ),
                          const SizedBox(width: 12),
                          LeagueBadge(
                            league: gamificationProfile!.league,
                            size: 18,
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          if (userData.joinDate != null) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 16,
                  color: Colors.white.withOpacity(0.6),
                ),
                const SizedBox(width: 8),
                Text(
                  'Katılım: ${_formatDate(userData.joinDate!)}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

// XP Progress Card
class _XPProgressCard extends StatelessWidget {
  const _XPProgressCard({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    final xpProgress = _calculateXPProgress(profile.xp);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        gradient: const LinearGradient(
          colors: [Color(0x3326517A), Color(0x2235709B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.trending_up,
                    size: 20,
                    color: Colors.white.withOpacity(0.8),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    context.l10n.gamificationXPProgress,
                    style: const TextStyle(
                      color: Colors.white60,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              Text(
                '${profile.xp} / ${xpProgress.next} XP',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            height: 12,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(6),
              color: Colors.white.withOpacity(0.1),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: xpProgress.percentage / 100,
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF3B82F6), Color(0xFF8B5CF6)],
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Sonraki seviyeye ${xpProgress.next - profile.xp} XP kaldı',
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  ({double percentage, int next}) _calculateXPProgress(int currentXP) {
    const thresholds = [0, 100, 500, 1500, 5000];
    int nextThreshold = 5000;

    for (int i = 0; i < thresholds.length - 1; i++) {
      if (currentXP >= thresholds[i] && currentXP < thresholds[i + 1]) {
        nextThreshold = thresholds[i + 1];
        break;
      }
    }

    final currentThreshold = thresholds.firstWhere(
      (threshold) => currentXP >= threshold,
      orElse: () => 0,
    );

    final progressInRank = currentXP - currentThreshold;
    final totalForRank = nextThreshold - currentThreshold;
    final percentage = (progressInRank / totalForRank) * 100;

    return (percentage: percentage, next: nextThreshold);
  }
}

// Streak and Season Grid
class _StreakAndSeasonGrid extends StatelessWidget {
  const _StreakAndSeasonGrid({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              color: Colors.white.withOpacity(0.05),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      context.l10n.gamificationStreak,
                      style: const TextStyle(
                        color: Colors.white60,
                        fontSize: 12,
                      ),
                    ),
                    Icon(
                      Icons.local_fire_department,
                      color: Colors.orange,
                      size: 24,
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '${profile.currentStreak}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  context.l10n.gamificationDays,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.4),
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'En uzun: ${profile.longestStreak} gün',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.5),
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              color: Colors.white.withOpacity(0.05),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      context.l10n.gamificationSeasonXP,
                      style: const TextStyle(
                        color: Colors.white60,
                        fontSize: 12,
                      ),
                    ),
                    Icon(Icons.star, color: Colors.amber, size: 24),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '${profile.seasonXp}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  context.l10n.gamificationPoints,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.4),
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Bu sezon',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.5),
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// Statistics Grid
class _StatisticsGrid extends StatelessWidget {
  const _StatisticsGrid({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: ProfileStatCard(
            label: context.l10n.gamificationWeekly,
            value: '${profile.weeklyXp}',
            icon: Icons.calendar_view_week,
            color: Colors.blue,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ProfileStatCard(
            label: context.l10n.gamificationMonthly,
            value: '${profile.monthlyXp}',
            icon: Icons.calendar_month,
            color: Colors.green,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ProfileStatCard(
            label: context.l10n.gamificationFollowing,
            value: '${profile.followedTopics.length}',
            icon: Icons.topic,
            color: Colors.purple,
          ),
        ),
      ],
    );
  }
}

// Badges Section
class _BadgesSection extends StatelessWidget {
  const _BadgesSection({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    final earnedBadges = profile.badges
        .where((badge) => badge.isEarned)
        .toList();

    if (earnedBadges.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        gradient: const LinearGradient(
          colors: [Color(0x3326517A), Color(0x2235709B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.military_tech,
                size: 20,
                color: Colors.white.withOpacity(0.8),
              ),
              const SizedBox(width: 8),
              Text(
                context.l10n.gamificationBadges,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              Text(
                '${earnedBadges.length} rozet',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: earnedBadges
                .map((badge) => _BadgeItem(badge: badge))
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _BadgeItem extends StatelessWidget {
  const _BadgeItem({required this.badge});

  final Badge badge;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 70,
      height: 70,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(35),
        color: _getBadgeColor(badge.rarity).withOpacity(0.2),
        border: Border.all(
          color: _getBadgeColor(badge.rarity).withOpacity(0.3),
          width: 2,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            _getBadgeIcon(badge.type),
            size: 24,
            color: _getBadgeColor(badge.rarity),
          ),
          const SizedBox(height: 4),
          Text(
            badge.name,
            style: TextStyle(
              color: _getBadgeColor(badge.rarity),
              fontSize: 8,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Color _getBadgeColor(int rarity) {
    switch (rarity) {
      case 1:
        return Colors.green;
      case 2:
        return Colors.blue;
      case 3:
        return Colors.purple;
      case 4:
        return Colors.orange;
      case 5:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getBadgeIcon(BadgeType type) {
    switch (type) {
      case BadgeType.streak3:
      case BadgeType.streak7:
      case BadgeType.streak30:
      case BadgeType.streak100:
        return Icons.local_fire_department;
      case BadgeType.quizMaster:
        return Icons.quiz;
      case BadgeType.wordWizard:
        return Icons.spellcheck;
      case BadgeType.memoryChampion:
        return Icons.memory;
      case BadgeType.timelineExpert:
        return Icons.timeline;
      case BadgeType.spotMaster:
        return Icons.search;
      case BadgeType.firstWin:
        return Icons.emoji_events;
      case BadgeType.perfectScore:
        return Icons.star;
      case BadgeType.speedDemon:
        return Icons.speed;
      case BadgeType.consistent:
        return Icons.trending_up;
      case BadgeType.explorer:
        return Icons.explore;
      case BadgeType.earlyBird:
        return Icons.wb_sunny;
      case BadgeType.nightOwl:
        return Icons.nights_stay;
      case BadgeType.weekendWarrior:
        return Icons.weekend;
      case BadgeType.challenger:
        return Icons.sports_esports;
      case BadgeType.social:
        return Icons.people;
    }
  }
}

// Streak Protection Card
class _StreakProtectionCard extends StatelessWidget {
  const _StreakProtectionCard({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          colors: [Color(0x1A8B5CF6), Color(0x1A3B82F6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Icon(Icons.shield_outlined, color: Colors.purple, size: 28),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  context.l10n.gamificationStreakProtection,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${profile.streakProtection} ${context.l10n.gamificationItems}',
                  style: TextStyle(
                    color: Colors.purple.withOpacity(0.7),
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Streak\'inizi koruyun',
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

// User Details Card
class _UserDetailsCard extends StatelessWidget {
  const _UserDetailsCard({required this.userData});

  final CombinedUserData userData;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        gradient: const LinearGradient(
          colors: [Color(0x3326517A), Color(0x2235709B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline,
                size: 20,
                color: Colors.white.withOpacity(0.8),
              ),
              const SizedBox(width: 8),
              Text(
                'Kullanıcı Bilgileri',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _DetailRow(
            icon: Icons.person,
            label: 'Kullanıcı Adı',
            value: userData.displayName,
          ),
          if (userData.email != null) ...[
            const SizedBox(height: 12),
            _DetailRow(
              icon: Icons.email,
              label: 'E-posta',
              value: userData.email!,
            ),
          ],
          if (userData.city != null) ...[
            const SizedBox(height: 12),
            _DetailRow(
              icon: Icons.location_on,
              label: 'Şehir',
              value: userData.city!,
            ),
          ],
          if (userData.joinDate != null) ...[
            const SizedBox(height: 12),
            _DetailRow(
              icon: Icons.calendar_today,
              label: 'Katılım Tarihi',
              value: _formatDate(userData.joinDate!),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.white.withOpacity(0.6)),
        const SizedBox(width: 12),
        Text(
          '$label:',
          style: TextStyle(
            color: Colors.white.withOpacity(0.7),
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ),
      ],
    );
  }
}

// Account Info Card
class _AccountInfoCard extends StatelessWidget {
  const _AccountInfoCard({required this.userData});

  final CombinedUserData userData;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        gradient: const LinearGradient(
          colors: [Color(0x3326517A), Color(0x2235709B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.account_circle,
                size: 20,
                color: Colors.white.withOpacity(0.8),
              ),
              const SizedBox(width: 8),
              Text(
                'Hesap Bilgileri',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _InfoRow(
            icon: Icons.verified_user,
            label: 'Hesap Durumu',
            value: 'Aktif',
            valueColor: Colors.green,
          ),
          const SizedBox(height: 12),
          _InfoRow(
            icon: Icons.security,
            label: 'Kimlik Doğrulama',
            value: userData.supabaseUser.emailConfirmedAt != null
                ? 'Doğrulandı'
                : 'Beklemede',
            valueColor: userData.supabaseUser.emailConfirmedAt != null
                ? Colors.green
                : Colors.orange,
          ),
          const SizedBox(height: 12),
          _InfoRow(
            icon: Icons.access_time,
            label: 'Son Giriş',
            value: _formatLastSignIn(userData.supabaseUser.lastSignInAt),
            valueColor: Colors.white.withOpacity(0.8),
          ),
        ],
      ),
    );
  }

  String _formatLastSignIn(String? lastSignIn) {
    if (lastSignIn == null) return 'Bilinmiyor';

    final lastSignInDate = DateTime.tryParse(lastSignIn);
    if (lastSignInDate == null) return 'Bilinmiyor';

    final now = DateTime.now();
    final difference = now.difference(lastSignInDate);

    if (difference.inDays > 0) {
      return '${difference.inDays} gün önce';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} saat önce';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} dakika önce';
    } else {
      return 'Az önce';
    }
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.valueColor,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.white.withOpacity(0.6)),
        const SizedBox(width: 12),
        Text(
          '$label:',
          style: TextStyle(
            color: Colors.white.withOpacity(0.7),
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              color: valueColor,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
