import { DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

const swaggerConfig = new DocumentBuilder()
  .setTitle('Lokana Backend')
  .setDescription('API documentation for Lokana')
  .setVersion('0.1')
  .addApiKey(
    {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
    },
    'accessToken',
  )
  .build();

export function setupSwagger(app: INestApplication) {
  const document = () => SwaggerModule.createDocument(app, swaggerConfig);
  return SwaggerModule.setup('/api/v1/docs', app, document, {
    customSiteTitle: "Lokana Backend"
  });
}
