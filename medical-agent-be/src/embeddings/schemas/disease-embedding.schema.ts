import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DiseaseEmbeddingDocument = DiseaseEmbedding & Document;

@Schema({
  timestamps: true,
  collection: 'diseases',
})
export class DiseaseEmbedding {
  @Prop({ required: true, type: String })
  disease: string;

  @Prop({ required: true, type: String })
  symptom: string;

  @Prop({ required: true, type: [Number] })
  embedding: number[];
}

export const DiseaseEmbeddingSchema =
  SchemaFactory.createForClass(DiseaseEmbedding);
