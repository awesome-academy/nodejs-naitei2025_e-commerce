import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const payload = await this.authService.register(dto);
    return { success: true, ...payload };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const payload = await this.authService.login(dto);
    return { success: true, ...payload };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Req() req: any) {
    const profile = await this.authService.getProfile(req.user.userId);
    return { success: true, user: profile };
  }
}
