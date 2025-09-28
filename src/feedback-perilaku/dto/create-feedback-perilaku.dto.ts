import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFeedbackPerilakuDto {
  @IsNotEmpty()
  @IsUUID()
  perilaku_id: string;

  @IsNotEmpty()
  @IsUUID()
  periode_penilaian_id: string;

  @IsNotEmpty()
  @IsString()
  desc: string;
}
