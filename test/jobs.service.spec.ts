import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from '../src/jobs/schemas/job.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { JobsService } from '../src/jobs/service/jobs.service';

describe('JobsService', () => {
  let service: JobsService;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(await mongod.getUri()),
        MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
      ],
      providers: [JobsService],
    }).compile();

    service = moduleRef.get(JobsService);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('creates and reads job', async () => {
    const created = await service.create({
      title: 'Frontend Dev',
      company: 'Acme',
      location: 'Remote',
      description: 'React + TypeScript',
      isActive: true,
    });
    const list = await service.findAll({ limit: 10, offset: 0 });
    expect(list.total).toBe(1);
    const one = await service.findOne((created as any)._id.toString());
    expect(one.title).toBe('Frontend Dev');
  });
});
