import { IsOptional, IsString } from 'class-validator';

export class CancelOrderDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}