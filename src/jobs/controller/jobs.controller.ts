import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from '../service/jobs.service';
import { QueryJobsDto } from '../dto/query-jobs.dto';
import { ParseObjectIdPipe } from '../../common/pipes/objectid.pipe';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';
import { CreateJobDto } from '../dto/create-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Get()
  getAll(@Query() q: QueryJobsDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  getOne(@Param('id', new ParseObjectIdPipe()) id: string) {
    return this.service.findOne(id);
  }

  // Admin-only
  @UseGuards(BasicAuthGuard)
  @Post()
  create(@Body() dto: CreateJobDto) {
    return this.service.create(dto);
  }
}
