import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/gamification_provider.dart';

class UserStatsCard extends ConsumerWidget {
  const UserStatsCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userProfileAsync = ref.watch(userProfileProvider);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withOpacity(0.1),
            Colors.white.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
        ),
      ),
      child: userProfileAsync.when(
        data: (profile) {
          if (profile == null) {
            return const _EmptyStatsRow();
          }

          return Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _StatItem(
                icon: Icons.star,
                label: 'Toplam XP',
                value: profile.xp.toString(),
                color: Colors.yellow,
              ),
              Container(
                width: 1,
                height: 40,
                color: Colors.white.withOpacity(0.2),
              ),
              _StatItem(
                icon: Icons.local_fire_department,
                label: 'Seri',
                value: profile.currentStreak.toString(),
                color: Colors.orange,
              ),
              Container(
                width: 1,
                height: 40,
                color: Colors.white.withOpacity(0.2),
              ),
              _StatItem(
                icon: Icons.emoji_events,
                label: 'Rozetler',
                value: profile.badges.where((b) => b.isEarned).length.toString(),
                color: Colors.green,
              ),
            ],
          );
        },
        loading: () => const _LoadingStatsRow(),
        error: (_, __) => const _EmptyStatsRow(),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.6)),
        ),
      ],
    );
  }
}

class _EmptyStatsRow extends StatelessWidget {
  const _EmptyStatsRow();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _StatItem(
          icon: Icons.star,
          label: 'Toplam XP',
          value: '0',
          color: Colors.yellow,
        ),
        Container(
          width: 1,
          height: 40,
          color: Colors.white.withOpacity(0.2),
        ),
        _StatItem(
          icon: Icons.local_fire_department,
          label: 'Seri',
          value: '0',
          color: Colors.orange,
        ),
        Container(
          width: 1,
          height: 40,
          color: Colors.white.withOpacity(0.2),
        ),
        _StatItem(
          icon: Icons.emoji_events,
          label: 'Rozetler',
          value: '0',
          color: Colors.green,
        ),
      ],
    );
  }
}

class _LoadingStatsRow extends StatelessWidget {
  const _LoadingStatsRow();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _StatItem(
          icon: Icons.star,
          label: 'Toplam XP',
          value: '...',
          color: Colors.yellow,
        ),
        Container(
          width: 1,
          height: 40,
          color: Colors.white.withOpacity(0.2),
        ),
        _StatItem(
          icon: Icons.local_fire_department,
          label: 'Seri',
          value: '...',
          color: Colors.orange,
        ),
        Container(
          width: 1,
          height: 40,
          color: Colors.white.withOpacity(0.2),
        ),
        _StatItem(
          icon: Icons.emoji_events,
          label: 'Rozetler',
          value: '...',
          color: Colors.green,
        ),
      ],
    );
  }
}
