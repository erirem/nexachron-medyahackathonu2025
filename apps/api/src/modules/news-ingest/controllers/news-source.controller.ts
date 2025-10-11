/**
 * News Source Controller
 * Controller for news source management
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
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NewsSourceService } from '../services/news-source.service';
import {
  CreateNewsSourceDto,
  UpdateNewsSourceDto,
  NewsSourceQueryDto,
  NewsSourceResponseDto,
  NewsSourceStatsDto,
} from '../../../shared/dto/news-ingest.dto';
import { PaginatedResponseDto } from '../../../shared/dto/pagination.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/errors';

@ApiTags('News Sources')
@Controller('news-sources')
export class NewsSourceController {
  private readonly logger = new Logger(NewsSourceController.name);

  constructor(
    private readonly newsSourceService: NewsSourceService,
  ) {}

  /**
   * Create a new news source
   */
  @Post()
  @ApiOperation({ summary: 'Create a new news source' })
  @ApiResponse({ status: 201, description: 'Source created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createSource(@Body() createSourceDto: CreateNewsSourceDto): Promise<{
    success: boolean;
    data: NewsSourceResponseDto;
    message: string;
  }> {
    try {
      const source = await this.newsSourceService.createSource(createSourceDto);
      return createSuccessResponse(source, 'News source created successfully');
    } catch (error) {
      this.logger.error('Failed to create news source:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.CREATE_SOURCE_FAILED, ERROR_MESSAGES.CREATE_SOURCE_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get news sources with pagination
   */
  @Get()
  @ApiOperation({ summary: 'Get news sources with pagination' })
  @ApiResponse({ status: 200, description: 'Sources retrieved successfully' })
  async getSources(@Query() query: NewsSourceQueryDto): Promise<PaginatedResponseDto<NewsSourceResponseDto>> {
    try {
      return await this.newsSourceService.getSources(query);
    } catch (error) {
      this.logger.error('Failed to get news sources:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_SOURCES_FAILED, ERROR_MESSAGES.FETCH_SOURCES_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific news source
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific news source' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 200, description: 'Source retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  async getSourceById(@Param('id') id: string): Promise<{
    success: boolean;
    data: NewsSourceResponseDto | null;
    message: string;
  }> {
    try {
      const source = await this.newsSourceService.getSourceById(id);
      if (!source) {
        throw new HttpException(
          createErrorResponse(ERROR_CODES.SOURCE_NOT_FOUND, ERROR_MESSAGES.SOURCE_NOT_FOUND),
          HttpStatus.NOT_FOUND,
        );
      }
      return createSuccessResponse(source, 'Source retrieved successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed to get source ${id}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_SOURCE_FAILED, ERROR_MESSAGES.FETCH_SOURCE_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a news source
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a news source' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 200, description: 'Source updated successfully' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  async updateSource(
    @Param('id') id: string,
    @Body() updateSourceDto: UpdateNewsSourceDto,
  ): Promise<{
    success: boolean;
    data: NewsSourceResponseDto;
    message: string;
  }> {
    try {
      const source = await this.newsSourceService.updateSource(id, updateSourceDto);
      return createSuccessResponse(source, 'Source updated successfully');
    } catch (error) {
      this.logger.error(`Failed to update source ${id}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.UPDATE_SOURCE_FAILED, ERROR_MESSAGES.UPDATE_SOURCE_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a news source
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a news source' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 200, description: 'Source deleted successfully' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  async deleteSource(@Param('id') id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await this.newsSourceService.deleteSource(id);
      return createSuccessResponse(null, 'Source deleted successfully');
    } catch (error) {
      this.logger.error(`Failed to delete source ${id}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.DELETE_SOURCE_FAILED, ERROR_MESSAGES.DELETE_SOURCE_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get active sources
   */
  @Get('active/list')
  @ApiOperation({ summary: 'Get active news sources' })
  @ApiResponse({ status: 200, description: 'Active sources retrieved successfully' })
  async getActiveSources(): Promise<{
    success: boolean;
    data: NewsSourceResponseDto[];
    message: string;
  }> {
    try {
      const sources = await this.newsSourceService.getActiveSources();
      return createSuccessResponse(sources, 'Active sources retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get active sources:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_ACTIVE_SOURCES_FAILED, ERROR_MESSAGES.FETCH_ACTIVE_SOURCES_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get sources that need fetching
   */
  @Get('needing-fetch/list')
  @ApiOperation({ summary: 'Get sources that need fetching' })
  @ApiResponse({ status: 200, description: 'Sources needing fetch retrieved successfully' })
  async getSourcesNeedingFetch(): Promise<{
    success: boolean;
    data: NewsSourceResponseDto[];
    message: string;
  }> {
    try {
      const sources = await this.newsSourceService.getSourcesNeedingFetch();
      return createSuccessResponse(sources, 'Sources needing fetch retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get sources needing fetch:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_SOURCES_NEEDING_FETCH_FAILED, ERROR_MESSAGES.FETCH_SOURCES_NEEDING_FETCH_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get sources by category
   */
  @Get('category/:category')
  @ApiOperation({ summary: 'Get sources by category' })
  @ApiParam({ name: 'category', description: 'Category name' })
  @ApiResponse({ status: 200, description: 'Sources by category retrieved successfully' })
  async getSourcesByCategory(@Param('category') category: string): Promise<{
    success: boolean;
    data: NewsSourceResponseDto[];
    message: string;
  }> {
    try {
      const sources = await this.newsSourceService.getSourcesByCategory(category);
      return createSuccessResponse(sources, `Sources for category '${category}' retrieved successfully`);
    } catch (error) {
      this.logger.error(`Failed to get sources by category ${category}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_SOURCES_BY_CATEGORY_FAILED, ERROR_MESSAGES.FETCH_SOURCES_BY_CATEGORY_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update source status
   */
  @Put(':id/status')
  @ApiOperation({ summary: 'Update source status' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 200, description: 'Source status updated successfully' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  async updateSourceStatus(
    @Param('id') id: string,
    @Body() body: { status: string; errorMessage?: string },
  ): Promise<{
    success: boolean;
    data: NewsSourceResponseDto;
    message: string;
  }> {
    try {
      const source = await this.newsSourceService.updateSourceStatus(id, body.status as any, body.errorMessage);
      return createSuccessResponse(source, 'Source status updated successfully');
    } catch (error) {
      this.logger.error(`Failed to update source status ${id}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.UPDATE_SOURCE_STATUS_FAILED, ERROR_MESSAGES.UPDATE_SOURCE_STATUS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Enable a source
   */
  @Post(':id/enable')
  @ApiOperation({ summary: 'Enable a news source' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 200, description: 'Source enabled successfully' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  async enableSource(@Param('id') id: string): Promise<{
    success: boolean;
    data: NewsSourceResponseDto;
    message: string;
  }> {
    try {
      const source = await this.newsSourceService.enableSource(id);
      return createSuccessResponse(source, 'Source enabled successfully');
    } catch (error) {
      this.logger.error(`Failed to enable source ${id}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.ENABLE_SOURCE_FAILED, ERROR_MESSAGES.ENABLE_SOURCE_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Disable a source
   */
  @Post(':id/disable')
  @ApiOperation({ summary: 'Disable a news source' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 200, description: 'Source disabled successfully' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  async disableSource(@Param('id') id: string): Promise<{
    success: boolean;
    data: NewsSourceResponseDto;
    message: string;
  }> {
    try {
      const source = await this.newsSourceService.disableSource(id);
      return createSuccessResponse(source, 'Source disabled successfully');
    } catch (error) {
      this.logger.error(`Failed to disable source ${id}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.DISABLE_SOURCE_FAILED, ERROR_MESSAGES.DISABLE_SOURCE_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Test a source URL
   */
  @Post('test')
  @ApiOperation({ summary: 'Test a source URL' })
  @ApiResponse({ status: 200, description: 'Source test completed' })
  async testSource(@Body() body: { url: string }): Promise<{
    success: boolean;
    data: {
      success: boolean;
      status: number;
      contentType?: string;
      error?: string;
    };
    message: string;
  }> {
    try {
      const result = await this.newsSourceService.testSource(body.url);
      return createSuccessResponse(result, 'Source test completed');
    } catch (error) {
      this.logger.error(`Failed to test source URL ${body.url}:`, error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.TEST_SOURCE_FAILED, ERROR_MESSAGES.TEST_SOURCE_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Bulk update source status
   */
  @Put('bulk/status')
  @ApiOperation({ summary: 'Bulk update source status' })
  @ApiResponse({ status: 200, description: 'Bulk update completed' })
  async bulkUpdateStatus(
    @Body() body: { sourceIds: string[]; status: string },
  ): Promise<{
    success: boolean;
    data: { updated: number; errors: number };
    message: string;
  }> {
    try {
      const result = await this.newsSourceService.bulkUpdateStatus(body.sourceIds, body.status as any);
      return createSuccessResponse(result, 'Bulk update completed');
    } catch (error) {
      this.logger.error('Failed to bulk update source status:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.BULK_UPDATE_SOURCE_STATUS_FAILED, ERROR_MESSAGES.BULK_UPDATE_SOURCE_STATUS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get source statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get news source statistics' })
  @ApiResponse({ status: 200, description: 'Source statistics retrieved successfully' })
  async getSourceStats(): Promise<{
    success: boolean;
    data: NewsSourceStatsDto;
    message: string;
  }> {
    try {
      const stats = await this.newsSourceService.getSourceStats();
      return createSuccessResponse(stats, 'Source statistics retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to get source statistics:', error);
      throw new HttpException(
        createErrorResponse(ERROR_CODES.FETCH_SOURCE_STATS_FAILED, ERROR_MESSAGES.FETCH_SOURCE_STATS_FAILED),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
