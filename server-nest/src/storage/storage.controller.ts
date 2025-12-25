import { BadRequestException, Controller, Delete, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Body('productId') productId?: string) {
    if (!file) {
      throw new BadRequestException('Missing file');
    }
    const url = await this.storageService.uploadProductImage(file, productId);
    return { success: true, data: { url } };
  }

  @Delete('delete')
  async remove(@Body() body: { url?: string }) {
    if (!body?.url) {
      throw new BadRequestException('Missing url');
    }
    const removed = await this.storageService.deleteByUrl(body.url);
    return { success: true, data: { removed } };
  }
}
