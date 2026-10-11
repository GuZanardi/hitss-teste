import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for mobile app and web clients
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global prefix /api as requested in design spec
  app.setGlobalPrefix('api');

  // Global request validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global response transformer: 200 { data, meta? }
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global exception filter: { error: { code, message, details? } }
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 3333;
  await app.listen(port);
  logger.log(`🚀 API running on http://localhost:${port}/api`);
}

bootstrap();
