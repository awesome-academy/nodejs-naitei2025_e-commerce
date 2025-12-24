import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.profilesService.getProfile(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const data = await this.profilesService.updateProfile(id, body);
    return { success: true, data };
  }

  @Get(':id/cart')
  async getCart(@Param('id') id: string) {
    const data = await this.profilesService.getCart(id);
    return { success: true, data };
  }

  @Put(':id/cart')
  async updateCart(@Param('id') id: string, @Body() body: { cart?: any[] }) {
    await this.profilesService.updateCart(id, body.cart ?? []);
    return { success: true };
  }
}
