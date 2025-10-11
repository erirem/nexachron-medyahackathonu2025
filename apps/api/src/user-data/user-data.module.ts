import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { UserDataController } from './user-data.controller';
import { UserDataService } from './user-data.service';

@Module({
  imports: [SupabaseModule],
  controllers: [UserDataController],
  providers: [UserDataService],
  exports: [UserDataService],
})
export class UserDataModule {}


