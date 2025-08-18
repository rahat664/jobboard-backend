// src/applications/controllers/applications.controller.ts
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApplicationsService } from '../services/applications.service';
import { CreateApplicationDto } from '../dto/create-application.dto';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApplicationResponseDto } from '../dto/application-response.dto';
import { QueryApplicationsDto } from '../dto/query-applications.dto';
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @ApiOkResponse({
    description: 'Applications fetched',
    schema: {
      example: {
        items: [
          {
            id: '68a3898370c7c6c43f1adf35',
            jobId: '68a3898370c7c6c43f1adf12',
            name: 'Jane Doe',
            email: 'jane@example.com',
            cvLink: 'https://example.com/cv.pdf',
            coverText: 'I love NestJS…',
            createdAt: '2025-08-18T20:13:55.965Z',
            updatedAt: '2025-08-18T20:13:55.965Z',
          },
        ],
        total: 1,
        offset: 0,
        limit: 12,
      },
    },
  })
  list(@Query() query: QueryApplicationsDto) {
    return this.service.findAll(query);
  }
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
