import { Test } from '@nestjs/testing';
import { JobsService } from '../src/jobs/service/jobs.service';
import { getModelToken } from '@nestjs/mongoose';
import { createJobModelMock } from './utils/mock-model';

describe('JobsService', () => {
  let service: JobsService;
  let jobModel: any;

  beforeEach(async () => {
    jobModel = createJobModelMock([]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: getModelToken('Job'), useValue: jobModel },
      ],
    }).compile();

    service = moduleRef.get(JobsService);
  });

  it('creates a job', async () => {
    const dto = {
      title: 'Backend Engineer',
      company: 'Globex',
      location: 'Remote',
      description: 'NestJS, MongoDB',
      isActive: true,
    };
    const created = await service.create(dto as any);
    expect(created.title).toBe('Backend Engineer');
    expect(jobModel.create).toHaveBeenCalled();
  });

  it('finds jobs with pagination and search', async () => {
    // seed
    await service.create({
      title: 'Nest Dev',
      company: 'A',
      location: 'Remote',
      description: 'x',
      isActive: true,
    } as any);
    await service.create({
      title: 'React Dev',
      company: 'B',
      location: 'NY',
      description: 'y',
      isActive: true,
    } as any);

    const res = await service.findAll({
      search: 'Nest',
      offset: 0,
      limit: 10,
    } as any);
    expect(res.total).toBe(1);
    expect(res.items[0].title).toContain('Nest');
  });

  it('findOne returns a job', async () => {
    const c = await service.create({
      title: 'X',
      company: 'Y',
      location: 'Z',
      description: '...',
    } as any);
    const one = await service.findOne(String((c as any)._id));
    expect(one.title).toBe('X');
  });
});
