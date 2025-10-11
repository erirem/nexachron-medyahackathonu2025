import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../domain/entities/reel_entity.dart';

class ReelVideoPlayer extends StatefulWidget {
  final ReelEntity reel;
  final bool autoPlay;
  final VoidCallback? onTap;
  final VoidCallback? onDoubleTap;
  final VoidCallback? onLongPress;

  const ReelVideoPlayer({
    super.key,
    required this.reel,
    this.autoPlay = true,
    this.onTap,
    this.onDoubleTap,
    this.onLongPress,
  });

  @override
  State<ReelVideoPlayer> createState() => _ReelVideoPlayerState();
}

class _ReelVideoPlayerState extends State<ReelVideoPlayer> {
  VideoPlayerController? _controller;
  bool _isInitialized = false;
  bool _hasError = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  @override
  void didUpdateWidget(ReelVideoPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.reel.id != widget.reel.id) {
      _disposeController();
      _initializeVideo();
    }
  }

  Future<void> _initializeVideo() async {
    try {
      _hasError = false;
      _errorMessage = null;

      // Validate video URL
      if (widget.reel.videoUrl.isEmpty) {
        throw Exception('Video URL is empty');
      }

      // Check if URL is valid and not a placeholder
      if (widget.reel.videoUrl.contains('example.com') ||
          widget.reel.videoUrl.contains('localhost') ||
          !widget.reel.videoUrl.startsWith('http')) {
        throw Exception('Invalid video URL: ${widget.reel.videoUrl}');
      }

      print('🎬 Initializing video: ${widget.reel.videoUrl}');

      _controller = VideoPlayerController.networkUrl(
        Uri.parse(widget.reel.videoUrl),
      );

      await _controller!.initialize();

      if (mounted) {
        setState(() {
          _isInitialized = true;
        });

        if (widget.autoPlay) {
          await _controller!.play();
        }

        // Video bittiğinde tekrar başlat
        _controller!.setLooping(true);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _hasError = true;
          _errorMessage = e.toString();
        });
      }
    }
  }

  void _disposeController() {
    _controller?.dispose();
    _controller = null;
    _isInitialized = false;
  }

  @override
  void dispose() {
    _disposeController();
    super.dispose();
  }

  void _togglePlayPause() {
    if (_controller != null && _isInitialized) {
      if (_controller!.value.isPlaying) {
        _controller!.pause();
      } else {
        _controller!.play();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        _togglePlayPause();
        widget.onTap?.call();
      },
      onDoubleTap: widget.onDoubleTap,
      onLongPress: widget.onLongPress,
      child: Container(
        width: double.infinity,
        height: double.infinity,
        color: Colors.black,
        child: _buildVideoContent(),
      ),
    );
  }

  Widget _buildVideoContent() {
    if (_hasError) {
      return _buildErrorWidget();
    }

    if (!_isInitialized || _controller == null) {
      return _buildLoadingWidget();
    }

    return Stack(
      fit: StackFit.expand,
      children: [
        // Video Player
        Center(
          child: AspectRatio(
            aspectRatio: _controller!.value.aspectRatio,
            child: VideoPlayer(_controller!),
          ),
        ),

        // Play/Pause Overlay
        if (!_controller!.value.isPlaying)
          Center(
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.5),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.play_arrow,
                color: Colors.white,
                size: 40,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildLoadingWidget() {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Thumbnail as background
        if (widget.reel.thumbUrl.isNotEmpty)
          CachedNetworkImage(
            imageUrl: widget.reel.thumbUrl,
            fit: BoxFit.cover,
            placeholder: (context, url) => Container(
              color: Colors.grey[900],
              child: const Center(
                child: Icon(Icons.video_library, color: Colors.white, size: 50),
              ),
            ),
            errorWidget: (context, url, error) => Container(
              color: Colors.grey[900],
              child: const Center(
                child: Icon(Icons.error, color: Colors.white, size: 50),
              ),
            ),
          )
        else
          Container(
            color: Colors.grey[900],
            child: const Center(
              child: Icon(Icons.video_library, color: Colors.white, size: 50),
            ),
          ),

        // Play button overlay
        Center(
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.5),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.play_arrow, color: Colors.white, size: 40),
          ),
        ),
      ],
    );
  }

  Widget _buildErrorWidget() {
    return Container(
      color: Colors.grey[900],
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: Colors.white, size: 50),
            const SizedBox(height: 16),
            const Text(
              'Video yüklenemedi',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage ?? 'Bilinmeyen hata',
              style: const TextStyle(color: Colors.white70, fontSize: 12),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                _initializeVideo();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
              ),
              child: const Text('Tekrar Dene'),
            ),
          ],
        ),
      ),
    );
  }
}
