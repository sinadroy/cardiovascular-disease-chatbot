import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmbeddingsService } from './embeddings.service';
import { EmbeddingsController } from './embeddings.controller';
import {
  DiseaseEmbedding,
  DiseaseEmbeddingSchema,
} from './schemas/disease-embedding.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiseaseEmbedding.name, schema: DiseaseEmbeddingSchema },
    ]),
  ],
  controllers: [EmbeddingsController],
  providers: [EmbeddingsService],
})
export class EmbeddingsModule {}
