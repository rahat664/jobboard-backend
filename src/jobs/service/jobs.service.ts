import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Job, JobDocument } from '../schemas/job.schema';
import { CreateJobDto } from '../dto/create-job.dto';
import { QueryJobsDto } from '../dto/query-jobs.dto';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

  async create(dto: CreateJobDto): Promise<Job> {
    return this.jobModel.create(dto);
  }

  async findAll(q: QueryJobsDto) {
    const { search, offset = 0, limit = 20 } = q;
    const filter: FilterQuery<Job> = { isActive: true };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.jobModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      this.jobModel.countDocuments(filter),
    ]);
    return { items, total, offset, limit };
  }

  async findOne(id: string) {
    const job = await this.jobModel.findById(id).lean();
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }
}
