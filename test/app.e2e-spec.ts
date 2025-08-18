// test/swagger.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication, Module } from '@nestjs/common';
import request from 'supertest';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

@Module({})
class DummyModule {}

describe('Swagger (e2e, minimal)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DummyModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');

    // Mount Swagger just like in main.ts (no AppModule needed)
    const config = new DocumentBuilder()
      .setTitle('Job Board API (Test)')
      .setVersion('1.0.0')
      .addBasicAuth({ type: 'http', scheme: 'basic' }, 'basic')
      .addServer('/')
      .addServer('/api')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document, {
      jsonDocumentUrl: '/api/docs-json',
      customSiteTitle: 'Job Board API Docs (Test)',
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/docs-json returns OpenAPI JSON', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);

    // Accept either parsed JSON (object) or text depending on supertest config
    const body =
      typeof res.body === 'object' && Object.keys(res.body).length
        ? res.body
        : JSON.parse(res.text);
    expect(body.openapi).toBeDefined();
    expect(body.info?.title).toMatch(/Job Board API/i);
  });
});
