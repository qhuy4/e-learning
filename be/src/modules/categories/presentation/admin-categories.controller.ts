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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAdminCategoriesQuery } from '@/modules/categories/application/query/get-admin-categories.query';
import { GetAdminCategoryByIdQuery } from '@/modules/categories/application/query/get-admin-category-by-id.query';
import { CreateCategoryCommand } from '@/modules/categories/application/command/create-category.command';
import { UpdateCategoryCommand } from '@/modules/categories/application/command/update-category.command';
import { DeleteCategoryCommand } from '@/modules/categories/application/command/delete-category.command';
import { CreateCategoryDto } from '@/modules/categories/presentation/dto/create-category.dto';
import { UpdateCategoryDto } from '@/modules/categories/presentation/dto/update-category.dto';

@Controller('admin/categories')
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
    return this.queryBus.execute(
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
    return this.queryBus.execute(new GetAdminCategoryByIdQuery({ id }));
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.commandBus.execute(
      new CreateCategoryCommand({
        name: dto.name,
        slug: dto.slug,
        parentId: dto.parentId,
      }),
    );
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.commandBus.execute(
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
