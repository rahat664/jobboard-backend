import { Test } from '@nestjs/testing';
import { ApplicationsService } from '../src/applications/services/applications.service';
import { getModelToken } from '@nestjs/mongoose';
import {
  createApplicationModelMock,
  createJobModelMock,
} from './utils/mock-model';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let appModel: any;
  let jobModel: any;

  beforeEach(async () => {
    appModel = createApplicationModelMock([]);
    jobModel = createJobModelMock([]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: getModelToken('Application'), useValue: appModel },
        { provide: getModelToken('Job'), useValue: jobModel },
      ],
    }).compile();

    service = moduleRef.get(ApplicationsService);
  });

  it('requires cvLink or coverText', async () => {
    await expect(
      service.create({
        jobId: '64d1a47f3d6e2a001f8a1e2c',
        name: 'Jane',
        email: 'j@e.com',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws if job not found', async () => {
    await expect(
      service.create({
        jobId: '64d1a47f3d6e2a001f8a1e2c',
        name: 'Jane',
        email: 'j@e.com',
        cvLink: 'http://cv',
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates application when job exists', async () => {
    const job = await jobModel.create({
      _id: '64d1a47f3d6e2a001f8a1e2c',
      title: 'Role',
    });
    const res = await service.create({
      jobId: job._id,
      name: 'Jane',
      email: 'jane@example.com',
      cvLink: 'https://example.com/cv.pdf',
    } as any);
    expect(res.message).toBe('Application submitted');
    expect(appModel.create).toHaveBeenCalled();
  });
});
