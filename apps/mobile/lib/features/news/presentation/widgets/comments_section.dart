import 'package:flutter/material.dart';
import '../../domain/entities/comment.dart';
import 'comment_card.dart';
import 'comment_input.dart';

class CommentsSection extends StatefulWidget {
  final String articleId;
  final List<Comment> comments;
  final User currentUser;
  final Function(String content) onCommentSubmit;
  final Function(String commentId, String content) onReplySubmit;
  final Function(String commentId) onCommentLike;
  final Function(String replyId) onReplyLike;

  const CommentsSection({
    super.key,
    required this.articleId,
    required this.comments,
    required this.currentUser,
    required this.onCommentSubmit,
    required this.onReplySubmit,
    required this.onCommentLike,
    required this.onReplyLike,
  });

  @override
  State<CommentsSection> createState() => _CommentsSectionState();
}

class _CommentsSectionState extends State<CommentsSection> {
  String _sortBy = 'newest';
  bool _showCommentInput = false;
  final Set<String> _likedComments = <String>{};
  final Set<String> _likedReplies = <String>{};

  List<Comment> get _sortedComments {
    final comments = List<Comment>.from(widget.comments);
    
    switch (_sortBy) {
      case 'newest':
        comments.sort((a, b) => b.timestamp.compareTo(a.timestamp));
        break;
      case 'oldest':
        comments.sort((a, b) => a.timestamp.compareTo(b.timestamp));
        break;
      case 'popular':
        comments.sort((a, b) {
          final aLikes = a.likes + (_likedComments.contains(a.id) ? 1 : 0);
          final bLikes = b.likes + (_likedComments.contains(b.id) ? 1 : 0);
          return bLikes.compareTo(aLikes);
        });
        break;
    }
    
    return comments;
  }

  int get _totalLikes {
    int total = 0;
    for (final comment in widget.comments) {
      total += comment.likes + (_likedComments.contains(comment.id) ? 1 : 0);
      if (comment.replies != null) {
        for (final reply in comment.replies!) {
          total += reply.likes + (_likedReplies.contains(reply.id) ? 1 : 0);
        }
      }
    }
    return total;
  }

  void _handleCommentSubmit(String content) {
    widget.onCommentSubmit(content);
    setState(() {
      _showCommentInput = false;
    });
  }

  void _handleReplySubmit(String commentId, String content) {
    widget.onReplySubmit(commentId, content);
  }

  void _handleCommentLike(String commentId) {
    setState(() {
      if (_likedComments.contains(commentId)) {
        _likedComments.remove(commentId);
      } else {
        _likedComments.add(commentId);
      }
    });
    widget.onCommentLike(commentId);
  }

  void _handleReplyLike(String replyId) {
    setState(() {
      if (_likedReplies.contains(replyId)) {
        _likedReplies.remove(replyId);
      } else {
        _likedReplies.add(replyId);
      }
    });
    widget.onReplyLike(replyId);
  }

  Widget _buildSortChip(String value, String label, IconData icon) {
    final isSelected = _sortBy == value;
    return GestureDetector(
      onTap: () => setState(() => _sortBy = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected 
              ? Colors.blue.withOpacity(0.2)
              : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected 
                ? Colors.blue.withOpacity(0.5)
                : Colors.white.withOpacity(0.1),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 14,
              color: isSelected 
                  ? Colors.blue
                  : Colors.white.withOpacity(0.6),
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected 
                    ? Colors.blue
                    : Colors.white.withOpacity(0.7),
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Colors.white.withOpacity(0.1),
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      '💬 Yorumlar',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '${widget.comments.length}',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text(
                      '$_totalLikes beğeni',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Text(
                      '${(widget.comments.length * 2.3).round()} görüntülenme',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // Comment input button
          if (!_showCommentInput)
            GestureDetector(
              onTap: () => setState(() => _showCommentInput = true),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.1),
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundImage: NetworkImage(widget.currentUser.avatar),
                      backgroundColor: Colors.white.withOpacity(0.1),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Bu haber hakkında ne düşünüyorsunuz?',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 16,
                        ),
                      ),
                    ),
                    Icon(
                      Icons.edit,
                      color: Colors.white.withOpacity(0.5),
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
          
          // Comment input form
          if (_showCommentInput)
            CommentInput(
              currentUser: widget.currentUser,
              onSubmit: _handleCommentSubmit,
              onCancel: () => setState(() => _showCommentInput = false),
              placeholder: 'Bu haber hakkında ne düşünüyorsunuz?',
            ),
          
          const SizedBox(height: 20),
          
          // Sort options - Modern Design
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.03),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Colors.white.withOpacity(0.08),
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.sort,
                      color: Colors.white.withOpacity(0.7),
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Yorumları Sırala',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _buildSortChip('newest', 'En Yeni', Icons.access_time),
                    _buildSortChip('oldest', 'En Eski', Icons.history),
                    _buildSortChip('popular', 'En Popüler', Icons.trending_up),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // Comments list
          if (widget.comments.isEmpty)
            Container(
              padding: const EdgeInsets.all(40),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.03),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Colors.white.withOpacity(0.05),
                  width: 1,
                ),
              ),
              child: Column(
                children: [
                  Text(
                    '💬',
                    style: const TextStyle(fontSize: 48),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Henüz yorum yok',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'İlk yorumu yapan siz olun!',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            )
          else
            ..._sortedComments.map((comment) => CommentCard(
              comment: comment,
              isLiked: _likedComments.contains(comment.id),
              onLike: () => _handleCommentLike(comment.id),
              onReply: () {
                // Handle reply to comment
              },
              onReplySubmit: (content) => _handleReplySubmit(comment.id, content),
            )),
        ],
      ),
    );
  }
}
