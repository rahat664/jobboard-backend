import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from '../schemas/application.schema';
import { Job } from '../../jobs/schemas/job.schema';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { QueryApplicationsDto } from '../dto/query-applications.dto';

type ApplicationResponse = {
  id: string;
  jobId: string;
  createdAt: Date;
  message: 'Application submitted';
};

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private appModel: Model<Application>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
  ) {}

  async create(dto: CreateApplicationDto): Promise<ApplicationResponse> {
    if (!dto.cvLink && !dto.coverText) {
      throw new BadRequestException('Provide at least cvLink or coverText');
    }

    const jobExists = await this.jobModel.exists({ _id: dto.jobId });
    if (!jobExists) throw new NotFoundException('Job not found');

    const created = await this.appModel.create({
      job: new Types.ObjectId(dto.jobId),
      name: dto.name,
      email: dto.email,
      cvLink: dto.cvLink,
      coverText: dto.coverText,
      // do NOT set createdAt manually; timestamps handle it
    });

    return {
      id: created._id.toString(),
      jobId: dto.jobId,
      createdAt: created.createdAt!, // defined via timestamps
      message: 'Application submitted',
    };
  }

  async findAll(q: QueryApplicationsDto) {
    const { search, jobId, offset = 0, limit = 20 } = q;

    const filter: FilterQuery<ApplicationDocument> = {};
    if (jobId) filter.jobId = jobId;

    if (search && search.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { coverText: rx }];
    }

    const [items, total] = await Promise.all([
      this.appModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean()
        .exec(),
      this.appModel.countDocuments(filter),
    ]);

    // Map _id → id for frontend convenience
    const mapped = items.map((x: any) => ({ id: String(x._id), ...x }));
    return { items: mapped, total, offset, limit };
  }
}
