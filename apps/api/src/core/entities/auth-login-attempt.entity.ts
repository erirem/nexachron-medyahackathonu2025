/**
 * Auth Login Attempt Entity
 * Represents login attempts for security monitoring
 */

export enum LoginAttemptStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  BLOCKED = 'BLOCKED',
  LOCKED = 'LOCKED',
}

export enum LoginAttemptType {
  PASSWORD = 'PASSWORD',
  SOCIAL = 'SOCIAL',
  API_KEY = 'API_KEY',
  MAGIC_LINK = 'MAGIC_LINK',
}

export interface CreateAuthLoginAttemptData {
  userId?: string;
  email?: string;
  status: LoginAttemptStatus;
  attemptType: LoginAttemptType;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    deviceType?: string;
    browser?: string;
    os?: string;
    isMobile?: boolean;
  };
  failureReason?: string;
  metadata?: any;
}

export interface UpdateAuthLoginAttemptData {
  status?: LoginAttemptStatus;
  failureReason?: string;
  metadata?: any;
}

export class AuthLoginAttemptEntity {
  id: string;
  userId?: string;
  email?: string;
  status: LoginAttemptStatus;
  attemptType: LoginAttemptType;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    deviceType?: string;
    browser?: string;
    os?: string;
    isMobile?: boolean;
  };
  failureReason?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    user_id?: string;
    email?: string;
    status: LoginAttemptStatus;
    attempt_type: LoginAttemptType;
    ip_address?: string;
    user_agent?: string;
    device_info?: any;
    failure_reason?: string;
    metadata?: any;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.userId = data.user_id;
    this.email = data.email;
    this.status = data.status;
    this.attemptType = data.attempt_type;
    this.ipAddress = data.ip_address;
    this.userAgent = data.user_agent;
    this.deviceInfo = data.device_info;
    this.failureReason = data.failure_reason;
    this.metadata = data.metadata;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  isSuccessful(): boolean {
    return this.status === LoginAttemptStatus.SUCCESS;
  }

  isFailed(): boolean {
    return this.status === LoginAttemptStatus.FAILED;
  }

  isBlocked(): boolean {
    return this.status === LoginAttemptStatus.BLOCKED;
  }

  isLocked(): boolean {
    return this.status === LoginAttemptStatus.LOCKED;
  }

  isPasswordAttempt(): boolean {
    return this.attemptType === LoginAttemptType.PASSWORD;
  }

  isSocialAttempt(): boolean {
    return this.attemptType === LoginAttemptType.SOCIAL;
  }

  isApiKeyAttempt(): boolean {
    return this.attemptType === LoginAttemptType.API_KEY;
  }

  isMagicLinkAttempt(): boolean {
    return this.attemptType === LoginAttemptType.MAGIC_LINK;
  }

  getDeviceSummary(): string {
    if (!this.deviceInfo) return 'Unknown device';
    
    const parts: string[] = [];
    if (this.deviceInfo.browser) parts.push(this.deviceInfo.browser);
    if (this.deviceInfo.os) parts.push(this.deviceInfo.os);
    if (this.deviceInfo.deviceType) parts.push(this.deviceInfo.deviceType);
    
    return parts.join(' on ') || 'Unknown device';
  }

  getAttemptAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  getAttemptAgeFormatted(): string {
    const age = this.getAttemptAge();
    const minutes = Math.floor(age / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  getSecurityLevel(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.isBlocked() || this.isLocked()) return 'critical';
    if (this.isFailed() && this.failureReason?.includes('password')) return 'high';
    if (this.isFailed()) return 'medium';
    return 'low';
  }

  toJSON(): {
    id: string;
    userId?: string;
    email?: string;
    status: LoginAttemptStatus;
    attemptType: LoginAttemptType;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: any;
    failureReason?: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    isSuccessful: boolean;
    isFailed: boolean;
    isBlocked: boolean;
    isLocked: boolean;
    deviceSummary: string;
    attemptAge: number;
    attemptAgeFormatted: string;
    securityLevel: string;
  } {
    return {
      id: this.id,
      userId: this.userId,
      email: this.email,
      status: this.status,
      attemptType: this.attemptType,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      deviceInfo: this.deviceInfo,
      failureReason: this.failureReason,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isSuccessful: this.isSuccessful(),
      isFailed: this.isFailed(),
      isBlocked: this.isBlocked(),
      isLocked: this.isLocked(),
      deviceSummary: this.getDeviceSummary(),
      attemptAge: this.getAttemptAge(),
      attemptAgeFormatted: this.getAttemptAgeFormatted(),
      securityLevel: this.getSecurityLevel(),
    };
  }
}
