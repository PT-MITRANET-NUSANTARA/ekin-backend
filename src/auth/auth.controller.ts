import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  Param,
  Headers,
  Res,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

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
      data: user.mapData,
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
        id: user.mapData.nipBaru,
        ...user.mapData,
      },
    };
  }

  // Get photo by ID
  @UseGuards(JwtAuthGuard)
  @Get('foto/:id')
  async getFotoById(
    @Param('id') id: string,
    @Headers('authorization') token: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.getPhoto(id, token, res);
  }

  // Get current user's photo
  @UseGuards(JwtAuthGuard)
  @Get('profile/foto')
  async getProfileFoto(
    @CurrentUser() user: any,
    @Headers('authorization') token: string,
    @Res() res: Response,
  ): Promise<void> {
    const id = user.mapData.nipBaru;
    await this.authService.getPhoto(id, token, res);
  }
}
