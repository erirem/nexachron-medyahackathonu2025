import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ReelActionButton extends StatelessWidget {
  final IconData icon;
  final String? count;
  final VoidCallback onTap;
  final Color? iconColor;
  final Color? countColor;
  final bool isActive;

  const ReelActionButton({
    super.key,
    required this.icon,
    this.count,
    required this.onTap,
    this.iconColor,
    this.countColor,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.3),
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
            child: Icon(
              icon,
              color: isActive
                  ? (iconColor ?? Colors.red)
                  : (iconColor ?? Colors.white),
              size: 24,
            ),
          ),
        ),
        if (count != null) ...[
          const SizedBox(height: 4),
          Text(
            count!,
            style: TextStyle(
              color: countColor ?? Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ],
    );
  }
}

class ReelLikeButton extends ConsumerStatefulWidget {
  final bool isLiked;
  final int likeCount;
  final Function(bool isLiked, int newCount) onLikeChanged;

  const ReelLikeButton({
    super.key,
    required this.isLiked,
    required this.likeCount,
    required this.onLikeChanged,
  });

  @override
  ConsumerState<ReelLikeButton> createState() => _ReelLikeButtonState();
}

class _ReelLikeButtonState extends ConsumerState<ReelLikeButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.elasticOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _handleLike() {
    final newIsLiked = !widget.isLiked;
    final newCount = newIsLiked ? widget.likeCount + 1 : widget.likeCount - 1;

    if (newIsLiked) {
      _animationController.forward().then((_) {
        if (mounted) {
          _animationController.reverse();
        }
      });
    }

    widget.onLikeChanged(newIsLiked, newCount);
  }

  String _formatCount(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    } else if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}K';
    }
    return count.toString();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: ReelActionButton(
            icon: widget.isLiked ? Icons.favorite : Icons.favorite_border,
            count: _formatCount(widget.likeCount),
            onTap: _handleLike,
            iconColor: widget.isLiked ? Colors.red : Colors.white,
            isActive: widget.isLiked,
          ),
        );
      },
    );
  }
}

class ReelCommentButton extends StatelessWidget {
  final int commentCount;
  final VoidCallback onTap;

  const ReelCommentButton({
    super.key,
    required this.commentCount,
    required this.onTap,
  });

  String _formatCount(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    } else if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}K';
    }
    return count.toString();
  }

  @override
  Widget build(BuildContext context) {
    return ReelActionButton(
      icon: Icons.chat_bubble_outline,
      count: _formatCount(commentCount),
      onTap: onTap,
    );
  }
}

class ReelShareButton extends StatelessWidget {
  final VoidCallback onTap;

  const ReelShareButton({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ReelActionButton(icon: Icons.share, onTap: onTap);
  }
}

class ReelBookmarkButton extends ConsumerStatefulWidget {
  final bool isBookmarked;
  final VoidCallback onTap;

  const ReelBookmarkButton({
    super.key,
    required this.isBookmarked,
    required this.onTap,
  });

  @override
  ConsumerState<ReelBookmarkButton> createState() => _ReelBookmarkButtonState();
}

class _ReelBookmarkButtonState extends ConsumerState<ReelBookmarkButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.elasticOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _handleBookmark() {
    if (!widget.isBookmarked) {
      _animationController.forward().then((_) {
        if (mounted) {
          _animationController.reverse();
        }
      });
    }
    widget.onTap();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: ReelActionButton(
            icon: widget.isBookmarked ? Icons.bookmark : Icons.bookmark_border,
            onTap: _handleBookmark,
            iconColor: widget.isBookmarked ? Colors.yellow : Colors.white,
            isActive: widget.isBookmarked,
          ),
        );
      },
    );
  }
}
