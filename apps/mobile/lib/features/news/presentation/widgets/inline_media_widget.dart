import 'package:flutter/material.dart';
import '../../domain/entities/news_item.dart';
import 'interactive_image_viewer.dart';

/// Clean, reusable widget for displaying media inline with article content.
/// 
/// Follows Single Responsibility Principle - only handles media presentation.
/// Supports images with optional caption and credit information.
/// Includes tap-to-zoom functionality for better user experience.
class InlineMediaWidget extends StatefulWidget {
  final NewsImage image;

  const InlineMediaWidget({
    super.key,
    required this.image,
  });

  @override
  State<InlineMediaWidget> createState() => _InlineMediaWidgetState();
}

class _InlineMediaWidgetState extends State<InlineMediaWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  bool _hasError = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 700),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeOut,
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.05),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeOut,
      ),
    );

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Don't render if there's an error or no URL
    if (_hasError || widget.image.url.isEmpty) {
      return const SizedBox.shrink();
    }

    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: _buildMediaContainer(),
        ),
      ),
    );
  }

  Widget _buildMediaContainer() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
          width: 1,
        ),
        color: const Color(0xFF1a2234).withOpacity(0.3),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildImageSection(),
          if (_hasCaption || _hasCredit) _buildInfoSection(),
        ],
      ),
    );
  }

  Widget _buildImageSection() {
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(
        top: Radius.circular(16),
        bottom: Radius.circular(0),
      ),
      child: AspectRatio(
        aspectRatio: 16 / 9,
        child: GestureDetector(
          onTap: () => _openImageViewer(),
          child: Stack(
            fit: StackFit.expand,
            children: [
              Image.network(
                widget.image.url,
                fit: BoxFit.cover,
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) {
                    // Image loaded successfully
                    if (_isLoading) {
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        if (mounted) {
                          setState(() => _isLoading = false);
                        }
                      });
                    }
                    return child;
                  }
                  return _buildPlaceholder();
                },
                errorBuilder: (context, error, stackTrace) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    if (mounted) {
                      setState(() => _hasError = true);
                    }
                  });
                  return const SizedBox.shrink();
                },
              ),
              // Tap indicator overlay
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.6),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.zoom_in,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: const Color(0xFF0F1624),
      child: Center(
        child: SizedBox(
          width: 40,
          height: 40,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(
              Colors.white.withOpacity(0.3),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1a2234).withOpacity(0.5),
        borderRadius: const BorderRadius.vertical(
          bottom: Radius.circular(16),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_hasCaption) _buildCaption(),
          if (_hasCaption && _hasCredit) const SizedBox(height: 8),
          if (_hasCredit) _buildCredit(),
        ],
      ),
    );
  }

  Widget _buildCaption() {
    return Text(
      widget.image.caption!,
      style: TextStyle(
        fontSize: 14,
        height: 1.5,
        color: Colors.white.withOpacity(0.85),
        letterSpacing: 0.2,
      ),
    );
  }

  Widget _buildCredit() {
    return Text(
      'Fotoğraf: ${widget.image.credit}',
      style: TextStyle(
        fontSize: 12,
        color: Colors.white.withOpacity(0.5),
        fontStyle: FontStyle.italic,
      ),
    );
  }

  bool get _hasCaption =>
      widget.image.caption != null && widget.image.caption!.isNotEmpty;

  bool get _hasCredit =>
      widget.image.credit != null && widget.image.credit!.isNotEmpty;

  /// Opens the interactive image viewer
  void _openImageViewer() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => InteractiveImageViewer(
          image: widget.image,
          title: widget.image.caption ?? 'Resim',
        ),
      ),
    );
  }
}

