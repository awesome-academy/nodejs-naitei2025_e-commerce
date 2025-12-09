import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import type { Order } from './order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() order: Order) {
    return this.service.create(order);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() order: Partial<Order>) {
    return this.service.update(id, order);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}