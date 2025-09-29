import { Module } from '@nestjs/common';

import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SupabaseModule],
  controllers: [UsersController],
  providers: [UsersService, SupabaseAuthGuard],
})
export class UsersModule {}
