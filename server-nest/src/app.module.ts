import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ChatModule } from './chat/chat.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    SupabaseModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
    ProfilesModule,
    ChatModule,
    StorageModule
  ]
})
export class AppModule {}
