import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateJobDto {
  @IsString() @MinLength(3) title: string;
  @IsString() @MinLength(2) company: string;
  @IsString() @MinLength(2) location: string;
  @IsString() @MinLength(10) description: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
