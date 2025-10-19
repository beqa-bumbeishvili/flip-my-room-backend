import { generatePromptFromImages, generatePromptFromImagesForSingleImage } from '../services/AIService.js';
import ImagenService from "../services/ImagenService.js";
import Anthropic from '@anthropic-ai/sdk';

export const generateClaudePrompt = async (req, res) => {
  try {
    let { markedImage, textureImage } = req.body;

    const anthropicAPI = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
 
    // Validate required fields
    if (!markedImage || !textureImage) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        details: "markedImage, originalImage, and textureImage are required"
      });
    }

    //const prompt = await generatePromptFromImages(markedImage, textureImage, anthropicAPI); //generatePromptFromImagesForSingleImage for one image

    const prompt = await generatePromptFromImagesForSingleImage(markedImage, textureImage, anthropicAPI);
    res.json({
      success: true,
      prompt: prompt
    });
  } catch (error) {
    console.error('Claude Prompt Generation Error:', error);
    res.status(500).json({
      success: false,
      error: "Prompt generation failed",
      details: error.message
    });
  }
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

    const result = await ImagenService.generateImage(originalImage, textureImage, prompt);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Imagen Generation Error:', error);
    res.status(500).json({
      success: false,
      error: "Image generation failed",
      details: error.message
    });
  }
};