/**
 * Standardized response DTOs for API
 * Consistent response format across all endpoints
 */

export class ApiResponseDto<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
    timestamp: string;
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

export class PaginationDto {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export class ErrorResponseDto {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    timestamp: string;
  };
}

export class SuccessResponseDto<T = any> {
  success: true;
  data: T;
  message: string;
  pagination?: PaginationDto;
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(data: T, message?: string, pagination?: PaginationDto): SuccessResponseDto<T> {
  return {
    success: true,
    data,
    message: message || '',
    ...(pagination && { pagination }),
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(code: string, message: string, details?: string): ErrorResponseDto {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
  };
}
