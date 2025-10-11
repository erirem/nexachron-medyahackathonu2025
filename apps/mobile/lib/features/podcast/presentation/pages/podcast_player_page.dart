import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/podcast_item.dart';
import '../providers/podcast_provider.dart';
import '../providers/audio_player_notifier.dart';

class PodcastPlayerPage extends ConsumerStatefulWidget {
  final PodcastItem podcast;

  const PodcastPlayerPage({super.key, required this.podcast});

  @override
  ConsumerState<PodcastPlayerPage> createState() => _PodcastPlayerPageState();
}

class _PodcastPlayerPageState extends ConsumerState<PodcastPlayerPage> {
  bool _isGeneratingTTS = false;
  String? _ttsError;

  @override
  void initState() {
    super.initState();
    _initializePodcast();
  }

  Future<void> _initializePodcast() async {
    // Eğer podcast'in audioUrl'i yoksa TTS oluştur
    if (widget.podcast.audioUrl == null) {
      setState(() {
        _isGeneratingTTS = true;
        _ttsError = null;
      });

      try {
        print('🎵 Generating TTS for podcast: ${widget.podcast.title}');

        final updatedPodcast = await ref
            .read(podcastNewsProvider.notifier)
            .generateTTSForPodcast(widget.podcast);

        if (updatedPodcast != null && updatedPodcast.audioUrl != null) {
          // Audio player'ı başlat
          await ref
              .read(audioPlayerProvider.notifier)
              .play(updatedPodcast.audioUrl!);

          // TTS loading'i temizle
          setState(() {
            _isGeneratingTTS = false;
          });
        } else {
          setState(() {
            _ttsError = 'Ses oluşturulamadı';
            _isGeneratingTTS = false;
          });
        }
      } catch (e) {
        print('❌ Error generating TTS: $e');
        setState(() {
          _ttsError = 'Ses oluşturulurken hata oluştu: ${e.toString()}';
          _isGeneratingTTS = false;
        });
      }
    } else {
      // AudioUrl varsa direkt çal
      await ref
          .read(audioPlayerProvider.notifier)
          .play(widget.podcast.audioUrl!);
    }
  }

  @override
  Widget build(BuildContext context) {
    final audioState = ref.watch(audioPlayerProvider);
    final screenHeight = MediaQuery.of(context).size.height;
    final safeAreaHeight =
        MediaQuery.of(context).padding.top +
        MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: const Color(0xFF0F1624),
      body: SafeArea(
        child: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: screenHeight - safeAreaHeight,
            ),
            child: Column(
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.share, color: Colors.white),
                      ),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.more_vert, color: Colors.white),
                      ),
                    ],
                  ),
                ),

                // Podcast Image - Boyutu ekran boyutuna göre ayarla
                Container(
                  width: screenHeight * 0.25, // Ekran yüksekliğinin %25'i
                  height: screenHeight * 0.25,
                  margin: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Stack(
                      children: [
                        Image.network(
                          widget.podcast.imageUrl,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          height: double.infinity,
                        ),
                        // TTS Loading overlay - sadece TTS oluşturulurken göster
                        if (_isGeneratingTTS)
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.5),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  CircularProgressIndicator(
                                    color: Color(0xFF0f6acd),
                                  ),
                                  SizedBox(height: 16),
                                  Text(
                                    'Ses oluşturuluyor...',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        // Playing indicator - ses oynatıldığında göster
                        if (audioState.isPlaying && !_isGeneratingTTS)
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Center(
                              child: Icon(
                                Icons.equalizer,
                                color: Color(0xFF0f6acd),
                                size: 48,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),

                // Podcast Info
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    children: [
                      Text(
                        widget.podcast.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        widget.podcast.subtitle,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 14,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),

                      // Error message
                      if (_ttsError != null) ...[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.red.withOpacity(0.3),
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.error,
                                color: Colors.red,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _ttsError!,
                                  style: const TextStyle(
                                    color: Colors.red,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 24),

                      // Progress Bar
                      Column(
                        children: [
                          SliderTheme(
                            data: SliderTheme.of(context).copyWith(
                              activeTrackColor: const Color(0xFF0f6acd),
                              inactiveTrackColor: Colors.white.withOpacity(0.2),
                              thumbColor: const Color(0xFF0f6acd),
                              overlayColor: const Color(
                                0xFF0f6acd,
                              ).withOpacity(0.2),
                            ),
                            child: Slider(
                              value: audioState.progress,
                              onChanged:
                                  audioState.totalDuration.inMilliseconds > 0
                                  ? (value) {
                                      final newPosition = Duration(
                                        milliseconds:
                                            (value *
                                                    audioState
                                                        .totalDuration
                                                        .inMilliseconds)
                                                .round(),
                                      );
                                      ref
                                          .read(audioPlayerProvider.notifier)
                                          .seek(newPosition);
                                    }
                                  : null,
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  audioState.currentTimeFormatted,
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.7),
                                    fontSize: 12,
                                  ),
                                ),
                                Text(
                                  audioState.totalTimeFormatted,
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.7),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // Control Buttons
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          IconButton(
                            onPressed:
                                audioState.totalDuration.inMilliseconds > 0
                                ? () => ref
                                      .read(audioPlayerProvider.notifier)
                                      .seekBackward()
                                : null,
                            icon: Icon(
                              Icons.replay_10,
                              color: audioState.totalDuration.inMilliseconds > 0
                                  ? Colors.white
                                  : Colors.white.withOpacity(0.3),
                              size: 32,
                            ),
                          ),
                          Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF0f6acd),
                              shape: BoxShape.circle,
                            ),
                            child: IconButton(
                              onPressed: audioState.currentAudioUrl != null
                                  ? () => ref
                                        .read(audioPlayerProvider.notifier)
                                        .togglePlayPause()
                                  : null,
                              icon: Icon(
                                audioState.isPlaying
                                    ? Icons.pause
                                    : Icons.play_arrow,
                                color: Colors.white,
                                size: 48,
                              ),
                            ),
                          ),
                          IconButton(
                            onPressed:
                                audioState.totalDuration.inMilliseconds > 0
                                ? () => ref
                                      .read(audioPlayerProvider.notifier)
                                      .seekForward()
                                : null,
                            icon: Icon(
                              Icons.forward_10,
                              color: audioState.totalDuration.inMilliseconds > 0
                                  ? Colors.white
                                  : Colors.white.withOpacity(0.3),
                              size: 32,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // Additional Controls
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          IconButton(
                            onPressed: () {},
                            icon: const Icon(
                              Icons.shuffle,
                              color: Colors.white,
                              size: 24,
                            ),
                          ),
                          IconButton(
                            onPressed: () {},
                            icon: const Icon(
                              Icons.repeat,
                              color: Colors.white,
                              size: 24,
                            ),
                          ),
                          IconButton(
                            onPressed: () {},
                            icon: const Icon(
                              Icons.favorite_border,
                              color: Colors.white,
                              size: 24,
                            ),
                          ),
                          IconButton(
                            onPressed: () {},
                            icon: const Icon(
                              Icons.download,
                              color: Colors.white,
                              size: 24,
                            ),
                          ),
                        ],
                      ),

                      // Alt boşluk
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    // Audio player'ı tamamen durdur ve temizle
    try {
      ref.read(audioPlayerProvider.notifier).stop();
      ref.read(audioPlayerProvider.notifier).dispose();
    } catch (e) {
      print('❌ Error disposing audio player: $e');
    }
    super.dispose();
  }
}
