import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({
    example: 'Backend Engineer',
    description: 'Title of the job posting (min 3 characters)',
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: 'Globex Corporation',
    description: 'Company name (min 2 characters)',
  })
  @IsString()
  @MinLength(2)
  company: string;

  @ApiProperty({
    example: 'Remote',
    description: 'Job location (min 2 characters)',
  })
  @IsString()
  @MinLength(2)
  location: string;

  @ApiProperty({
    example: 'We are looking for a NestJS developer with MongoDB experience...',
    description: 'Full job description (min 10 characters)',
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    example: true,
    description: 'Whether the job is active and visible',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
