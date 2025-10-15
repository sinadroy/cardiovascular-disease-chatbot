import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  @ApiOperation({
    summary: 'Chat with AI medical assistant',
    description:
      'Send a message to the AI medical assistant. The AI uses RAG (Retrieval-Augmented Generation) to find similar medical conditions from the database and provides informed responses based on medical knowledge.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful chat response with related medical conditions',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request format or missing message',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error or AI service unavailable',
  })
  async chat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatbotService.chat(chatRequest);
  }
}
