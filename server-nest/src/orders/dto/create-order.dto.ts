import { IsString, IsEmail, IsOptional, IsArray, IsNumber, ValidateNested, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

enum PaymentMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  customerPhone: string;

  @IsString()
  shippingAddress: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}