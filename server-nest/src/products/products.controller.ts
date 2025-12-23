import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAll() {
    const products = await this.productsService.getAll();
    return { success: true, data: products };
  }

  @Get('related')
  async getRelated(
    @Query('category') category: string,
    @Query('excludeId') excludeId?: string,
    @Query('limit') limit?: string
  ) {
    const products = await this.productsService.getRelated(
      category,
      excludeId,
      limit ? Number(limit) : 4
    );
    return { success: true, data: products };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const product = await this.productsService.getById(id);
    return { success: true, data: product };
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    const product = await this.productsService.create(dto);
    return { success: true, data: product };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.productsService.update(id, dto);
    return { success: true, data: product };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productsService.delete(id);
    return { success: true, data: { removed: true } };
  }
}