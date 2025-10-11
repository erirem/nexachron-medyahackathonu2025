import '../entities/reel_entity.dart';
import '../repositories/reel_repository.dart';

class ReelService {
  final ReelRepository _repository;

  const ReelService(this._repository);

  /// Explore feed'den reel listesini getirir
  Future<ExploreFeedResponse> getExploreFeed({
    int? limit,
    String? cursor,
    String? category,
    String? userId,
  }) async {
    return await _repository.getExploreFeed(
      limit: limit,
      cursor: cursor,
      category: category,
      userId: userId,
    );
  }

  /// Belirli bir reel'i ID ile getirir
  Future<ReelEntity> getReelById(String id) async {
    return await _repository.getReelById(id);
  }

  /// Mevcut reel'den sonraki reel'i getirir
  Future<NextReelResponse> getNextReel(
    String currentId, {
    String? direction,
    String? category,
    String? userId,
  }) async {
    return await _repository.getNextReel(
      currentId,
      direction: direction,
      category: category,
      userId: userId,
    );
  }

  /// Reel listesini getirir
  Future<List<ReelEntity>> getReelsList({
    int? limit,
    int? offset,
    String? status,
    String? category,
  }) async {
    return await _repository.getReelsList(
      limit: limit,
      offset: offset,
      status: status,
      category: category,
    );
  }

  /// Kategoriye göre reel'leri filtreler
  Future<List<ReelEntity>> getReelsByCategory(String category) async {
    final response = await getExploreFeed(category: category);
    return response.items;
  }

  /// Popüler reel'leri getirir (engagement score'a göre)
  Future<List<ReelEntity>> getPopularReels({int limit = 20}) async {
    final response = await getExploreFeed(limit: limit);
    final sortedItems = response.items.toList()
      ..sort((a, b) => b.engagementScore.compareTo(a.engagementScore));
    return sortedItems;
  }
}

