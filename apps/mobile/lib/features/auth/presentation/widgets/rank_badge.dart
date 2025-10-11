import 'package:flutter/material.dart';
import '../../../../core/l10n/l10n.dart';
import '../../../games/domain/entities/gamification_models.dart';

class RankBadge extends StatelessWidget {
  const RankBadge({super.key, required this.rank, this.size = 20.0});

  final UserRank rank;
  final double size;

  @override
  Widget build(BuildContext context) {
    final rankInfo = _getRankInfo(rank, context);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: size * 0.4,
        vertical: size * 0.2,
      ),
      decoration: BoxDecoration(
        color: rankInfo.color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(size * 0.5),
        border: Border.all(color: rankInfo.color.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            rankInfo.icon,
            size: size * 0.6,
            color: rankInfo.color,
          ),
          SizedBox(width: size * 0.2),
          Text(
            rankInfo.name,
            style: TextStyle(
              color: rankInfo.color,
              fontSize: size * 0.5,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  RankInfo _getRankInfo(UserRank rank, BuildContext context) {
    switch (rank) {
      case UserRank.newMember:
        return RankInfo(
          name: context.l10n.gamificationRankNewMember,
          icon: Icons.person_add,
          color: Colors.green,
        );
      case UserRank.activeReader:
        return RankInfo(
          name: context.l10n.gamificationRankActiveReader,
          icon: Icons.menu_book,
          color: Colors.blue,
        );
      case UserRank.knowledgeSharer:
        return RankInfo(
          name: context.l10n.gamificationRankKnowledgeSharer,
          icon: Icons.share,
          color: Colors.orange,
        );
      case UserRank.expertCommenter:
        return RankInfo(
          name: context.l10n.gamificationRankExpertCommenter,
          icon: Icons.comment,
          color: Colors.purple,
        );
      case UserRank.communityLeader:
        return RankInfo(
          name: context.l10n.gamificationRankCommunityLeader,
          icon: Icons.star,
          color: Colors.amber,
        );
    }
  }
}

class RankInfo {
  final String name;
  final IconData icon;
  final Color color;

  const RankInfo({
    required this.name,
    required this.icon,
    required this.color,
  });
}