import '../entities/reel_entity.dart';

abstract class ReelRepository {
  /// Explore feed'den reel listesini getirir
  Future<ExploreFeedResponse> getExploreFeed({
    int? limit,
    String? cursor,
    String? category,
    String? userId,
  });

  /// Belirli bir reel'i ID ile getirir
  Future<ReelEntity> getReelById(String id);

  /// Mevcut reel'den sonraki reel'i getirir
  Future<NextReelResponse> getNextReel(
    String currentId, {
    String? direction,
    String? category,
    String? userId,
  });

  /// Reel listesini getirir (admin/management için)
  Future<List<ReelEntity>> getReelsList({
    int? limit,
    int? offset,
    String? status,
    String? category,
  });

  // Web'deki API'leri ekle
  /// Web'deki reels list API'yi kullan
  Future<ReelListResponse> fetchReelsList({
    int? limit,
    int? offset,
    String? status,
    String? category,
  });

  /// Web'deki reel detail API'yi kullan
  Future<ReelDetail> fetchReelById(String id);

  /// Web'deki next reel API'yi kullan
  Future<NextReelResponse> fetchNextReel(
    String currentId, {
    String? direction,
    String? category,
    String? userId,
  });
}
