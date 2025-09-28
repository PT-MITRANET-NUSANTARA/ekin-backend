import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFeedbackAspekDto {
  @IsNotEmpty()
  @IsUUID()
  aspek_id: string;

  @IsNotEmpty()
  @IsUUID()
  periode_penilaian_id: string;

  @IsNotEmpty()
  @IsString()
  desc: string;
}
