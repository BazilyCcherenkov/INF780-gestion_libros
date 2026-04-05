import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Gestión de Libros Leídos')
    .setDescription(
      `API REST completa para el seguimiento de libros leídos.
      
## Características
- CRUD completo de libros
- Filtros avanzados (autor, género, estado, calificación)
- Paginación configurable
- Ordenamiento por múltiples campos
- Estadísticas de lectura
- Validación de datos profesional
- Documentación Swagger/OpenAPI

## Autenticación
Esta API no requiere autenticación para desarrollo.`,
    )
    .setVersion('1.0')
    .addTag('books', 'Gestión de libros leídos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'API Gestión de Libros - Swagger',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
