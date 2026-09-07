import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@/common/exception/response.interceptor';
import { GlobalExceptionFilter } from '@/common/exception/global.exception';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { DataSource } from 'typeorm';
import { initDatabaseTables } from '@/database/init-db';

import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const dataSource = app.get(DataSource);
  await initDatabaseTables(dataSource);

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useStaticAssets(join(process.cwd(), 'storage'), {
    prefix: '/storage/',
  });
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  const port = process.env.PORT ?? 3001;

  await app.listen(port);

  console.log(`🚀 Server running at: http://localhost:${port}`);
}

bootstrap();
