import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.ordersService.createOrder(dto);
    return { success: true, data: order };
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @Body() dto: CancelOrderDto) {
    const order = await this.ordersService.cancelOrder(id, dto.userId, dto.note);
    return { success: true, data: order };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const order = await this.ordersService.getOrderById(id);
    return { success: true, data: order };
  }

  @Get(':id/history')
  async fetchHistory(@Param('id') id: string) {
    const history = await this.ordersService.fetchOrderHistory(id);
    return { success: true, data: history };
  }
}