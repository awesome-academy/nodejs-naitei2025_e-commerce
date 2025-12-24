import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

const buildProductPayload = (input: Record<string, any>) => ({
  id: input.id ?? `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  name: input.name ?? '',
  price: input.price ?? 0,
  originalprice: input.originalPrice ?? null,
  category: input.category ?? 'men',
  subcategory: input.subcategory ?? '',
  images: input.images ?? [],
  colors: JSON.stringify(input.colors ?? []),
  sizes: JSON.stringify(input.sizes ?? []),
  description: input.description ?? '',
  features: JSON.stringify(input.features ?? []),
  isnew: input.isNew ?? false,
  issale: input.isSale ?? false,
  rating: input.rating ?? null,
  reviewcount: input.reviewCount ?? null,
  stock: input.stock ?? 0,
  sold_count: input.soldCount ?? 0
});

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAll() {
    const data = await this.productsService.getAll();
    return { success: true, data };
  }

  @Get('related')
  async getRelated(
    @Query('category') category: string,
    @Query('excludeId') excludeId?: string,
    @Query('limit') limit?: string
  ) {
    const data = await this.productsService.getRelated(category, excludeId, limit ? Number(limit) : 4);
    return { success: true, data };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.productsService.getById(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: Record<string, any>) {
    const payload = buildProductPayload(body);
    const data = await this.productsService.create(payload);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Record<string, any>) {
    const payload = buildProductPayload(body);
    delete payload.id;
    const data = await this.productsService.update(id, payload);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productsService.delete(id);
    return { success: true };
  }
}
