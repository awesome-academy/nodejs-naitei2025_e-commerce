import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() body: any) {
    const data = await this.ordersService.createOrder(body);
    return { success: true, data };
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @Body() body: any) {
    const data = await this.ordersService.cancelOrder(id, body?.userId, body?.note);
    return { success: true, data };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.ordersService.getOrderById(id);
    return { success: true, data };
  }

  @Get(':id/history')
  async history(@Param('id') id: string) {
    const data = await this.ordersService.getOrderHistory(id);
    return { success: true, data };
  }
}
