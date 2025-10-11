/**
 * Auth Module
 * Authentication system module configuration
 */

import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthSessionController } from './controllers/auth-session.controller';
import { AuthTokenController } from './controllers/auth-token.controller';
import { AuthLoginAttemptController } from './controllers/auth-login-attempt.controller';
import { AuthService } from './services/auth.service';
import { AuthSessionRepository } from '../../core/repositories/auth-session.repository';
import { AuthTokenRepository } from '../../core/repositories/auth-token.repository';
import { AuthLoginAttemptRepository } from '../../core/repositories/auth-login-attempt.repository';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [
    AuthController,
    AuthSessionController,
    AuthTokenController,
    AuthLoginAttemptController,
  ],
  providers: [
    AuthService,
    AuthSessionRepository,
    AuthTokenRepository,
    AuthLoginAttemptRepository,
  ],
  exports: [
    AuthService,
    AuthSessionRepository,
    AuthTokenRepository,
    AuthLoginAttemptRepository,
  ],
})
export class AuthModule {}
