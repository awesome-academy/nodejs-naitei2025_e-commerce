import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { ProfilesController } from './profiles.controller';
import { CustomersController } from './customers.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ProfilesController, CustomersController],
  providers: [ProfilesService]
})
export class ProfilesModule {}
