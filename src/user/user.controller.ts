import {
  Controller,
  Get,
  Param,
  Headers,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { FilterUserDto } from './dto/filter-user.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':nip')
  async findUserByNip(
    @Param('nip') nip: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.userService.findUserByNip(nip, token);
  }

  @Get('unit/:unitId')
  async findUsersByUnitId(
    @Param('unitId') unitId: string,
    @Headers('authorization') token: string,
    @Query() filterDto: FilterUserDto,
  ): Promise<ApiResponse> {
    return this.userService.findUsersByUnitId(unitId, token, filterDto);
  }

  @Get('unit/:unitId/unor/:unorId')
  async findUsersByUnitIdAndUnorId(
    @Param('unitId') unitId: string,
    @Param('unorId') unorId: string,
    @Headers('authorization') token: string,
    @CurrentUser() user: any,
    @Query() filterDto: FilterUserDto,
  ): Promise<ApiResponse> {
    return this.userService.findUsersByUnitIdAndUnorId(
      unitId,
      unorId,
      token,
      filterDto,
      user,
    );
  }

  @Get('unit/:unitId/user/:userId')
  async findUserById(
    @Param('unitId') unitId: string,
    @Param('userId') userId: string,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse> {
    return this.userService.findUserById(unitId, userId, token);
  }
}
