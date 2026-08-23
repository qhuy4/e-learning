import {Controller, Get, Param, Query} from "@nestjs/common";
import {UserService} from "./user.service";
import {PaginationDto} from "../../common/pagination/pagination.dto";

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UserService,
    ) {
    }
    @Get("all")
    async getAll(@Query() pagination: PaginationDto) {
        return this.usersService.getAll(pagination)
    }

    @Get(':id')
    async getUser(@Param('id') id: number) {
        return this.usersService.findById(id);
    }


}