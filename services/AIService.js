export async function generatePromptFromImagesWithDot(markedImage, textureImage, anthropicAPI) {
    try {
        // Extract base64 data and media type from data URI
        // Format: data:image/png;base64,iVBORw0KG...
        const extractImageData = (dataUri) => {
            const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
            
            if (!matches) {
                throw new Error('Invalid image data URI format');
            }
            
            return {
                media_type: matches[1],
                data: matches[2]
            };
        };

        const markedImageData = extractImageData(markedImage);
        const textureImageData = extractImageData(textureImage);
        
        // Re-encode to ensure proper base64 padding
        const decodedMarkedImage = Buffer.from(markedImageData.data, 'base64');
        markedImageData.data = decodedMarkedImage.toString('base64');
        
        const decodedTextureImage = Buffer.from(textureImageData.data, 'base64');
        textureImageData.data = decodedTextureImage.toString('base64');

        const message = await anthropicAPI.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1500,
            temperature: 0,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: textureImageData.media_type,
                                data: textureImageData.data,
                            },
                        },
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: markedImageData.media_type,
                                data: markedImageData.data,
                            },
                        },
                        {
                            type: "text",
                            text: `You are generating a prompt for Google's Gemini 2.5 Flash Image AI for an interior design transformation task.

SYSTEM ARCHITECTURE:
- INPUT (to you): Image 1 (textureImage - material reference) + Image 2 (markedImage - room with GREEN DOT markers)
- OUTPUT (from you): A complete prompt for Gemini
- CRITICAL: Gemini will receive TWO images: [Image 1 (texture), unmarked original room, your prompt]
- Gemini will NOT see the green dots - you must convert dot markers into spatial text descriptions

🎯 GREEN DOT DETECTION METHOD:
Image 2 contains small GREEN CIRCLES (color: #00FF00, pure bright green, ~30px radius) marking surfaces to transform.
Your job: Find ALL green dots, identify which surface each dot is on, list unique surfaces.

YOUR DETECTION TASK:

STEP 1 - FIND ALL GREEN DOTS in Image 2:
□ Scan the entire image for BRIGHT GREEN circles (color #00FF00 - pure green, RGB 0,255,0)
□ These are small filled circles, approximately 10-20 pixels in radius
□ Very distinct and bright - will stand out clearly against the room
□ Count how many green dots you see total
□ Note the approximate position of each dot

STEP 2 - IDENTIFY WHICH SURFACE EACH DOT IS ON:

For EACH green dot you found, determine what surface it's marking:

A. Analyze dot position and surrounding context:
   - Where is this dot in the frame? (top, bottom, left, right, center)
   - What's the surface texture/material around the dot?
   - Is it on a horizontal surface (ceiling/floor) or vertical surface (wall)?

B. Classify each dot by surface type:
   - Dot on CEILING: Top portion of frame (upper 30%) on horizontal/overhead surface
   - Dot on FLOOR: Bottom portion of frame (lower 30%) on horizontal/ground surface  
   - Dot on LEFT WALL: Left side of frame on vertical surface
   - Dot on RIGHT WALL: Right side of frame on vertical surface
   - Dot on BACK WALL: Center/back of frame on vertical surface

C. List each dot classification:
   Example: "Dot 1: on ceiling, Dot 2: on ceiling, Dot 3: on right wall, Dot 4: on floor"

STEP 3 - GROUP DOTS BY SURFACE:
□ Combine multiple dots on the same surface into one surface
□ Example: "Dots 1 & 2 both on ceiling → CEILING is marked"
□ Example: "Dot 3 on right wall → RIGHT WALL is marked"
□ Example: "Dot 4 on floor → FLOOR is marked"

STEP 4 - LIST UNIQUE MARKED SURFACES:
□ Write ONLY the unique surface names (one entry per surface, even if multiple dots)
□ Format: "CEILING + RIGHT WALL + FLOOR" or "LEFT WALL + FLOOR" or just "RIGHT WALL"
□ Do NOT list a surface if it has NO green dots on it
      
      EXAMPLES:
      
✅ CORRECT: Found 2 green dots (both on ceiling) → Output: "CEILING"
✅ CORRECT: Found 3 green dots (1 on ceiling, 2 on right wall) → Output: "CEILING + RIGHT WALL"
✅ CORRECT: Found 4 green dots (1 on floor, 2 on left wall, 1 on right wall) → Output: "FLOOR + LEFT WALL + RIGHT WALL"
✅ CORRECT: Found 1 green dot (on right wall only) → Output: "RIGHT WALL"

❌ WRONG: Found dots on ceiling and right wall, but output "CEILING + RIGHT WALL + FLOOR" (no dot on floor!)
❌ WRONG: Found 3 dots all on ceiling, but output "CEILING + CEILING + CEILING" (should be just "CEILING")
❌ WRONG: Confused left/right - dot on left side but called it right wall

CRITICAL RULES:
- ONLY include surfaces that have at least ONE green dot
- Multiple dots on same surface = list that surface ONCE
- LEFT WALL = left side of frame | RIGHT WALL = right side of frame
- Check for dots on ALL surfaces: ceiling, floor, left wall, right wall, back wall

STEP 5 - IDENTIFY ROOM ELEMENTS (Image 2):
Now that you've identified marked surfaces, just note:
- What major objects/fixtures are in the room (toilet, vanity, furniture, etc.)
- Which surfaces are unmarked (these will go in the "Keep unchanged" part)

STEP 6 - NOTE THE TEXTURE IMAGE:
Gemini will see the texture image (Image 1), so you don't need to describe it in detail.
Just refer to it as "the texture from the first image" in your prompt.

STEP 7 - CONSTRUCT THE GEMINI PROMPT (ULTRA-EXPLICIT FORMAT):

   Make it CRYSTAL CLEAR which surfaces to transform. Use explicit numbering or emphasis.

   PART 1 - ACTION (use numbered list for multiple surfaces):
   If ONE surface: "Transform the entire [surface] with the texture from the first image."
   If MULTIPLE surfaces: "Transform these surfaces with the texture from the first image: 1) the complete [surface 1], 2) the complete [surface 2], 3) the complete [surface 3]."
   
   PART 2 - PRESERVATION (1 sentence):
   "Keep all fixtures in place. Keep [unmarked surfaces] unchanged."
   
   PART 3 - QUALITY (1 sentence):
   "Photorealistic quality. Same frame size. In-place editing."

   COMPLETE FORMAT FOR MULTIPLE SURFACES:
   "Transform these surfaces with the texture from the first image: 1) [surface 1], 2) [surface 2]. Keep all fixtures in place. Keep [unmarked surfaces] unchanged. Photorealistic quality. Same frame size. In-place editing."
   
   CRITICAL: 
   - Use numbered lists (1, 2, 3) for clarity when multiple surfaces
   - Use "Transform" instead of "Apply" - more direct
   - Always say "complete" or "entire" before surface names
   - ONLY list surfaces that were actually marked (have green dots)

EXAMPLES OF COMPLETE OUTPUTS:

Example 1 - Left Wall + Right Wall ONLY (NO floor, NO ceiling):
"Transform these surfaces with the texture from the first image: 1) the entire left wall from floor to ceiling, 2) the entire right wall from floor to ceiling. Keep all fixtures in place. Keep the ceiling, floor, and back wall unchanged. Photorealistic quality. Same frame size. In-place editing."

Example 2 - Floor + Right Wall:
"Transform these surfaces with the texture from the first image: 1) the entire right wall from floor to ceiling, 2) the complete floor area. Keep all fixtures in place. Keep the ceiling, left wall, and back wall unchanged. Photorealistic quality. Same frame size. In-place editing."

Example 3 - Left Wall only:
"Transform the entire left wall from floor to ceiling with the texture from the first image. Keep all fixtures in place. Keep the ceiling, right wall, back wall, and floor unchanged. Photorealistic quality. Same frame size. In-place editing."

Example 4 - Ceiling + Left Wall + Right Wall (NO floor):
"Transform these surfaces with the texture from the first image: 1) the complete ceiling, 2) the entire left wall from floor to ceiling, 3) the entire right wall from floor to ceiling. Keep all fixtures in place. Keep the floor and back wall unchanged. Photorealistic quality. Same frame size. In-place editing."

⚠️⚠️⚠️ CRITICAL OUTPUT INSTRUCTIONS ⚠️⚠️⚠️

DO NOT include your detection steps, thinking process, or analysis in your response.
DO NOT write "STEP 1", "STEP 2", "STEP 3", "Looking at the images", "I can see", or any commentary.
DO NOT explain what you're doing or how you detected the surfaces.
DO NOT show your work or reasoning.

Return ONLY the final Gemini prompt as ONE complete paragraph.
Start directly with "The room..." or "The bathroom..." (no preamble).

Your entire output must be JUST the prompt that Gemini will read - nothing else.`
                        }
                    ]
                }
            ]
        });
  
        return message.content[0].text;
    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw new Error('Failed to generate prompt from Claude');
    }
}

export async function generatePromptFromImagesForSingleImage(markedImage, textureImage, anthropicAPI) {
    try {
        // Extract base64 data and media type from data URI
        // Format: data:image/png;base64,iVBORw0KG...
        const extractImageData = (dataUri) => {
            const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
            if (!matches) {
                throw new Error('Invalid image data URI format');
            }
            
            return {
                media_type: matches[1],
                data: matches[2]
            };
        };

        const markedImageData = extractImageData(markedImage);
        const textureImageData = extractImageData(textureImage);
        
        // Re-encode to ensure proper base64 padding
        const decodedMarkedImage = Buffer.from(markedImageData.data, 'base64');
        markedImageData.data = decodedMarkedImage.toString('base64');
        
        const decodedTextureImage = Buffer.from(textureImageData.data, 'base64');
        textureImageData.data = decodedTextureImage.toString('base64');

        const message = await anthropicAPI.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            temperature: 0,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: markedImageData.media_type,
                                data: markedImageData.data,
                            },
                        },
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: textureImageData.media_type,
                                data: textureImageData.data,
                            },
                        },
                        {
                            type: "text",
                            text: `You are generating a prompt for Google's Imagen AI (Nano Banana) for an interior design transformation task.

SYSTEM ARCHITECTURE:
- INPUT (to you): Image 1 (markedImage - the room to edit) + Image 2 (textureImage - material reference)
- OUTPUT (from you): A complete prompt that Imagen will use with ONLY Image 1
- CRITICAL: Imagen will receive ONLY Image 1 + your prompt. It will NOT see Image 2.

YOUR TASK:
Analyze both images and generate a prompt that describes the material from Image 2 in precise textual detail, so Imagen can apply it to Image 1 without seeing Image 2.

PROMPT STRUCTURE:
[Action verb] + [specific marked area description] + [detailed material description from Image 2] + [preservation instructions] + [quality requirements] + [boundary constraints]

REQUIREMENTS:

1. ANALYZE IMAGE 1 (markedImage) and identify the marked/selected area:
   - Determine what surfaces are marked for transformation (walls, floors, specific objects)
   - Describe the location precisely (e.g., "the left wall", "all floor tiles", "the cabinet doors")
   - Note the extent of the marked area (partial or full coverage, specific sections)
   - Identify the current material/appearance of the marked area
   - Spatial relationships: which parts of the room are affected (e.g., "walls from floor to ceiling", "lower half of walls")

2. ANALYZE IMAGE 2 (textureImage) and extract:
   - Base color + undertones (e.g., "warm white with cream undertones")
   - Pattern details: veining, grain, geometric patterns (direction, scale, characteristics)
   - Finish type: matte, satin, glossy, polished, brushed
   - Reflectivity level: non-reflective, slight sheen, mirror-like
   - Material type if identifiable: marble, wood, ceramic, metal, fabric, stone
   - Texture qualities: smooth, rough, polished, textured

3. DESCRIBE THE TRANSFORMATION:
   - Start with action verb: "Replace/Change/Transform"
   - Use the precise marked area description from step 1 as your target
   - Include full material description from Image 2 analysis
   - Be specific about what is marked and what will change

4. PRESERVATION INSTRUCTIONS:
   - "Keep the exact [room/bathroom/space] layout unchanged"
   - "Preserve all fixtures, furniture, lighting, and camera angle"
   - "Maintain original room dimensions and proportions"

5. QUALITY SPECIFICATIONS:
   - "Photorealistic quality"
   - "Maintain lighting consistency with existing scene"
   - "Accurate shadows and reflections matching the original"

6. BOUNDARY CONSTRAINTS:
   - "Do not extend image boundaries"
   - "Same frame size and aspect ratio"
   - "In-place editing only, no canvas expansion"

CRITICAL RULES:
- Do NOT reference "Image 2" or "reference image" in your output
- Do NOT say "use the material from Image 2"
- Write as if only the markedImage exists
- Your prompt must be completely self-contained

EXAMPLE OUTPUT:
"Replace the marked surfaces - specifically all wall tiles covering the left, right, and back walls from floor to ceiling, and all floor tiles throughout the bathroom - with white Calacatta marble featuring soft gray diagonal veining in irregular patterns, polished to a mirror-like finish with high reflectivity and subtle cream undertones. Keep the exact bathroom layout, all fixtures, furniture, lighting, and camera angle unchanged. Photorealistic quality with accurate reflections and lighting consistency. Do not extend image boundaries. Same frame size. In-place editing only."

Return ONLY the optimized prompt text, nothing else.`
                        }
                    ]
                }
            ]
        });
  
        return message.content[0].text;
    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw new Error('Failed to generate prompt from Claude');
    }
}