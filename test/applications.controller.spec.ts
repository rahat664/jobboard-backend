// test/health.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { HealthModule } from '../src/health/health.module';
import { AppModule } from '../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    // mirror your main.ts behavior
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  describe('App (e2e)', () => {
    let app: INestApplication;
    const OLD_ENV = process.env;

    beforeAll(async () => {
      // Provide the env vars AppModule expects
      process.env = {
        ...OLD_ENV,
        NODE_ENV: 'test',
        PORT: '0',
        MONGODB_URI: 'mongodb://localhost:27017/jobboard_test', // or a test URI
        ADMIN_USER: 'testAdmin',
        ADMIN_PASS: 'testPass',
        SWAGGER_ENABLED: 'false',
      };

      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleRef.createNestApplication();
      await app.init();
    });

    afterAll(async () => {
      await app.close();
      process.env = OLD_ENV;
    });

    it('GET /api/healthz → 200', async () => {
      await request(app.getHttpServer()).get('/api/healthz').expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/healthz → 200 { ok: true }', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});
