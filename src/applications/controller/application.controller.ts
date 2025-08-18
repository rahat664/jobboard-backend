import { Body, Controller, Post } from '@nestjs/common';
import { ApplicationsService } from '../services/applications.service';
import { CreateApplicationDto } from '../dto/create-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  create(@Body() dto: CreateApplicationDto) {
    return this.service.create(dto);
  }
}
