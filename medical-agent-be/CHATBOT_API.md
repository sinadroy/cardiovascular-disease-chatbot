# Medical Chatbot API

This endpoint provides an AI-powered medical chatbot that uses RAG (Retrieval-Augmented Generation) to provide informed responses about medical symptoms and conditions.

## Chat Endpoint

**POST** `/chatbot/chat`

### Request Body

```json
{
  "message": "I have chest pain and shortness of breath, what could it be?"
}
```

### Response

```json
{
  "response": "Based on your symptoms of chest pain and shortness of breath, these could be related to several cardiovascular conditions such as angina, heart attack, or other cardiac issues. However, these symptoms can also be caused by non-cardiac conditions. I strongly recommend seeking immediate medical attention, especially if the chest pain is severe, persistent, or accompanied by other symptoms like nausea or sweating. A healthcare professional can perform the necessary tests and examinations to provide a proper diagnosis.",
  "relatedConditions": [
    {
      "disease": "Coronary Artery Disease",
      "symptom": "chest pain, shortness of breath, fatigue"
    },
    {
      "disease": "Myocardial Infarction",
      "symptom": "severe chest pain, shortness of breath, nausea"
    },
    {
      "disease": "Angina",
      "symptom": "chest pain, pressure, shortness of breath"
    }
  ],
  "timestamp": "2025-10-15T10:30:00Z"
}
```

### How it works (RAG Implementation)

1. **User Query**: The user sends a message with their symptoms
2. **Similarity Search**: The system uses embeddings to find the top 5 most similar medical conditions from the database
3. **Context Preparation**: The similar conditions are formatted as context for the AI
4. **AI Response**: OpenAI GPT-3.5-turbo generates a response using the medical context
5. **Enhanced Response**: The response includes both the AI's answer and the related conditions found

### Key Features

- **RAG (Retrieval-Augmented Generation)**: Uses vector similarity search to find relevant medical conditions
- **Medical Context**: Provides responses based on actual medical data in the database
- **Safety Disclaimers**: Always includes warnings about seeking professional medical advice
- **Related Conditions**: Shows which medical conditions were found to be similar to the user's query
- **Swagger Documentation**: Full API documentation available at `/api`

### Testing

1. Start the development server:
   ```bash
   npm run start:dev
   ```

2. Open Swagger UI at: `http://localhost:3000/api`

3. Use the `/chatbot/chat` endpoint to test with various medical symptom queries

### Example Queries

- "I have chest pain and shortness of breath"
- "What causes high blood pressure?"
- "I feel dizzy and have heart palpitations"
- "Symptoms of heart disease"

### Important Notes

- The AI always recommends consulting healthcare professionals
- Responses are for informational purposes only
- The system uses medical embeddings for more accurate context
- All responses include disclaimers about not replacing professional medical advice