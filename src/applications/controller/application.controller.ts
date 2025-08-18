// src/applications/controllers/applications.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { ApplicationsService } from '../services/applications.service';
import { CreateApplicationDto } from '../dto/create-application.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApplicationResponseDto } from '../dto/application-response.dto';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a job application' })
  @ApiBody({ type: CreateApplicationDto })
  @ApiCreatedResponse({
    description: 'Application created successfully',
    type: ApplicationResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Validation failed (e.g., missing jobId, invalid email) or neither cvLink nor coverText provided',
  })
  create(@Body() dto: CreateApplicationDto): Promise<ApplicationResponseDto> {
    return this.service.create(
      dto,
    ) as unknown as Promise<ApplicationResponseDto>;
  }
}
