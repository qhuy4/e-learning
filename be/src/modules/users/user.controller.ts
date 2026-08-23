import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}
  @Get('all')
  async getAll() {
    return this.usersService.getAll();
  }

  @Get(':id')
  async getUser(@Param('id') id: number) {
    return this.usersService.findById(id);
  }
}
