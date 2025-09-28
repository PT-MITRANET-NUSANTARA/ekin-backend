import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { HarianService } from './harian.service';
import { CreateHarianDto } from './dto/create-harian.dto';
import { UpdateHarianDto } from './dto/update-harian.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilterHarianDto } from './dto/filter-harian.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(JwtAuthGuard)
@Controller('harian')
export class HarianController {
  constructor(private readonly harianService: HarianService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/harian',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async create(
    @Body() createHarianDto: CreateHarianDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ApiResponse> {
    if (files && files.length > 0) {
      const fileNames = files.map((file) => file.filename);
      createHarianDto.files = fileNames;
    }
    return this.harianService.create(createHarianDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterHarianDto): Promise<ApiResponse> {
    return this.harianService.findAll(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    return this.harianService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/harian',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateHarianDto: UpdateHarianDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ApiResponse> {
    if (files && files.length > 0) {
      const fileNames = files.map((file) => file.filename);
      updateHarianDto.files = fileNames;
    }
    return this.harianService.update(id, updateHarianDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse> {
    return this.harianService.remove(id);
  }
}
