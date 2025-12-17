import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ProductModule,
    OrderModule,
    ProfileModule,
    AuthModule,
    CartModule,
    AdminModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
