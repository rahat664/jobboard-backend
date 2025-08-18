import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';

import { JobsModule } from './jobs/jobs.module';
import { HealthModule } from './health/health.module';
import { ApplicationsModule } from './applications/application.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'staging', 'production')
          .default('development'),
        PORT: Joi.number().default(3000),
        // ✅ accept mongodb & mongodb+srv
        MONGODB_URI: Joi.string()
          .uri({ scheme: ['mongodb', 'mongodb+srv'] })
          .required(),
        ADMIN_USER: Joi.string().required(),
        ADMIN_PASS: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGODB_URI'),
        // dbName taken from the URI path; leave undefined
        dbName: undefined,
      }),
    }),
    JobsModule,
    ApplicationsModule,
    HealthModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
