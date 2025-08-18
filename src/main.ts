import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { ValidationPipe } from '@nestjs/common';

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
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(compression());

  app.enableCors({
    origin: parseCorsOrigins(process.env.CORS_ORIGIN), // "*", or list like "https://a.com,https://b.com"
    credentials: false,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT) || 8080;
  await app.listen(port, '0.0.0.0');

  // Avoid hardcoding localhost in container/cloud logs
  const base = process.env.PUBLIC_URL || `http://0.0.0.0:${port}`;
  console.log(`✅ Application ready at ${base}/api`);
}

bootstrap().catch((err) => {
  console.error('❌ Error during application bootstrap:', err);
  process.exit(1);
});
