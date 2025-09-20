import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVisiDto {
  @IsNotEmpty({ message: 'Nama visi tidak boleh kosong' })
  @IsString({ message: 'Nama visi harus berupa string' })
  name: string;

  @IsNotEmpty({ message: 'Deskripsi visi tidak boleh kosong' })
  @IsString({ message: 'Deskripsi visi harus berupa string' })
  desc: string;
}