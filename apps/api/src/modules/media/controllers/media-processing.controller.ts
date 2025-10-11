/**
 * Media Processing Controller
 * Background media processing job operations
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
import { MediaProcessingService } from '../services/media-processing.service';
import {
  CreateMediaProcessingJobDto,
  UpdateMediaProcessingJobDto,
  MediaProcessingJobResponseDto,
  PaginatedMediaProcessingJobResponseDto,
  MediaProcessingJobQueryDto,
} from '../../../shared/dto/media.dto';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';
import { ERROR_MESSAGES } from '../../../common/constants';

@Controller('media-processing')
export class MediaProcessingController {
  private readonly logger = new Logger(MediaProcessingController.name);

  constructor(private readonly mediaProcessingService: MediaProcessingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJob(
    @Body() createJobDto: CreateMediaProcessingJobDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaProcessingJobResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.createJob(createJobDto);
    } catch (error) {
      this.logger.error('Error creating media processing job:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get()
  async getJobs(
    @Query() query: MediaProcessingJobQueryDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<PaginatedMediaProcessingJobResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.getJobs(query);
    } catch (error) {
      this.logger.error('Error getting media processing jobs:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('stats')
  async getJobStats(
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.getJobStats();
    } catch (error) {
      this.logger.error('Error getting job stats:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('queue-status')
  async getQueueStatus(
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.getQueueStatus();
    } catch (error) {
      this.logger.error('Error getting queue status:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('performance')
  async getPerformanceMetrics(
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.getPerformanceMetrics();
    } catch (error) {
      this.logger.error('Error getting performance metrics:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('active')
  async getActiveJobs(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaProcessingJobResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.getActiveJobs(limit || 100);
    } catch (error) {
      this.logger.error('Error getting active jobs:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('completed')
  async getCompletedJobs(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaProcessingJobResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.getCompletedJobs(limit || 100);
    } catch (error) {
      this.logger.error('Error getting completed jobs:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('failed')
  async getFailedJobs(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaProcessingJobResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.getFailedJobs(limit || 100);
    } catch (error) {
      this.logger.error('Error getting failed jobs:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('retryable')
  async getRetryableJobs(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaProcessingJobResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.getRetryableJobs(limit || 100);
    } catch (error) {
      this.logger.error('Error getting retryable jobs:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('stuck')
  async getStuckJobs(
    @Query('minutes') minutes?: number,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaProcessingJobResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.getStuckJobs(minutes || 30, limit || 100);
    } catch (error) {
      this.logger.error('Error getting stuck jobs:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('search')
  async searchJobs(
    @Query('q') query: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaProcessingJobResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      if (!query) {
        throw new BadRequestException('Search query is required');
      }
      return await this.mediaProcessingService.searchJobs(query, limit || 100);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error searching jobs:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('worker/:workerId')
  async getJobsByWorker(
    @Param('workerId') workerId: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaProcessingJobResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.getJobsByWorker(workerId, limit || 100);
    } catch (error) {
      this.logger.error('Error getting jobs by worker:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('tag/:tag')
  async getJobsByTag(
    @Param('tag') tag: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaProcessingJobResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.getJobsByTag(tag, limit || 100);
    } catch (error) {
      this.logger.error('Error getting jobs by tag:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get(':id')
  async getJobById(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaProcessingJobResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.getJobById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, 'Media processing job not found'));
      }
      this.logger.error('Error getting job by ID:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Put(':id')
  async updateJob(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateMediaProcessingJobDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<MediaProcessingJobResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.mediaProcessingService.updateJob(id, updateJobDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, 'Media processing job not found'));
      }
      this.logger.error('Error updating job:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteJob(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<void> {
    const locale = resolveLocale(acceptLanguage);
    try {
      await this.mediaProcessingService.deleteJob(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(translate(locale, 'Media processing job not found'));
      }
      this.logger.error('Error deleting job:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }
}
