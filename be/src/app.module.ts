import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {databaseConfig} from "./database/database";
import {ConfigModule, ConfigService} from '@nestjs/config';
import {UserModule} from "./modules/users/user.module";

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
    providers: [AppService],
})
export class AppModule {}
