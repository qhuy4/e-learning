import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import {User} from "./entities/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {AppException} from "../../common/exception/app.exception";
import {ErrorCode} from "../../common/enum/error-code.enum";
import {PaginationDto} from "../../common/pagination/pagination.dto";
import {PaginationResponse} from "../../common/pagination/pagination.response";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
    }
    async getAll(pagination: PaginationDto): Promise<PaginationResponse<User>> {
        const page = pagination.page ?? 1;
        const limit = pagination.limit ?? 10;
        const [data, total] =
            await this.userRepository.findAndCount({
                skip: (page - 1) * limit,
                take: limit,
            });

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {id},
        });

        if (!user) {
            throw new AppException(
                ErrorCode.USER_NOT_FOUND,
                'User not found',
                404,
            );
        }

        return user;
    }


}