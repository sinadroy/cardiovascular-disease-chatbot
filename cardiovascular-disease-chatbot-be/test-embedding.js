const axios = require('axios');

// Test data - subset from diseases.json
const testData = [
  {
    "disease": "Coronary Artery Disease (CAD)",
    "symptom": "Chest pain (angina), shortness of breath, fatigue, heart attack."
  },
  {
    "disease": "Hypertension (High Blood Pressure)",
    "symptom": "Often asymptomatic; severe cases may cause headaches, dizziness, or nosebleeds."
  }
];

async function testEmbedding() {
  try {
    console.log('Testing embedding API...');
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:3000/embeddings/diseases-symptoms', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('\n✅ Success! Response:');
    console.log('Message:', response.data.message);
    console.log('Processed items:', response.data.processed);
    console.log('Text used for embedding:', response.data.text.substring(0, 200) + '...');
    console.log('Embedding dimensions:', response.data.embedding.length);
    console.log('Tokens used:', response.data.tokenCount);
    console.log('First 5 embedding values:', response.data.embedding.slice(0, 5));
    
  } catch (error) {
    console.error('❌ Error testing embedding:', error.response?.data || error.message);
  }
}

// Run test after a small delay to ensure server is ready
setTimeout(testEmbedding, 1000);
