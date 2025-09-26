import { IPerilaku } from '../../perilaku/interfaces/perilaku.interface';

/**
 * Template data perilaku berdasarkan BKN
 * Digunakan sebagai referensi untuk penilaian perilaku ASN
 */
export const perilakuTemplate: IPerilaku[] = [
  {
    name: 'Berorientasi Pelayanan',
    isi: [
      'Memahami dan memenuhi kebutuhan masyarakat',
      'Ramah, cekatan, solutif, dan dapat diandalkan',
      'Melakukan perbaikan tiada henti',
    ],
    espektasi: '',
  },
  {
    name: 'Akuntabel',
    isi: [
      'Melaksanakan tugas dengan jujur, bertanggung jawab, cermat, disiplin, dan berintegritas tinggi',
      'Menggunakan kekayaan dan BMN secara bertanggung jawab, efektif, dan efisien',
      'Tidak menyalahgunakan kewenangan jabatan',
    ],
    espektasi: '',
  },
  {
    name: 'Kompeten',
    isi: [
      'Meningkatkan kompetensi diri untuk menjawab tantangan yang selalu berubah',
      'Membantu orang lain belajar',
      'Melaksanakan tugas dengan kualitas terbaik',
    ],
    espektasi: '',
  },
  {
    name: 'Harmonis',
    isi: [
      'Menghargai setiap orang apapun latar belakangnya',
      'Suka menolong orang lain',
      'Membangun lingkungan kerja yang kondusif',
    ],
    espektasi: '',
  },
  {
    name: 'Loyal',
    isi: [
      'Memegang teguh ideologi Pancasila, Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, setia pada NKRI serta pemerintahan yang sah',
      'Menjaga nama baik sesama ASN, Pimpinan, Instansi dan Negara',
      'Menjaga rahasia jabatan dan negara',
    ],
    espektasi: '',
  },
  {
    name: 'Adaptif',
    isi: [
      'Cepat menyesuaikan diri menghadapi perubahan',
      'Terus berinovasi dan mengembangkan kreativitas',
      'Bertindak proaktif',
    ],
    espektasi: '',
  },
  {
    name: 'Kolaboratif',
    isi: [
      'Memberi kesempatan kepada berbagai pihak untuk berkontribusi',
      'Terbuka dalam bekerja sama untuk menghasilkan nilai tambah',
      'Menggerakkan pemanfaatan berbagai sumberdaya untuk tujuan bersama',
    ],
    espektasi: '',
  },
];

/**
 * Cara penggunaan:
 *
 * 1. Import template perilaku:
 * import { perilakuTemplate } from '../common/data/perilaku-template';
 *
 * 2. Gunakan sebagai data awal atau referensi:
 * const perilakuData = [...perilakuTemplate];
 *
 * 3. Atau gunakan untuk inisialisasi data:
 * async initPerilakuData() {
 *   const count = await this.perilakuRepository.count();
 *   if (count === 0) {
 *     await this.perilakuRepository.save(perilakuTemplate);
 *   }
 * }
 */
