import { Controller, Get, Param } from '@nestjs/common';
import { ProfilesService } from './profiles.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':id/dashboard')
  async dashboard(@Param('id') id: string) {
    const data = await this.profilesService.getCustomerDashboard(id);
    return { success: true, data };
  }
}
