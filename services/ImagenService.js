import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

class ImagenService {
  constructor() {
    this.ai = null;
  }

  _initializeClient() {
    if (this.ai) return;
    
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log('🔑 Initializing ImagenService');
    console.log('   API Key present:', !!apiKey);
    console.log('   API Key length:', apiKey?.length || 0);
    console.log('   API Key prefix:', apiKey?.substring(0, 10) + '...');
    
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY not found in environment variables');
    }
    
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateImage(originalImage, textureImage, prompt) {
    try {
      this._initializeClient();
      
      console.log('\n🎨 Starting image generation...');
      console.log('   Model: imagen-4.0-generate-001');
      console.log('   Prompt length:', prompt.length);
      console.log('   Original image length:', originalImage?.length || 0);
      console.log('   Texture image length:', textureImage?.length || 0);
      
      // Note: As of now, Imagen API through @google/genai only supports text-to-image generation
      // Multi-image input (image editing with reference) may require different approach
      console.log('\n📡 Calling Google Imagen API...');
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1'
        }
      });

      console.log('✅ API response received');
      console.log('   Generated images count:', response.generated_images?.length || 0);
      
      // Log complete response to file for debugging
      fs.writeFileSync('imagen-response.json', JSON.stringify(response, null, 2));
      console.log('📄 Full response saved to imagen-response.json');
      
      // Check if we got any images (note: property is camelCase, not snake_case)
      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('No images generated. Response: ' + JSON.stringify(response));
      }
      
      // Get the generated image
      const generatedImage = response.generatedImages[0];
      
      console.log('📸 Generated image structure:', {
        hasImage: !!generatedImage.image,
        hasImageBytes: !!generatedImage.image?.imageBytes,
        imageBytesLength: generatedImage.image?.imageBytes?.length || 0
      });
      
      // The imageBytes is already a base64 string
      const imageBase64 = generatedImage.image?.imageBytes;
      
      if (!imageBase64) {
        throw new Error('No image bytes in response');
      }

      return {
        transformedImage: `data:image/png;base64,${imageBase64}`,
        model: 'imagen-4.0-generate-001'
      };
    } catch (error) {
      console.error('\n❌ Imagen API Error:');
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
      console.error('   Full error:', error);
      
      // Log complete error to file for debugging
      const errorLog = {
        message: error.message,
        stack: error.stack,
        fullError: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
      };
      fs.writeFileSync('imagen-error.json', JSON.stringify(errorLog, null, 2));
      console.error('📄 Full error saved to imagen-error.json');
      
      // Try to extract Google API error message
      let errorMessage = error.message;
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError.error && parsedError.error.message) {
          errorMessage = parsedError.error.message;
        }
      } catch (e) {
        // If parsing fails, use original message
      }
      
      throw new Error(`Imagen generation failed: ${errorMessage}`);
    }
  }
}

export default new ImagenService();
