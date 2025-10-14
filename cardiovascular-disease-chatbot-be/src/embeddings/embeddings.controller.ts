import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { EmbeddingsService } from './embeddings.service';
import { DiseaseSymptomDto } from './dto/disease-symptom.dto';

@ApiTags('embeddings')
@Controller('embeddings')
export class EmbeddingsController {
  constructor(private readonly embeddingsService: EmbeddingsService) {}

  @Post('diseases-symptoms')
  @ApiOperation({
    summary: 'Process diseases and symptoms',
    description:
      'Receives an array of disease and symptom objects for processing',
  })
  @ApiBody({
    description: 'Array of disease and symptom objects',
    type: [DiseaseSymptomDto],
    examples: {
      example1: {
        summary: 'Sample diseases and symptoms',
        value: [
          {
            disease: 'Diabetes',
            symptom: 'Increased thirst, frequent urination, extreme fatigue',
          },
          {
            disease: 'Hypertension',
            symptom: 'High blood pressure, headaches, shortness of breath',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Successfully processed diseases and symptoms and saved to MongoDB Atlas',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Success message',
        },
        processed: {
          type: 'number',
          description: 'Number of disease-symptom pairs processed',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async processDiseaseSymptoms(
    @Body() diseaseSymptoms: DiseaseSymptomDto[],
  ): Promise<{
    message: string;
    processed: number;
  }> {
    return this.embeddingsService.processDiseasesSymptoms(diseaseSymptoms);
  }

  @Get('vector-search')
  @ApiOperation({
    summary: 'Search for similar diseases',
    description:
      'Finds similar diseases based on a query using vector similarity search',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query describing symptoms or disease conditions',
    example: 'chest pain and shortness of breath',
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of similar results to return (default: 5)',
    example: 5,
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully found similar diseases',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          disease: {
            type: 'string',
            description: 'Name of the disease',
          },
          symptom: {
            type: 'string',
            description: 'Description of symptoms',
          },
          _id: {
            type: 'string',
            description: 'Database ID',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Missing or invalid query parameter',
  })
  async searchSimilarDiseases(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    if (!query) {
      throw new BadRequestException('Query parameter "q" is required');
    }

    const topK = limit && limit > 0 ? Math.min(limit, 20) : 5; // Cap at 20 results
    return this.embeddingsService.findSimilarChunkEmbedding(query, topK);
  }
}
