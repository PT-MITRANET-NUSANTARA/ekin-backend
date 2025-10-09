import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { PerjanjianKinerjaService } from './perjanjian-kinerja.service';
import { CreatePerjanjianKinerjaDto } from './dto/create-perjanjian-kinerja.dto';
import { UpdatePerjanjianKinerjaDto } from './dto/update-perjanjian-kinerja.dto';
import { FilterPerjanjianKinerjaDto } from './dto/filter-perjanjian-kinerja.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('perjanjian-kinerja')
@UseGuards(JwtAuthGuard)
export class PerjanjianKinerjaController {
  constructor(
    private readonly perjanjianKinerjaService: PerjanjianKinerjaService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/perjanjian-kinerja',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Body() createPerjanjianKinerjaDto: CreatePerjanjianKinerjaDto,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.perjanjianKinerjaService.create(
      createPerjanjianKinerjaDto,
      file,
      token,
    );
  }

  @Get()
  findAll(
    @Query() filterPerjanjianKinerjaDto: FilterPerjanjianKinerjaDto,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.perjanjianKinerjaService.findAll(
      filterPerjanjianKinerjaDto,
      token,
    );
  }

  @Get('skp/:skp_id/template')
  getTemplate(
    @Param('skp_id') skp_id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.perjanjianKinerjaService.getTemplate(skp_id, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.perjanjianKinerjaService.findOne(id, token);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/perjanjian-kinerja',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updatePerjanjianKinerjaDto: UpdatePerjanjianKinerjaDto,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.perjanjianKinerjaService.update(
      id,
      updatePerjanjianKinerjaDto,
      file,
      token,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.perjanjianKinerjaService.remove(id, token);
  }

  @Get(':id/download')
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.perjanjianKinerjaService.downloadFile(id);
    return file;
  }
}
