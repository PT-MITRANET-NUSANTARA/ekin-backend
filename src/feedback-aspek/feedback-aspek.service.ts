import {
  Injectable,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackAspekDto } from './dto/create-feedback-aspek.dto';
import { UpdateFeedbackAspekDto } from './dto/update-feedback-aspek.dto';
import { FeedbackAspek } from './entities/feedback-aspek.entity';
import { FilterFeedbackAspekDto } from './dto/filter-feedback-aspek.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Injectable()
export class FeedbackAspekService {
  constructor(
    @InjectRepository(FeedbackAspek)
    private readonly feedbackAspekRepository: Repository<FeedbackAspek>,
  ) {}

  async create(
    createFeedbackAspekDto: CreateFeedbackAspekDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const feedbackAspek = this.feedbackAspekRepository.create({
        ...createFeedbackAspekDto,
      });

      const result = await this.feedbackAspekRepository.save(feedbackAspek);

      return {
        code: HttpStatus.CREATED,
        status: true,
        message: 'Feedback aspek berhasil dibuat',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        'Gagal membuat feedback aspek: ' + error.message,
      );
    }
  }

  async findAll(
    filterDto: FilterFeedbackAspekDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        perPage = 10,
        aspek_id,
        periode_penilaian_id,
      } = filterDto;

      const queryBuilder =
        this.feedbackAspekRepository.createQueryBuilder('feedback');

      if (aspek_id) {
        queryBuilder.andWhere('feedback.aspek_id = :aspek_id', {
          aspek_id,
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
        message: 'Daftar feedback aspek berhasil diambil',
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
        'Gagal mengambil daftar feedback aspek: ' + error.message,
      );
    }
  }

  async findOne(id: string, token: string): Promise<ApiResponse> {
    try {
      const feedbackAspek = await this.feedbackAspekRepository.findOne({
        where: { id },
      });

      if (!feedbackAspek) {
        throw new NotFoundException(
          `Feedback aspek dengan ID ${id} tidak ditemukan`,
        );
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Feedback aspek berhasil ditemukan',
        data: feedbackAspek,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Gagal mengambil feedback aspek: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    updateFeedbackAspekDto: UpdateFeedbackAspekDto,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const feedbackAspek = await this.feedbackAspekRepository.findOne({
        where: { id },
      });

      if (!feedbackAspek) {
        throw new NotFoundException(
          `Feedback aspek dengan ID ${id} tidak ditemukan`,
        );
      }

      await this.feedbackAspekRepository.update(id, {
        ...updateFeedbackAspekDto,
      });

      const updatedFeedbackAspek = await this.feedbackAspekRepository.findOne({
        where: { id },
      });

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Feedback aspek berhasil diperbarui',
        data: updatedFeedbackAspek,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Gagal memperbarui feedback aspek: ' + error.message,
      );
    }
  }

  async remove(id: string, token: string): Promise<ApiResponse> {
    try {
      const feedbackAspek = await this.feedbackAspekRepository.findOne({
        where: { id },
      });

      if (!feedbackAspek) {
        throw new NotFoundException(
          `Feedback aspek dengan ID ${id} tidak ditemukan`,
        );
      }

      await this.feedbackAspekRepository.delete(id);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Feedback aspek berhasil dihapus',
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Gagal menghapus feedback aspek: ' + error.message,
      );
    }
  }
}
