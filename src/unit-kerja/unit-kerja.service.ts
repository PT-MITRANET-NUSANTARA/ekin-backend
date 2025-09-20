import { Injectable, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { UnitKerjaDto } from './dto/unit-kerja.dto';
import { FilterUnitKerjaDto } from './dto/filter-unit-kerja.dto';
import { UnitOrganisasiDto } from './dto/unit-organisasi.dto';
import { FilterUnitOrganisasiDto } from './dto/filter-unit-organisasi.dto';

// Interface untuk ResponseDto
interface ResponseDto {
  success: boolean;
  message: string;
  statusCode: number;
  data: any;
}

@Injectable()
export class UnitKerjaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
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

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data unit kerja',
        data: response_unor.data.mapData[0],
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

      console.log('id sapk', unitKerja.id_sapk.toString());

      const response_jabatan = await firstValueFrom(
        this.httpService.get(
          `${apiUrl}/jabatan/${unitKerja.id_sapk.toString()}`,
          {
            headers: {
              Authorization: token,
            },
          },
        ),
      );

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data jabatan',
        data: response_jabatan.data.mapData,
      };
    } catch (error) {
      return {
        code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil data jabatan',
        data: null,
      };
    }
  }
}
