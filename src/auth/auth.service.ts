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
import { UmpegService } from '../umpeg/umpeg.service';
import { VerificatorService } from '../verificator/verificator.service';
import { AbsenceService } from '../absence/absence.service';
import { HarianService } from '../harian/harian.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly userService: UserService,
    private readonly unitKerjaService: UnitKerjaService,
    private readonly umpegService: UmpegService,
    private readonly verificatorService: VerificatorService,
    private readonly absenceService: AbsenceService,
    private readonly harianService: HarianService,
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
  
  async getDashboard(user: any, token: string): Promise<ApiResponse> {
    try {
      // Mendapatkan data profil user
      const profileResponse = await this.getProfile(user, token);
      const profileData = profileResponse.data;
      
      // Mendapatkan tanggal hari ini dalam format YYYY-MM-DD
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      // Mendapatkan data absence hari ini
      let absenceData = null;
      try {
        const absenceResponse = await this.absenceService.findAll(
          { date: new Date(formattedDate), user_id: profileData.nipBaru },
          token,
        );
        if (absenceResponse.status && absenceResponse.data && absenceResponse.data.length > 0) {
          absenceData = absenceResponse.data[0];
        }
      } catch (error) {
        console.error('Error fetching absence data:', error.message);
      }
      
      // Mendapatkan data harian hari ini
      let harianData = null;
      try {
        const harianResponse = await this.harianService.findByDate(formattedDate);
        if (harianResponse.status && harianResponse.data && harianResponse.data.length > 0) {
          harianData = harianResponse.data;
        }
      } catch (error) {
        console.error('Error fetching harian data:', error.message);
      }
      
      // Mendapatkan data settings
      let settingsData: any = null;
      try {
        const settings = await this.settingRepository.find();
        if (settings && settings.length > 0) {
          settingsData = {
            default_harian_time_start: settings[0].default_harian_time_start,
            default_harian_time_end: settings[0].default_harian_time_end,
            default_break_time_start: settings[0].default_break_time_start,
            default_break_time_end: settings[0].default_break_time_end,
            default_total_minuetes: settings[0].default_total_minuetes
          };
        }
      } catch (error) {
        console.error('Error fetching settings data:', error.message);
      }
      
      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Dashboard data berhasil diambil',
        data: {
          profile: profileData,
          absence: absenceData,
          harian: harianData,
          settings: settingsData,
        },
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Failed to get dashboard data: ${error.message}`,
        data: null,
      };
    }
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
      profileData.pimpinan = null;

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

          // Ambil data unor untuk mendapatkan pimpinan
          try {
            if (profileData.posjab && profileData.posjab.nama_jabatan) {
              const unorResponse = await this.unitKerjaService.findAllUnor(
                profileData.posjab.unor.induk.id_simpeg,
                token,
              );
              if (unorResponse.status && unorResponse.data) {
                const unorList = unorResponse.data;
                // Cari unor yang nama jabatannya cocok dengan nama jabatan user saat ini
                const matchingUnor = unorList.find((unor) => {
                  // Normalisasi string untuk perbandingan (ubah ke lowercase dan hapus spasi berlebih)
                  const normalizedUnorJabatan =
                    unor.namaJabatan
                      ?.toLowerCase()
                      .trim()
                      .replace(/\s+/g, ' ') || '';
                  const normalizedProfileJabatan =
                    profileData.posjab.nama_jabatan
                      ?.toLowerCase()
                      .trim()
                      .replace(/\s+/g, ' ') || '';

                  // Cek juga apakah salah satu string berisi string lainnya
                  const isExactMatch =
                    normalizedUnorJabatan === normalizedProfileJabatan;
                  const unorContainsProfile = normalizedUnorJabatan.includes(
                    normalizedProfileJabatan,
                  );
                  const profileContainsUnor = normalizedProfileJabatan.includes(
                    normalizedUnorJabatan,
                  );

                  // Gunakan kecocokan persis atau kecocokan sebagian jika diperlukan
                  return (
                    isExactMatch || unorContainsProfile || profileContainsUnor
                  );
                });

                // Jika ditemukan, set pimpinan = unor tersebut, jika tidak pimpinan tetap null
                if (matchingUnor) {
                  profileData.pimpinan = matchingUnor;
                }
              }
            }
          } catch (unorError) {
            console.error(
              'Error fetching unor data for pimpinan:',
              unorError.message,
            );
            // Jika gagal mendapatkan data unor, tetap lanjutkan tanpa mengubah pimpinan
          }

          // Ambil data umpeg berdasarkan unit dan jabatan
          try {
            if (
              profileData.posjab &&
              profileData.posjab.unor &&
              profileData.posjab.unor.induk &&
              profileData.posjab.unor.induk.id_simpeg &&
              profileData.posjab.nama_jabatan
            ) {
              // Ambil data verificator berdasarkan unit dan jabatan
              try {
                const unitId = profileData.posjab.unor.induk.id_simpeg;
                const jabatan = profileData.posjab.nama_jabatan;

                // Buat objek untuk parameter verifyUnitAndJabatan
                const verifyDto = {
                  unit_id: Number(unitId),
                  jabatan: [{ [unitId]: [jabatan] }],
                };

                const verificatorResponse =
                  await this.verificatorService.verifyUnitAndJabatan(
                    verifyDto,
                    token,
                  );

                if (verificatorResponse.status && verificatorResponse.data) {
                  profileData.verificators = verificatorResponse.data;
                }
              } catch (verificatorError) {
                console.error(
                  'Error fetching verificator data:',
                  verificatorError.message,
                );
                // Jika gagal mengambil data verificator, tetap lanjutkan tanpa data verificator
              }

              const unitId = profileData.posjab.unor.induk.id_simpeg;
              const jabatan = profileData.posjab.nama_jabatan;

              const umpegResponse =
                await this.umpegService.findByUnitAndJabatan(
                  unitId.toString(),
                  jabatan,
                  token,
                );

              if (umpegResponse.status && umpegResponse.data) {
                profileData.umpegs = umpegResponse.data;
              }
            }
          } catch (umpegError) {
            console.error('Error fetching umpeg data:', umpegError.message);
            // Jika gagal mendapatkan data umpeg, tetap lanjutkan tanpa data umpeg
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
