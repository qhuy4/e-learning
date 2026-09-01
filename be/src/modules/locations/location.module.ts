import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Country } from './domain/entity/country.entity';
import { City } from './domain/entity/city.entity';
import { LocationService } from './application/location.service';
import { LocationController } from './presentation/controller/location.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Country, City])],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
