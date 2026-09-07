import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Country } from '@/modules/locations/domain/entity/country.entity';
import { City } from '@/modules/locations/domain/entity/city.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,

    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async getCountries(): Promise<Country[]> {
    return this.countryRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async getCitiesByCountry(countryCode: string): Promise<City[]> {
    return this.cityRepository.find({
      where: {
        countryCode,
      },
      order: {
        name: 'ASC',
      },
    });
  }
}