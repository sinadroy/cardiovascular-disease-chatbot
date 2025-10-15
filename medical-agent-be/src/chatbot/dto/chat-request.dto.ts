import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({
    description: 'User message or question about medical symptoms',
    example: 'I have chest pain and shortness of breath, what could it be?',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, {
    message: 'Message is too long. Maximum 1000 characters allowed.',
  })
  message: string;
}
