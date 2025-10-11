import '../../domain/entities/reel_entity.dart';
import '../../domain/repositories/reel_repository.dart';
import '../services/reel_api_service.dart';

class ReelRepositoryImpl implements ReelRepository {
  final ReelApiService _apiService;

  const ReelRepositoryImpl(this._apiService);

  @override
  Future<ExploreFeedResponse> getExploreFeed({
    int? limit,
    String? cursor,
    String? category,
    String? userId,
  }) async {
    return await _apiService.getExploreFeed(
      limit: limit,
      cursor: cursor,
      category: category,
      userId: userId,
    );
  }

  @override
  Future<ReelEntity> getReelById(String id) async {
    return await _apiService.getReelById(id);
  }

  @override
  Future<NextReelResponse> getNextReel(
    String currentId, {
    String? direction,
    String? category,
    String? userId,
  }) async {
    return await _apiService.getNextReel(
      currentId,
      direction: direction,
      category: category,
      userId: userId,
    );
  }

  @override
  Future<List<ReelEntity>> getReelsList({
    int? limit,
    int? offset,
    String? status,
    String? category,
  }) async {
    return await _apiService.getReelsList(
      limit: limit,
      offset: offset,
      status: status,
      category: category,
    );
  }

  // Web'deki API'leri implement et
  @override
  Future<ReelListResponse> fetchReelsList({
    int? limit,
    int? offset,
    String? status,
    String? category,
  }) async {
    return await _apiService.fetchReelsList(
      limit: limit,
      offset: offset,
      status: status,
      category: category,
    );
  }

  @override
  Future<ReelDetail> fetchReelById(String id) async {
    return await _apiService.fetchReelById(id);
  }

  @override
  Future<NextReelResponse> fetchNextReel(
    String currentId, {
    String? direction,
    String? category,
    String? userId,
  }) async {
    return await _apiService.fetchNextReel(
      currentId,
      direction: direction,
      category: category,
      userId: userId,
    );
  }
}
