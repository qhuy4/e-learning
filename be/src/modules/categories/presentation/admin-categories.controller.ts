import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enum/role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { GetAdminCategoriesQuery } from '@/modules/categories/application/query/get-admin-categories.query';
import { GetAdminCategoryByIdQuery } from '@/modules/categories/application/query/get-admin-category-by-id.query';
import { CreateCategoryCommand } from '@/modules/categories/application/command/create-category.command';
import { UpdateCategoryCommand } from '@/modules/categories/application/command/update-category.command';
import { DeleteCategoryCommand } from '@/modules/categories/application/command/delete-category.command';
import { CreateCategoryDto } from '@/modules/categories/presentation/dto/create-category.dto';
import { UpdateCategoryDto } from '@/modules/categories/presentation/dto/update-category.dto';
import {
  AdminCategoriesPage,
  CategoryItem,
} from '@/modules/categories/domain/repository/category.repository';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminCategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword?: string,
    @Query('parentId') parentId?: string,
    @Query('getAll') getAll?: string,
  ) {
    return this.queryBus.execute<GetAdminCategoriesQuery, AdminCategoriesPage>(
      new GetAdminCategoriesQuery({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 50,
        keyword,
        parentId: parentId !== undefined ? (parentId === '' ? null : parseInt(parentId, 10)) : undefined,
        getAll: getAll === 'true',
      }),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute<GetAdminCategoryByIdQuery, CategoryItem>(
      new GetAdminCategoryByIdQuery({ id }),
    );
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.commandBus.execute<CreateCategoryCommand, CategoryItem | null>(
      new CreateCategoryCommand({
        name: dto.name,
        slug: dto.slug,
        parentId: dto.parentId,
      }),
    );
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.commandBus.execute<UpdateCategoryCommand, CategoryItem | null>(
      new UpdateCategoryCommand({
        id,
        name: dto.name,
        slug: dto.slug,
        parentId: dto.parentId,
      }),
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.commandBus.execute(new DeleteCategoryCommand({ id }));
  }
}
