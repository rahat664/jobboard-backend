// test/jobs.service.spec.ts
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JobsService } from '../src/jobs/service/jobs.service';

// ---- Minimal mongoose-like mock for chaining (.find().sort().skip().limit().lean(), .findById().lean()) ----
function makeJobModelMock(seed: any[] = []) {
  const state = { data: [...seed] as any[] };

  const applyFilter = (items: any[], filter: any) => {
    if (!filter || Object.keys(filter).length === 0) return items;
    if (filter.$or?.length) {
      return items.filter((j) =>
        filter.$or.some((cond: any) => {
          const key = Object.keys(cond)[0];
          const val = cond[key];
          if (val?.$regex) {
            const re = new RegExp(val.$regex, val.$options);
            return re.test(j[key] ?? '');
          }
          return j[key] === val;
        }),
      );
    }
    return items;
  };

  return {
    _state: state,

    create: jest.fn((doc: any) => {
      const _id =
        doc._id ?? Math.random().toString(16).slice(2).padEnd(24, '0');
      const created = { ...doc, _id };
      state.data.push(created);
      return created;
    }),

    find: jest.fn((filter: any = {}) => {
      const items = applyFilter([...state.data], filter);

      return {
        sort: jest.fn(() => ({
          skip: jest.fn((n: number) => ({
            limit: jest.fn((m: number) => ({
              lean: jest.fn(() => items.slice(n).slice(0, m)),
              exec: jest.fn(() => items.slice(n).slice(0, m)),
            })),
          })),
        })),
        // allow direct lean without skip/limit in case service changes
        lean: jest.fn(() => items),
        exec: jest.fn(() => items),
      };
    }),

    countDocuments: jest.fn((filter: any = {}) => {
      return applyFilter([...state.data], filter).length;
    }),

    findById: jest.fn((id: string) => {
      const found =
        state.data.find((d) => String(d._id) === String(id)) ?? null;
      return {
        lean: jest.fn(() => found),
        exec: jest.fn(() => found),
      };
    }),
  };
}

describe('JobsService', () => {
  let service: JobsService;
  let jobModel: ReturnType<typeof makeJobModelMock>;

  beforeEach(async () => {
    jobModel = makeJobModelMock([]);

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

    expect(jobModel.create).toHaveBeenCalledWith(dto);
    expect(created.title).toBe('Backend Engineer');
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

    expect(jobModel.find).toHaveBeenCalled();
    expect(jobModel.countDocuments).toHaveBeenCalled();
    expect(res.total).toBe(1);
    expect(res.items[0].title).toContain('Nest');
  });

  it('findOne returns a job', async () => {
    const c = await service.create({
      title: 'X',
      company: 'Y',
      location: 'Z',
      description: '...',
      isActive: true,
    } as any);

    const one = await service.findOne(String((c as any)._id));

    expect(jobModel.findById).toHaveBeenCalled();
    expect(one.title).toBe('X');
  });
});
