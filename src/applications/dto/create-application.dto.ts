import {
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateApplicationDto {
  @IsMongoId() jobId: string;

  @IsString() @MinLength(2) name: string;
  @IsEmail() email: string;

  @IsOptional() @IsString() @MinLength(5) cvLink?: string;
  @IsOptional() @IsString() @MinLength(5) coverText?: string;
}
