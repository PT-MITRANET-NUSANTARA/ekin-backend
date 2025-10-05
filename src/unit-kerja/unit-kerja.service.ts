import {
  Injectable,
  HttpStatus,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { find, firstValueFrom } from 'rxjs';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { UnitKerjaDto } from './dto/unit-kerja.dto';
import { FilterUnitKerjaDto } from './dto/filter-unit-kerja.dto';
import { UnitOrganisasiDto } from './dto/unit-organisasi.dto';
import { FilterUnitOrganisasiDto } from './dto/filter-unit-organisasi.dto';
import { UserService } from '../user/user.service';

// Interface untuk ResponseDto

@Injectable()
export class UnitKerjaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async findAll(
    token: string,
    filterDto: FilterUnitKerjaDto,
  ): Promise<ApiResponse> {
    const { search = '', page = 1, perPage = 10 } = filterDto;
    try {
      const apiUrl = this.configService.get<string>('idasn.apiUrl');

      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/all`, {
          headers: {
            Authorization: token,
          },
        }),
      );

      let unitKerjaData = response.data.mapData as UnitKerjaDto[];

      // Filter data jika ada parameter search
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        unitKerjaData = unitKerjaData.filter(
          (unit) =>
            unit.nama_unor.toLowerCase().includes(searchLower) ||
            unit.id_simpeg.toString().includes(searchLower) ||
            unit.id_sapk.toString().includes(searchLower),
        );
      }

      // Hitung total data dan total halaman
      const totalItems = unitKerjaData.length;
      const totalPages = Math.ceil(totalItems / perPage);

      // Pagination manual
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedData = unitKerjaData.slice(startIndex, endIndex);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data unit kerja',
        data: paginatedData,
        pagination: {
          current_page: page,
          per_page: perPage,
          total: totalItems,
          last_page: totalPages,
        },
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mengambil data unit kerja: ${error.message}`,
        data: null,
      };
    }
  }

  async findById(id: number, token: string): Promise<ApiResponse> {
    try {
      const apiUrl = this.configService.get<string>('idasn.apiUrl');
      let authToken = token;
      if (!token.startsWith('Bearer ')) {
        authToken = `Bearer ${token}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/all`, {
          headers: {
            Authorization: authToken,
          },
        }),
      );

      const unitKerjaData = response.data.mapData as UnitKerjaDto[];
      const unitKerja = unitKerjaData.find((unit) => unit.id_simpeg === id);

      if (!unitKerja) {
        throw new NotFoundException('Unit Kerja tidak ditemukan');
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data unit kerja',
        data: unitKerja,
      };
    } catch (error) {
      return {
        code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil data unit kerja',
        data: null,
      };
    }
  }

  async findByIdSapk(id: string, token: string): Promise<ApiResponse> {
    try {
      const apiUrl = this.configService.get<string>('idasn.apiUrl');
      let authToken = token;
      if (!token.startsWith('Bearer ')) {
        authToken = `Bearer ${token}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/all`, {
          headers: {
            Authorization: authToken,
          },
        }),
      );

      const unitKerjaData = response.data.mapData as UnitKerjaDto[];
      const unitKerja = unitKerjaData.find(
        (unit) => unit.id_sapk.toString() === id,
      );

      if (!unitKerja) {
        throw new NotFoundException('Unit Kerja tidak ditemukan');
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data unit kerja',
        data: unitKerja,
      };
    } catch (error) {
      return {
        code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil data unit kerja',
        data: null,
      };
    }
  }

  async findAllUnor(
    id: number,
    token: string,
    filter?: FilterUnitOrganisasiDto,
  ): Promise<ApiResponse> {
    try {
      const apiUrl = this.configService.get<string>('idasn.apiUrl');

      let authToken = token;
      if (!token.startsWith('Bearer ')) {
        authToken = `Bearer ${token}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/all`, {
          headers: {
            Authorization: authToken,
          },
        }),
      );

      const unitKerjaData = response.data.mapData as UnitKerjaDto[];
      const unitKerja = unitKerjaData.find((unit) => unit.id_simpeg === id);

      if (!unitKerja) {
        throw new NotFoundException('Unit Kerja tidak ditemukan');
      }

      const response_unor = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/${unitKerja.id_sapk}`, {
          headers: {
            Authorization: authToken,
          },
        }),
      );

      // Flatten the hierarchy into a single array list
      let flattenedUnits = this.flattenUnitHierarchy(
        response_unor.data.mapData[0],
      );

      // Apply search filter if provided
      if (filter?.search) {
        const searchTerm = filter.search.toLowerCase();
        flattenedUnits = flattenedUnits.filter((unit) =>
          unit.namaUnor?.toLowerCase().includes(searchTerm),
        );
      }

      // Apply pagination
      const page = filter?.page || 1;
      const perPage = filter?.perPage || 10;
      const totalItems = flattenedUnits.length;
      const totalPages = Math.ceil(totalItems / perPage);
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedUnits = flattenedUnits.slice(startIndex, endIndex);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data unit organisasi',
        data: paginatedUnits,
        pagination: {
          current_page: page,
          per_page: perPage,
          total: totalItems,
          last_page: totalPages,
        },
      };
    } catch (error) {
      return {
        code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil data unit kerja',
        data: null,
      };
    }
  }

  async findUnorById(
    id: number,
    token: string,
    unor_id: string,
  ): Promise<ApiResponse> {
    try {
      const apiUrl = this.configService.get<string>('idasn.apiUrl');

      let authToken = token;
      if (!token.startsWith('Bearer ')) {
        authToken = `Bearer ${token}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/all`, {
          headers: {
            Authorization: authToken,
          },
        }),
      );

      const unitKerjaData = response.data.mapData as UnitKerjaDto[];
      const unitKerja = unitKerjaData.find((unit) => unit.id_simpeg === id);

      if (!unitKerja) {
        throw new NotFoundException('Unit Kerja tidak ditemukan');
      }

      const response_unor = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/${unitKerja.id_sapk}`, {
          headers: {
            Authorization: authToken,
          },
        }),
      );

      const flattenedUnits = this.flattenUnitHierarchy(
        response_unor.data.mapData[0],
      );

      const unor = flattenedUnits.find((unit) => unit.id === unor_id);

      if (!unor) {
        throw new NotFoundException('Unor Kerja tidak ditemukan');
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data unit kerja',
        data: unor,
      };
    } catch (error) {
      return {
        code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil data unit kerja',
        data: null,
      };
    }
  }

  private flattenUnitHierarchy(rootUnit: any): any[] {
    const flattenedUnits: any[] = [];

    const processUnit = (unit: any) => {
      // Ekstrak data yang relevan dari unit
      const flattenedUnit = {
        id: unit.id,
        namaUnor: unit.namaUnor,
        namaJabatan: unit.namaJabatan,
        eselon: unit.eselon,
        asn: unit.asn,
        atasan: unit.atasan,
        induk: unit.induk,
      };

      flattenedUnits.push(flattenedUnit);

      // Proses unit bawahan secara rekursif
      if (
        unit.bawahan &&
        Array.isArray(unit.bawahan) &&
        unit.bawahan.length > 0
      ) {
        unit.bawahan.forEach(processUnit);
      }
    };

    processUnit(rootUnit);
    return flattenedUnits;
  }

  async findUnorHierarchy(id: number, token: string): Promise<ApiResponse> {
    try {
      if (!token.startsWith('Bearer ')) {
        token = `Bearer ${token}`;
      }
      const apiUrl = this.configService.get<string>('idasn.apiUrl');
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/all`, {
          headers: {
            Authorization: token,
          },
        }),
      );

      const unitKerjaData = response.data.mapData as UnitKerjaDto[];
      const unitKerja = unitKerjaData.find((unit) => unit.id_simpeg === id);

      if (!unitKerja) {
        throw new NotFoundException('Unit Kerja tidak ditemukan');
      }

      const response_unor = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/${unitKerja.id_sapk}`, {
          headers: {
            Authorization: token,
          },
        }),
      );

      const rootUnit = response_unor.data.mapData[0];
      const hierarchy = await this.recursiveUserHierachy(rootUnit, String(id), rootUnit.id, token);
      console.log("hier", hierarchy);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data unit kerja',
        data: hierarchy,
      };
    } catch (error) {
      return {
        code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil data unit kerja',
        data: null,
      };
    }
  }

  async recursiveUserHierachy(
    data: any,
    unitId: string,
    unorId: string,
    token: string
  ) {
    const pimpinan = await this.userService.findUserByJabatanAndUnor(unitId, unorId, data.namaJabatan, token);

    const bawahan = await Promise.all(
      (data.bawahan || []).map((child: any) =>
        this.recursiveUserHierachy(child, unitId, child.id, token)
      )
    );

    return {
      ...data,
      user: pimpinan.data,
      bawahan,
    };
  }

  async findAllJabatan(id: number, token: string): Promise<ApiResponse> {
    try {
      const apiUrl = this.configService.get<string>('idasn.apiUrl');

      if (!token.startsWith('Bearer ')) {
        token = `Bearer ${token}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/all`, {
          headers: {
            Authorization: token,
          },
        }),
      );

      const unitKerjaData = response.data.mapData as UnitKerjaDto[];
      const unitKerja = unitKerjaData.find((unit) => unit.id_simpeg === id);

      if (!unitKerja) {
        throw new NotFoundException('Unit Kerja tidak ditemukan');
      }

      // Perbaikan: Menggunakan endpoint /jabatan-unor/ alih-alih /jabatan/
      // dan memastikan id_sapk dikonversi ke string dengan benar
      // const idSapk = unitKerja.id_sapk.toString();
      // console.log('id sapk', idSapk);
      // console.log("url", `${apiUrl}/jabatan/${idSapk}`)

      // const response_jabatan = await firstValueFrom(
      //   this.httpService.get(
      //     `${apiUrl}/jabatan/${idSapk}`,
      //     {
      //       headers: {
      //         Authorization: token,
      //       },
      //     },
      //   ),
      // );

      const userRes = await this.userService.findUsersByUnitId(String(id),token);
      const userData = userRes.data;
      const uniqueNamaJabatan = [...new Set(userData.map(item => item.nama_jabatan))];

      console.log("response", uniqueNamaJabatan);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data jabatan',
        data: uniqueNamaJabatan,
      };
    } catch (error) {
      console.error('Error fetching jabatan:', error.response?.data || error.message);
      return {
        code: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mengambil data jabatan: ${error.response?.data?.message || error.message}`,
        data: null,
      };
    }
  }

  async getIsJpt(userId: string, token: string): Promise<boolean> {
    try {
      // 1. Ambil data profile user berdasarkan ID yang diberikan
      const userResponse = await this.userService.findUserByNip(userId, token);

      if (!userResponse.status || !userResponse.data) {
        throw new NotFoundException(`User dengan ID ${userId} tidak ditemukan`);
      }

      // 2. Dapatkan data posisi jabatan (posjab) dari profile
      const userProfile = userResponse.data;

      if (!userProfile.unor || !userProfile.unor.id) {
        throw new NotFoundException(
          'Data UNOR tidak ditemukan pada profil user',
        );
      }

      // Ambil data unit kerja
      const unorResponse = await this.findUnorHierarchy(
        userProfile.unor.induk.id_simpeg,
        token,
      );

      const unitKerjaData = unorResponse.data;
      return userProfile.nama_jabatan === unitKerjaData.namaJabatan;
    } catch (error) {
      console.error('Error in getIsJpt:', error.message);
      return false;
    }
  }
}
