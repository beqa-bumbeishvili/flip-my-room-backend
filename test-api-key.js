import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function testAPIKey() {
  console.log('🔑 Testing Google API Key...\n');
  
  const apiKey = process.env.GOOGLE_API_KEY;
  console.log('API Key present:', !!apiKey);
  console.log('API Key length:', apiKey?.length);
  console.log('API Key prefix:', apiKey?.substring(0, 15) + '...\n');
  
  if (!apiKey) {
    console.error('❌ No API key found in .env file');
    return;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Test 1: Try to list models
    console.log('📋 Test 1: Listing available models...');
    try {
      const models = await ai.models.list();
      console.log('✅ API key is valid!');
      console.log('Available models:', models.models?.length || 0);
      console.log('\nModels list:');
      models.models?.forEach(model => {
        console.log(`  - ${model.name}`);
      });
    } catch (error) {
      console.error('❌ Failed to list models:', error.message);
    }
    
    // Test 2: Try Imagen specifically
    console.log('\n\n🎨 Test 2: Testing Imagen API...');
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: 'A simple red circle on white background',
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1'
        }
      });
      console.log('✅ Imagen API works!');
      console.log('Generated images:', response.generated_images?.length || 0);
    } catch (error) {
      console.error('❌ Imagen API error:', error.message);
      console.error('\n💡 This likely means:');
      console.error('   1. Imagen API is not enabled in Google Cloud Console');
      console.error('   2. Go to: https://console.cloud.google.com/apis/library');
      console.error('   3. Search for "Generative Language API" and enable it');
      console.error('   4. Make sure billing is enabled for your project');
    }
    
  } catch (error) {
    console.error('❌ API initialization failed:', error.message);
  }
}

testAPIKey();
