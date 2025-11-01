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
      console.log('   Model: gemini-2.5-flash-image (Nano Banana)');
      console.log('   Prompt length:', prompt.length);
      console.log('   Original image provided:', !!originalImage);
      console.log('   Texture image provided:', !!textureImage);

      console.log('   Original image:', originalImage);
      console.log('   Texture image:', textureImage);
      
      // Extract base64 data from data URIs
      const extractBase64 = (dataUri) => {
        const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          throw new Error('Invalid image data URI format');
        }
        return matches[2];
      };

      const originalImageBase64 = extractBase64(originalImage);
      const originalImageMimeType = originalImage.match(/^data:([^;]+);base64,/)?.[1] || 'image/png';

      const textureImageBase64 = extractBase64(textureImage);
      const textureImageMimeType = textureImage.match(/^data:([^;]+);base64,/)?.[1] || 'image/png';
      
      console.log('\n📡 Calling Nano Banana (Gemini 2.5 Flash Image) API...');
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
          { 
            text: prompt
          },
          {
            inlineData: {
              mimeType: textureImageMimeType,
              data: textureImageBase64
            }
          },
          {
            inlineData: {
              mimeType: originalImageMimeType,
              data: originalImageBase64
            }
          }
        ],
        config: {
        }
      });

      console.log('✅ API response received');
      
      // Check if we got any candidates
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No candidates returned. Response: ' + JSON.stringify(response));
      }
      
      // Extract image from response
      const candidate = response.candidates[0];
      let imageBase64 = null;
      
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data;
          console.log('📸 Image found in response');
          console.log('   Image data length:', imageBase64?.length || 0);
          break;
        }
        if (part.text) {
          console.log('📝 AI Description:', part.text);
        }
      }
      
      if (!imageBase64) {
        throw new Error('No image data in response');
      }

      return {
        transformedImage: `data:image/png;base64,${imageBase64}`,
        model: 'gemini-2.5-flash-image'
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
