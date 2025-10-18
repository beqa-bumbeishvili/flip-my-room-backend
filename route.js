import express from "express";

import {
  generateClaudePrompt,
  generateImagenImage
} from "./controllers/AIGeneratorController.js";

const router = express.Router();

router.post("/generate_claude_prompt", generateClaudePrompt);
router.post("/generate_imagen_image", generateImagenImage);

export default router;