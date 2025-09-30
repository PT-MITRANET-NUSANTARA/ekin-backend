import {
  Injectable,
  HttpStatus,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { UserDto } from './dto/user.dto';
import { UnitKerjaDto } from '../unit-kerja/dto/unit-kerja.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { UnitKerjaService } from '../unit-kerja/unit-kerja.service';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => UnitKerjaService))
    private readonly unitKerjaService: UnitKerjaService,
  ) {}

  async findUsersByUnitId(
    unitId: string,
    token: string,
    filterDto?: FilterUserDto,
  ): Promise<ApiResponse> {
    const { search = '', page = 1, perPage = 10 } = filterDto || {};
    try {
      const apiUrl = this.configService.get<string>('idasn.apiUrl');
      const responseUnit = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/all`, {
          headers: {
            Authorization: token,
          },
        }),
      );

      const unitKerjaData = responseUnit.data.mapData as UnitKerjaDto[];
      const unitKerja = unitKerjaData.find(
        (unit) => unit.id_simpeg === parseInt(unitId),
      );

      if (!unitKerja) {
        throw new NotFoundException(
          `Unit kerja dengan ID ${unitId} tidak ditemukan`,
        );
      }

      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/posjab/unor/${unitKerja.id_sapk}`, {
          headers: {
            Authorization: token,
          },
        }),
      );

      if (!response.data.success) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: response.data.message || 'Gagal mengambil data user',
          data: null,
        };
      }

      let userData = response.data.mapData.data as UserDto[];

      // Filter untuk memastikan NIP user unik (tidak ada duplikat)
      const uniqueUserData = Array.from(
        new Map(userData.map((user) => [user.nip_asn, user])).values(),
      );

      // Filter data jika ada parameter search
      let filteredData = uniqueUserData;
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase();
        filteredData = uniqueUserData.filter(
          (user) =>
            user.nama_asn?.toLowerCase().includes(searchLower) ||
            user.nip_asn?.toLowerCase().includes(searchLower) ||
            user.jabatan?.toLowerCase().includes(searchLower),
        );
      }

      // Hitung total data dan total halaman
      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / perPage);

      // Pagination manual
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data user',
        data: paginatedData,
        pagination: {
          current_page: page,
          per_page: perPage,
          total: totalItems,
          last_page: totalPages,
        },
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(
          `Unit kerja dengan ID ${unitId} tidak ditemukan`,
        );
      }

      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mengambil data user: ${error.message}`,
        data: null,
      };
    }
  }

  async findUsersByUnitIdAndUnorId(
    unitId: string,
    unorId: string,
    token: string,
    filterDto?: FilterUserDto,
    user?: any,
  ): Promise<ApiResponse> {
    const { search = '', page = 1, perPage = 10 } = filterDto || {};
    try {
      const apiUrl = this.configService.get<string>('idasn.apiUrl');
      const responseUnit = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/all`, {
          headers: {
            Authorization: token,
          },
        }),
      );
      const isJpt = await this.unitKerjaService.getIsJpt(
        user?.mapData.nipBaru,
        token,
      );
      const unitKerjaHierachyRes =
        await this.unitKerjaService.findUnorHierarchy(Number(unitId), token);
      const unitKerjaHierachy = unitKerjaHierachyRes.data;
      console.log(unitKerjaHierachy);
      if (isJpt) {
        const unitKerjaHierachyRes =
          await this.unitKerjaService.findUnorHierarchy(Number(unitId), token);
        const unitKerjaHierachy = unitKerjaHierachyRes.data;
        const bawahanUnorJpt = unitKerjaHierachy.bawahan;
        const unitKerjaData = responseUnit.data.mapData as UnitKerjaDto[];
        const unitKerja = unitKerjaData.find(
          (unit) => unit.id_simpeg === parseInt(unitId),
        );
        if (!unitKerja) {
          throw new NotFoundException(
            `Unit kerja dengan ID ${unitId} tidak ditemukan`,
          );
        }

        const response = await firstValueFrom(
          this.httpService.get(`${apiUrl}/posjab/unor/${unitKerja.id_sapk}`, {
            headers: {
              Authorization: token,
            },
          }),
        );

        if (!response.data.success) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: response.data.message || 'Gagal mengambil data user',
            data: null,
          };
        }

        const userData = response.data.mapData.data as any[];

        // Filter untuk memastikan NIP user unik (tidak ada duplikat)
        const uniqueUserData = Array.from(
          new Map(userData.map((user) => [user.nip_asn, user])).values(),
        );

        // Filter berdasarkan unor ID
        let unorUsers = uniqueUserData.filter((user) => {
          return bawahanUnorJpt.some(
            (unor) =>
              // unor.id === user.unor.id &&
              unor.namaJabatan.toLowerCase() ===
              user.nama_jabatan.toLowerCase(),
          );
        });

        // Filter data jika ada parameter search
        if (search && search.trim() !== '') {
          const searchLower = search.toLowerCase();
          unorUsers = unorUsers.filter(
            (user) =>
              user.nama_asn?.toLowerCase().includes(searchLower) ||
              user.nip_asn?.toLowerCase().includes(searchLower),
          );
        }

        // Hitung total data dan total halaman
        const totalItems = unorUsers.length;
        const totalPages = Math.ceil(totalItems / perPage);

        // Pagination manual
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedData = unorUsers.slice(startIndex, endIndex);

        return {
          code: HttpStatus.OK,
          status: true,
          message: 'Berhasil mengambil data user',
          data: paginatedData,
          pagination: {
            current_page: page,
            per_page: perPage,
            total: totalItems,
            last_page: totalPages,
          },
        };
      } else {
        const unitKerjaData = responseUnit.data.mapData as UnitKerjaDto[];
        const unitKerja = unitKerjaData.find(
          (unit) => unit.id_simpeg === parseInt(unitId),
        );
        if (!unitKerja) {
          throw new NotFoundException(
            `Unit kerja dengan ID ${unitId} tidak ditemukan`,
          );
        }

        const response = await firstValueFrom(
          this.httpService.get(`${apiUrl}/posjab/unor/${unitKerja.id_sapk}`, {
            headers: {
              Authorization: token,
            },
          }),
        );

        console.log('response', response.data);

        if (!response.data.success) {
          return {
            code: HttpStatus.BAD_REQUEST,
            status: false,
            message: response.data.message || 'Gagal mengambil data user',
            data: null,
          };
        }

        const userData = response.data.mapData.data as UserDto[];

        // Filter untuk memastikan NIP user unik (tidak ada duplikat)
        const uniqueUserData = Array.from(
          new Map(userData.map((user) => [user.nip_asn, user])).values(),
        );

        // Filter berdasarkan unor ID
        let unorUsers = uniqueUserData.filter(
          (user) => user.unor.id === unorId,
        );

        // Filter data jika ada parameter search
        if (search && search.trim() !== '') {
          const searchLower = search.toLowerCase();
          unorUsers = unorUsers.filter(
            (user) =>
              user.nama_asn?.toLowerCase().includes(searchLower) ||
              user.nip_asn?.toLowerCase().includes(searchLower) ||
              user.jabatan?.toLowerCase().includes(searchLower),
          );
        }

        // Hitung total data dan total halaman
        const totalItems = unorUsers.length;
        const totalPages = Math.ceil(totalItems / perPage);

        // Pagination manual
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedData = unorUsers.slice(startIndex, endIndex);

        return {
          code: HttpStatus.OK,
          status: true,
          message: 'Berhasil mengambil data user',
          data: paginatedData,
          pagination: {
            current_page: page,
            per_page: perPage,
            total: totalItems,
            last_page: totalPages,
          },
        };
      }
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(
          `Unit kerja dengan ID ${unitId} tidak ditemukan`,
        );
      }

      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: `Gagal mengambil data user: ${error.message}`,
        data: null,
      };
    }
  }

  async findUserById(
    unitId: string,
    userId: string,
    token: string,
  ): Promise<ApiResponse> {
    try {
      const apiUrl = this.configService.get<string>('idasn.apiUrl');
      const responseUnit = await firstValueFrom(
        this.httpService.get(`${apiUrl}/unor/all`, {
          headers: {
            Authorization: token,
          },
        }),
      );

      const unitKerjaData = responseUnit.data.mapData as UnitKerjaDto[];
      const unitKerja = unitKerjaData.find(
        (unit) => unit.id_simpeg === parseInt(unitId),
      );

      if (!unitKerja) {
        throw new NotFoundException(
          `Unit kerja dengan ID ${unitId} tidak ditemukan`,
        );
      }

      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/posjab/unor/${unitKerja.id_sapk}`, {
          headers: {
            Authorization: token,
          },
        }),
      );

      if (!response.data.success) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: response.data.message || 'Gagal mengambil data user',
          data: null,
        };
      }

      const userData = response.data.mapData.data as UserDto[];

      // Filter untuk memastikan NIP user unik (tidak ada duplikat)
      const uniqueUserData = Array.from(
        new Map(userData.map((user) => [user.nip_asn, user])).values(),
      );

      const user = uniqueUserData.find((user) => user.nip_asn === userId);

      if (!user) {
        throw new NotFoundException(
          `User dengan ID ${userId} tidak ditemukan di unit kerja ${unitId}`,
        );
      }

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data user',
        data: user,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      return {
        code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil data user',
        data: null,
      };
    }
  }

  async findUserByNip(userNip: string, token: string): Promise<ApiResponse> {
    try {
      const apiUrl = this.configService.get<string>('idasn.apiUrl');

      let authToken = token;
      if (!token.startsWith('Bearer ')) {
        authToken = `Bearer ${token}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/posjab/nip/${userNip}`, {
          headers: {
            Authorization: authToken,
          },
        }),
      );

      if (!response.data.success) {
        return {
          code: HttpStatus.BAD_REQUEST,
          status: false,
          message: response.data.message || 'Gagal mengambil data user',
          data: null,
        };
      }

      const userData = response.data.mapData.data[0];

      // Filter untuk memastikan NIP user unik (tidak ada duplikat)
      // const uniqueUserData = Array.from(
      //   new Map(userData.map((user) => [user.nip_asn, user])).values(),
      // );

      return {
        code: HttpStatus.OK,
        status: true,
        message: 'Berhasil mengambil data user',
        data: userData,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(
          `User dengan NIP ${userNip} tidak ditemukan`,
        );
      }

      return {
        code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message || 'Gagal mengambil data user',
        data: null,
      };
    }
  }
}
