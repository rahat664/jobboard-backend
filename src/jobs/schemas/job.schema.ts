// src/jobs/schemas/job.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) company: string;
  @Prop({ required: true }) location: string;
  @Prop({ required: true }) description: string;
  @Prop({ default: true }) isActive: boolean;
}

export type JobDocument = HydratedDocument<Job>;
export const JobSchema = SchemaFactory.createForClass(Job);
