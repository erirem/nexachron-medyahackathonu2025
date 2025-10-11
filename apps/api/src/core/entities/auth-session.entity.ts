/**
 * Auth Session Entity
 * Represents user authentication sessions
 */

export interface CreateAuthSessionData {
  userId: string;
  sessionToken: string;
  refreshToken: string;
  expiresAt: Date;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  };
  isActive: boolean;
  lastActivityAt?: Date;
}

export interface UpdateAuthSessionData {
  sessionToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  };
  isActive?: boolean;
  lastActivityAt?: Date;
}

export class AuthSessionEntity {
  id: string;
  userId: string;
  sessionToken: string;
  refreshToken: string;
  expiresAt: Date;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  };
  isActive: boolean;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    user_id: string;
    session_token: string;
    refresh_token: string;
    expires_at: string;
    device_info?: any;
    is_active: boolean;
    last_activity_at?: string;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.userId = data.user_id;
    this.sessionToken = data.session_token;
    this.refreshToken = data.refresh_token;
    this.expiresAt = new Date(data.expires_at);
    this.deviceInfo = data.device_info;
    this.isActive = data.is_active;
    this.lastActivityAt = data.last_activity_at ? new Date(data.last_activity_at) : undefined;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isActiveSession(): boolean {
    return this.isActive && !this.isExpired();
  }

  updateLastActivity(): void {
    this.lastActivityAt = new Date();
  }

  getSessionDuration(): number {
    return Date.now() - this.createdAt.getTime();
  }

  getTimeUntilExpiry(): number {
    return this.expiresAt.getTime() - Date.now();
  }

  getDeviceSummary(): string {
    if (!this.deviceInfo) return 'Unknown device';
    
    const parts: string[] = [];
    if (this.deviceInfo.browser) parts.push(this.deviceInfo.browser);
    if (this.deviceInfo.os) parts.push(this.deviceInfo.os);
    if (this.deviceInfo.deviceType) parts.push(this.deviceInfo.deviceType);
    
    return parts.join(' on ') || 'Unknown device';
  }

  toJSON(): {
    id: string;
    userId: string;
    sessionToken: string;
    refreshToken: string;
    expiresAt: string;
    deviceInfo?: any;
    isActive: boolean;
    lastActivityAt?: string;
    createdAt: string;
    updatedAt: string;
    isExpired: boolean;
    isActiveSession: boolean;
    sessionDuration: number;
    timeUntilExpiry: number;
    deviceSummary: string;
  } {
    return {
      id: this.id,
      userId: this.userId,
      sessionToken: this.sessionToken,
      refreshToken: this.refreshToken,
      expiresAt: this.expiresAt.toISOString(),
      deviceInfo: this.deviceInfo,
      isActive: this.isActive,
      lastActivityAt: this.lastActivityAt?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isExpired: this.isExpired(),
      isActiveSession: this.isActiveSession(),
      sessionDuration: this.getSessionDuration(),
      timeUntilExpiry: this.getTimeUntilExpiry(),
      deviceSummary: this.getDeviceSummary(),
    };
  }
}
