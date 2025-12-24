import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async overview() {
    const data = await this.adminService.getOverview();
    return { success: true, data };
  }

  @Patch('orders/:id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string; actorId?: string; note?: string }) {
    const data = await this.adminService.updateOrderStatus(id, body.status, body.actorId, body.note);
    return { success: true, data };
  }

  @Get('customers/:id')
  async customer(@Param('id') id: string) {
    const data = await this.adminService.getCustomerDetails(id);
    return { success: true, data };
  }
}
