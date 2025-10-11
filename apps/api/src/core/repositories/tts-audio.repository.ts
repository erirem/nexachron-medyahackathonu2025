import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { TTSAudioEntity, CreateTTSAudioData, UpdateTTSAudioData, TTSStatus, TTSVoice, TTSEngine } from '../entities/tts-audio.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class TTSAudioRepository extends BaseRepository<TTSAudioEntity> {
  private readonly tableName = DATABASE_TABLES.NEWS_TTS_AUDIO;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<TTSAudioEntity | null> {
    if (!this.validateUuid(id)) {
      return null;
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'findById');
      }
      return data ? new TTSAudioEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateTTSAudioData): Promise<TTSAudioEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          news_id: data.newsId,
          text: data.text,
          voice: data.voice,
          engine: data.engine,
          language: data.language,
          speed: data.speed || 1.0,
          pitch: data.pitch || 1.0,
          volume: data.volume || 1.0,
          status: data.status,
          audio_url: data.audioUrl,
          duration: data.duration,
          file_size: data.fileSize,
          quality_score: data.qualityScore || 0,
          metadata: data.metadata,
          expires_at: data.expiresAt?.toISOString(),
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new TTSAudioEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateTTSAudioData): Promise<TTSAudioEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid TTS audio ID');
    }
    try {
      const updateData: any = {};
      if (data.text !== undefined) updateData.text = data.text;
      if (data.voice !== undefined) updateData.voice = data.voice;
      if (data.engine !== undefined) updateData.engine = data.engine;
      if (data.language !== undefined) updateData.language = data.language;
      if (data.speed !== undefined) updateData.speed = data.speed;
      if (data.pitch !== undefined) updateData.pitch = data.pitch;
      if (data.volume !== undefined) updateData.volume = data.volume;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.audioUrl !== undefined) updateData.audio_url = data.audioUrl;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.fileSize !== undefined) updateData.file_size = data.fileSize;
      if (data.qualityScore !== undefined) updateData.quality_score = data.qualityScore;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      if (data.expiresAt !== undefined) updateData.expires_at = data.expiresAt.toISOString();

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new TTSAudioEntity(result);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!this.validateUuid(id)) {
      return false;
    }
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        this.handleError(error, 'delete');
      }
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async findByNewsId(newsId: string, limit: number = 100): Promise<TTSAudioEntity[]> {
    if (!this.validateUuid(newsId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('news_id', newsId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByNewsId');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByNewsId');
    }
  }

  async findByStatus(status: TTSStatus, limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByStatus');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByStatus');
    }
  }

  async findByVoice(voice: TTSVoice, limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('voice', voice)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByVoice');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByVoice');
    }
  }

  async findByEngine(engine: TTSEngine, limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('engine', engine)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByEngine');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByEngine');
    }
  }

  async findByLanguage(language: string, limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('language', language)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByLanguage');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByLanguage');
    }
  }

  async findAvailable(limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', TTSStatus.READY)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findAvailable');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findAvailable');
    }
  }

  async findExpired(limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', TTSStatus.EXPIRED)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findExpired');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findExpired');
    }
  }

  async findExpiringSoon(hours: number = 24, limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', TTSStatus.READY)
        .not('expires_at', 'is', null)
        .lte('expires_at', new Date(Date.now() + hours * 60 * 60 * 1000).toISOString())
        .order('expires_at', { ascending: true })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findExpiringSoon');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findExpiringSoon');
    }
  }

  async findHighQuality(limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('quality_score', 80)
        .order('quality_score', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findHighQuality');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findHighQuality');
    }
  }

  async findByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByDateRange');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByDateRange');
    }
  }

  async getTTSStats(): Promise<{
    totalAudio: number;
    byStatus: Record<string, number>;
    byVoice: Record<string, number>;
    byEngine: Record<string, number>;
    byLanguage: Record<string, number>;
    averageQuality: number;
    totalDuration: number;
    totalSize: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*');

      if (error) {
        this.handleError(error, 'getTTSStats');
      }

      if (!data) {
        return {
          totalAudio: 0,
          byStatus: {},
          byVoice: {},
          byEngine: {},
          byLanguage: {},
          averageQuality: 0,
          totalDuration: 0,
          totalSize: 0,
        };
      }

      const audio = data.map(row => new TTSAudioEntity(row));
      const totalAudio = audio.length;
      
      const byStatus: Record<string, number> = {};
      const byVoice: Record<string, number> = {};
      const byEngine: Record<string, number> = {};
      const byLanguage: Record<string, number> = {};
      let totalQuality = 0;
      let totalDuration = 0;
      let totalSize = 0;

      audio.forEach(item => {
        byStatus[item.status] = (byStatus[item.status] || 0) + 1;
        byVoice[item.voice] = (byVoice[item.voice] || 0) + 1;
        byEngine[item.engine] = (byEngine[item.engine] || 0) + 1;
        byLanguage[item.language] = (byLanguage[item.language] || 0) + 1;
        totalQuality += item.qualityScore;
        totalDuration += item.duration || 0;
        totalSize += item.fileSize || 0;
      });

      return {
        totalAudio,
        byStatus,
        byVoice,
        byEngine,
        byLanguage,
        averageQuality: totalAudio > 0 ? totalQuality / totalAudio : 0,
        totalDuration,
        totalSize,
      };
    } catch (error) {
      this.handleError(error, 'getTTSStats');
    }
  }

  async getRecentAudio(limit: number = 50): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getRecentAudio');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getRecentAudio');
    }
  }

  async getProcessingAudio(limit: number = 50): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('status', [TTSStatus.PENDING, TTSStatus.PROCESSING])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getProcessingAudio');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getProcessingAudio');
    }
  }

  async getFailedAudio(limit: number = 50): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', TTSStatus.FAILED)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getFailedAudio');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getFailedAudio');
    }
  }

  async searchAudio(query: string, limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .ilike('text', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'searchAudio');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'searchAudio');
    }
  }

  async getAudioByDuration(minDuration: number, maxDuration: number, limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('duration', minDuration)
        .lte('duration', maxDuration)
        .order('duration', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getAudioByDuration');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getAudioByDuration');
    }
  }

  async getAudioBySize(minSize: number, maxSize: number, limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('file_size', minSize)
        .lte('file_size', maxSize)
        .order('file_size', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getAudioBySize');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getAudioBySize');
    }
  }

  async getMostPlayed(limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', TTSStatus.READY)
        .order('metadata->plays', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getMostPlayed');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getMostPlayed');
    }
  }

  async getMostDownloaded(limit: number = 100): Promise<TTSAudioEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', TTSStatus.READY)
        .order('metadata->downloads', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getMostDownloaded');
      }
      return data ? data.map(row => new TTSAudioEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getMostDownloaded');
    }
  }
}
