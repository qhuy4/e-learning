import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@/common/exception/response.interceptor';
import { GlobalExceptionFilter } from '@/common/exception/global.exception';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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
    origin: ['http://localhost:5173', 'http://localhost:5174'],
  });
  const port = process.env.PORT ?? 3001;

  await app.listen(port);

  console.log(`🚀 Server running at: http://localhost:${port}`);
}

bootstrap();
