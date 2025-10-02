import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePerjanjianKinerjaDto {
  @IsNotEmpty()
  @IsString()
  unit_id: string;

  @IsNotEmpty()
  @IsString()
  unor_id: string;

  @IsNotEmpty()
  @IsString()
  skp_id: string;

  // File akan ditangani oleh FileInterceptor
  // Tidak perlu validasi di sini karena file diupload sebagai multipart/form-data
}
