import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { DiseaseSymptomDto } from './dto/disease-symptom.dto';
import {
  DiseaseEmbedding,
  DiseaseEmbeddingDocument,
} from './schemas/disease-embedding.schema';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(DiseaseEmbedding.name)
    private readonly diseaseEmbeddingModel: Model<DiseaseEmbeddingDocument>,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async processDiseasesSymptoms(diseaseSymptoms: DiseaseSymptomDto[]): Promise<{
    message: string;
    processed: number;
  }> {
    this.logger.log('=== Processing diseases and symptoms ===');
    this.logger.log(`Received ${diseaseSymptoms.length} items to process`);

    // Check if data already exists in the collection
    const existingCount = await this.diseaseEmbeddingModel.countDocuments();

    if (existingCount > 0) {
      this.logger.log(
        `Found ${existingCount} existing documents in the collection. Skipping processing.`,
      );
      return {
        message: 'Data already exists in the database. Processing skipped.',
        processed: 0,
      };
    }

    const diseaseSymptomEmbeddings = await Promise.all(
      diseaseSymptoms.map(async (item) => ({
        disease: item.disease,
        symptom: item.symptom,
        embedding: await this.createEmbedding(
          `Disease: ${item.disease}. Symptoms: ${item.symptom}`,
        ),
      })),
    );

    // Save embeddings to MongoDB Atlas
    await this.saveEmbeddingToAtlas(diseaseSymptomEmbeddings);

    this.logger.log('=== Processing completed successfully ===');

    return {
      message:
        'Diseases and symptoms processed and saved to Atlas successfully',
      processed: diseaseSymptoms.length,
    };
  }

  async createEmbedding(textsToEmbed: string): Promise<number[]> {
    try {
      this.logger.log(
        `Creating embedding for text: ${textsToEmbed.substring(0, 200)}...`,
      );

      // Create embedding using OpenAI API
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: textsToEmbed,
      });

      const embedding = response.data[0].embedding;
      const tokenCount = response.usage.total_tokens;

      this.logger.log(
        `Successfully created embedding with ${embedding.length} dimensions using ${tokenCount} tokens`,
      );

      return embedding;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error creating embedding:', errorMessage);
      throw new Error(`Failed to create embedding: ${errorMessage}`);
    }
  }

  async saveEmbeddingToAtlas(
    diseaseSymptomEmbeddings: {
      disease: string;
      symptom: string;
      embedding: number[];
    }[],
  ): Promise<void> {
    try {
      this.logger.log(
        `Saving ${diseaseSymptomEmbeddings.length} embeddings to MongoDB Atlas`,
      );

      // Insert all embeddings into the diseases collection
      const result = await this.diseaseEmbeddingModel.insertMany(
        diseaseSymptomEmbeddings,
      );

      this.logger.log(
        `Successfully saved ${result.length} disease embeddings to Atlas`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error saving embeddings to Atlas:', errorMessage);
      throw new Error(`Failed to save embeddings to Atlas: ${errorMessage}`);
    }
  }

  async findSimilarChunkEmbedding(
    query: string,
    topK = 5,
  ): Promise<Array<{ disease: string; symptom: string }>> {
    this.logger.log(`Finding top ${topK} similar embeddings in the database`);

    const queryEmbedding = await this.createEmbedding(query);

    // Fetch all embeddings from the database
    const allEmbeddings = await this.diseaseEmbeddingModel.aggregate([
      {
        $vectorSearch: {
          queryVector: queryEmbedding,
          path: 'embedding',
          numCandidates: 100, // Number of candidates to consider for similarity search
          limit: topK,
          index: 'default', // Ensure this matches your index name
        },
      },
    ]);

    return allEmbeddings as Array<{ disease: string; symptom: string }>;
  }
}
