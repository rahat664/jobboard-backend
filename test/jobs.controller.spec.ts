import { Test } from '@nestjs/testing';
import { JobsService } from '../src/jobs/service/jobs.service';
import { JobsController } from '../src/jobs/controller/jobs.controller';

describe('JobsController', () => {
  let controller: JobsController;
  let service: jest.Mocked<JobsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(JobsController);
    service = moduleRef.get(JobsService);
  });

  it('getAll calls service.findAll', async () => {
    service.findAll.mockResolvedValue({
      items: [],
      total: 0,
      offset: 0,
      limit: 20,
    });
    const res = await controller.getAll({} as any);
    expect(service.findAll).toHaveBeenCalled();
    expect(res.total).toBe(0);
  });

  it('getOne calls service.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1', title: 'T' } as any);
    const res = await controller.getOne('64d1a47f3d6e2a001f8a1e2c');
    expect(service.findOne).toHaveBeenCalledWith('64d1a47f3d6e2a001f8a1e2c');
    expect((res as any).title).toBe('T');
  });

  it('create calls service.create', async () => {
    service.create.mockResolvedValue({ id: '1', title: 'X' } as any);
    const res = await controller.create({ title: 'X' } as any);
    expect(service.create).toHaveBeenCalled();
    expect((res as any).id).toBe('1');
  });
});
