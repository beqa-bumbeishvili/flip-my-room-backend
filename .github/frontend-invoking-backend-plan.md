# Backend API - Quick Reference

**Base URL:** `http://localhost:3000`

## How to Use

**Step 1:** Call Claude endpoint first to get a refined prompt based on your images and initial request.

**Step 2:** Use Claude's generated prompt with Imagen endpoint to create the actual transformed image.

### About the Prompt

The `prompt` field should describe the **general transformation** you want (e.g., "modern minimalist style", "luxury hotel look", "Scandinavian design").

Claude will analyze your images and generate a detailed, optimized prompt for Imagen that includes:
- Specific materials and textures based on your texture image
- Preservation instructions for the room layout
- Quality requirements and technical details

**Your initial prompt can be simple:**
- "Modern minimalist living room"
- "Luxury spa bathroom"
- "Cozy rustic bedroom"
- "Industrial loft style"

Claude will handle the detailed prompt engineering using the uploaded images as context.

---

## Endpoint 1: Claude Sonnet 4.5 ✅ (WORKING)
**Call this FIRST** - Analyzes your images and prompt, returns an optimized prompt for image generation.
```javascript
fetch('http://localhost:3000/api/generate_claude_prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markedImage: 'data:image/png;base64,...',
    originalImage: 'data:image/png;base64,...',
    textureImage: 'data:image/png;base64,...',
    prompt: 'Modern minimalist living room'
  })
})
.then(res => res.json())
.then(data => {
  // data.transformedImage is base64 string
  // Use directly: <img src={data.transformedImage} />
})
```

**Response:**
```json
{
  "success": true,
  "transformedImage": "data:image/png;base64,...",
  "model": "claude-sonnet-4"
}
```

---

## Endpoint 2: Google Imagen 4 ✅ (WORKING)
**Call this SECOND** - Takes the Claude-generated prompt and creates the actual transformed room image.
```javascript
fetch('http://localhost:3000/api/generate_imagen_image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markedImage: 'data:image/png;base64,...',
    originalImage: 'data:image/png;base64,...',
    textureImage: 'data:image/png;base64,...',
    prompt: 'Modern minimalist living room'
  })
})
.then(res => res.json())
.then(data => {
  // data.transformedImage is base64 string
  // Use directly: <img src={data.transformedImage} />
})
```

**Response:**
```json
{
  "success": true,
  "transformedImage": "data:image/png;base64,...",
  "model": "imagen-4.0-generate-001"
}
```

**Takes ~6-10 seconds to generate.**
