import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaginationDto } from '@/common/pagination/pagination.dto';

@Controller('users')
export class UsersController {
  constructor() {}
}
