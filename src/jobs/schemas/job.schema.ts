import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, trim: true }) title: string;
  @Prop({ required: true, trim: true }) company: string;
  @Prop({ required: true, trim: true }) location: string;
  @Prop({ required: true, trim: true }) description: string;
  @Prop({ default: true }) isActive: boolean;
}

export type JobDocument = HydratedDocument<Job>;
export const JobSchema = SchemaFactory.createForClass(Job);
