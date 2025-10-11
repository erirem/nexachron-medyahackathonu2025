/**
 * Auth Token Repository
 * Handles authentication token data access
 */

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuthTokenEntity, CreateAuthTokenData, UpdateAuthTokenData, TokenType, TokenStatus } from '../entities/auth-token.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class AuthTokenRepository extends BaseRepository<AuthTokenEntity> {
  private readonly tableName = 'auth_tokens';

  constructor(protected readonly supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async create(data: CreateAuthTokenData): Promise<AuthTokenEntity> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .insert({
        user_id: data.userId,
        token_type: data.tokenType,
        token_value: data.tokenValue,
        expires_at: data.expiresAt.toISOString(),
        status: data.status,
        metadata: data.metadata,
        is_active: data.isActive,
      })
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to create auth token: ${result.error.message}`);
    }

    return new AuthTokenEntity(result.data);
  }

  async update(id: string, data: UpdateAuthTokenData): Promise<AuthTokenEntity> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update({
        token_value: data.tokenValue,
        expires_at: data.expiresAt?.toISOString(),
        status: data.status,
        metadata: data.metadata,
        is_active: data.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (result.error) {
      throw new Error(`Failed to update auth token: ${result.error.message}`);
    }

    return new AuthTokenEntity(result.data);
  }

  async findByUserId(userId: string): Promise<AuthTokenEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (result.error) {
      throw new Error(`Failed to find auth tokens by user ID: ${result.error.message}`);
    }

    return result.data.map(row => new AuthTokenEntity(row));
  }

  async findByTokenValue(tokenValue: string): Promise<AuthTokenEntity | null> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('token_value', tokenValue)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find auth token by value: ${result.error.message}`);
    }

    return new AuthTokenEntity(result.data);
  }

  async findByTokenType(userId: string, tokenType: TokenType): Promise<AuthTokenEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('token_type', tokenType)
      .order('created_at', { ascending: false });

    if (result.error) {
      throw new Error(`Failed to find auth tokens by type: ${result.error.message}`);
    }

    return result.data.map(row => new AuthTokenEntity(row));
  }

  async findActiveTokens(userId: string): Promise<AuthTokenEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('status', TokenStatus.ACTIVE)
      .order('created_at', { ascending: false });

    if (result.error) {
      throw new Error(`Failed to find active tokens: ${result.error.message}`);
    }

    return result.data.map(row => new AuthTokenEntity(row));
  }

  async findExpiredTokens(): Promise<AuthTokenEntity[]> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .lt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (result.error) {
      throw new Error(`Failed to find expired tokens: ${result.error.message}`);
    }

    return result.data.map(row => new AuthTokenEntity(row));
  }

  async revokeToken(id: string): Promise<boolean> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update({
        status: TokenStatus.REVOKED,
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (result.error) {
      throw new Error(`Failed to revoke token: ${result.error.message}`);
    }

    return true;
  }

  async revokeUserTokens(userId: string, tokenType?: TokenType): Promise<number> {
    let query = this.supabaseService.supabase
      .from(this.tableName)
      .update({
        status: TokenStatus.REVOKED,
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (tokenType) {
      query = query.eq('token_type', tokenType);
    }

    const result = await query;

    if (result.error) {
      throw new Error(`Failed to revoke user tokens: ${result.error.message}`);
    }

    return result.count || 0;
  }

  async markTokenAsUsed(id: string): Promise<boolean> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update({
        status: TokenStatus.USED,
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (result.error) {
      throw new Error(`Failed to mark token as used: ${result.error.message}`);
    }

    return true;
  }

  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .update({
        status: TokenStatus.EXPIRED,
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .lt('expires_at', new Date().toISOString())
      .eq('status', TokenStatus.ACTIVE);

    if (result.error) {
      throw new Error(`Failed to cleanup expired tokens: ${result.error.message}`);
    }

    return result.count || 0;
  }

  async findById(id: string): Promise<AuthTokenEntity | null> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find auth token by ID: ${result.error.message}`);
    }

    return new AuthTokenEntity(result.data);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (result.error) {
      throw new Error(`Failed to delete auth token: ${result.error.message}`);
    }

    return true;
  }

  async getTokenStats(): Promise<{
    totalTokens: number;
    activeTokens: number;
    expiredTokens: number;
    revokedTokens: number;
    usedTokens: number;
    byTokenType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const result = await this.supabaseService.supabase
      .from(this.tableName)
      .select('*');

    if (result.error) {
      throw new Error(`Failed to get token stats: ${result.error.message}`);
    }

    const tokens = result.data || [];
    const byTokenType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    let activeTokens = 0;
    let expiredTokens = 0;
    let revokedTokens = 0;
    let usedTokens = 0;

    tokens.forEach(token => {
      const tokenType = token.token_type;
      const status = token.status;
      
      byTokenType[tokenType] = (byTokenType[tokenType] || 0) + 1;
      byStatus[status] = (byStatus[status] || 0) + 1;

      if (token.is_active && status === TokenStatus.ACTIVE) {
        activeTokens++;
      } else if (status === TokenStatus.EXPIRED) {
        expiredTokens++;
      } else if (status === TokenStatus.REVOKED) {
        revokedTokens++;
      } else if (status === TokenStatus.USED) {
        usedTokens++;
      }
    });

    return {
      totalTokens: tokens.length,
      activeTokens,
      expiredTokens,
      revokedTokens,
      usedTokens,
      byTokenType,
      byStatus,
    };
  }
}
