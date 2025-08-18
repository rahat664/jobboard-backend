import { Test } from '@nestjs/testing';
import { ApplicationsService } from '../src/applications/services/applications.service';
import { ApplicationsController } from '../src/applications/controller/application.controller';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let service: jest.Mocked<ApplicationsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    controller = moduleRef.get(ApplicationsController);
    service = moduleRef.get(ApplicationsService);
  });

  it('create calls service.create', async () => {
    service.create.mockResolvedValue({
      id: '66b0c2f1a2a1b9c9f1e7a321',
      jobId: '64d1a47f3d6e2a001f8a1e2c',
      createdAt: new Date(),
      message: 'Application submitted',
    });
    const res = await controller.create({
      jobId: '64d1a47f3d6e2a001f8a1e2c',
      name: 'Jane',
      email: 'j@example.com',
      cvLink: 'https://example.com/cv.pdf',
    } as any);
    expect(service.create).toHaveBeenCalled();
    expect(res.message).toBe('Application submitted');
  });
});
