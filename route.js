import express from "express";

import {
  generateClaudePrompt,
  generateNanoBananaImage
} from "./controllers/AIGeneratorController.js";

const router = express.Router();

router.post("/generate_claude_prompt", generateClaudePrompt);
router.post("/generate_nano_banana_image", generateNanoBananaImage);

export default router;