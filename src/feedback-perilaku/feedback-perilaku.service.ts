import {
  Injectable,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackPerilakuDto } from './dto/create-feedback-perilaku.dto';
import { UpdateFeedbackPerilakuDto } from './dto/update-feedback-perilaku.dto';
import { FeedbackPerilaku } from './entities/feedback-perilaku.entity';
import { FilterFeedbackPerilakuDto } from './dto/filter-feedback-perilaku.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class FeedbackPerilakuService {
  constructor(
    @InjectRepository(FeedbackPerilaku)
    private readonly feedbackPerilakuRepository: Repository<FeedbackPerilaku>,
  ) {}

  async create(
    createFeedbackPerilakuDto: CreateFeedbackPerilakuDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const feedbackPerilaku = this.feedbackPerilakuRepository.create({
        ...createFeedbackPerilakuDto,
      });

      const result =
        await this.feedbackPerilakuRepository.save(feedbackPerilaku);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Feedback perilaku berhasil dibuat',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        'Gagal membuat feedback perilaku: ' + error.message,
      );
    }
  }

  async findAll(
    filterDto: FilterFeedbackPerilakuDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        perPage = 10,
        perilaku_id,
        periode_penilaian_id,
      } = filterDto;

      const queryBuilder =
        this.feedbackPerilakuRepository.createQueryBuilder('feedback');

      if (perilaku_id) {
        queryBuilder.andWhere('feedback.perilaku_id = :perilaku_id', {
          perilaku_id,
        });
      }

      if (periode_penilaian_id) {
        queryBuilder.andWhere(
          'feedback.periode_penilaian_id = :periode_penilaian_id',
          { periode_penilaian_id },
        );
      }

      const skip = (page - 1) * perPage;

      const [data, total] = await queryBuilder
        .skip(skip)
        .take(perPage)
        .orderBy('feedback.created_at', 'DESC')
        .getManyAndCount();

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Daftar feedback perilaku berhasil diambil',
        data,
        pagination: {
          current_page: Number(page),
          per_page: Number(perPage),
          total,
          last_page: Math.ceil(total / perPage),
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Gagal mengambil daftar feedback perilaku: ' + error.message,
      );
    }
  }

  async findOne(id: string, token: string): Promise<ApiResponse> {
    try {
      const feedbackPerilaku = await this.feedbackPerilakuRepository.findOne({
        where: { id },
      });

      if (!feedbackPerilaku) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Feedback perilaku dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Feedback perilaku berhasil diambil',
        data: feedbackPerilaku,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Gagal mengambil feedback perilaku: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    updateFeedbackPerilakuDto: UpdateFeedbackPerilakuDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const feedbackPerilaku = await this.feedbackPerilakuRepository.findOne({
        where: { id },
      });

      if (!feedbackPerilaku) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Feedback perilaku dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      await this.feedbackPerilakuRepository.update(id, {
        ...updateFeedbackPerilakuDto,
      });

      const updatedFeedbackPerilaku =
        await this.feedbackPerilakuRepository.findOne({
          where: { id },
        });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Feedback perilaku berhasil diperbarui',
        data: updatedFeedbackPerilaku,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Gagal memperbarui feedback perilaku: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      const feedbackPerilaku = await this.feedbackPerilakuRepository.findOne({
        where: { id },
      });

      if (!feedbackPerilaku) {
        return {
          code: HttpStatus.NOT_FOUND,
          status: false,
          message: `Feedback perilaku dengan ID ${id} tidak ditemukan`,
          data: null,
        };
      }

      await this.feedbackPerilakuRepository.delete(id);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Feedback perilaku berhasil dihapus',
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Gagal menghapus feedback perilaku: ' + error.message,
      );
    }
  }
}
