import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Country } from '@/modules/locations/domain/entity/country.entity';
import { City } from '@/modules/locations/domain/entity/city.entity';
import { LocationService } from '@/modules/locations/application/location.service';
import { LocationController } from '@/modules/locations/presentation/controller/location.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Country, City])],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
