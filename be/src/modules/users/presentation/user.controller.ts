import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUsersQuery } from '@/modules/users/application/query/get-users.query';
import { PaginationDto } from '@/common/pagination/pagination.dto';
import { GetUserByIdQuery } from '@/modules/users/application/query/get-user-by-id.query';
import { CreateUserCommand } from '@/modules/users/application/command/create-user.command';
import { UpdateUserDto } from '@/modules/users/presentation/dto/common/update-user.dto';
import { DeleteUserCommand } from '@/modules/users/application/command/delete-user.command';
import {
  CreateUserDto,
  mapUserRoleFromApi,
  mapUserStatusFromApi,
} from '@/modules/users/presentation/dto/common/create-user.dto';
import { BlockUserCommand } from '@/modules/users/application/command/block-user.command';
import { UnblockUserCommand } from '@/modules/users/application/command/unblock-user.command';
import { BlockUserDto } from '@/modules/users/presentation/dto/common/block-user.dto';
import { UpdateUserCommandMapper } from '@/modules/users/presentation/mapper/update-user.mapper';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarUploadConfig } from '@/config/multer.config';

@Controller('admin/users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll(@Query() query: PaginationDto, @Query('keyword') keyword?: string) {
    const data = {
      page: query.page,
      limit: query.limit,
      keyword,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    return this.queryBus.execute(new GetUsersQuery(data));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    const data = {
      id: id,
    };
    return this.queryBus.execute(new GetUserByIdQuery(data));
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.commandBus.execute(
      new CreateUserCommand({
        name: dto.name,
        email: dto.email,
        password: dto.password,
        role: dto.role ? mapUserRoleFromApi(dto.role) : undefined,
        status: dto.status ? mapUserStatusFromApi(dto.status) : undefined,
      }),
    );
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar', avatarUploadConfig))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {

    return this.commandBus.execute(
      UpdateUserCommandMapper.toCommand(id, dto, avatar),
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    const data = {
      id: id,
    };
    return this.commandBus.execute(new DeleteUserCommand(data));
  }

  @Post(':id/block')
  block(@Param('id', ParseIntPipe) id: number, @Body() body: BlockUserDto) {
    return this.commandBus.execute(
      new BlockUserCommand({
        id,
        reason: body.reason,
      }),
    );
  }

  @Post(':id/unblock')
  unblock(@Param('id', ParseIntPipe) id: number) {
    const data = {
      userId: id,
    };

    return this.commandBus.execute(new UnblockUserCommand(data));
  }
}
