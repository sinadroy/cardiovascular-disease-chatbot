import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({
    description: 'AI assistant response based on medical knowledge',
    example:
      'Based on your symptoms of chest pain and shortness of breath, these could be related to several cardiovascular conditions. However, I strongly recommend consulting with a healthcare professional for proper evaluation.',
  })
  response: string;

  @ApiProperty({
    description: 'Array of similar medical conditions found in the database',
    example: [
      {
        disease: 'Coronary Artery Disease',
        symptom: 'chest pain, shortness of breath, fatigue',
      },
    ],
  })
  relatedConditions: Array<{
    disease: string;
    symptom: string;
  }>;

  @ApiProperty({
    description: 'Timestamp of the response',
    example: '2025-10-15T10:30:00Z',
  })
  timestamp: string;
}
