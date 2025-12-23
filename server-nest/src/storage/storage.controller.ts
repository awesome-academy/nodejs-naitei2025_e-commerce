import { BadRequestException, Controller, Delete, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')

  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: MAX_FILE_SIZE}, // 10 MB limit
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only image files are allowed (JPEG, PNG, GIF, WEBP)'), false);
      }
    }
  }))

  async upload(@UploadedFile() file: Express.Multer.File, @Body('productId') productId?: string) {
    if (!file) {
      throw new BadRequestException('Missing file');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException('INVALID_FILE_TYPE');
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
