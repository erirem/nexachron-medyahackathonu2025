/**
 * Reel Template Service
 * Manages reel templates and their configurations
 */

import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ReelTemplateRepository } from '../../../core/repositories/reel-template.repository';
import { ReelTemplateEntity, ReelTemplateType } from '../../../core/entities/reel-template.entity';
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
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/errors';

@Injectable()
export class ReelTemplateService {
  private readonly logger = new Logger(ReelTemplateService.name);

  constructor(
    private readonly reelTemplateRepository: ReelTemplateRepository,
  ) {}

  // CRUD Operations
  async create(createTemplateDto: CreateReelTemplateDto): Promise<ReelTemplateResponseDto> {
    try {
      this.logger.log(`Creating template: ${createTemplateDto.name}`);

      const templateEntity = await this.reelTemplateRepository.create({
        name: createTemplateDto.name,
        type: createTemplateDto.type,
        description: createTemplateDto.description,
        config: createTemplateDto.config,
        isDefault: createTemplateDto.isDefault,
        isActive: createTemplateDto.isActive,
        createdBy: createTemplateDto.createdBy,
      });

      return this.mapTemplateEntityToDto(templateEntity);
    } catch (error) {
      this.logger.error('Error creating template:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.CREATE_TEMPLATE_FAILED);
    }
  }

  async findById(id: string): Promise<ReelTemplateResponseDto> {
    try {
      const templateEntity = await this.reelTemplateRepository.findById(id);
      if (!templateEntity) {
        throw new NotFoundException(ERROR_MESSAGES.TEMPLATE_NOT_FOUND);
      }
      return this.mapTemplateEntityToDto(templateEntity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error finding template by ID:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_TEMPLATE_FAILED);
    }
  }

  async findAll(query: ReelTemplateQueryDto): Promise<PaginatedReelTemplateResponseDto> {
    try {
      const { page = 1, pageSize = 20, ...filters } = query;
      const offset = (page - 1) * pageSize;

      const templates = await this.reelTemplateRepository.findAll({
        ...filters,
        limit: pageSize,
        offset,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      // Get total count for pagination
      const allTemplates = await this.reelTemplateRepository.findAll(filters);
      const total = allTemplates.length;

      const templateDtos = templates.map(template => this.mapTemplateEntityToDto(template));

      return {
        items: templateDtos,
        pagination: {
          page,
          pageSize,
          total,
          hasMore: page * pageSize < total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      this.logger.error('Error finding templates:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_TEMPLATES_FAILED);
    }
  }

  async update(id: string, updateTemplateDto: UpdateReelTemplateDto): Promise<ReelTemplateResponseDto> {
    try {
      const existingTemplate = await this.reelTemplateRepository.findById(id);
      if (!existingTemplate) {
        throw new NotFoundException(ERROR_MESSAGES.TEMPLATE_NOT_FOUND);
      }

      const updatedTemplate = await this.reelTemplateRepository.update(id, {
        name: updateTemplateDto.name,
        description: updateTemplateDto.description,
        config: updateTemplateDto.config,
        isDefault: updateTemplateDto.isDefault,
        isActive: updateTemplateDto.isActive,
      });

      return this.mapTemplateEntityToDto(updatedTemplate);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating template:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.UPDATE_TEMPLATE_FAILED);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingTemplate = await this.reelTemplateRepository.findById(id);
      if (!existingTemplate) {
        throw new NotFoundException(ERROR_MESSAGES.TEMPLATE_NOT_FOUND);
      }

      return await this.reelTemplateRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting template:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.DELETE_TEMPLATE_FAILED);
    }
  }

  // Specialized Operations
  async findByType(type: ReelTemplateType): Promise<ReelTemplateResponseDto[]> {
    try {
      const templates = await this.reelTemplateRepository.findByType(type);
      return templates.map(template => this.mapTemplateEntityToDto(template));
    } catch (error) {
      this.logger.error('Error finding templates by type:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_TEMPLATES_FAILED);
    }
  }

  async findActive(): Promise<ReelTemplateResponseDto[]> {
    try {
      const templates = await this.reelTemplateRepository.findActive();
      return templates.map(template => this.mapTemplateEntityToDto(template));
    } catch (error) {
      this.logger.error('Error finding active templates:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_TEMPLATES_FAILED);
    }
  }

  async findDefault(): Promise<ReelTemplateResponseDto[]> {
    try {
      const templates = await this.reelTemplateRepository.findDefault();
      return templates.map(template => this.mapTemplateEntityToDto(template));
    } catch (error) {
      this.logger.error('Error finding default templates:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_TEMPLATES_FAILED);
    }
  }

  async findByUser(userId: string): Promise<ReelTemplateResponseDto[]> {
    try {
      const templates = await this.reelTemplateRepository.findByUser(userId);
      return templates.map(template => this.mapTemplateEntityToDto(template));
    } catch (error) {
      this.logger.error('Error finding templates by user:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_TEMPLATES_FAILED);
    }
  }

  async getBestTemplates(limit: number = 10): Promise<ReelTemplateResponseDto[]> {
    try {
      const templates = await this.reelTemplateRepository.getBestTemplates(limit);
      return templates.map(template => this.mapTemplateEntityToDto(template));
    } catch (error) {
      this.logger.error('Error getting best templates:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_TEMPLATES_FAILED);
    }
  }

  async getMostUsedTemplates(limit: number = 10): Promise<ReelTemplateResponseDto[]> {
    try {
      const templates = await this.reelTemplateRepository.getMostUsedTemplates(limit);
      return templates.map(template => this.mapTemplateEntityToDto(template));
    } catch (error) {
      this.logger.error('Error getting most used templates:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_TEMPLATES_FAILED);
    }
  }

  // Analytics and Stats
  async getStats(): Promise<ReelTemplateStatsDto> {
    try {
      return await this.reelTemplateRepository.getTemplateStats();
    } catch (error) {
      this.logger.error('Error getting template stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_TEMPLATE_STATS_FAILED);
    }
  }

  async getTemplateInfo(id: string): Promise<ReelTemplateInfoDto> {
    try {
      const template = await this.reelTemplateRepository.findById(id);
      if (!template) {
        throw new NotFoundException(ERROR_MESSAGES.TEMPLATE_NOT_FOUND);
      }
      return template.getTemplateInfo();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting template info:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_TEMPLATE_INFO_FAILED);
    }
  }

  async getAnalytics(id: string): Promise<ReelTemplateAnalyticsDto> {
    try {
      const template = await this.reelTemplateRepository.findById(id);
      if (!template) {
        throw new NotFoundException(ERROR_MESSAGES.TEMPLATE_NOT_FOUND);
      }
      return template.getAnalyticsData();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting template analytics:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.FETCH_TEMPLATE_ANALYTICS_FAILED);
    }
  }

  // Utility Methods
  private mapTemplateEntityToDto(template: ReelTemplateEntity): ReelTemplateResponseDto {
    return {
      id: template.id,
      name: template.name,
      type: template.type,
      description: template.description,
      config: template.config,
      isDefault: template.isDefault,
      isActive: template.isActive,
      createdBy: template.createdBy,
      usageCount: template.usageCount,
      successRate: template.successRate,
      averageQuality: template.averageQuality,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }
}
