import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { TTSService } from './tts.service';
import { SupabaseAuthGuard, type AuthenticatedRequest } from '../auth/supabase-auth.guard';
import type {
  GenerateTTSRequest,
  TTSAudioResponse,
  TTSListResponse,
} from './dto/tts.dto';

@Controller('tts')
export class TTSController {
  private readonly logger = new Logger(TTSController.name);

  constructor(private readonly ttsService: TTSService) {}

  /**
   * TTS audio oluştur
   * POST /api/tts/generate
   */
  @Post('generate')
  // @UseGuards(SupabaseAuthGuard) // Test için geçici olarak kaldırıldı
  async generateTTS(
    @Body() request: GenerateTTSRequest,
    // @Request() req: AuthenticatedRequest, // Test için geçici olarak kaldırıldı
  ): Promise<TTSAudioResponse> {
    try {
      this.logger.log(`TTS audio oluşturuluyor: ${request.newsId} - ${request.contentType}`);
      
      const result = await this.ttsService.generateTTS(request);
      
      this.logger.log(`TTS audio başarıyla oluşturuldu: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('TTS audio oluşturulurken hata:', error);
      throw new HttpException(
        error.message || 'TTS audio oluşturulamadı',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * TTS audio getir
   * GET /api/tts/:id
   */
  @Get(':id')
  async getTTSAudio(@Param('id') id: string): Promise<TTSAudioResponse> {
    try {
      return await this.ttsService.getTTSAudio(id);
    } catch (error) {
      this.logger.error(`TTS audio getirilirken hata: ${id}`, error);
      throw new HttpException(
        error.message || 'TTS audio bulunamadı',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Haber için TTS audio'ları listele
   * GET /api/tts/news/:newsId
   */
  @Get('news/:newsId')
  async getTTSAudiosForNews(@Param('newsId') newsId: string): Promise<TTSAudioResponse[]> {
    try {
      return await this.ttsService.getTTSAudiosForNews(newsId);
    } catch (error) {
      this.logger.error(`Haber TTS audio'ları getirilirken hata: ${newsId}`, error);
      throw new HttpException(
        error.message || 'TTS audio listesi alınamadı',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * TTS audio sil
   * DELETE /api/tts/:id
   */
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  async deleteTTSAudio(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    try {
      await this.ttsService.deleteTTSAudio(id);
      
      this.logger.log(`TTS audio silindi: ${id}`);
      return { message: 'TTS audio başarıyla silindi' };
    } catch (error) {
      this.logger.error(`TTS audio silinirken hata: ${id}`, error);
      throw new HttpException(
        error.message || 'TTS audio silinemedi',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * TTS audio durumunu kontrol et
   * GET /api/tts/:id/status
   */
  @Get(':id/status')
  async getTTSStatus(@Param('id') id: string): Promise<{ status: string; audioUrl?: string }> {
    try {
      const ttsAudio = await this.ttsService.getTTSAudio(id);
      return {
        status: ttsAudio.status,
        audioUrl: ttsAudio.audioUrl,
      };
    } catch (error) {
      this.logger.error(`TTS durumu getirilirken hata: ${id}`, error);
      throw new HttpException(
        error.message || 'TTS durumu alınamadı',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }
}
