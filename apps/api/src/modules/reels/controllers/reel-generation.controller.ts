/**
 * Reel Generation Controller
 * Handles reel generation operations
 */

import {
  Controller,
  Post,
  Body,
  Req,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReelService } from '../services/reel.service';
import {
  ReelGenerationRequestDto,
  BulkGenerationRequestDto,
  BulkGenerationResponseDto,
  ReelResponseDto,
} from '../../../shared/dto/reel.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_CODES, ERROR_MESSAGES } from '../../../common/constants/errors';

@ApiTags('Reel Generation')
@Controller('reels/generation')
export class ReelGenerationController {
  private readonly logger = new Logger(ReelGenerationController.name);

  constructor(private readonly reelService: ReelService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a single reel' })
  @ApiResponse({ status: 201, description: 'Reel generated successfully', type: ReelResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateReel(@Body() request: ReelGenerationRequestDto, @Req() req: any): Promise<any> {
    try {
      this.logger.log(`Generating reel for request: ${JSON.stringify(request)}`);
      
      // Add user context if available
      if (req.user?.id) {
        request.metadata = {
          ...request.metadata,
          createdBy: req.user.id,
        };
      }

      const reel = await this.reelService.generateReel(request);
      return createSuccessResponse(reel, 'Reel generated successfully');
    } catch (error) {
      this.logger.error('Error generating reel:', error);
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.GENERATE_REEL_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bulk-generate')
  @ApiOperation({ summary: 'Generate multiple reels in bulk' })
  @ApiResponse({ status: 201, description: 'Bulk generation completed', type: BulkGenerationResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateBulkReels(@Body() request: BulkGenerationRequestDto, @Req() req: any): Promise<any> {
    try {
      this.logger.log(`Starting bulk reel generation: ${JSON.stringify(request)}`);
      
      // Add user context if available
      if (req.user?.id) {
        request.metadata = {
          ...request.metadata,
          createdBy: req.user.id,
        };
      }

      const result = await this.reelService.generateBulkReels(request);
      return createSuccessResponse(result, 'Bulk generation completed');
    } catch (error) {
      this.logger.error('Error generating bulk reels:', error);
      if (error instanceof BadRequestException) {
        return createErrorResponse(error.message, ERROR_CODES.BAD_REQUEST);
      }
      return createErrorResponse(ERROR_MESSAGES.BULK_GENERATE_REELS_FAILED, ERROR_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
