import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from '@/modules/locations/application/location.service';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('countries')
  getCountries() {
    return this.locationService.getCountries();
  }

  @Get('cities/:countryCode')
  getCities(@Param('countryCode') countryCode: string) {
    return this.locationService.getCitiesByCountry(countryCode.toUpperCase());
  }
}
