import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: 'cardiovascular-diseases',
      }),
      inject: [ConfigService],
    }),
    EmbeddingsModule,
    ChatbotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
