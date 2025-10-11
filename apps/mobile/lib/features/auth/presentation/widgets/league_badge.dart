import 'package:flutter/material.dart';
import '../../../../core/l10n/l10n.dart';
import '../../../games/domain/entities/gamification_models.dart';

class LeagueBadge extends StatelessWidget {
  const LeagueBadge({super.key, required this.league, this.size = 20.0});

  final League league;
  final double size;

  @override
  Widget build(BuildContext context) {
    final leagueInfo = _getLeagueInfo(league, context);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: size * 0.4,
        vertical: size * 0.2,
      ),
      decoration: BoxDecoration(
        color: leagueInfo.color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(size * 0.5),
        border: Border.all(color: leagueInfo.color.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            leagueInfo.icon,
            size: size * 0.6,
            color: leagueInfo.color,
          ),
          SizedBox(width: size * 0.2),
          Text(
            leagueInfo.name,
            style: TextStyle(
              color: leagueInfo.color,
              fontSize: size * 0.5,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  LeagueInfo _getLeagueInfo(League league, BuildContext context) {
    switch (league) {
      case League.bronze:
        return LeagueInfo(
          name: context.l10n.gamificationLeagueBronze,
          icon: Icons.emoji_events,
          color: Colors.orange,
        );
      case League.silver:
        return LeagueInfo(
          name: context.l10n.gamificationLeagueSilver,
          icon: Icons.emoji_events,
          color: Colors.grey,
        );
      case League.gold:
        return LeagueInfo(
          name: context.l10n.gamificationLeagueGold,
          icon: Icons.emoji_events,
          color: Colors.amber,
        );
      case League.platinum:
        return LeagueInfo(
          name: context.l10n.gamificationLeaguePlatinum,
          icon: Icons.diamond,
          color: Colors.cyan,
        );
      case League.diamond:
        return LeagueInfo(
          name: context.l10n.gamificationLeagueDiamond,
          icon: Icons.diamond,
          color: Colors.cyan,
        );
    }
  }
}

class LeagueInfo {
  final String name;
  final IconData icon;
  final Color color;

  const LeagueInfo({
    required this.name,
    required this.icon,
    required this.color,
  });
}