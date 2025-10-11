/**
 * Reel Template Controller
 * Handles reel template operations
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
import { ReelTemplateService } from '../services/reel-template.service';
import {
  CreateReelTemplateDto,
  UpdateReelTemplateDto,
  ReelTemplateResponseDto,
  ReelTemplateQueryDto,
  PaginatedReelTemplateResponseDto,
  ReelTemplateStatsDto,
  ReelTemplateInfoDto,
  ReelTemplateAnalyticsDto,
} from '../../../shared/dto/reel-template.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/errors';

@ApiTags('Reel Templates')
@Controller('reels/templates')
export class ReelTemplateController {
  private readonly logger = new Logger(ReelTemplateController.name);

  constructor(private readonly reelTemplateService: ReelTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reel template' })
  @ApiResponse({ status: 201, description: 'Template created successfully', type: ReelTemplateResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createTemplateDto: CreateReelTemplateDto, @Req() req: any): Promise<any> {
    try {
      this.logger.log(`Creating template: ${createTemplateDto.name}`);
      
      // Add user context if available
      if (req.user?.id) {
        createTemplateDto.createdBy = req.user.id;
      }

      const template = await this.reelTemplateService.create(createTemplateDto);
      return createSuccessResponse(template, 'Template created successfully');
    } catch (error) {
      this.logger.error('Error creating template:', error);
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.CREATE_TEMPLATE_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all reel templates with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully', type: PaginatedReelTemplateResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(@Query() query: ReelTemplateQueryDto): Promise<any> {
    try {
      this.logger.log(`Finding templates with query: ${JSON.stringify(query)}`);
      
      const result = await this.reelTemplateService.findAll(query);
      return createSuccessResponse(result, 'Templates retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding templates:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_TEMPLATES_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active templates' })
  @ApiResponse({ status: 200, description: 'Active templates retrieved successfully', type: [ReelTemplateResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findActive(): Promise<any> {
    try {
      this.logger.log('Finding active templates');
      
      const templates = await this.reelTemplateService.findActive();
      return createSuccessResponse(templates, 'Active templates retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding active templates:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_TEMPLATES_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default templates' })
  @ApiResponse({ status: 200, description: 'Default templates retrieved successfully', type: [ReelTemplateResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findDefault(): Promise<any> {
    try {
      this.logger.log('Finding default templates');
      
      const templates = await this.reelTemplateService.findDefault();
      return createSuccessResponse(templates, 'Default templates retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding default templates:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_TEMPLATES_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('best')
  @ApiOperation({ summary: 'Get best performing templates' })
  @ApiResponse({ status: 200, description: 'Best templates retrieved successfully', type: [ReelTemplateResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getBestTemplates(@Query('limit') limit?: number): Promise<any> {
    try {
      this.logger.log(`Finding best templates with limit: ${limit}`);
      
      const templates = await this.reelTemplateService.getBestTemplates(limit);
      return createSuccessResponse(templates, 'Best templates retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding best templates:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_TEMPLATES_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('most-used')
  @ApiOperation({ summary: 'Get most used templates' })
  @ApiResponse({ status: 200, description: 'Most used templates retrieved successfully', type: [ReelTemplateResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMostUsedTemplates(@Query('limit') limit?: number): Promise<any> {
    try {
      this.logger.log(`Finding most used templates with limit: ${limit}`);
      
      const templates = await this.reelTemplateService.getMostUsedTemplates(limit);
      return createSuccessResponse(templates, 'Most used templates retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding most used templates:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_TEMPLATES_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get template statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: ReelTemplateStatsDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getStats(): Promise<any> {
    try {
      this.logger.log('Getting template statistics');
      
      const stats = await this.reelTemplateService.getStats();
      return createSuccessResponse(stats, 'Statistics retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting template stats:', error);
      return createErrorResponse(ERROR_MESSAGES.FETCH_TEMPLATE_STATS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully', type: ReelTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findById(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Finding template by ID: ${id}`);
      
      const template = await this.reelTemplateService.findById(id);
      return createSuccessResponse(template, 'Template retrieved successfully');
    } catch (error) {
      this.logger.error('Error finding template by ID:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.TEMPLATE_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.FETCH_TEMPLATE_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/info')
  @ApiOperation({ summary: 'Get template info' })
  @ApiResponse({ status: 200, description: 'Template info retrieved successfully', type: ReelTemplateInfoDto })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTemplateInfo(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Getting template info for ID: ${id}`);
      
      const info = await this.reelTemplateService.getTemplateInfo(id);
      return createSuccessResponse(info, 'Template info retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting template info:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.TEMPLATE_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.FETCH_TEMPLATE_INFO_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get template analytics' })
  @ApiResponse({ status: 200, description: 'Template analytics retrieved successfully', type: ReelTemplateAnalyticsDto })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAnalytics(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Getting template analytics for ID: ${id}`);
      
      const analytics = await this.reelTemplateService.getAnalytics(id);
      return createSuccessResponse(analytics, 'Template analytics retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting template analytics:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.TEMPLATE_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.FETCH_TEMPLATE_ANALYTICS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully', type: ReelTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(@Param('id') id: string, @Body() updateTemplateDto: UpdateReelTemplateDto): Promise<any> {
    try {
      this.logger.log(`Updating template: ${id}`);
      
      const template = await this.reelTemplateService.update(id, updateTemplateDto);
      return createSuccessResponse(template, 'Template updated successfully');
    } catch (error) {
      this.logger.error('Error updating template:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.TEMPLATE_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.UPDATE_TEMPLATE_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async delete(@Param('id') id: string): Promise<any> {
    try {
      this.logger.log(`Deleting template: ${id}`);
      
      const result = await this.reelTemplateService.delete(id);
      return createSuccessResponse({ deleted: result }, 'Template deleted successfully');
    } catch (error) {
      this.logger.error('Error deleting template:', error);
      if (error instanceof NotFoundException) {
        return createErrorResponse(ERROR_MESSAGES.TEMPLATE_NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      return createErrorResponse(ERROR_MESSAGES.DELETE_TEMPLATE_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
