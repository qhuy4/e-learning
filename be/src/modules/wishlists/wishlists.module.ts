import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistOrmEntity, WishlistItemOrmEntity } from '@/modules/wishlists/infrastructure/entity/wishlist.orm-entity';
import { WishlistRepository } from '@/modules/wishlists/infrastructure/repository/wishlist.repository';
import { AdminWishlistsController } from '@/modules/wishlists/presentation/admin-wishlists.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WishlistOrmEntity, WishlistItemOrmEntity])],
  controllers: [AdminWishlistsController],
  providers: [WishlistRepository],
  exports: [WishlistRepository],
})
export class WishlistsModule {}
