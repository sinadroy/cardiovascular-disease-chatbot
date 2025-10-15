import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DiseaseSymptomDto {
  @ApiProperty({
    description: 'Name of the disease',
    example: 'Diabetes',
  })
  @IsString()
  @IsNotEmpty()
  disease: string;

  @ApiProperty({
    description: 'Description of possible symptoms',
    example: 'Increased thirst, frequent urination, extreme fatigue',
  })
  @IsString()
  @IsNotEmpty()
  symptom: string;
}
