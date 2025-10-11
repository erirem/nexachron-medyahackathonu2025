/**
 * TTS Service
 * Text-to-Speech audio management and operations
 */

import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TTSAudioRepository } from '../../../core/repositories/tts-audio.repository';
import { TTSAudioEntity, TTSStatus, TTSVoice, TTSEngine } from '../../../core/entities/tts-audio.entity';
import {
  CreateTTSAudioDto,
  UpdateTTSAudioDto,
  TTSAudioResponseDto,
  PaginatedTTSAudioResponseDto,
  TTSAudioQueryDto,
} from '../../../shared/dto/media.dto';
import { ERROR_MESSAGES } from '../../../common/constants';

@Injectable()
export class TTSService {
  private readonly logger = new Logger(TTSService.name);

  constructor(private readonly ttsAudioRepository: TTSAudioRepository) {}

  async createTTSAudio(createTTSAudioDto: CreateTTSAudioDto): Promise<TTSAudioResponseDto> {
    try {
      const ttsAudioEntity = await this.ttsAudioRepository.create({
        newsId: createTTSAudioDto.newsId,
        text: createTTSAudioDto.text,
        voice: createTTSAudioDto.voice,
        engine: createTTSAudioDto.engine,
        language: createTTSAudioDto.language,
        speed: createTTSAudioDto.speed,
        pitch: createTTSAudioDto.pitch,
        volume: createTTSAudioDto.volume,
        status: createTTSAudioDto.status,
        audioUrl: createTTSAudioDto.audioUrl,
        duration: createTTSAudioDto.duration,
        fileSize: createTTSAudioDto.fileSize,
        qualityScore: createTTSAudioDto.qualityScore,
        metadata: createTTSAudioDto.metadata,
        expiresAt: createTTSAudioDto.expiresAt ? new Date(createTTSAudioDto.expiresAt) : undefined,
      });

      return this.mapTTSAudioEntityToDto(ttsAudioEntity);
    } catch (error) {
      this.logger.error('Error creating TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTTSAudioById(id: string): Promise<TTSAudioResponseDto> {
    try {
      const ttsAudioEntity = await this.ttsAudioRepository.findById(id);
      if (!ttsAudioEntity) {
        throw new NotFoundException('TTS audio not found');
      }
      return this.mapTTSAudioEntityToDto(ttsAudioEntity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting TTS audio by ID:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateTTSAudio(id: string, updateTTSAudioDto: UpdateTTSAudioDto): Promise<TTSAudioResponseDto> {
    try {
      const ttsAudioEntity = await this.ttsAudioRepository.findById(id);
      if (!ttsAudioEntity) {
        throw new NotFoundException('TTS audio not found');
      }

      const updatedEntity = await this.ttsAudioRepository.update(id, {
        text: updateTTSAudioDto.text,
        voice: updateTTSAudioDto.voice,
        engine: updateTTSAudioDto.engine,
        language: updateTTSAudioDto.language,
        speed: updateTTSAudioDto.speed,
        pitch: updateTTSAudioDto.pitch,
        volume: updateTTSAudioDto.volume,
        status: updateTTSAudioDto.status,
        audioUrl: updateTTSAudioDto.audioUrl,
        duration: updateTTSAudioDto.duration,
        fileSize: updateTTSAudioDto.fileSize,
        qualityScore: updateTTSAudioDto.qualityScore,
        metadata: updateTTSAudioDto.metadata,
        expiresAt: updateTTSAudioDto.expiresAt ? new Date(updateTTSAudioDto.expiresAt) : undefined,
      });

      return this.mapTTSAudioEntityToDto(updatedEntity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteTTSAudio(id: string): Promise<boolean> {
    try {
      const ttsAudioEntity = await this.ttsAudioRepository.findById(id);
      if (!ttsAudioEntity) {
        throw new NotFoundException('TTS audio not found');
      }

      return await this.ttsAudioRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTTSAudio(query: TTSAudioQueryDto): Promise<PaginatedTTSAudioResponseDto> {
    try {
      const { page, pageSize, status, voice, engine, language, newsId, minQuality, minDuration, maxDuration, minFileSize, maxFileSize, search, expiringSoon } = query;
      const limit = pageSize || 20;
      const offset = ((page || 1) - 1) * limit;

      let ttsAudioEntities: TTSAudioEntity[] = [];

      if (search) {
        ttsAudioEntities = await this.ttsAudioRepository.searchAudio(search, limit);
      } else if (status) {
        ttsAudioEntities = await this.ttsAudioRepository.findByStatus(status, limit);
      } else if (voice) {
        ttsAudioEntities = await this.ttsAudioRepository.findByVoice(voice, limit);
      } else if (engine) {
        ttsAudioEntities = await this.ttsAudioRepository.findByEngine(engine, limit);
      } else if (language) {
        ttsAudioEntities = await this.ttsAudioRepository.findByLanguage(language, limit);
      } else if (newsId) {
        ttsAudioEntities = await this.ttsAudioRepository.findByNewsId(newsId, limit);
      } else if (expiringSoon) {
        ttsAudioEntities = await this.ttsAudioRepository.findExpiringSoon(expiringSoon, limit);
      } else if (minDuration !== undefined && maxDuration !== undefined) {
        ttsAudioEntities = await this.ttsAudioRepository.getAudioByDuration(minDuration, maxDuration, limit);
      } else if (minFileSize !== undefined && maxFileSize !== undefined) {
        ttsAudioEntities = await this.ttsAudioRepository.getAudioBySize(minFileSize, maxFileSize, limit);
      } else {
        ttsAudioEntities = await this.ttsAudioRepository.getRecentAudio(limit);
      }

      const ttsAudioDtos = ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
      const total = ttsAudioEntities.length; // This would need to be improved with proper counting

      const response = new PaginatedTTSAudioResponseDto();
      response.items = ttsAudioDtos;
      response.pagination = {
        page: page || 1,
        pageSize: limit,
        total,
        hasMore: (page || 1) * limit < total,
        totalPages: Math.ceil(total / limit),
      };

      return response;
    } catch (error) {
      this.logger.error('Error getting TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTTSStats(): Promise<any> {
    try {
      return await this.ttsAudioRepository.getTTSStats();
    } catch (error) {
      this.logger.error('Error getting TTS stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getAvailableTTSAudio(limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.findAvailable(limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting available TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getExpiredTTSAudio(limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.findExpired(limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting expired TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getExpiringSoonTTSAudio(hours: number = 24, limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.findExpiringSoon(hours, limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting expiring soon TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getHighQualityTTSAudio(limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.findHighQuality(limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting high quality TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getProcessingTTSAudio(limit: number = 50): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.getProcessingAudio(limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting processing TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getFailedTTSAudio(limit: number = 50): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.getFailedAudio(limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting failed TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTTSAudioByNewsId(newsId: string, limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.findByNewsId(newsId, limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting TTS audio by news ID:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTTSAudioByVoice(voice: TTSVoice, limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.findByVoice(voice, limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting TTS audio by voice:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTTSAudioByEngine(engine: TTSEngine, limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.findByEngine(engine, limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting TTS audio by engine:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTTSAudioByLanguage(language: string, limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.findByLanguage(language, limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting TTS audio by language:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTTSAudioByStatus(status: TTSStatus, limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.findByStatus(status, limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting TTS audio by status:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTTSAudioByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.findByDateRange(startDate, endDate, limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting TTS audio by date range:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async searchTTSAudio(query: string, limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.searchAudio(query, limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error searching TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getMostPlayedTTSAudio(limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.getMostPlayed(limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting most played TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getMostDownloadedTTSAudio(limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.getMostDownloaded(limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting most downloaded TTS audio:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTTSAudioByDuration(minDuration: number, maxDuration: number, limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.getAudioByDuration(minDuration, maxDuration, limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting TTS audio by duration:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTTSAudioBySize(minSize: number, maxSize: number, limit: number = 100): Promise<TTSAudioResponseDto[]> {
    try {
      const ttsAudioEntities = await this.ttsAudioRepository.getAudioBySize(minSize, maxSize, limit);
      return ttsAudioEntities.map(this.mapTTSAudioEntityToDto);
    } catch (error) {
      this.logger.error('Error getting TTS audio by size:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  private mapTTSAudioEntityToDto(ttsAudioEntity: TTSAudioEntity): TTSAudioResponseDto {
    return {
      id: ttsAudioEntity.id,
      newsId: ttsAudioEntity.newsId,
      text: ttsAudioEntity.text,
      voice: ttsAudioEntity.voice,
      engine: ttsAudioEntity.engine,
      language: ttsAudioEntity.language,
      speed: ttsAudioEntity.speed,
      pitch: ttsAudioEntity.pitch,
      volume: ttsAudioEntity.volume,
      status: ttsAudioEntity.status,
      audioUrl: ttsAudioEntity.audioUrl,
      duration: ttsAudioEntity.duration,
      fileSize: ttsAudioEntity.fileSize,
      qualityScore: ttsAudioEntity.qualityScore,
      metadata: ttsAudioEntity.metadata,
      expiresAt: ttsAudioEntity.expiresAt?.toISOString(),
      createdAt: ttsAudioEntity.createdAt.toISOString(),
      updatedAt: ttsAudioEntity.updatedAt.toISOString(),
      // Computed properties
      isPending: ttsAudioEntity.isPending(),
      isProcessing: ttsAudioEntity.isProcessing(),
      isReady: ttsAudioEntity.isReady(),
      isFailed: ttsAudioEntity.isFailed(),
      isExpired: ttsAudioEntity.isExpired(),
      isAvailable: ttsAudioEntity.isAvailable(),
      durationMinutes: ttsAudioEntity.getDurationMinutes() ?? undefined,
      durationFormatted: ttsAudioEntity.getDurationFormatted(),
      fileSizeMB: ttsAudioEntity.getFileSizeMB() ?? undefined,
      isHighQuality: ttsAudioEntity.isHighQuality(),
      qualityLevel: ttsAudioEntity.getQualityLevel(),
      statusColor: ttsAudioEntity.getStatusColor(),
      statusText: ttsAudioEntity.getStatusText(),
      voiceText: ttsAudioEntity.getVoiceText(),
      engineText: ttsAudioEntity.getEngineText(),
      audioInfo: ttsAudioEntity.getAudioInfo(),
      processingInfo: ttsAudioEntity.getProcessingInfo(),
      usageStats: {
        ...ttsAudioEntity.getUsageStats(),
        lastPlayed: ttsAudioEntity.getUsageStats().lastPlayed?.toISOString(),
      },
      textLength: ttsAudioEntity.getTextLength(),
      wordCount: ttsAudioEntity.getWordCount(),
      estimatedDuration: ttsAudioEntity.getEstimatedDuration(),
      readingSpeed: ttsAudioEntity.getReadingSpeed(),
      ageHours: ttsAudioEntity.getAgeHours(),
      isRecent: ttsAudioEntity.isRecent(),
      downloadUrl: ttsAudioEntity.getDownloadUrl() ?? undefined,
      streamUrl: ttsAudioEntity.getStreamUrl() ?? undefined,
      previewUrl: ttsAudioEntity.getPreviewUrl() ?? undefined,
    };
  }
}
