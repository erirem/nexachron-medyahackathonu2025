import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NewsService } from '../news/news.service';
import {
  GenerateTTSRequest,
  TTSAudioResponse,
  TTSListResponse,
  TTSVoice,
  TTSContentType,
  TTSStatus,
} from './dto/tts.dto';

@Injectable()
export class TTSService {
  private readonly logger = new Logger(TTSService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly newsService: NewsService,
  ) {}

  /**
   * TTS oluşturmayı test et (kaydetmeden)
   */
  private async testTTSGeneration(
    news: any,
    contentType: TTSContentType,
    voice: TTSVoice,
    speed: number,
  ): Promise<void> {
    // İçeriği belirle
    let content = '';
    switch (contentType) {
      case 'title':
        content = news.title;
        break;
      case 'summary':
        content = news.content || news.summary;
        break;
      case 'full':
        content = news.content || news.summary;
        break;
    }

    if (!content) {
      throw new Error('İçerik bulunamadı');
    }

    // OpenAI TTS API'si maksimum 4096 karakter kabul ediyor
    if (content.length > 4096) {
      content = content.substring(0, 4090) + '...';
      this.logger.warn(`İçerik çok uzun, kısaltıldı: ${content.length} karakter`);
    }

    // Sadece ilk 100 karakteri test et (hızlı test)
    const testContent = content.substring(0, 100);
    
    try {
      await this.generateAudioWithOpenAI(testContent, voice, speed);
      this.logger.log('TTS test başarılı');
    } catch (error) {
      this.logger.error('TTS test başarısız:', error);
      throw error;
    }
  }

  /**
   * TTS audio oluştur
   */
  async generateTTS(request: GenerateTTSRequest): Promise<TTSAudioResponse> {
    const { newsId, contentType, voice = TTSVoice.ALLOY, speed = 1.0 } = request;

    // Haber var mı kontrol et
    const newsResponse = await this.newsService.getNewsById(newsId);
    if (!newsResponse.data) {
      throw new NotFoundException('Haber bulunamadı');
    }
    const news = newsResponse.data;

    // Mevcut TTS kaydı var mı kontrol et
    const existingTTS = await this.getExistingTTS(newsId, contentType, voice);
    if (existingTTS && existingTTS.status === 'completed') {
      return existingTTS;
    }

    // Önce TTS oluşturmayı test et
    try {
      await this.testTTSGeneration(news, contentType, voice, speed);
      
      // Test başarılıysa kaydı oluştur
      const ttsRecord = await this.createTTSRecord({
        newsId,
        contentType,
        voice,
        speed,
      });

      // Arka planda TTS işlemini başlat
      this.processTTSAsync(ttsRecord.id, news, contentType, voice, speed);

      return ttsRecord;
    } catch (error) {
      this.logger.error(`TTS test başarısız: ${newsId}`, error);
      throw new BadRequestException(`TTS oluşturulamadı: ${error.message}`);
    }
  }

  /**
   * TTS audio getir
   */
  async getTTSAudio(id: string): Promise<TTSAudioResponse> {
    const { data, error } = await this.supabaseService
      .supabase
      .from('news_tts_audio')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('TTS audio bulunamadı');
    }

    return this.mapToResponse(data);
  }

  /**
   * Haber için TTS audio'ları listele
   */
  async getTTSAudiosForNews(newsId: string): Promise<TTSAudioResponse[]> {
    const { data, error } = await this.supabaseService
      .supabase
      .from('news_tts_audio')
      .select('*')
      .eq('news_id', newsId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('TTS audio listesi alınırken hata:', error);
      throw new BadRequestException('TTS audio listesi alınamadı');
    }

    return data.map(this.mapToResponse);
  }

  /**
   * TTS audio sil
   */
  async deleteTTSAudio(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .supabase
      .from('news_tts_audio')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('TTS audio silinirken hata:', error);
      throw new BadRequestException('TTS audio silinemedi');
    }
  }

  /**
   * Mevcut TTS kaydını kontrol et
   */
  private async getExistingTTS(
    newsId: string,
    contentType: TTSContentType,
    voice: TTSVoice,
  ): Promise<TTSAudioResponse | null> {
    try {
      const { data, error } = await this.supabaseService
        .supabase
        .from('news_tts_audio')
        .select('*')
        .eq('news_id', newsId)
        .eq('content_type', contentType)
        .eq('voice', voice)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapToResponse(data);
    } catch (error) {
      this.logger.warn('TTS tablosu bulunamadı, mevcut kayıt kontrol edilemedi');
      return null;
    }
  }

  /**
   * TTS kaydı oluştur
   */
  private async createTTSRecord(params: {
    newsId: string;
    contentType: TTSContentType;
    voice: TTSVoice;
    speed: number;
  }): Promise<TTSAudioResponse> {
    try {
      const { data, error } = await this.supabaseService
        .supabase
        .from('news_tts_audio')
        .insert({
          news_id: params.newsId,
          content_type: params.contentType,
          voice: params.voice,
          speed: params.speed,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        this.logger.error('TTS kaydı oluşturulurken hata:', error);
        // If table doesn't exist, create a mock response
        if (error.message?.includes('relation "news_tts_audio" does not exist')) {
          this.logger.warn('TTS tablosu bulunamadı, mock kayıt oluşturuluyor. Lütfen veritabanı migrasyonunu çalıştırın.');
          return {
            id: crypto.randomUUID(),
            newsId: params.newsId,
            contentType: params.contentType,
            voice: params.voice,
            speed: params.speed,
            status: 'pending' as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        throw new BadRequestException('TTS kaydı oluşturulamadı');
      }

      return this.mapToResponse(data);
    } catch (error) {
      this.logger.error('TTS kaydı oluşturulurken beklenmeyen hata:', error);
      // Create a mock response to allow TTS generation to continue
      this.logger.warn('TTS kaydı oluşturulamadı, mock kayıt oluşturuluyor');
      return {
        id: crypto.randomUUID(),
        newsId: params.newsId,
        contentType: params.contentType,
        voice: params.voice,
        speed: params.speed,
        status: 'pending' as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * TTS işlemini arka planda gerçekleştir
   */
  private async processTTSAsync(
    ttsId: string,
    news: any,
    contentType: TTSContentType,
    voice: TTSVoice,
    speed: number,
  ): Promise<void> {
    try {
      // Status'u processing olarak güncelle
      await this.updateTTSStatus(ttsId, TTSStatus.PROCESSING);

      // İçeriği belirle
      let content = '';
      switch (contentType) {
        case 'title':
          content = news.title;
          break;
        case 'summary':
          content = news.content || news.summary;
          break;
        case 'full':
          content = news.content || news.summary;
          break;
      }

      this.logger.log(`TTS İçerik Debug - contentType: ${contentType}, title: ${news.title?.substring(0, 50)}..., content: ${news.content?.substring(0, 50)}..., summary: ${news.summary?.substring(0, 50)}..., final content: ${content?.substring(0, 50)}...`);

      if (!content) {
        throw new Error('İçerik bulunamadı');
      }

      // OpenAI TTS API'si maksimum 4096 karakter kabul ediyor
      if (content.length > 4096) {
        content = content.substring(0, 4090) + '...';
        this.logger.warn(`İçerik çok uzun, kısaltıldı: ${content.length} karakter`);
      }

      // OpenAI TTS API'sini çağır
      const audioBuffer = await this.generateAudioWithOpenAI(content, voice, speed);

      // Audio dosyasını Supabase Storage'a yükle
      const audioUrl = await this.uploadAudioToStorage(ttsId, audioBuffer);

      // TTS kaydını güncelle
      await this.updateTTSRecord(ttsId, {
        status: TTSStatus.COMPLETED,
        audio_url: audioUrl,
        file_size_bytes: audioBuffer.length,
        duration_seconds: Math.ceil(audioBuffer.length / 16000), // Yaklaşık hesaplama
      });

      this.logger.log(`TTS audio başarıyla oluşturuldu: ${ttsId}`);
    } catch (error) {
      this.logger.error(`TTS işlemi başarısız: ${ttsId}`, error);
      
      // Hata durumunda kaydı sil (isteğe bağlı)
      await this.deleteTTSAudio(ttsId);
      
      // Veya sadece status'u failed olarak işaretle
      // await this.updateTTSRecord(ttsId, {
      //   status: TTSStatus.FAILED,
      //   error_message: error.message,
      // });
    }
  }

  /**
   * OpenAI TTS API ile audio oluştur
   */
  private async generateAudioWithOpenAI(
    content: string,
    voice: TTSVoice,
    speed: number,
  ): Promise<Buffer> {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OpenAI API key bulunamadı');
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: content,
        voice: voice,
        speed: speed,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI TTS API hatası: ${error}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Audio dosyasını Supabase Storage'a yükle
   */
  private async uploadAudioToStorage(ttsId: string, audioBuffer: Buffer): Promise<string> {
    const fileName = `tts-audio-${ttsId}.mp3`;
    const { data, error } = await this.supabaseService
      .adminSupabase
      .storage
      .from('tts-audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (error) {
      throw new Error(`Audio yükleme hatası: ${error.message}`);
    }

    const { data: urlData } = this.supabaseService
      .adminSupabase
      .storage
      .from('tts-audio')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  /**
   * TTS status güncelle
   */
  private async updateTTSStatus(ttsId: string, status: TTSStatus): Promise<void> {
    await this.updateTTSRecord(ttsId, { status });
  }

  /**
   * TTS kaydını güncelle
   */
  private async updateTTSRecord(ttsId: string, updates: Partial<any>): Promise<void> {
    try {
      const { error } = await this.supabaseService
        .supabase
        .from('news_tts_audio')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ttsId);

      if (error) {
        this.logger.error('TTS kaydı güncellenirken hata:', error);
        // If table doesn't exist, log warning but don't throw error
        if (error.message?.includes('relation "news_tts_audio" does not exist')) {
          this.logger.warn('TTS tablosu bulunamadı, kayıt güncellenemedi. Lütfen veritabanı migrasyonunu çalıştırın.');
          return;
        }
        throw new BadRequestException('TTS kaydı güncellenemedi');
      }
    } catch (error) {
      this.logger.error('TTS kaydı güncellenirken beklenmeyen hata:', error);
      // Don't throw error to prevent breaking the TTS generation
      this.logger.warn('TTS kaydı güncellenemedi, ancak ses dosyası oluşturuldu');
    }
  }

  /**
   * Veritabanı kaydını response formatına çevir
   */
  private mapToResponse(data: any): TTSAudioResponse {
    return {
      id: data.id,
      newsId: data.news_id,
      contentType: data.content_type,
      voice: data.voice,
      speed: data.speed,
      audioUrl: data.audio_url,
      fileSizeBytes: data.file_size_bytes,
      durationSeconds: data.duration_seconds,
      status: data.status,
      errorMessage: data.error_message,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
