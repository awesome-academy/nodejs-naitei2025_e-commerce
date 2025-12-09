import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [ProductModule, OrderModule, ProfileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
