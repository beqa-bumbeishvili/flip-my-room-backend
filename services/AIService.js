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
[Action verb] + [specific marked area description] + [detailed material description from Image 2] + [preservation instructions] + [quality specifications] + [boundary constraints]

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

REVISED EXAMPLES OF COMPLETE OUTPUTS:

Example 1 - Right Wall only:
"Take the texture/material shown in the first image and use it as a repeating tile pattern to completely cover the entire right wall surface in the second image. Tile this pattern repeatedly across the full right wall from floor to ceiling with no gaps."

Example 2 - Left Wall + Right Wall:
"Take the texture/material shown in the first image and use it as a repeating tile pattern to completely cover the entire left wall surface in the second image as well as the entire right wall surface. Tile this pattern repeatedly across the full left wall and right wall from floor to ceiling with no gaps."

Example 3 - Right Wall + Floor:
"Take the texture/material shown in the first image and use it as a repeating tile pattern to completely cover the entire right wall surface in the second image as well as the entire floor surface. Tile this pattern repeatedly across the full right wall from floor to ceiling and across the full floor with no gaps."

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

export async function generatePromptWithRepeatedImage(markedImage, textureImage, anthropicAPI) {
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
   - Dot on FRONT WALL: Center/back of frame on vertical surface (closest to viewer, if identifiable)

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
- Check for dots on ALL surfaces: ceiling, floor, left wall, right wall, front wall

STEP 5 - IDENTIFY ROOM ELEMENTS (Image 2):
Now that you've identified marked surfaces, just note:
- What major objects/fixtures are in the room (toilet, vanity, furniture, etc.)
- Which surfaces are unmarked (these will go in the "Keep unchanged" part)

STEP 6 - CONSTRUCT THE GEMINI PROMPT (SIMPLE & CLEAR FORMAT):

   Keep it SHORT and NATURAL. Use the "Take... and tile it repeatedly" format.
   DO NOT use "image 1" or "image 2" - use clearer references.
   Make it CRYSTAL CLEAR that the texture should be repeated as a tiled pattern.

   COMPLETE FORMAT:
   
   FOR SINGLE SURFACE:
   "Take the texture/material shown in the first image and use it as a repeating tile pattern to completely cover the entire [surface 1] surface in the second image. Tile this pattern repeatedly across the full [surface 1] from floor to ceiling with no gaps."

   FOR TWO SURFACES:
   "Take the texture/material shown in the first image and use it as a repeating tile pattern to completely cover the entire [surface 1] surface in the second image as well as the entire [surface 2] surface. Tile this pattern repeatedly across the full [surface 1] and [surface 2] from floor to ceiling with no gaps."

   CRITICAL PHRASING RULES:
   - Use "the texture/material shown in the first image" (covers tiles, wood, wallpaper, etc.)
   - Use "use it as a repeating tile pattern" (makes tiling action explicit)
   - Use "to completely cover the entire [surface] surface"
   - Use "Tile this pattern repeatedly across the full [surface]"
   - End with "from floor to ceiling with no gaps"
   - Always use "the entire" and "the full" for emphasis
   - Keep it natural and flowing
   - ONLY list surfaces that were actually marked (have green dots)

REVISED EXAMPLES OF COMPLETE OUTPUTS:

Example 1 - Right Wall only:
"Take the texture/material shown in the first image and use it as a repeating tile pattern to completely cover the entire right wall surface in the second image. Tile this pattern repeatedly across the full right wall from floor to ceiling with no gaps."

Example 2 - Left Wall + Right Wall:
"Take the texture/material shown in the first image and use it as a repeating tile pattern to completely cover the entire left wall surface in the second image as well as the entire right wall surface. Tile this pattern repeatedly across the full left wall and right wall from floor to ceiling with no gaps."

Example 3 - Right Wall + Floor:
"Take the texture/material shown in the first image and use it as a repeating tile pattern to completely cover the entire right wall surface in the second image as well as the entire floor surface. Tile this pattern repeatedly across the full right wall from floor to ceiling and across the full floor with no gaps."

🚨🚨🚨 EXTREMELY CRITICAL OUTPUT INSTRUCTIONS 🚨🚨🚨

YOUR RESPONSE MUST BE ONLY THE FINAL PROMPT - NOTHING ELSE!

❌ DO NOT WRITE: "STEP 1", "STEP 2", "STEP 3", "STEP 4", "STEP 5", "STEP 6"
❌ DO NOT WRITE: "Looking at the images", "I found", "I can see", "This appears"
❌ DO NOT WRITE: "GREEN DOT DETECTION", "DOT SURFACE IDENTIFICATION", "GROUPING"
❌ DO NOT WRITE: "GEMINI PROMPT:", or any label before the prompt
❌ DO NOT explain your process, reasoning, or analysis
❌ DO NOT describe the room or what you see
❌ DO NOT show your work

✅ WRITE ONLY: The prompt sentence that starts with "Take the texture/material shown in the first image..."

Your ENTIRE response must be ONE OR TWO SENTENCES ONLY.
No headers, no labels, no explanations, no analysis - JUST THE PROMPT.
Start directly with "Take the texture/material shown in the first image..." - nothing before or after.`
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

export async function generatePromptFromImageOptimizedForFloor(markedImage, textureImage, anthropicAPI) {
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
                            text: `You are generating a prompt for Google's Flash Image 2.5 AI (Nano Banana) for an interior design transformation task.
SYSTEM ARCHITECTURE:

INPUT (to you): Image 1 (textureImage - material reference) + Image 2 (the room to edit)
OUTPUT (from you): A complete prompt that Nano Banana will use with ONLY Image 2

YOUR TASK:
Analyze both images and generate a prompt that instructs Nano Banana to directly copy the material from Image 1 and apply it to Image 2, WITHOUT describing the texture's appearance in detail.
PROMPT STRUCTURE:
[Action verb] + [floor area description from image2] + [direct reference to image 1 without description] + [format/orientation instructions if non-square] + [room dimensions if helpful] + [perspective instructions if non-square] + [preservation instructions] + [quality specifications] + [boundary constraints] + [scaling instructions]
REQUIREMENTS:

ANALYZE IMAGE 2 (room to edit) and identify the floor area:

Determine the floor surface and estimate room dimensions if relevant
Describe the floor precisely (e.g., "entire floor surface", "all floor tiles")
Note the extent of the floor area (partial or full coverage, specific sections)
Identify the current material/appearance of the floor
Spatial relationships: which parts of the room are affected


ANALYZE PROVIDED TILE DIMENSIONS:

Check if tile is square (e.g., 15x15cm, 50x50cm) or non-square (e.g., 30x90cm, 20x60cm)
For SQUARE tiles: Keep prompt simple and general
For NON-SQUARE tiles: Add specific orientation, perspective, and directional instructions with HEAVY EMPHASIS


DO NOT DESCRIBE IMAGE 1 (textureImage):

Simply reference "the exact texture and material shown in image 1"
Let the AI interpret image 1 directly
Use phrases like: "copy image 1 exactly", "use image 1 as the direct reference"
Mention: "Rotating the texture is OK" (especially for non-square)


DESCRIBE THE TRANSFORMATION:

Start with action verb: "Replace/Change/Transform"
Use the precise floor description from step 1 as your target
Reference image 1 directly: "by applying the exact texture from image 1"


FORMAT & ORIENTATION INSTRUCTIONS (ONLY FOR NON-SQUARE TILES):
When aspect ratio is NOT 1:1, add these instructions with MAXIMUM EMPHASIS:

Use terminology: "planks" or "elongated panels" instead of "tiles"
CRITICAL marker at beginning: "CRITICAL LAYOUT: This is NOT square format."
Specify orientation multiple times: "with their long axis running front-to-back (toward and away from camera)"
Clarify dimensions repeatedly:

"[LONG]cm dimension runs [DIRECTION]"
"[SHORT]cm dimension runs [PERPENDICULAR DIRECTION]"
"Each plank measures [SHORT]cm × [LONG]cm (NOT [LONG]cm × [LONG]cm)"


Use multiple metaphors: "oriented like floorboards/wood planks running deep into the room"
Emphasize ratio: "maintaining a [ratio] aspect ratio"
Add strong perspective notes:

"PERSPECTIVE EMPHASIS: Due to camera angle, planks in foreground appear less elongated"
"Planks receding toward back wall show maximum elongation effect"
"The lengthwise direction creates strong vanishing lines toward the back"


Include room dimensions: "The room measures approximately [WIDTH]m wide by [DEPTH]m deep"
Reinforce at end: "Remember: planks are [SHORT]cm wide × [LONG]cm long, NOT square"

For square tiles, skip all orientation instructions
PRESERVATION INSTRUCTIONS:

"Keep room layout, fixtures, lighting, and camera angle unchanged"
Keep brief


QUALITY SPECIFICATIONS:

"Photorealistic quality"
Keep minimal


BOUNDARY CONSTRAINTS:

"Same frame size"
Keep minimal


SCALING INSTRUCTIONS:
Formula: [SCALE]-SCALE, [FREQUENCY]-FREQUENCY texture repetition - each tile/plank is [SIZE]cm x [SIZE]cm (or [W]cm x [L]cm for non-square)
Scale + Frequency pairs:

3-15cm: MICRO to SMALL-SCALE, VERY HIGH to HIGH-FREQUENCY
15-30cm: SMALL-SCALE, HIGH-FREQUENCY (default for square)
30-50cm: MEDIUM-SCALE, MODERATE-FREQUENCY
50-100cm: LARGE-SCALE, LOW-FREQUENCY

Always add: "Cut planks/tiles at all edges (walls, corners) to ensure complete floor coverage with no gaps - every part of floor must be covered"

CRITICAL RULES:

Your prompt must be completely self-contained
DO NOT describe the texture appearance - only reference image 1 directly
Keep prompts CONCISE for square tiles (~80-120 words)
For non-square tiles, ADD MAXIMUM EMPHASIS with repetition (~200-250 words)
Default is 15cm x 15cm square tiles unless specified otherwise
Use "tiles" for square formats, "planks/panels" for non-square formats
For non-square: Repeat orientation instructions 3-4 times using different phrasings

EXAMPLE OUTPUT (Square tiles - 50x50cm):
"Replace the entire floor surface by applying the exact texture and material shown in image 1 as repeating tiles. Use image 1 as the direct reference - copy its appearance exactly without interpretation. Rotating the texture is OK. Apply MEDIUM-SCALE, MODERATE-FREQUENCY texture repetition - each tile measuring 50cm x 50cm with visible grout lines. Cut tiles at all edges to ensure complete floor coverage with no gaps. Keep room layout, fixtures, lighting, and camera angle unchanged. Photorealistic quality. Same frame size."
EXAMPLE OUTPUT (Non-square planks - 35x90cm):
"Replace the entire floor by applying the exact texture from image 1 as repeating elongated planks. CRITICAL LAYOUT: This is NOT square format. The planks run with their long axis front-to-back (toward and away from camera), like floorboards running deep into the room. The room measures approximately 3 meters wide by 3.5 meters deep. Use image 1 as direct reference - copy exactly. Rotating the texture is OK. Each plank measures 35cm wide × 90cm long (maintaining a 1:2.6 aspect ratio). The 90cm LONG dimension runs front-to-back (deep into room). The 35cm SHORT dimension runs left-to-right (parallel to window). Left-right is always SHORT (35cm). Front-to-back is always LONG (90cm) - planks stretch deeply toward the back wall. PERSPECTIVE EMPHASIS: Due to camera angle, planks in foreground appear less elongated. Planks receding toward window/back wall show maximum elongation effect, creating strong vanishing lines toward the back. The lengthwise orientation creates depth lines running away from camera. MEDIUM-SCALE, MODERATE-FREQUENCY repetition with visible grout lines separating planks. Cut planks at all edges (walls, corners) to ensure complete floor coverage with no gaps. Remember: planks are 35cm wide × 90cm long elongated format, NOT 35cm × 35cm square. Keep room layout, fixtures, lighting, and camera angle unchanged. Photorealistic quality. Same frame size."
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

export async function generatePromptFromImageOptimizedForFloorAndDimensions(markedImage, textureImage, anthropicAPI) {
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
                            text: `You are generating a prompt for Google's Flash Image 2.5 AI (Nano Banana) for an interior design transformation task.

SYSTEM ARCHITECTURE:
- INPUT (to you): Image 1 (textureImage - material reference) + Image 2 (the room to edit)
- OUTPUT (from you): A complete prompt that Nano Banana will use with ONLY Image 2 

YOUR TASK:
Analyze both images and generate a prompt that instructs Nano Banana to directly copy the material from Image 1 and apply it to Image 2, WITHOUT describing the texture's appearance in detail.

PROMPT STRUCTURE:
[Action verb] + [floor area description from image2] + [direct reference to image 1 without description] + [preservation instructions] + [quality specifications] + [boundary constraints] + [scaling instructions]

REQUIREMENTS:

1. ANALYZE IMAGE 2 (room to edit) and identify the floor area:
   - Determine the floor surface, try identify specific/close dimensions like length and area
   - Describe the floor precisely ( "all floor tiles")
   - Note the extent of the floor area (partial or full coverage, specific sections, in relation to residing objects)
   - Identify the current material/appearance of the floor
   - Spatial relationships: which parts of the room are affected (e.g., "floors under the sofa")

2. DO NOT DESCRIBE IMAGE 1 (textureImage):
   - Instead of describing color, pattern, finish, or material type
   - Simply reference "the exact texture and material shown in image 1"
   - Let the AI interpret image 1 directly
   - Use phrases like: "copy image 1 exactly", "use image 1 as the direct reference", "match it precisely"

3. DESCRIBE THE TRANSFORMATION:
   - Start with action verb: "Replace/Change/Transform"
   - Use the precise floor description from step 1 as your target
   - Reference image 1 directly: "by taking the exact texture and material shown in image 1"
   - Emphasize direct copying: "Use image 1 as the direct reference - copy its color, pattern, veining, finish, and reflectivity exactly without interpretation"
   - Add: "The floor material must look identical to what is shown in image 1 - match it precisely"

4. PRESERVATION INSTRUCTIONS:
   - "Keep the exact [room/bathroom/space] layout unchanged"
   - "Preserve all fixtures, furniture, lighting, and camera angle"
   - "Maintain original room dimensions and proportions"

5. QUALITY SPECIFICATIONS:
   - "Photorealistic quality"
   - "Maintain lighting consistency with existing scene"
   - "Accurate shadows and reflections appropriate to the material shown in image 1"

6. BOUNDARY CONSTRAINTS:
   - "Do not extend image boundaries"
   - "Same frame size and aspect ratio"
   - "In-place editing only, no canvas expansion"

CRITICAL RULES:
- Your prompt must be completely self-contained
- DO NOT describe the texture appearance - only reference image 1 directly
- Make sure the default is small-scale, high frequency tiles - 15 cm in width. But if additional information is provided about the specific dimension, feel free to override
- Emphasize that the AI should copy image 1 exactly, not interpret or describe it

Additional helpers:

Scaling - Texture Scale Control for AI Image Generation:
To control tile/pattern size in Gemini 2.5 Flash (nano-banana), use:
Formula: [SCALE]-SCALE, [FREQUENCY]-FREQUENCY texture repetition - each tile is [SIZE]cm x [SIZE]cm
Scale + Frequency pairs by tile size:
* 3cm tiles: MICRO-SCALE, VERY HIGH-FREQUENCY (mosaic-like density)
* 15cm tiles: SMALL-SCALE, HIGH-FREQUENCY (standard small format)
* 50cm tiles: MEDIUM-SCALE, MODERATE-FREQUENCY (medium format)
* 100cm tiles: LARGE-SCALE, LOW-FREQUENCY (large format pavers)
Example: "LARGE-SCALE, LOW-FREQUENCY texture repetition - each tile is 100cm x 100cm"
Always add: "It's OK to cut tiles at edges where they don't fit"

REVISED EXAMPLES OF COMPLETE OUTPUTS:

Example 1 - Floor only:
"Replace the entire floor surface by taking the exact texture and material shown in image 1 and applying it as repeating tiles. Use image 1 as the direct reference - copy its appearance exactly without interpretation. Tile the pattern from image 1 repeatedly across the full floor with SMALL-SCALE, HIGH-FREQUENCY texture repetition - each tile measuring 15cm x 15cm. It's OK to cut tiles at edges where they don't fit. The floor material must look identical to what is shown in image 1 - match it precisely."

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