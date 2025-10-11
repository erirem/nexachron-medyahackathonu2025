/**
 * Reel Controller
 * Main controller for reel operations
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
  Headers,
  UseGuards,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReelService } from '../services/reel.service';
import {
  CreateReelDto,
  UpdateReelDto,
  ReelResponseDto,
  ReelQueryDto,
  PaginatedReelResponseDto,
  ReelStatsDto,
  ReelGenerationRequestDto,
  BulkGenerationRequestDto,
  BulkGenerationResponseDto,
  ReelFeedQueryDto,
  ReelFeedResponseDto,
} from '../../../shared/dto/reel.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/errors';

@ApiTags('Reels')
@Controller('reels')
export class ReelController {
  private readonly logger = new Logger(ReelController.name);

  constructor(private readonly reelService: ReelService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reel' })
  @ApiResponse({ status: 201, description: 'Reel created successfully', type: ReelResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createReelDto: CreateReelDto, @Req() req: any): Promise<any> {
    try {
      this.logger.log(`Creating reel: ${createReelDto.title}`);
      
      // Add user context if available
      if (req.user?.id) {
        createReelDto.createdBy = req.user.id;
      }

      const reel = await this.reelService.create(createReelDto);
      return createSuccessResponse(reel, 'Reel created successfully');
    } catch (error) {
      this.logger.error('Error creating reel:', error);
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.CREATE_REEL_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all reels with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Reels retrieved successfully', type: PaginatedReelResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(@Query() query: ReelQueryDto): Promise<any> {
    try {
      this.logger.log(`Finding reels with query: ${JSON.stringify(query)}`);
      
      const result = await this.reelService.findAll(query);
      return createSuccessResponse(result, 'Reels retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding reels:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_REELS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get reel feed' })
  @ApiResponse({ status: 200, description: 'Reel feed retrieved successfully', type: ReelFeedResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getFeed(@Query() query: ReelFeedQueryDto): Promise<any> {
    try {
      this.logger.log(`Getting reel feed with query: ${JSON.stringify(query)}`);
      
      const result = await this.reelService.getFeed(query);
      return createSuccessResponse(result, 'Reel feed retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting reel feed:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_REEL_FEED_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public reels' })
  @ApiResponse({ status: 200, description: 'Public reels retrieved successfully', type: [ReelResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findPublic(@Query('limit') limit?: number): Promise<any> {
    try {
      this.logger.log(`Finding public reels with limit: ${limit}`);
      
      const reels = await this.reelService.findPublic(limit);
      return createSuccessResponse(reels, 'Public reels retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding public reels:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_REELS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending reels' })
  @ApiResponse({ status: 200, description: 'Trending reels retrieved successfully', type: [ReelResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findTrending(@Query('limit') limit?: number): Promise<any> {
    try {
      this.logger.log(`Finding trending reels with limit: ${limit}`);
      
      const reels = await this.reelService.findTrending(limit);
      return createSuccessResponse(reels, 'Trending reels retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding trending reels:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_REELS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent reels' })
  @ApiResponse({ status: 200, description: 'Recent reels retrieved successfully', type: [ReelResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findRecent(@Query('limit') limit?: number): Promise<any> {
    try {
      this.logger.log(`Finding recent reels with limit: ${limit}`);
      
      const reels = await this.reelService.findRecent(limit);
      return createSuccessResponse(reels, 'Recent reels retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding recent reels:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_REELS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search reels' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully', type: [ReelResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchReels(@Query('q') query: string, @Query('limit') limit?: number): Promise<any> {
    try {
      this.logger.log(`Searching reels with query: ${query}`);
      
      if (!query) {
        return createErrorResponse('Search query is required', ERROR_CODES.BAD_REQUEST);
      }
      
      const reels = await this.reelService.searchReels(query, limit);
      return createSuccessResponse(reels, 'Search results retrieved successfully');
    } catch (error) {
      this.logger.error('Error searching reels:', error);
      return createErrorResponse(ERROR_MESSAGES.SEARCH_REELS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get reel statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: ReelStatsDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getStats(): Promise<any> {
    try {
      this.logger.log('Getting reel statistics');
      
      const stats = await this.reelService.getStats();
      return createSuccessResponse(stats, 'Statistics retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting reel stats:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_REEL_STATS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reel by ID' })
  @ApiResponse({ status: 200, description: 'Reel retrieved successfully', type: ReelResponseDto })
  @ApiResponse({ status: 404, description: 'Reel not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findById(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Finding reel by ID: ${id}`);
      
      const reel = await this.reelService.findById(id);
      return createSuccessResponse(reel, 'Reel retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding reel by ID:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.REEL_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.FETCH_REEL_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('news/:newsId')
  @ApiOperation({ summary: 'Get reels by news ID' })
  @ApiResponse({ status: 200, description: 'Reels retrieved successfully', type: [ReelResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findByNewsId(@Param('newsId') newsId: string): Promise<any> {
    try {
      this.logger.log(`Finding reels by news ID: ${newsId}`);
      
      const reels = await this.reelService.findByNewsId(newsId);
      return createSuccessResponse(reels, 'Reels retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding reels by news ID:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_REELS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get reels by user ID' })
  @ApiResponse({ status: 200, description: 'Reels retrieved successfully', type: [ReelResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getReelsByUser(@Param('userId') userId: string, @Query('limit') limit?: number): Promise<any> {
    try {
      this.logger.log(`Finding reels by user ID: ${userId}`);
      
      const reels = await this.reelService.getReelsByUser(userId, limit);
      return createSuccessResponse(reels, 'Reels retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding reels by user ID:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_REELS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update reel' })
  @ApiResponse({ status: 200, description: 'Reel updated successfully', type: ReelResponseDto })
  @ApiResponse({ status: 404, description: 'Reel not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(@Param('id') id: string, @Body() updateReelDto: UpdateReelDto): Promise<any> {
    try {
      this.logger.log(`Updating reel: ${id}`);
      
      const reel = await this.reelService.update(id, updateReelDto);
      return createSuccessResponse(reel, 'Reel updated successfully');
    } catch (error) {
      this.logger.error('Error updating reel:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.REEL_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.UPDATE_REEL_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete reel' })
  @ApiResponse({ status: 200, description: 'Reel deleted successfully' })
  @ApiResponse({ status: 404, description: 'Reel not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async delete(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Deleting reel: ${id}`);
      
      const result = await this.reelService.delete(id);
      return createSuccessResponse({ deleted: result }, 'Reel deleted successfully');
    } catch (error) {
      this.logger.error('Error deleting reel:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.REEL_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.DELETE_REEL_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
