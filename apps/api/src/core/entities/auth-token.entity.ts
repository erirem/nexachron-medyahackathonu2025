/**
 * Auth Token Entity
 * Represents authentication tokens (access, refresh, etc.)
 */

export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  RESET_PASSWORD = 'RESET_PASSWORD',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  API_KEY = 'API_KEY',
}

export enum TokenStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  USED = 'USED',
}

export interface CreateAuthTokenData {
  userId: string;
  tokenType: TokenType;
  tokenValue: string;
  expiresAt: Date;
  status: TokenStatus;
  metadata?: {
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    purpose?: string;
  };
  isActive: boolean;
}

export interface UpdateAuthTokenData {
  tokenValue?: string;
  expiresAt?: Date;
  status?: TokenStatus;
  metadata?: {
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    purpose?: string;
  };
  isActive?: boolean;
}

export class AuthTokenEntity {
  id: string;
  userId: string;
  tokenType: TokenType;
  tokenValue: string;
  expiresAt: Date;
  status: TokenStatus;
  metadata?: {
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    purpose?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    user_id: string;
    token_type: TokenType;
    token_value: string;
    expires_at: string;
    status: TokenStatus;
    metadata?: any;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.userId = data.user_id;
    this.tokenType = data.token_type;
    this.tokenValue = data.token_value;
    this.expiresAt = new Date(data.expires_at);
    this.status = data.status;
    this.metadata = data.metadata;
    this.isActive = data.is_active;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isActiveToken(): boolean {
    return this.isActive && this.status === TokenStatus.ACTIVE && !this.isExpired();
  }

  isRefreshToken(): boolean {
    return this.tokenType === TokenType.REFRESH;
  }

  isAccessToken(): boolean {
    return this.tokenType === TokenType.ACCESS;
  }

  isPasswordResetToken(): boolean {
    return this.tokenType === TokenType.RESET_PASSWORD;
  }

  isEmailVerificationToken(): boolean {
    return this.tokenType === TokenType.EMAIL_VERIFICATION;
  }

  isApiKey(): boolean {
    return this.tokenType === TokenType.API_KEY;
  }

  revoke(): void {
    this.status = TokenStatus.REVOKED;
    this.isActive = false;
  }

  markAsUsed(): void {
    this.status = TokenStatus.USED;
    this.isActive = false;
  }

  getTimeUntilExpiry(): number {
    return this.expiresAt.getTime() - Date.now();
  }

  getTokenAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  getTokenSummary(): string {
    const type = this.tokenType.toLowerCase().replace('_', ' ');
    const status = this.status.toLowerCase();
    const age = Math.floor(this.getTokenAge() / (1000 * 60 * 60)); // hours
    
    return `${type} token (${status}, ${age}h old)`;
  }

  toJSON(): {
    id: string;
    userId: string;
    tokenType: TokenType;
    tokenValue: string;
    expiresAt: string;
    status: TokenStatus;
    metadata?: any;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    isExpired: boolean;
    isActiveToken: boolean;
    timeUntilExpiry: number;
    tokenAge: number;
    tokenSummary: string;
  } {
    return {
      id: this.id,
      userId: this.userId,
      tokenType: this.tokenType,
      tokenValue: this.tokenValue,
      expiresAt: this.expiresAt.toISOString(),
      status: this.status,
      metadata: this.metadata,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isExpired: this.isExpired(),
      isActiveToken: this.isActiveToken(),
      timeUntilExpiry: this.getTimeUntilExpiry(),
      tokenAge: this.getTokenAge(),
      tokenSummary: this.getTokenSummary(),
    };
  }
}
