import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
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
}
