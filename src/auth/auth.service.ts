import {
  Injectable,
  HttpStatus,
  UnauthorizedException,
  StreamableFile,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { firstValueFrom } from 'rxjs';
import { IdasnResponseDto } from './interfaces/login-response.interface';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../settings/entities/setting.entity';
import { UserService } from '../user/user.service';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly userService: UserService,
    private readonly unitKerjaService: UnitKerjaService,
  ) {}

  async getPhoto(id: string, token: string, res: Response): Promise<void> {
    const fotoUrl = this.configService.get<string>('idasn.fotoUrl');

    if (!fotoUrl) {
      throw new Error('Missing photo URL configuration');
    }

    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    // Construct the URL with the ID
    const url = `${fotoUrl}/${id}`;

    try {
      // Get the photo as a stream with authorization header
      const response = await firstValueFrom(
        this.httpService.get(url, {
          responseType: 'arraybuffer',
          headers: {
            Authorization: token,
          },
        }),
      );

      // Set the content type from the response
      const contentType = response.headers['content-type'] || 'image/png';

      // Set all necessary headers for proper image display
      res.set({
        'Content-Type': contentType,
        'Content-Length': response.headers['content-length'],
        'Cache-Control': 'public, max-age=86400',
      });

      // Send the buffer directly as response
      res.end(Buffer.from(response.data));
    } catch (error) {
      console.error('Error fetching photo:', error);

      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        throw new UnauthorizedException('Unauthorized to access photo service');
      }

      throw new Error(`Failed to fetch photo: ${error.message}`);
    }
  }

  async login(loginDto: LoginDto): Promise<ApiResponse> {
    const loginUrl = this.configService.get<string>('IDASN_LOGIN_URL');
    const clientId = this.configService.get<string>('IDASN_CLIENT_ID');
    const responseType = this.configService.get<string>('IDASN_RESPONSE_TYPE');

    if (!loginUrl || !clientId || !responseType) {
      return {
        code: HttpStatus.BAD_REQUEST,
        status: false,
        message: 'Missing required environment variables for IDASN login',
        data: { token: null },
      };
    }

    // Build the URL with query parameters
    const url = `${loginUrl}?client_id=${clientId}&response_type=${responseType}`;

    try {
      // Make the HTTP request to the external service
      const response = await firstValueFrom(
        this.httpService.post<IdasnResponseDto>(url, {
          username: loginDto.username,
          password: loginDto.password,
        }),
      );

      const data = response.data;

      if (!data.success) {
        return {
          code: HttpStatus.UNAUTHORIZED,
          status: false,
          message: data.message || 'Authentication failed',
          data: null,
        };
      }

      // Extract the token from the redirect_uri
      const token = this.extractAccessToken(data.mapData.redirect_uri);

      // Return complete response object
      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Login berhasil',
        data: token || null,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Failed to authenticate: ${error.message}`,
        data: null,
      };
    }
  }

  extractAccessToken(redirectUri: string): string | null {
    const match = redirectUri.match(/access_token=([^&]*)/);
    return match ? match[1] : null;
  }

  async getProfile(user: any, token: string): Promise<ApiResponse> {
    try {
      // Ambil setting untuk mendapatkan admin_id dan bupati_id
      const settings = await this.settingRepository.find();
      const setting = settings.length > 0 ? settings[0] : null;

      // Siapkan data profil dari user
      const profileData = { ...user.mapData };
      // Tambahkan flag isAdmin dan isBupati
      profileData.isAdmin = false;
      profileData.isBupati = false;
      profileData.isJpt = false;

      // Cek apakah user adalah admin atau bupati
      if (setting) {
        const userNip = profileData.nipBaru;
        const userId = profileData.id;

        if (userNip === setting.admin_id || userId === setting.admin_id) {
          profileData.isAdmin = true;
        }

        if (userNip === setting.bupati_id || userId === setting.bupati_id) {
          profileData.isBupati = true;
        }
      }

      // Ambil data posjab dari user service
      try {
        const userResponse = await this.userService.findUserByNip(
          profileData.nipBaru,
          token,
        );

        if (userResponse.status && userResponse.data) {
          profileData.posjab = userResponse.data;

          // Cek apakah user adalah JPT
          try {
            profileData.isJpt = await this.unitKerjaService.getIsJpt(
              profileData.nipBaru,
              token,
            );
          } catch (jptError) {
            console.error('Error checking JPT status:', jptError.message);
            // Jika gagal memeriksa status JPT, tetap lanjutkan dengan isJpt = false
          }
        }
      } catch (error) {
        // Jika gagal mendapatkan posjab, tetap lanjutkan tanpa posjab
        console.error('Error fetching posjab data:', error.message);
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Profile berhasil diambil',
        data: profileData,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mengambil profile: ${error.message}`,
        data: null,
      };
    }
  }
}
