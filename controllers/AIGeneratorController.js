import { generatePromptFromImages } from '../services/AIService.js';

// controllers/AIGeneratorController.js
export const generateClaudePrompt = async (req, res) => {
  let { markedImage, originalImage, textureImage } = req.body;

  let prompt = await generatePromptFromImages(markedImage, originalImage, textureImage);

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
