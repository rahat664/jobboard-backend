// src/jobs/controllers/jobs.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from '../service/jobs.service';
import { QueryJobsDto } from '../dto/query-jobs.dto';
import { ParseObjectIdPipe } from '../../common/pipes/objectid.pipe';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';
import { CreateJobDto } from '../dto/create-job.dto';
import {
  ApiBasicAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

// Optional: lightweight response DTOs for nicer docs
class JobDto {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  isActive: boolean;
}
class PaginatedJobsDto {
  items: JobDto[];
  total: number;
  offset: number;
  limit: number;
}

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'List jobs (search & pagination)' })
  @ApiQuery({ name: 'search', required: false, example: 'NestJS Developer' })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({ description: 'Jobs fetched', type: PaginatedJobsDto })
  getAll(@Query() q: QueryJobsDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by id' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
  @ApiOkResponse({ description: 'Job found', type: JobDto })
  @ApiNotFoundResponse({ description: 'Job not found' })
  getOne(@Param('id', new ParseObjectIdPipe()) id: string) {
    return this.service.findOne(id);
  }

  // Admin-only
  @Post()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basic') // matches .addBasicAuth({ ... }, 'basic') in Swagger config
  @ApiOperation({ summary: 'Create a job (admin only)' })
  @ApiCreatedResponse({ description: 'Job created', type: JobDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() dto: CreateJobDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth('basic')
  @ApiOperation({ summary: 'Delete a job (admin only)' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
  @ApiOkResponse({ description: 'Job deleted' })
  @ApiNotFoundResponse({ description: 'Job not found' })
  remove(@Param('id', new ParseObjectIdPipe()) id: string) {
    return this.service.remove(id);
  }
}
