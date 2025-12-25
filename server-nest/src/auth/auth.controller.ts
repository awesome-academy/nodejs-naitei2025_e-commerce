import { Body, Controller, Get, Post, Req, UseGuards, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipThrottle()
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Headers() headers: Record<string, string>) {
    const payload = await this.authService.register(dto);
    return { 
      success: true, 
      ...payload,
      _headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    };
  }

  @SkipThrottle()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Headers() headers: Record<string, string>) {
    const payload = await this.authService.login(dto);
    return { 
      success: true, 
      ...payload,
      _headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Req() req: any) {
    const profile = await this.authService.getProfile(req.user.userId);
    return { success: true, user: profile };
  }
}