import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/reel_entity.dart';
import '../../domain/repositories/reel_repository.dart';
import '../../domain/services/reel_service.dart';
import '../../data/repositories/reel_repository_impl.dart';
import '../../data/services/reel_api_service.dart';

// Repository Provider
final reelRepositoryProvider = Provider<ReelRepository>((ref) {
  return ReelRepositoryImpl(ReelApiService());
});

// Service Provider
final reelServiceProvider = Provider<ReelService>((ref) {
  final repository = ref.watch(reelRepositoryProvider);
  return ReelService(repository);
});

// Explore Feed Provider - Web'deki API'yi kullan
final exploreFeedProvider = FutureProvider<ExploreFeedResponse>((ref) async {
  try {
    final reelService = ref.watch(reelServiceProvider);
    print('🎬 Starting to fetch explore feed...');
    final result = await reelService.getExploreFeed(limit: 24);
    print('🎬 Explore feed fetched successfully: ${result.items.length} items');
    return result;
  } catch (e) {
    print('❌ Error in exploreFeedProvider: $e');
    rethrow;
  }
});

// Reels List Provider - Web'deki reels list API'yi kullan
final reelsListProvider = FutureProvider<ReelListResponse>((ref) async {
  try {
    final repository = ref.watch(reelRepositoryProvider);
    print('🎬 Starting to fetch reels list...');
    final result = await repository.fetchReelsList(limit: 20);
    print('🎬 Reels list fetched successfully: ${result.reels.length} items');
    return result;
  } catch (e) {
    print('❌ Error in reelsListProvider: $e');
    rethrow;
  }
});

// Reels by Category Provider
final reelsByCategoryProvider = FutureProvider.family<List<ReelEntity>, String>(
  (ref, category) async {
    final reelService = ref.watch(reelServiceProvider);
    final response = await reelService.getExploreFeed(
      category: category,
      limit: 20,
    );
    return response.items;
  },
);

// Popular Reels Provider
final popularReelsProvider = FutureProvider<List<ReelEntity>>((ref) async {
  final reelService = ref.watch(reelServiceProvider);
  return await reelService.getPopularReels(limit: 20);
});

// Single Reel Provider
final reelByIdProvider = FutureProvider.family<ReelEntity, String>((
  ref,
  reelId,
) async {
  final reelService = ref.watch(reelServiceProvider);
  return await reelService.getReelById(reelId);
});
