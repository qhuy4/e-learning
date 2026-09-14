import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { WishlistRepository } from '@/modules/wishlists/infrastructure/repository/wishlist.repository';
import { AppException } from '@/common/exception/app.exception';
import { ErrorCode } from '@/common/enum/error-code.enum';

@Controller('admin/wishlists')
@UseGuards(JwtAuthGuard)
export class AdminWishlistsController {
  constructor(private readonly wishlistRepo: WishlistRepository) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.wishlistRepo.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      keyword,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const wishlist = await this.wishlistRepo.findById(id);
    if (!wishlist) throw new AppException(ErrorCode.WISHLIST_NOT_FOUND, 404);
    return wishlist;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.wishlistRepo.remove(id);
    if (!result) throw new AppException(ErrorCode.WISHLIST_NOT_FOUND, 404);
    return result;
  }

  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    const result = await this.wishlistRepo.removeItem(id, itemId);
    if (!result) throw new AppException(ErrorCode.WISHLIST_ITEM_NOT_FOUND, 404);
    return result;
  }
}
