import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StorageService {
  private bucketName = 'product-images';

  constructor(private readonly supabaseService: SupabaseService) {}

  async uploadProductImage(file: Express.Multer.File, productId?: string) {
    const supabase = this.supabaseService.getClient();
    const id = productId ?? String(Date.now());
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const safeName = `${timestamp}-${randomSuffix}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const path = `products/${id}/${safeName}`;

    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(path, file.buffer, {
        upsert: true,
        contentType: file.mimetype
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(this.bucketName).getPublicUrl(path);
    if (!data?.publicUrl) {
      throw new Error('Unable to get public URL');
    }

    return data.publicUrl;
  }

  async deleteByUrl(url: string) {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/');
      const publicIndex = parts.indexOf('public');
      if (publicIndex >= 0 && parts.length > publicIndex + 2) {
        const bucket = parts[publicIndex + 1];
        const path = parts.slice(publicIndex + 2).join('/');
        const { error } = await this.supabaseService.getClient().storage.from(bucket).remove([path]);
        if (error) throw error;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
