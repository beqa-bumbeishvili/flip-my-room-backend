import AIService from "../services/AIService.js";

// controllers/AIGeneratorController.js
import { GoogleGenAI } from '@google/genai';

export const generateClaudePrompt = (req, res) => {
  res.json({
    success: true,
    model: "claude",
    prompt: "Sample Claude prompt generated successfully"
  });
};

export const generateImagenImage = async (req, res) => {
  try {
    const { originalImage, textureImage, prompt } = req.body;

    // Validate required fields
    if (!originalImage || !textureImage || !prompt) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        details: "originalImage, textureImage, and prompt are required"
      });
    }

    // Initialize Google GenAI client
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    // Note: As of now, Imagen API through @google/genai only supports text-to-image generation
    // Multi-image input (image editing with reference) may require different approach
    // For now, we'll generate based on the prompt
    const response = await ai.models.generateImages({
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

    res.json({
      success: true,
      transformedImage: imageBase64 ? `data:image/png;base64,${imageBase64}` : null,
      model: 'imagen-4.0-generate-001'
    });

  } catch (error) {
    console.error('Imagen API Error:', error);
    res.status(500).json({
      success: false,
      error: "Image generation failed",
      details: error.message
    });
  }
  let { markedImage, originalImage, textureImage } = req.body;

  let prompt = await AIService.generatePromptFromImages(markedImage, originalImage, textureImage);


  res.json({
    success: true,
    prompt: prompt
  });
};

export const generateNanoBananaImage = (req, res) => {
  res.json({
    success: true,
    model: "nano-banana",
    message: "Sample Nano Banana image generation simulated"
  });
};
