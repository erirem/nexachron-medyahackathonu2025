/**
 * Refactored Users Module
 * Clean, SOLID-compliant user management module
 */

import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from '../../core/repositories/user.repository';
import { UserStatsRepository } from '../../core/repositories/user-stats.repository';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserStatsRepository],
  exports: [UserService, UserRepository, UserStatsRepository],
})
export class UsersModule {}
