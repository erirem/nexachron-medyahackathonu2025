import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';
import 'package:audio_session/audio_session.dart';

/// Audio player state
class AudioPlayerState {
  final bool isPlaying;
  final Duration currentPosition;
  final Duration totalDuration;
  final bool isLoading;
  final String? error;
  final String? currentAudioUrl;

  const AudioPlayerState({
    this.isPlaying = false,
    this.currentPosition = Duration.zero,
    this.totalDuration = Duration.zero,
    this.isLoading = false,
    this.error,
    this.currentAudioUrl,
  });

  AudioPlayerState copyWith({
    bool? isPlaying,
    Duration? currentPosition,
    Duration? totalDuration,
    bool? isLoading,
    String? error,
    String? currentAudioUrl,
  }) {
    return AudioPlayerState(
      isPlaying: isPlaying ?? this.isPlaying,
      currentPosition: currentPosition ?? this.currentPosition,
      totalDuration: totalDuration ?? this.totalDuration,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      currentAudioUrl: currentAudioUrl ?? this.currentAudioUrl,
    );
  }

  /// Progress percentage (0.0 to 1.0)
  double get progress {
    if (totalDuration.inMilliseconds == 0) return 0.0;
    return currentPosition.inMilliseconds / totalDuration.inMilliseconds;
  }

  /// Formatted time strings
  String get currentTimeFormatted {
    final minutes = currentPosition.inMinutes;
    final seconds = currentPosition.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  String get totalTimeFormatted {
    final minutes = totalDuration.inMinutes;
    final seconds = totalDuration.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }
}

/// Audio player notifier
class AudioPlayerNotifier extends Notifier<AudioPlayerState> {
  AudioPlayer? _audioPlayer;
  StreamSubscription<Duration>? _positionSubscription;
  StreamSubscription<PlayerState>? _playerStateSubscription;

  @override
  AudioPlayerState build() {
    _initializeAudioPlayer();
    return const AudioPlayerState();
  }

  Future<void> _initializeAudioPlayer() async {
    try {
      // Audio session yapılandırması (opsiyonel)
      try {
        final session = await AudioSession.instance;
        await session.configure(const AudioSessionConfiguration.music());
        print('✅ Audio session configured');
      } catch (e) {
        print('⚠️ Audio session configuration failed (continuing anyway): $e');
      }

      _audioPlayer = AudioPlayer();

      // Position stream'i dinle
      _positionSubscription = _audioPlayer!.positionStream.listen((position) {
        state = state.copyWith(currentPosition: position);
      });

      // Player state stream'i dinle
      _playerStateSubscription = _audioPlayer!.playerStateStream.listen((
        playerState,
      ) {
        print(
          '🎵 Player state changed: ${playerState.processingState}, playing: ${playerState.playing}',
        );
        state = state.copyWith(
          isPlaying: playerState.playing,
          isLoading:
              playerState.processingState == ProcessingState.loading ||
              playerState.processingState == ProcessingState.buffering,
        );
      });

      // Duration stream'i dinle
      _audioPlayer!.durationStream.listen((duration) {
        if (duration != null) {
          print('🎵 Duration updated: ${duration.inSeconds}s');
          state = state.copyWith(totalDuration: duration);
        }
      });

      print('✅ Audio player initialized');
    } catch (e) {
      print('❌ Error initializing audio player: $e');
      state = state.copyWith(error: 'Audio player initialization failed');
    }
  }

  /// Ses çal
  Future<void> play(String audioUrl) async {
    try {
      if (_audioPlayer == null) {
        print('❌ Audio player is null, initializing...');
        await _initializeAudioPlayer();
        if (_audioPlayer == null) {
          throw Exception('Failed to initialize audio player');
        }
      }

      state = state.copyWith(
        isLoading: true,
        error: null,
        currentAudioUrl: audioUrl,
      );

      print('🎵 Playing audio: $audioUrl');

      // Önce mevcut sesi durdur
      await _audioPlayer!.stop();

      // Yeni URL ile ses dosyasını yükle
      print('📥 Setting URL: $audioUrl');
      await _audioPlayer!.setUrl(audioUrl);
      print('✅ URL set successfully');

      // Duration'ı bekle
      print('⏳ Waiting for duration...');
      await _audioPlayer!.durationStream.first;
      print('✅ Duration loaded: ${_audioPlayer!.duration}');

      // Çalmaya başla
      print('▶️ Starting playback...');
      await _audioPlayer!.play();
      print('✅ Play command executed');

      state = state.copyWith(isLoading: false);
      print('✅ Audio started playing');
    } catch (e) {
      print('❌ Error playing audio: $e');
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to play audio: ${e.toString()}',
      );
    }
  }

  /// Duraklat
  Future<void> pause() async {
    try {
      if (_audioPlayer == null) return;
      await _audioPlayer!.pause();
      print('⏸️ Audio paused');
    } catch (e) {
      print('❌ Error pausing audio: $e');
      state = state.copyWith(error: 'Failed to pause audio');
    }
  }

  /// Devam ettir
  Future<void> resume() async {
    try {
      if (_audioPlayer == null) return;
      await _audioPlayer!.play();
      print('▶️ Audio resumed');
    } catch (e) {
      print('❌ Error resuming audio: $e');
      state = state.copyWith(error: 'Failed to resume audio');
    }
  }

  /// Play/Pause toggle
  Future<void> togglePlayPause() async {
    if (state.isPlaying) {
      await pause();
    } else {
      await resume();
    }
  }

  /// Belirli pozisyona git
  Future<void> seek(Duration position) async {
    try {
      if (_audioPlayer == null) return;
      await _audioPlayer!.seek(position);
      print('⏩ Seeking to: ${position.inSeconds}s');
    } catch (e) {
      print('❌ Error seeking: $e');
      state = state.copyWith(error: 'Failed to seek');
    }
  }

  /// 10 saniye ileri
  Future<void> seekForward() async {
    final newPosition = state.currentPosition + const Duration(seconds: 10);
    await seek(newPosition);
  }

  /// 10 saniye geri
  Future<void> seekBackward() async {
    final newPosition = state.currentPosition - const Duration(seconds: 10);
    await seek(newPosition);
  }

  /// Durdur ve sıfırla
  Future<void> stop() async {
    try {
      if (_audioPlayer == null) return;
      await _audioPlayer!.stop();
      state = state.copyWith(
        isPlaying: false,
        currentPosition: Duration.zero,
        currentAudioUrl: null,
      );
      print('⏹️ Audio stopped');
    } catch (e) {
      print('❌ Error stopping audio: $e');
      state = state.copyWith(error: 'Failed to stop audio');
    }
  }

  /// Hata temizle
  void clearError() {
    state = state.copyWith(error: null);
  }

  void dispose() {
    try {
      print('🔄 Disposing audio player...');

      // Önce sesi durdur
      _audioPlayer?.stop();

      // Subscription'ları iptal et
      _positionSubscription?.cancel();
      _playerStateSubscription?.cancel();

      // Audio player'ı dispose et
      _audioPlayer?.dispose();
      _audioPlayer = null;

      // State'i sıfırla
      state = const AudioPlayerState();

      print('✅ Audio player disposed successfully');
    } catch (e) {
      print('❌ Error disposing audio player: $e');
    }
  }
}

/// Audio player provider
final audioPlayerProvider =
    NotifierProvider<AudioPlayerNotifier, AudioPlayerState>(
      () => AudioPlayerNotifier(),
    );
