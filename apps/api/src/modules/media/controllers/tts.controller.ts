/**
 * TTS Controller
 * Text-to-Speech audio operations
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TTSService } from '../services/tts.service';
import {
  CreateTTSAudioDto,
  UpdateTTSAudioDto,
  TTSAudioResponseDto,
  PaginatedTTSAudioResponseDto,
  TTSAudioQueryDto,
} from '../../../shared/dto/media.dto';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';
import { ERROR_MESSAGES } from '../../../common/constants';

@Controller('tts')
export class TTSController {
  private readonly logger = new Logger(TTSController.name);

  constructor(private readonly ttsService: TTSService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTTSAudio(
    @Body() createTTSAudioDto: CreateTTSAudioDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.createTTSAudio(createTTSAudioDto);
    } catch (error) {
      this.logger.error('Error creating TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get()
  async getTTSAudio(
    @Query() query: TTSAudioQueryDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<PaginatedTTSAudioResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getTTSAudio(query);
    } catch (error) {
      this.logger.error('Error getting TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('stats')
  async getTTSStats(
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getTTSStats();
    } catch (error) {
      this.logger.error('Error getting TTS stats:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('available')
  async getAvailableTTSAudio(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getAvailableTTSAudio(limit || 100);
    } catch (error) {
      this.logger.error('Error getting available TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('expired')
  async getExpiredTTSAudio(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getExpiredTTSAudio(limit || 100);
    } catch (error) {
      this.logger.error('Error getting expired TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('expiring-soon')
  async getExpiringSoonTTSAudio(
    @Query('hours') hours?: number,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getExpiringSoonTTSAudio(hours || 24, limit || 100);
    } catch (error) {
      this.logger.error('Error getting expiring soon TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('high-quality')
  async getHighQualityTTSAudio(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getHighQualityTTSAudio(limit || 100);
    } catch (error) {
      this.logger.error('Error getting high quality TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('processing')
  async getProcessingTTSAudio(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getProcessingTTSAudio(limit || 50);
    } catch (error) {
      this.logger.error('Error getting processing TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('failed')
  async getFailedTTSAudio(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getFailedTTSAudio(limit || 50);
    } catch (error) {
      this.logger.error('Error getting failed TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('most-played')
  async getMostPlayedTTSAudio(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getMostPlayedTTSAudio(limit || 100);
    } catch (error) {
      this.logger.error('Error getting most played TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('most-downloaded')
  async getMostDownloadedTTSAudio(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getMostDownloadedTTSAudio(limit || 100);
    } catch (error) {
      this.logger.error('Error getting most downloaded TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('search')
  async searchTTSAudio(
    @Query('q') query: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      if (!query) {
        throw new BadRequestException('Search query is required');
      }
      return await this.ttsService.searchTTSAudio(query, limit || 100);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error searching TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('news/:newsId')
  async getTTSAudioByNewsId(
    @Param('newsId') newsId: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getTTSAudioByNewsId(newsId, limit || 100);
    } catch (error) {
      this.logger.error('Error getting TTS audio by news ID:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('voice/:voice')
  async getTTSAudioByVoice(
    @Param('voice') voice: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getTTSAudioByVoice(voice as any, limit || 100);
    } catch (error) {
      this.logger.error('Error getting TTS audio by voice:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('engine/:engine')
  async getTTSAudioByEngine(
    @Param('engine') engine: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getTTSAudioByEngine(engine as any, limit || 100);
    } catch (error) {
      this.logger.error('Error getting TTS audio by engine:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('language/:language')
  async getTTSAudioByLanguage(
    @Param('language') language: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getTTSAudioByLanguage(language, limit || 100);
    } catch (error) {
      this.logger.error('Error getting TTS audio by language:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('duration')
  async getTTSAudioByDuration(
    @Query('minDuration') minDuration: number,
    @Query('maxDuration') maxDuration: number,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      if (!minDuration || !maxDuration) {
        throw new BadRequestException('minDuration and maxDuration are required');
      }
      return await this.ttsService.getTTSAudioByDuration(minDuration, maxDuration, limit || 100);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error getting TTS audio by duration:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('size')
  async getTTSAudioBySize(
    @Query('minSize') minSize: number,
    @Query('maxSize') maxSize: number,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      if (!minSize || !maxSize) {
        throw new BadRequestException('minSize and maxSize are required');
      }
      return await this.ttsService.getTTSAudioBySize(minSize, maxSize, limit || 100);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error getting TTS audio by size:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get(':id')
  async getTTSAudioById(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.getTTSAudioById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, 'TTS audio not found'));
      }
      this.logger.error('Error getting TTS audio by ID:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Put(':id')
  async updateTTSAudio(
    @Param('id') id: string,
    @Body() updateTTSAudioDto: UpdateTTSAudioDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<TTSAudioResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.ttsService.updateTTSAudio(id, updateTTSAudioDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, 'TTS audio not found'));
      }
      this.logger.error('Error updating TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTTSAudio(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<void> {
    const locale = resolveLocale(acceptLanguage);
    try {
      await this.ttsService.deleteTTSAudio(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, 'TTS audio not found'));
      }
      this.logger.error('Error deleting TTS audio:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }
}
