import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('overview')
  getOverview() {
    return this.service.getOverview();
  }

  @Put('products/:id')
  updateProduct(
    @Param('id') id: string,
    @Body() body: { updates: any; actorId?: string }
  ) {
    return this.service.updateProduct(id, body.updates, body.actorId);
  }

  @Delete('products/:id')
  deleteProduct(
    @Param('id') id: string,
    @Body() body: { actorId?: string }
  ) {
    return this.service.deleteProduct(id, body.actorId);
  }

  @Put('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string; actorId?: string; note?: string }
  ) {
    return this.service.updateOrderStatus(id, body.status, body.actorId, body.note);
  }
}