import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('Swagger (e2e, optional)', () => {
  let app: INestApplication;
  const OLD_ENV = process.env;

  beforeAll(async () => {
    process.env = { ...OLD_ENV, SWAGGER_ENABLED: 'true' };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env = OLD_ENV;
  });

  it('/api/docs-json returns openapi json', async () => {
    await request(app.getHttpServer()).get('/api/docs-json').expect(200);
  });
});
