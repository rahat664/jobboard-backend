import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import * as process from 'node:process';
import expressBasicAuth from 'express-basic-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function parseCorsOrigins(value?: string) {
  if (!value || value.trim() === '*') return '*';
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }),
  );
  app.use(compression());

  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite
      'http://localhost:3000', // CRA/Next dev
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'https://jobboard-frontend.your-domain.tld', // prod if any
    ],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 🔹 Swagger
  if (process.env.SWAGGER_ENABLED === 'true') {
    // Optional protection for docs
    if (process.env.SWAGGER_USER && process.env.SWAGGER_PASS) {
      app.use(
        ['/api/docs', '/api/docs-json'], // <-- leading slashes
        expressBasicAuth({
          challenge: true,
          users: { [process.env.SWAGGER_USER]: process.env.SWAGGER_PASS },
        }),
      );
    }

    const config = new DocumentBuilder()
      .setTitle('Job Board API')
      .setDescription('REST API for Mini Job Board (NestJS + MongoDB)')
      .setVersion('1.0.0')
      .addBasicAuth({ type: 'http', scheme: 'basic' }, 'basic')
      .addServer('/')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document, {
      jsonDocumentUrl: '/api/docs-json',
      customSiteTitle: 'Job Board API Docs',
    });
  }

  const port = Number(process.env.PORT) || 8080;
  await app.listen(port, '0.0.0.0');

  const base = process.env.PUBLIC_URL || `http://localhost:${port}`;
  console.log(`✅ Application ready at ${base}/api`);
  if (process.env.SWAGGER_ENABLED === 'true') {
    console.log(`📚 Swagger UI: ${base}/api/docs`);
    console.log(`📄 Swagger JSON: ${base}/api/docs-json`);
  }
}

bootstrap().catch((err) => {
  console.error('❌ Error during application bootstrap:', err);
  process.exit(1);
});
