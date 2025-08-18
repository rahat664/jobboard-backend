import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryApplicationsDto {
  @ApiPropertyOptional({ description: 'Free-text search (name, email, coverText)' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by job id' })
  @IsOptional() @IsString()
  jobId?: string;

  @ApiPropertyOptional({ description: 'Results to skip', default: 0 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  offset: number = 0;

  @ApiPropertyOptional({ description: 'Max results', default: 20 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit: number = 20;
}
