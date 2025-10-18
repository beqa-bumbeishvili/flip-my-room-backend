# FlipMyRoom Backend Implementation Plan

## **Product Overview**
Backend API service for FlipMyRoom that processes home exterior renovation visualizations using Claude AI for prompt optimization and Google Imagen for image transformation.

---

## **Architecture Overview**

### **Technology Stack**
- **Runtime:** Node.js with Express
- **AI Services:**
  - Claude Sonnet 4.5 (Anthropic) - Prompt optimization
  - Google Imagen 4 (Gemini API or Vertex AI) - Image transformation
- **Image Format:** Base64 encoding
- **Storage:** None (stateless, in-memory processing)

### **API Endpoints**
1. `POST /api/generate_claude_prompt` - Generate optimized Imagen prompt
2. `POST /api/generate_imagen_image` - Transform image with AI

---

## **Detailed API Specifications**

### **Endpoint 1: Generate Claude Prompt**

**Route:** `POST /api/generate_claude_prompt`

**Purpose:** Receive marked image and texture, generate Imagen-optimized prompt using Claude's vision capabilities

**Request Payload:**
```json
{
  "markedImage": "base64 string",     // Original image with brush marks overlay
  "originalImage": "base64 string",   // Clean original image
  "textureImage": "base64 string"     // Product texture/material image
}
```

**Claude Processing Logic:**
1. Receive all three images (marked, original, texture)
2. Use Claude Sonnet 4.5 with vision API
3. Analyze:
   - What areas are marked (from markedImage)
   - What the house looks like (from originalImage)
   - What material/texture to apply (from textureImage)
4. Generate prompt following Imagen best practices:
   - Use two-image structure (original + texture as reference)
   - Include anti-blending directives
   - Preserve everything except marked areas
   - Add quality requirements
   - Follow template: "Image 1 is [role]. Image 2 is [role]. [Explicit instruction]. [Anti-blending directive]."

**Response:**
```json
{
  "success": true,
  "prompt": "Image 1 is the house exterior to edit. Image 2 shows the siding texture to apply. Replace the marked siding areas in Image 1 with the texture from Image 2. Do NOT blend or merge these images. Keep Image 1's composition, lighting, shadows, and all other elements completely intact. Photorealistic quality.",
  "claudeModel": "claude-sonnet-4-5-20250929"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to generate prompt",
  "details": "Error message from Claude API"
}
```

---

### **Endpoint 2: Generate Imagen Image**

**Route:** `POST /api/generate_imagen_image`

**Purpose:** Transform house image using Google Imagen 4 with optimized prompt

**Request Payload:**
```json
{
  "originalImage": "base64 string",  // Clean original house image
  "textureImage": "base64 string",   // Product texture image
  "prompt": "string"                 // Optimized prompt from Claude
}
```

**Imagen Processing Logic:**
1. Receive original image, texture image, and Claude-generated prompt
2. Send both images to Google Imagen 4 via Gemini API or Vertex AI
3. Use the prompt as instruction for transformation
4. Return transformed image

**Response:**
```json
{
  "success": true,
  "transformedImage": "base64 string"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Image generation failed",
  "details": "Error message from Vertex AI"
}
```

---

## **Implementation Details**

### **Phase 1: Environment Setup**

**Environment Variables (.env):**
```env
PORT=3000
CLAUDE_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_ai_studio_api_key
NODE_ENV=development
```

**Required NPM Packages:**
```json
{
  "dependencies": {
    "express": "^5.1.0",
    "dotenv": "^17.2.3",
    "@anthropic-ai/sdk": "latest",
    "@google/generative-ai": "latest",
    "cors": "^2.8.5"
  }
}
```

**Note:** We're using `@google/generative-ai` (Gemini API SDK) instead of `@google-cloud/aiplatform` for easier setup. Alternatively, you can use Vertex AI with the aiplatform SDK.
```

---

### **Phase 2: Claude Integration**

**File:** `controllers/AIGeneratorController.js`

**Implementation Steps:**
1. Import Anthropic SDK
2. Initialize client with API key
3. Create `generateClaudePrompt` function:
   - Accept markedImage, originalImage, textureImage from request body
   - Validate all images are present
   - Convert base64 to format Claude expects
   - Send vision API request with all three images
   - Provide context about Nano Banana requirements
   - Parse response and extract optimized prompt
   - Return formatted response

**Claude API Call Structure:**
```javascript
const message = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: markedImageBase64
        }
      },
      {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: originalImageBase64
        }
      },
      {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: textureImageBase64
        }
      },
      {
        type: "text",
        text: `You are an expert at creating prompts for Google's Imagen image editing AI.

Image 1 shows a house with marked areas (red/blue overlay) indicating what needs to be changed.
Image 2 is the clean original house without markings.
Image 3 is the texture/material that should be applied to the marked areas.

Your task: Generate an Imagen prompt that will replace the marked areas with the new texture while preserving everything else.

CRITICAL REQUIREMENTS:
1. Use the two-image format: "Image X is [role]. Image Y is [role]."
2. Include anti-blending directive: "Do NOT blend or merge these images"
3. Specify preservation: "Keep Image 1's composition, lighting, shadows unchanged"
4. Add quality requirements: "Photorealistic quality"
5. Be specific about what to change: "Replace only the [marked areas]"

Follow this template:
"Image 1 is [description of what to edit]. Image 2 shows [what to use as reference]. Apply [specific instruction]. Do NOT blend or merge these images. Keep [preservation list]. [Quality requirement]."

Generate the optimized prompt now:`
      }
    ]
  }]
});
```

---

### **Phase 3: Google Imagen Integration**

**File:** `controllers/AIGeneratorController.js`

**Setup Steps:**
1. Install Google Generative AI SDK (`@google/generative-ai`)
2. Get API key from Google AI Studio
3. Initialize Gemini API client
4. Create `generateImagenImage` function

**Imagen API Call Structure (Gemini API):**
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({ model: 'imagen-4.0-generate-001' });

// Generate image using Imagen
const result = await model.generateImages({
  prompt: claudeGeneratedPrompt,
  numberOfImages: 1,
  // Note: Multi-image input support may vary
  // Check latest Gemini API docs for reference image capabilities
});

// Extract transformed image from response
const transformedImage = result.images[0].base64;
```

---

### **Phase 4: Error Handling**

**Error Scenarios:**

1. **Missing Request Data**
   - Status: 400
   - Message: "Missing required field: [fieldName]"

2. **Invalid Image Format**
   - Status: 400
   - Message: "Invalid image format. Expected base64 encoded image"

3. **Claude API Failure**
   - Status: 500
   - Message: "Failed to generate prompt"
   - Include: Claude error details

4. **Imagen API Failure**
   - Status: 500
   - Message: "Image generation failed"
   - Include: Vertex AI error details

5. **Network Timeout**
   - Status: 504
   - Message: "Request timed out"

**Error Handler Middleware:**
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
```

---

### **Phase 5: CORS Configuration**

**File:** `server.js`

**Configuration:**
```javascript
import cors from 'cors';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## **Implementation Order**

### **Sprint 1: Foundation (Day 1)**
1. Set up environment variables
2. Install required dependencies
3. Configure CORS
4. Update server.js with proper middleware
5. Create basic error handling

### **Sprint 2: Claude Integration (Day 1-2)**
6. Install Anthropic SDK
7. Implement generateClaudePrompt controller
8. Add image validation
9. Test Claude vision API with sample images
10. Refine prompt engineering instructions

### **Sprint 3: Imagen Integration (Day 2-3)**
11. Set up Google Cloud project
12. Create service account and download credentials
13. Install Google Cloud AI Platform SDK
14. Implement generateNanoBananaImage controller
15. Test image transformation pipeline

### **Sprint 4: Testing & Polish (Day 3)**
16. End-to-end testing with real images
17. Error handling refinement
18. Response time optimization
19. Documentation
20. Deployment preparation

---

## **API Credentials Setup Instructions**

### **Claude (Anthropic) Setup**
1. Go to https://console.anthropic.com/
2. Sign up/Log in
3. Navigate to "API Keys" in settings
4. Click "Create API Key"
5. Copy the key and add to `.env` as `CLAUDE_API_KEY`
6. Model to use: `claude-sonnet-4-5-20250929` (or use alias `claude-sonnet-4-5`)

### **Google Imagen (Gemini API) Setup**
1. Go to https://aistudio.google.com/
2. Sign in with your Google account
3. Click "Get API Key" in the top right
4. Create API key (or use existing one)
5. Copy the API key
6. Add to `.env` as `GOOGLE_API_KEY`
7. Model to use: `imagen-4.0-generate-001` (standard), `imagen-4.0-fast-generate-001` (faster), or `imagen-4.0-ultra-generate-001` (highest quality)

**Alternative: Vertex AI Setup** (if you prefer Google Cloud)
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable Vertex AI API
4. Set up authentication with service account
5. Use `@google-cloud/aiplatform` SDK instead

---

## **Data Flow Diagram**

```
Frontend
   ↓
   ├─→ POST /api/generate_claude_prompt
   │   ├─ markedImage (base64)
   │   ├─ originalImage (base64)
   │   └─ textureImage (base64)
   │        ↓
   │   Claude Sonnet 4.5 Vision API
   │        ↓
   │   Optimized Prompt (text)
   │        ↓
   ←─ Return {prompt: "..."}
   │
   ├─→ POST /api/generate_imagen_image
   │   ├─ originalImage (base64)
   │   ├─ textureImage (base64)
   │   └─ prompt (text)
   │        ↓
   │   Google Imagen 4 API (Gemini)
   │        ↓
   │   Transformed Image (base64)
   │        ↓
   ←─ Return {transformedImage: "base64..."}
```

---

## **File Structure**

```
/flip-my-room-backend/
├── server.js                          # Express app setup
├── route.js                           # API routes
├── controllers/
│   └── AIGeneratorController.js       # Claude & Imagen logic
├── .env                               # Environment variables
├── .gitignore                         # Exclude .env, service account key
├── package.json                       # Dependencies

└── .github/
    ├── backend-plan.md                # This file
    ├── frontend-plan.md
    ├── project.md
    └── claude-instructions-for-better-nano-banana-prompting.md
```

---

## **Testing Checklist**

### **Manual Testing**
- [ ] Claude receives all three images correctly
- [ ] Claude generates valid Imagen prompt
- [ ] Prompt follows anti-blending guidelines
- [ ] Imagen receives original + texture images
- [ ] Imagen returns transformed image
- [ ] Transformed image has good quality
- [ ] Marked areas are replaced
- [ ] Non-marked areas are preserved
- [ ] Errors are handled gracefully
- [ ] CORS works from different origin

### **Edge Cases**
- [ ] Very large images (>10MB)
- [ ] Invalid base64 strings
- [ ] Missing required fields
- [ ] API timeouts
- [ ] API rate limits
- [ ] Network failures

---

## **Performance Considerations**

### **Expected Response Times**
- Claude prompt generation: 2-5 seconds
- Imagen transformation: 5-15 seconds
- Total pipeline: 7-20 seconds

### **Optimizations** (Future)
- Image compression before API calls
- Caching common textures
- Parallel processing where possible
- Response streaming for large images

---

## **Security Considerations**

1. **API Keys:** Never commit to git, use .env
2. **Input Validation:** Validate base64 format, image size
3. **Rate Limiting:** Not implemented (hackathon scope)
4. **CORS:** Allow all origins (hackathon scope)
5. **Error Messages:** Don't expose sensitive details in production

---

## **Deployment Notes**

### **Environment Variables Checklist**
- [ ] PORT
- [ ] CLAUDE_API_KEY
- [ ] GOOGLE_API_KEY
- [ ] NODE_ENV

### **Prerequisites**
- [ ] Node.js 18+ installed
- [ ] npm packages installed
- [ ] Claude API key configured
- [ ] Google AI Studio API key obtained

### **Startup Command**
```bash
npm run dev  # Development (nodemon)
npm start    # Production (if we add start script)
```

---

## **Known Limitations**

1. **Stateless:** No image persistence, all in-memory
2. **No Rate Limiting:** Could be abused
3. **No Analytics:** No usage tracking
4. **No Caching:** Every request hits APIs
5. **No Retries:** Single attempt per API call
6. **Two-Image Requirement:** Imagen may blend despite instructions
7. **Processing Time:** 7-20 seconds per request

---

## **Future Enhancements** (Post-Hackathon)

- [ ] Add request caching (Redis)
- [ ] Implement rate limiting
- [ ] Add usage analytics
- [ ] Optimize image sizes before API calls
- [ ] Add automatic retries with exponential backoff
- [ ] Implement webhooks for async processing
- [ ] Add API authentication
- [ ] Create admin dashboard
- [ ] Add A/B testing for prompts
- [ ] Implement cost tracking

---

## **Success Criteria**

✅ Claude successfully generates optimized prompts  
✅ Imagen transforms images with new textures  
✅ Frontend can call both endpoints sequentially  
✅ Errors are handled gracefully  
✅ Response times are acceptable (<20s)  
✅ CORS allows cross-origin requests  
✅ No sensitive data is logged or exposed  

---

**Status:** Ready for implementation  
**Estimated Time:** 3 days  
**Next Step:** Sprint 1 - Foundation **setup**