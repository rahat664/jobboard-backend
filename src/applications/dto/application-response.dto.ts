// src/applications/dto/application-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ApplicationResponseDto {
  @ApiProperty({ example: '66b0c2f1a2a1b9c9f1e7a321' })
  id: string;

  @ApiProperty({ example: '66b0c2f1a2a1b9c9f1e7a300' })
  jobId: string;

  @ApiProperty({ example: '2025-08-18T12:15:24.123Z' })
  createdAt: string;

  @ApiProperty({ example: 'Application submitted' })
  message: string;
}
