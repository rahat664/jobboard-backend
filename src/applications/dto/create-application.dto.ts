import { IsEmail, IsMongoId, IsOptional, IsString, MinLength, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the job being applied for',
    example: '64d1a47f3d6e2a001f8a1e2c',
  })
  @IsMongoId()
  jobId: string;

  @ApiProperty({
    description: 'Full name of the applicant',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Email address of the applicant',
    example: 'johndoe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Link to CV or resume (optional)',
    example: 'https://mycvbucket.s3.amazonaws.com/john-cv.pdf',
  })
  @IsOptional()
  @IsUrl({}, { message: 'cvLink must be a valid URL' })
  cvLink?: string;

  @ApiPropertyOptional({
    description: 'Short cover text (optional)',
    example: 'I am excited to apply for this role...',
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  coverText?: string;
}
