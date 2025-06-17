import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger';
import { GlobalErrorHandler } from './common/errors/GlobalErrorHandler.filter';
import "reflect-metadata";
import { Logger, ValidationPipe } from '@nestjs/common';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') ?? 3000;

  setupSwagger(app);
  app.setGlobalPrefix("/api/v1")
  await app.useGlobalFilters(new GlobalErrorHandler());
  await app.useGlobalPipes(new ValidationPipe({
    forbidNonWhitelisted: true,
    whitelist: true,
    transform: true
  }))
  await app.listen(port, () => {
    logger.log(`Application started successfully in port: ${port}`)
  });
}

bootstrap().catch((err) => {
  logger.error('Application can not start', err);
});
