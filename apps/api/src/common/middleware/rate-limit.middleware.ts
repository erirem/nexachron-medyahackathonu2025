import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import type { NextFunction, Response } from 'express';

import type { AuthenticatedRequest } from '../../auth/supabase-auth.guard';

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;

interface WindowCounter {
  count: number;
  expiresAt: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly buckets = new Map<string, WindowCounter>();

  use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const key = this.resolveKey(req);
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (bucket && bucket.expiresAt > now) {
      if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
        throw new HttpException(
          'Rate limit exceeded for quiz endpoint.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      bucket.count += 1;
      this.buckets.set(key, bucket);
      return next();
    }

    this.buckets.set(key, {
      count: 1,
      expiresAt: now + WINDOW_MS,
    });

    return next();
  }

  private resolveKey(req: AuthenticatedRequest): string {
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }
    return `ip:${req.ip ?? 'unknown'}`;
  }
}
