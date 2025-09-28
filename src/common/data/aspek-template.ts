import { JenisAspek } from '../../aspek/entities/aspek.entity';

/**
 * Interface untuk template aspek
 */
export interface IAspekTemplate {
  jenis: JenisAspek;
  desc: string;
}

/**
 * Template aspek untuk RHK dengan rhk_atasan_id null (DESKRIPSI)
 */
export const aspekTemplateUtama: IAspekTemplate[] = [
  {
    jenis: JenisAspek.DESKRIPSI,
    desc: 'Deskripsi aspek kinerja utama',
  },
];

/**
 * Template aspek untuk RHK dengan rhk_atasan_id tidak null (KUANTITAS, KUALITAS, WAKTU)
 */
export const aspekTemplateTurunan: IAspekTemplate[] = [
  {
    jenis: JenisAspek.KUANTITAS,
    desc: 'Aspek kuantitas dari kinerja',
  },
  {
    jenis: JenisAspek.KUALITAS,
    desc: 'Aspek kualitas dari kinerja',
  },
  {
    jenis: JenisAspek.WAKTU,
    desc: 'Aspek waktu penyelesaian',
  },
];
