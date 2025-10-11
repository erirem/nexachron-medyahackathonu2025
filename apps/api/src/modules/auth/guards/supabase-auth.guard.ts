import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import type { User } from '@supabase/supabase-js';

import { SupabaseService } from '../../../supabase/supabase.service';

export interface AuthenticatedRequest extends Request {
  user?: User;
  accessToken?: string;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extractBearerToken(request);
    const { data, error } =
      await this.supabaseService.supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw new UnauthorizedException('Supabase token doğrulanamadı.');
    }

    request.user = data.user;
    request.accessToken = token;

    return true;
  }

  private extractBearerToken(request: Request): string {
    const header =
      request.headers['authorization'] ?? request.headers['Authorization'];

    if (typeof header !== 'string') {
      throw new UnauthorizedException('Authorization header bulunamadı.');
    }

    const [scheme, token] = header.trim().split(/\s+/);

    if (!token || scheme.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('Bearer token formatı geçersiz.');
    }

    return token;
  }
}
