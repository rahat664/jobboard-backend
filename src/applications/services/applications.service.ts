import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application } from '../schemas/application.schema';
import { Job } from '../../jobs/schemas/job.schema';
import { CreateApplicationDto } from '../dto/create-application.dto';

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
}
