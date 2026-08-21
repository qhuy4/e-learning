import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {databaseConfig} from "./database/database";
import {ConfigModule, ConfigService} from '@nestjs/config';
import {UserModule} from "./modules/users/user.module";
import {APP_FILTER, APP_INTERCEPTOR} from "@nestjs/core";
import {GlobalExceptionFilter} from "./common/exception/global.exception";
import {ResponseInterceptor} from "./common/exception/response.interceptor";

@Module({
    imports: [
    ConfigModule.forRoot({
        isGlobal: true,
    }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],

            useFactory: (config: ConfigService) => {
                return databaseConfig(config);
            },
        }),
        UserModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
    ],
})
export class AppModule {}
