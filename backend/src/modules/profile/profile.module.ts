import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { SupabaseService } from '../../supabase/supabase.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, SupabaseService],
})
export class ProfileModule {}