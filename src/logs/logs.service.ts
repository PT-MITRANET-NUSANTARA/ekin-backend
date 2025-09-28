import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { FilterLogDto } from './dto/filter-log.dto';
import { Log, OperationType } from './entities/log.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async create(createLogDto: CreateLogDto): Promise<ApiResponse> {
    try {
      const log = this.logRepository.create(createLogDto);
      const result = await this.logRepository.save(log);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Log berhasil dibuat',
        data: result,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal membuat log',
        data: null,
      };
    }
  }

  async findAll(filterDto: FilterLogDto): Promise<ApiResponse> {
    try {
      const { search, page = 1, perPage = 10 } = filterDto;

      // Build query with search filter if provided
      const whereCondition = search
        ? [
            { model: Like(`%${search}%`) },
            { model_id: Like(`%${search}%`) },
            { operation: Like(`%${search}%`) },
          ]
        : {};

      // Calculate skip for pagination
      const skip = (page - 1) * perPage;

      // Get total count for pagination
      const total = await this.logRepository.count({
        where: whereCondition,
      });

      // Calculate last page
      const lastPage = Math.ceil(total / perPage);

      // Get data with pagination
      const logs = await this.logRepository.find({
        where: whereCondition,
        skip,
        take: perPage,
        order: { created_at: 'DESC' },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mendapatkan semua log',
        data: logs,
        pagination: {
          current_page: page,
          per_page: perPage,
          total,
          last_page: lastPage,
        },
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal mendapatkan log',
        data: null,
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const log = await this.logRepository.findOne({ where: { id } });

      if (!log) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: 'Log tidak ditemukan',
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mendapatkan log',
        data: log,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal mendapatkan log',
        data: null,
      };
    }
  }

  async findByUserId(
    userId: string,
    filterDto: FilterLogDto,
  ): Promise<ApiResponse> {
    try {
      const { search, page = 1, perPage = 10 } = filterDto;

      // Build query with search filter if provided
      const whereCondition: any = { user_id: userId };

      if (search) {
        whereCondition.model = Like(`%${search}%`);
      }

      // Calculate skip for pagination
      const skip = (page - 1) * perPage;

      // Get total count for pagination
      const total = await this.logRepository.count({
        where: whereCondition,
      });

      // Calculate last page
      const lastPage = Math.ceil(total / perPage);

      // Get data with pagination
      const logs = await this.logRepository.find({
        where: whereCondition,
        skip,
        take: perPage,
        order: { created_at: 'DESC' },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mendapatkan log berdasarkan user id',
        data: logs,
        pagination: {
          current_page: page,
          per_page: perPage,
          total,
          last_page: lastPage,
        },
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal mendapatkan log berdasarkan user id',
        data: null,
      };
    }
  }

  async findByModelId(
    modelId: string,
    filterDto: FilterLogDto,
  ): Promise<ApiResponse> {
    try {
      const { search, page = 1, perPage = 10 } = filterDto;

      // Build query with search filter if provided
      const whereCondition: any = { model_id: modelId };

      if (search) {
        whereCondition.model = Like(`%${search}%`);
      }

      // Calculate skip for pagination
      const skip = (page - 1) * perPage;

      // Get total count for pagination
      const total = await this.logRepository.count({
        where: whereCondition,
      });

      // Calculate last page
      const lastPage = Math.ceil(total / perPage);

      // Get data with pagination
      const logs = await this.logRepository.find({
        where: whereCondition,
        skip,
        take: perPage,
        order: { created_at: 'DESC' },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mendapatkan log berdasarkan model id',
        data: logs,
        pagination: {
          current_page: page,
          per_page: perPage,
          total,
          last_page: lastPage,
        },
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Gagal mendapatkan log berdasarkan model id',
        data: null,
      };
    }
  }

  // Metode untuk mencatat operasi CREATE
  async logCreate(
    userId: string,
    model: string,
    modelId: string,
    name?: string,
  ): Promise<ApiResponse> {
    return this.create({
      user_id: userId,
      model,
      model_id: modelId,
      name,
      operation: OperationType.CREATE,
    });
  }

  // Metode untuk mencatat operasi UPDATE
  async logUpdate(
    userId: string,
    model: string,
    modelId: string,
    name?: string,
  ): Promise<ApiResponse> {
    return this.create({
      user_id: userId,
      model,
      model_id: modelId,
      name,
      operation: OperationType.UPDATE,
    });
  }

  // Metode untuk mencatat operasi DELETE
  async logDelete(
    userId: string,
    model: string,
    modelId: string,
    name?: string,
  ): Promise<ApiResponse> {
    return this.create({
      user_id: userId,
      model,
      model_id: modelId,
      name,
      operation: OperationType.DELETE,
    });
  }
}
