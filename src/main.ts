import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger';
import { GlobalErrorHandler } from './common/errors/GlobalErrorHandler.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  setupSwagger(app);
  await app.useGlobalFilters(new GlobalErrorHandler());
  await app.listen(port ?? 3000);
}
bootstrap().catch((err) => {
  console.log(err);
});
