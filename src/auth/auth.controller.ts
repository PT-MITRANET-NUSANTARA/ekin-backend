import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Login endpoint - for external authentication with JWKS
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse> {
    return await this.authService.login(loginDto);
  }

  // Protected endpoint - requires valid JWT token
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any): ApiResponse {
    return {
      code: HttpStatus.OK,
      status: true,
      message: 'Profile berhasil diambil',
      data: {
        user: user.mapData,
      },
    };
  }

  // Protected endpoint - verify token
  @UseGuards(JwtAuthGuard)
  @Post('verify')
  verifyToken(@CurrentUser() user: any): ApiResponse {
    return {
      code: HttpStatus.OK,
      status: true,
      message: 'Token valid',
      data: {
        valid: true,
        user: user.mapData,
      },
    };
  }
}
