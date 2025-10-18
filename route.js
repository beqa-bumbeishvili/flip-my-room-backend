import express from "express";

import {
  generateClaudePrompt,
  generateNanoBananaImage
} from "./controllers/AIGeneratorController.js";

const router = express.Router();

router.get("/generate_claude_prompt", generateClaudePrompt);
router.get("/generate_nano_banana_image", generateNanoBananaImage);

export default router;