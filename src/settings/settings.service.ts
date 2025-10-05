import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
  ) {}

  async getLatestSetting(): Promise<ApiResponse> {
    try {
      // Get the most recent setting
      const latestSetting = await this.settingRepository.createQueryBuilder('setting')
        .orderBy('setting.createdAt', 'DESC')
        .getOne();

      if (!latestSetting) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Setting tidak ditemukan',
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mendapatkan setting terbaru',
        data: latestSetting,
      };
    } catch (error) {
      console.error('Error getting latest setting:', error);
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mendapatkan setting terbaru: ${error.message}`,
        data: null,
      };
    }
  }

  async initialize(): Promise<ApiResponse> {
    try {
      // Check if default settings already exist
      const existingSettings = await this.settingRepository.find();

      if (existingSettings.length > 0) {
        return {
          code: HttpStatus.OK,
          status: true,
          message: 'Settings sudah diinisialisasi sebelumnya',
          data: existingSettings,
        };
      }

      // Create default settings
      const defaultSetting = this.settingRepository.create({
        admin_id: '197904012005011015',
        default_harian_time_start: new Date(new Date().setHours(7, 0, 0, 0)),
        default_harian_time_end: new Date(new Date().setHours(17, 0, 0, 0)),
        default_break_time_start: new Date(new Date().setHours(11, 0, 0, 0)),
        default_break_time_end: new Date(new Date().setHours(12, 0, 0, 0)),
        default_total_minuetes: 480, // 8 jam = 480 menit
        bupati_id: '197904012005011015',
      });

      const savedSetting = await this.settingRepository.save(defaultSetting);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Settings berhasil diinisialisasi',
        data: savedSetting,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal menginisialisasi settings',
        data: null,
      };
    }
  }

  async create(createSettingDto: CreateSettingDto): Promise<ApiResponse> {
    try {
      const setting = this.settingRepository.create(createSettingDto);
      const result = await this.settingRepository.save(setting);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Setting berhasil dibuat',
        data: result,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal membuat setting',
        data: null,
      };
    }
  }

  async findAll(query: any): Promise<ApiResponse> {
    try {
      const { page = 1, perPage = 10 } = query;
      const skip = (page - 1) * perPage;

      // Get the latest settings first
      const [settings, total] = await this.settingRepository.findAndCount({
        take: perPage,
        skip: skip,
        order: {
          createdAt: 'DESC', // Order by creation date, newest first
        },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mendapatkan semua setting',
        data: {
          settings,
          meta: {
            total,
            page: Number(page),
            perPage: Number(perPage),
            totalPages: Math.ceil(total / perPage),
          },
        },
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal mendapatkan setting',
        data: null,
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const setting = await this.settingRepository.findOne({
        where: { id },
      });

      if (!setting) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Setting tidak ditemukan',
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mendapatkan setting',
        data: setting,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal mendapatkan setting',
        data: null,
      };
    }
  }

  async update(
    id: string,
    updateSettingDto: UpdateSettingDto,
  ): Promise<ApiResponse> {
    try {
      const setting = await this.settingRepository.findOne({
        where: { id },
      });

      if (!setting) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Setting tidak ditemukan',
          data: null,
        };
      }

      await this.settingRepository.update(id, updateSettingDto);
      const updatedSetting = await this.settingRepository.findOne({
        where: { id },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Setting berhasil diperbarui',
        data: updatedSetting,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal memperbarui setting',
        data: null,
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      const setting = await this.settingRepository.findOne({
        where: { id },
      });

      if (!setting) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Setting tidak ditemukan',
          data: null,
        };
      }

      await this.settingRepository.delete(id);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Setting berhasil dihapus',
        data: null,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal menghapus setting',
        data: null,
      };
    }
  }
}
