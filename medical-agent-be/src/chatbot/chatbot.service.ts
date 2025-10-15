import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly embeddingsService: EmbeddingsService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async chat(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    this.logger.log('Processing chat request');

    try {
      // Step 1: Find similar medical conditions using RAG
      const similarConditions =
        await this.embeddingsService.findSimilarChunkEmbedding(
          chatRequest.message,
          3,
        );

      this.logger.log(`Found ${similarConditions.length} similar conditions`);

      // Step 2: Prepare context for OpenAI
      const medicalContext = this.prepareMedicalContext(similarConditions);

      // Step 3: Create prompt with context
      const systemPrompt = this.createSystemPrompt(medicalContext);

      // Step 4: Query OpenAI with RAG context
      const aiResponse = await this.queryOpenAI(
        systemPrompt,
        chatRequest.message,
      );

      // Step 5: Format response
      return {
        response: aiResponse,
        relatedConditions: similarConditions.map((condition) => ({
          disease: condition.disease,
          symptom: condition.symptom,
        })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing chat request:', error);
      throw new Error('Failed to process chat request');
    }
  }

  private prepareMedicalContext(
    similarConditions: Array<{ disease: string; symptom: string }>,
  ): string {
    if (similarConditions.length === 0) {
      return 'No similar medical conditions found in the database.';
    }

    const contextLines = similarConditions.map((condition, index) => {
      return `${index + 1}. Disease: ${condition.disease}\n   Symptoms: ${condition.symptom}`;
    });

    return `Related medical conditions from database:\n${contextLines.join('\n\n')}`;
  }

  private createSystemPrompt(medicalContext: string): string {
    return `You are a helpful medical assistant AI. Your role is to provide informative responses about medical symptoms and conditions based on the following medical knowledge database.

IMPORTANT DISCLAIMERS:
- Stay on topic, limit yourself to answering only about health topics, illnesses, symptoms, and diagnostic recommendations
- You are NOT a replacement for professional medical advice
- Always recommend a diagnosis to patient
- Your responses are for informational purposes only
- Never provide definitive diagnoses

MEDICAL KNOWLEDGE CONTEXT:
${medicalContext}

Based on this medical knowledge and the user's question, provide a helpful, informative response.`;
  }

  private async queryOpenAI(
    systemPrompt: string,
    userMessage: string,
  ): Promise<string> {
    try {
      this.logger.log('Sending request to OpenAI');

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const response =
        completion.choices[0]?.message?.content ||
        'Sorry, I could not generate a response.';

      this.logger.log('Successfully received response from OpenAI');
      return response;
    } catch (error) {
      this.logger.error('Error querying OpenAI:', error);
      throw new Error('Failed to get AI response');
    }
  }
}
