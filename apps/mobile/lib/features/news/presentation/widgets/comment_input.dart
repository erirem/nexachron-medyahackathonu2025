import 'package:flutter/material.dart';
import '../../domain/entities/comment.dart';

class CommentInput extends StatefulWidget {
  final Function(String content) onSubmit;
  final VoidCallback? onCancel;
  final String? placeholder;
  final User currentUser;

  const CommentInput({
    super.key,
    required this.onSubmit,
    this.onCancel,
    this.placeholder,
    required this.currentUser,
  });

  @override
  State<CommentInput> createState() => _CommentInputState();
}

class _CommentInputState extends State<CommentInput> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    // Auto focus when widget appears
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    final content = _controller.text.trim();
    if (content.isNotEmpty) {
      widget.onSubmit(content);
      _controller.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1a2234).withOpacity(0.9),
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(20),
        ),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),
          
          // Header
          Row(
            children: [
              Text(
                'Yorum Yap',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white.withOpacity(0.9),
                ),
              ),
              const Spacer(),
              if (widget.onCancel != null)
                IconButton(
                  onPressed: widget.onCancel,
                  icon: Icon(
                    Icons.close,
                    color: Colors.white.withOpacity(0.7),
                    size: 24,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          
          // User info and input
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User avatar
              CircleAvatar(
                radius: 20,
                backgroundImage: NetworkImage(widget.currentUser.avatar),
                backgroundColor: Colors.white.withOpacity(0.1),
              ),
              const SizedBox(width: 12),
              
              // Text input
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.1),
                      width: 1,
                    ),
                  ),
                  child: TextField(
                    controller: _controller,
                    focusNode: _focusNode,
                    maxLines: 4,
                    minLines: 1,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 16,
                    ),
                    decoration: InputDecoration(
                      hintText: widget.placeholder ?? 'Yorumunuzu yazın...',
                      hintStyle: TextStyle(
                        color: Colors.white.withOpacity(0.5),
                        fontSize: 16,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.all(16),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Action buttons
          Row(
            children: [
              const Spacer(),
              // Cancel button
              if (widget.onCancel != null)
                TextButton(
                  onPressed: widget.onCancel,
                  child: Text(
                    'İptal',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 16,
                    ),
                  ),
                ),
              if (widget.onCancel != null) const SizedBox(width: 12),
              
              // Submit button
              ElevatedButton(
                onPressed: _controller.text.trim().isNotEmpty ? _handleSubmit : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3B82F6),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Gönder',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
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
