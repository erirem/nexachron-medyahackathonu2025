/**
 * Reel Asset Controller
 * Handles reel asset operations
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
  Req,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReelAssetService } from '../services/reel-asset.service';
import {
  CreateReelAssetDto,
  UpdateReelAssetDto,
  ReelAssetResponseDto,
  ReelAssetQueryDto,
  PaginatedReelAssetResponseDto,
  ReelAssetStatsDto,
  ReelAssetInfoDto,
  ReelAssetAnalyticsDto,
  ReelAssetsByReelDto,
} from '../../../shared/dto/reel-asset.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/errors';

@ApiTags('Reel Assets')
@Controller('reels/assets')
export class ReelAssetController {
  private readonly logger = new Logger(ReelAssetController.name);

  constructor(private readonly reelAssetService: ReelAssetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reel asset' })
  @ApiResponse({ status: 201, description: 'Asset created successfully', type: ReelAssetResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createAssetDto: CreateReelAssetDto, @Req() req: any): Promise<any> {
    try {
      this.logger.log(`Creating asset for reel: ${createAssetDto.reelId}`);
      
      const asset = await this.reelAssetService.create(createAssetDto);
      return createSuccessResponse(asset, 'Asset created successfully');
    } catch (error) {
      this.logger.error('Error creating asset:', error);
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.CREATE_ASSET_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all reel assets with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully', type: PaginatedReelAssetResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(@Query() query: ReelAssetQueryDto): Promise<any> {
    try {
      this.logger.log(`Finding assets with query: ${JSON.stringify(query)}`);
      
      const result = await this.reelAssetService.findAll(query);
      return createSuccessResponse(result, 'Assets retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding assets:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_ASSETS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('reel/:reelId')
  @ApiOperation({ summary: 'Get assets by reel ID' })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully', type: [ReelAssetResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findByReelId(@Param('reelId') reelId: string): Promise<any> {
    try {
      this.logger.log(`Finding assets by reel ID: ${reelId}`);
      
      const assets = await this.reelAssetService.findByReelId(reelId);
      return createSuccessResponse(assets, 'Assets retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding assets by reel ID:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_ASSETS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('reel/:reelId/by-type')
  @ApiOperation({ summary: 'Get assets by reel ID grouped by type' })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully', type: ReelAssetsByReelDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAssetsByReel(@Param('reelId') reelId: string): Promise<any> {
    try {
      this.logger.log(`Getting assets by reel ID: ${reelId}`);
      
      const assets = await this.reelAssetService.getAssetsByReel(reelId);
      return createSuccessResponse(assets, 'Assets retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting assets by reel:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_ASSETS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('reel/:reelId/primary')
  @ApiOperation({ summary: 'Get primary asset by reel ID' })
  @ApiResponse({ status: 200, description: 'Primary asset retrieved successfully', type: ReelAssetResponseDto })
  @ApiResponse({ status: 404, description: 'Primary asset not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findPrimaryByReelId(@Param('reelId') reelId: string): Promise<any> {
    try {
      this.logger.log(`Finding primary asset by reel ID: ${reelId}`);
      
      const asset = await this.reelAssetService.findPrimaryByReelId(reelId);
      if (!asset) {
        return createErrorResponse(ERROR_MESSAGES.ASSET_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createSuccessResponse(asset, 'Primary asset retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding primary asset:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_ASSET_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('reel/:reelId/videos')
  @ApiOperation({ summary: 'Get video assets by reel ID' })
  @ApiResponse({ status: 200, description: 'Video assets retrieved successfully', type: [ReelAssetResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findVideosByReelId(@Param('reelId') reelId: string): Promise<any> {
    try {
      this.logger.log(`Finding video assets by reel ID: ${reelId}`);
      
      const assets = await this.reelAssetService.findVideosByReelId(reelId);
      return createSuccessResponse(assets, 'Video assets retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding video assets:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_ASSETS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('reel/:reelId/images')
  @ApiOperation({ summary: 'Get image assets by reel ID' })
  @ApiResponse({ status: 200, description: 'Image assets retrieved successfully', type: [ReelAssetResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findImagesByReelId(@Param('reelId') reelId: string): Promise<any> {
    try {
      this.logger.log(`Finding image assets by reel ID: ${reelId}`);
      
      const assets = await this.reelAssetService.findImagesByReelId(reelId);
      return createSuccessResponse(assets, 'Image assets retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding image assets:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_ASSETS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('reel/:reelId/audio')
  @ApiOperation({ summary: 'Get audio assets by reel ID' })
  @ApiResponse({ status: 200, description: 'Audio assets retrieved successfully', type: [ReelAssetResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAudioByReelId(@Param('reelId') reelId: string): Promise<any> {
    try {
      this.logger.log(`Finding audio assets by reel ID: ${reelId}`);
      
      const assets = await this.reelAssetService.findAudioByReelId(reelId);
      return createSuccessResponse(assets, 'Audio assets retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding audio assets:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_ASSETS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('reel/:reelId/thumbnails')
  @ApiOperation({ summary: 'Get thumbnail assets by reel ID' })
  @ApiResponse({ status: 200, description: 'Thumbnail assets retrieved successfully', type: [ReelAssetResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findThumbnailsByReelId(@Param('reelId') reelId: string): Promise<any> {
    try {
      this.logger.log(`Finding thumbnail assets by reel ID: ${reelId}`);
      
      const assets = await this.reelAssetService.findThumbnailsByReelId(reelId);
      return createSuccessResponse(assets, 'Thumbnail assets retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding thumbnail assets:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_ASSETS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get asset statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: ReelAssetStatsDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getStats(): Promise<any> {
    try {
      this.logger.log('Getting asset statistics');
      
      const stats = await this.reelAssetService.getStats();
      return createSuccessResponse(stats, 'Statistics retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting asset stats:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_ASSET_STATS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiResponse({ status: 200, description: 'Asset retrieved successfully', type: ReelAssetResponseDto })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findById(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Finding asset by ID: ${id}`);
      
      const asset = await this.reelAssetService.findById(id);
      return createSuccessResponse(asset, 'Asset retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding asset by ID:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.ASSET_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.FETCH_ASSET_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/info')
  @ApiOperation({ summary: 'Get asset info' })
  @ApiResponse({ status: 200, description: 'Asset info retrieved successfully', type: ReelAssetInfoDto })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAssetInfo(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Getting asset info for ID: ${id}`);
      
      const info = await this.reelAssetService.getAssetInfo(id);
      return createSuccessResponse(info, 'Asset info retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting asset info:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.ASSET_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.FETCH_ASSET_INFO_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get asset analytics' })
  @ApiResponse({ status: 200, description: 'Asset analytics retrieved successfully', type: ReelAssetAnalyticsDto })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAnalytics(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Getting asset analytics for ID: ${id}`);
      
      const analytics = await this.reelAssetService.getAnalytics(id);
      return createSuccessResponse(analytics, 'Asset analytics retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting asset analytics:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.ASSET_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.FETCH_ASSET_ANALYTICS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update asset' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully', type: ReelAssetResponseDto })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(@Param('id') id: string, @Body() updateAssetDto: UpdateReelAssetDto): Promise<any> {
    try {
      this.logger.log(`Updating asset: ${id}`);
      
      const asset = await this.reelAssetService.update(id, updateAssetDto);
      return createSuccessResponse(asset, 'Asset updated successfully');
    } catch (error) {
      this.logger.error('Error updating asset:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.ASSET_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.UPDATE_ASSET_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete asset' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async delete(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Deleting asset: ${id}`);
      
      const result = await this.reelAssetService.delete(id);
      return createSuccessResponse({ deleted: result }, 'Asset deleted successfully');
    } catch (error) {
      this.logger.error('Error deleting asset:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.ASSET_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.DELETE_ASSET_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
