import { GoogleGenAI } from '@google/genai';

class ImagenService {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  }

  async generateImage(originalImage, textureImage, prompt) {
    try {
      // Note: As of now, Imagen API through @google/genai only supports text-to-image generation
      // Multi-image input (image editing with reference) may require different approach
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1'
        }
      });

      // Get the generated image
      const generatedImage = response.generated_images[0];
      
      // Convert to base64 if needed
      const imageBase64 = generatedImage.image.image_bytes 
        ? Buffer.from(generatedImage.image.image_bytes).toString('base64')
        : null;

      return {
        transformedImage: imageBase64 ? `data:image/png;base64,${imageBase64}` : null,
        model: 'imagen-4.0-generate-001'
      };
    } catch (error) {
      throw new Error(`Imagen generation failed: ${error.message}`);
    }
  }
}

export default new ImagenService();
