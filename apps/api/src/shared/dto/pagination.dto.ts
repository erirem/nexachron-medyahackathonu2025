/**
 * Pagination DTOs for API requests and responses
 * Standardized pagination across all endpoints
 */

import { IsOptional, IsPositive, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PAGINATION_CONSTANTS } from '../../common/constants';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(PAGINATION_CONSTANTS.MAX_PAGE_SIZE)
  pageSize?: number = PAGINATION_CONSTANTS.DEFAULT_PAGE_SIZE;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(PAGINATION_CONSTANTS.MAX_LIMIT)
  limit?: number;
}

export class PaginationMetaDto {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  items: T[];
  pagination: PaginationMetaDto;
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  pageSize: number,
  total: number,
): PaginationMetaDto {
  const totalPages = Math.ceil(total / pageSize);
  const hasMore = page < totalPages;

  return {
    page,
    pageSize,
    total,
    hasMore,
    totalPages,
  };
}

/**
 * Parse pagination parameters from query
 */
export function parsePaginationQuery(query: any): {
  page: number;
  pageSize: number;
  offset: number;
  limit: number;
} {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(
    PAGINATION_CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, parseInt(query.pageSize) || PAGINATION_CONSTANTS.DEFAULT_PAGE_SIZE),
  );
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  return { page, pageSize, offset, limit };
}
