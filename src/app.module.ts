import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/application.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().default('development'),
        PORT: Joi.number().default(3000),
        MONGODB_URI: Joi.string().uri().required(),
        ADMIN_USER: Joi.string().required(),
        ADMIN_PASS: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGODB_URI'),
        dbName: undefined, // use db in URI
      }),
    }),
    JobsModule,
    ApplicationsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
