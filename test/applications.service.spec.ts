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

    // ✅ Add a mongoose-like .exists() mock that your service relies on
    // It returns a truthy object when the _id exists, otherwise null
    jobModel.exists = jest.fn(async (filter: any = {}) => {
      const id = filter?._id;
      if (!id) return null;
      const found = jobModel._data?.some?.(
        (d: any) => String(d._id) === String(id),
      );
      return found ? { _id: id } : null;
    });

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
    // jobModel.exists will return null for unknown id (per our mock)
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

    // jobModel.exists will now return truthy for this _id
    const res = await service.create({
      jobId: job._id,
      name: 'Jane',
      email: 'jane@example.com',
      cvLink: 'https://example.com/cv.pdf',
    } as any);

    expect(res.message).toBe('Application submitted');
    expect(appModel.create).toHaveBeenCalled();
    expect(jobModel.exists).toHaveBeenCalledWith({ _id: job._id });
  });
});
