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
Image 2 contains small GREEN CIRCLES (color: #00FF00, pure bright green, ~10px radius) marking surfaces to transform.
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

STEP 5 - ANALYZE THE ROOM (Image 2):
Now that you've identified marked surfaces, describe the complete room:
- Room type, shape, ceiling type (flat, sloped, triangular, vaulted)
- Walls: how many visible, their positions (left, right, back)
- Floor: type, coverage, material/appearance
- Ceiling: shape, height, material/appearance
- ALL objects and fixtures with their positions
- Lighting conditions
- Current material on the MARKED surfaces (where green dots are located)

STEP 6 - ANALYZE THE TEXTURE (Image 1):
Extract complete material details from the texture image:
- Base color + undertones (e.g., "warm white with cream undertones")
- Pattern details: veining, grain, geometric patterns (direction, scale, spacing, characteristics)
- Finish type: matte, satin, glossy, polished, brushed, textured
- Reflectivity level: non-reflective, slight sheen, mirror-like, high reflectivity
- Material type: marble, wood, ceramic, tiles, metal, fabric, stone, wallpaper, paint
- Texture qualities: smooth, rough, polished, textured, embossed
- Any distinctive features or characteristics

STEP 7 - CONSTRUCT THE GEMINI PROMPT:

   PART 1 - CONTEXT (2-4 sentences):
   Describe the complete room including all structural elements, objects, fixtures, and current materials.
   
   Example: "The bathroom has a triangular sloped ceiling meeting two walls. The left wall extends from floor to ceiling, meeting the right wall at a right angle in the back corner. A white porcelain toilet sits against the left wall, with a chrome towel rack mounted on the right wall. The walls currently have white painted drywall, and the floor has beige ceramic tiles."

   PART 2 - TRANSFORMATION (1-2 sentences):
   Replace ONLY the surfaces where you found green dots with the texture from Image 1.
   
   Example: "Replace the left wall white painted drywall from floor to ceiling with white Calacatta marble tiles featuring soft gray diagonal veining in irregular patterns, polished to a mirror-like finish with high reflectivity and subtle cream undertones from the first image."

   PART 3 - PRESERVATION (1 sentence):
   List ALL unmarked surfaces to keep unchanged.
   
   Example: "Keep the exact room layout, the right wall, floor, toilet, towel rack, toilet paper holder, lighting, shadows, and camera angle completely unchanged."

   PART 4 - QUALITY (2 sentences):
   "Photorealistic quality with accurate lighting, shadows, reflections, and perspective matching the original room. Natural integration of the new material. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

EXAMPLES OF COMPLETE OUTPUTS:
"The bathroom has a triangular sloped ceiling meeting two walls at clean angles, creating a peaked roofline. The left wall extends from floor to ceiling with a chrome towel rack mounted on it, meeting the right wall at a right angle in the back corner. A modern white porcelain toilet sits against the right wall. A wall-mounted floating vanity cabinet with white countertop and rectangular mirror is positioned on the back wall, with two crystal pendant lights hanging above. The floor has gray marble-look large format tiles with subtle veining throughout the entire floor area. The right wall currently has gray marble-look tiles with subtle veining from floor to ceiling, appearing connected to the floor tiles with the same material. The green enclosed area covers approximately 85% of the right wall's visible area AND 80% of the floor's visible area. Replace the right wall gray marble-look tiles from floor to ceiling AND the entire floor gray marble-look tiles with dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image. Keep the exact bathroom layout, triangular ceiling, left wall, back wall, toilet, vanity, mirror, towel rack, crystal pendant lights, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the botanical material on both the right wall surface and floor surface. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (bathroom with ONLY left wall marked):
"The bathroom has a triangular sloped ceiling meeting two walls at clean angles. The left wall extends from floor to ceiling, meeting the right wall at a right angle in the back corner, creating an enclosed corner space. A modern white porcelain toilet sits against the left wall, with a chrome towel rack mounted on the right wall above a small chrome toilet paper holder. The left wall currently has white painted drywall with a smooth matte finish. The right wall has white painted drywall, and the floor has beige ceramic tiles. Replace the left wall white painted drywall from floor to ceiling with white Calacatta marble tiles featuring soft gray diagonal veining in irregular patterns, polished to a mirror-like finish with high reflectivity and subtle cream undertones from the first image. Keep the exact bathroom layout, the right wall, floor, toilet, towel rack, toilet paper holder, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the new material. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (living room with wallpaper on single wall):
"The living room contains a flat white ceiling spanning the width of the space. Three walls are visible: the back wall spans the full width from floor to ceiling, meeting perpendicular side walls on the left and right. A beige fabric sofa sits centered against the back wall, flanked by two wooden side tables with table lamps. A coffee table sits in front of the sofa on a cream area rug. The back wall currently has smooth off-white painted drywall, the side walls have light gray paint, and the floor is light oak hardwood. Replace the back wall off-white painted drywall from floor to ceiling with dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image. Keep the exact room layout, all furniture, side walls, floor, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting and perspective matching the original room. Natural integration of the wallpaper. Do not extend image boundaries. Same frame size. In-place editing only."

COMPLETE EXAMPLE OUTPUT (empty room with floor + right wall marked):
"The room is an empty residential space with a flat white ceiling. Three walls are visible: a back wall with a large black-framed window, a left wall with smooth white painted drywall, and a right wall meeting the back wall at a right angle. The floor is unfinished concrete with a rough, mottled gray surface covering the entire floor area. The right wall currently has white painted drywall with a smooth matte finish, and the floor currently has rough gray concrete. Replace the right wall white painted drywall from floor to ceiling and the entire concrete floor surface with dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image. Keep the exact room layout, ceiling, back wall, left wall, window, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting and perspective. Natural integration of the material. Do not extend image boundaries. Same frame size. In-place editing only."

COMPLETE EXAMPLE OUTPUT (empty room with ceiling + right wall marked):
"The room is an empty residential space with a flat white ceiling spanning the width and depth of the space. Three walls are visible: a back wall with a large black-framed window showing buildings outside, a left wall with smooth white painted drywall, and a right wall meeting the back wall at a right angle. The floor is unfinished concrete with a rough, mottled gray surface. The ceiling currently has smooth white painted drywall, and the right wall currently has white painted drywall with a smooth matte finish from floor to ceiling. Replace the flat ceiling smooth white painted drywall and the right wall white painted drywall from floor to ceiling with rich walnut wood paneling featuring geometric circular and curved patterns in varying wood grain directions, with alternating light and dark walnut tones creating dimensional relief panels in a sophisticated geometric composition from the first image. Keep the exact room layout, back wall with window, left wall, concrete floor, natural lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the wood paneling on both the ceiling surface and right wall surface. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (empty room with floor + left wall marked):
"The room is an empty residential space with a flat white ceiling spanning the width and depth of the space. Three walls are visible: a back wall with a large black-framed window showing buildings outside, a left wall with smooth white painted drywall, and a right wall meeting the back wall at a right angle. The floor is unfinished concrete with a rough, mottled gray surface covering the entire floor area. The left wall (on the LEFT side of the frame) currently has white painted drywall with a smooth matte finish from floor to ceiling, and the floor currently has rough gray concrete. Replace the left wall white painted drywall from floor to ceiling and the entire concrete floor surface with rich walnut wood paneling featuring geometric circular and curved patterns in varying wood grain directions, with alternating light and dark walnut tones creating dimensional relief panels in a sophisticated geometric composition from the first image. Keep the exact room layout, ceiling, back wall with window, right wall, natural lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the wood paneling on both the left wall surface and floor surface. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (empty room with ceiling + left wall + right wall marked - NO FLOOR):
"The room is an empty residential space with a flat white ceiling spanning the width and depth of the space. Three walls are visible: a back wall with a large black-framed window showing buildings outside, a left wall with smooth white painted drywall, and a right wall meeting the back wall at a right angle. The floor is unfinished concrete with a rough, mottled gray surface covering the entire floor area. The ceiling currently has smooth white painted drywall, the left wall currently has white painted drywall with a smooth matte finish from floor to ceiling, and the right wall currently has white painted drywall with a smooth matte finish from floor to ceiling. Replace the flat ceiling smooth white painted drywall, the left wall white painted drywall from floor to ceiling, and the right wall white painted drywall from floor to ceiling with rich walnut wood paneling featuring geometric circular and curved patterns in varying wood grain directions, with alternating light and dark walnut tones creating dimensional relief panels in a sophisticated geometric composition from the first image. Keep the exact room layout, back wall with window, concrete floor, natural lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the wood paneling on the ceiling surface and both wall surfaces only. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (empty room with left wall + right wall marked ONLY - NO CEILING, NO FLOOR):
"The room is an empty residential space with a flat white ceiling spanning the width and depth of the space. Three walls are visible: a back wall with a large black-framed window showing buildings outside, a left wall with smooth white painted drywall, and a right wall meeting the back wall at a right angle. The floor is unfinished concrete with a rough, mottled gray surface covering the entire floor area. The left wall currently has white painted drywall with a smooth matte finish from floor to ceiling, and the right wall currently has white painted drywall with a smooth matte finish from floor to ceiling. Replace the left wall white painted drywall from floor to ceiling and the right wall white painted drywall from floor to ceiling with rich walnut wood paneling featuring geometric circular and curved patterns in varying wood grain directions, with alternating light and dark walnut tones creating dimensional relief panels in a sophisticated geometric composition from the first image. Keep the exact room layout, back wall with window, flat white ceiling, concrete floor, natural lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the wood paneling on both wall surfaces only. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (busy bathroom with ONLY triangular ceiling marked):
"The bathroom has a triangular sloped ceiling meeting two walls at clean angles, creating a peaked roofline. The left wall extends from floor to ceiling with a chrome towel rack mounted on it, meeting the right wall at a right angle in the back corner. A modern white porcelain toilet sits against the right wall. A wall-mounted floating vanity cabinet with white countertop and rectangular mirror is positioned on the back wall, with two crystal pendant lights hanging above. The floor has gray marble-look large format tiles with subtle veining. The triangular ceiling currently has smooth white painted drywall. The walls have gray marble-look tiles, and the floor has matching gray marble tiles. Replace the triangular sloped ceiling smooth white painted drywall with dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image. Keep the exact bathroom layout, all walls, floor tiles, toilet, vanity, mirror, towel rack, crystal pendant lights, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the wallpaper on the ceiling surface only. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (bathroom with ONLY right wall marked - green area covers wall but barely touches floor):
"The bathroom has a triangular sloped ceiling meeting two walls at clean angles, creating a peaked roofline. The left wall extends from floor to ceiling with a chrome towel rack mounted on it, meeting the right wall at a right angle in the back corner. A modern white porcelain toilet sits against the right wall. A wall-mounted floating vanity cabinet with white countertop and rectangular mirror is positioned on the back wall, with two crystal pendant lights hanging above. The floor has gray marble-look large format tiles with subtle veining throughout the entire floor area. The right wall currently has gray marble-look tiles with subtle veining from floor to ceiling. The green enclosed area covers approximately 80% of the right wall's visible area, while only touching the very bottom edge of the floor (less than 5% of floor area). Replace the right wall gray marble-look tiles from floor to ceiling with dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image. Keep the exact bathroom layout, triangular ceiling, left wall, back wall, floor tiles, toilet, vanity, mirror, towel rack, crystal pendant lights, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the botanical wallpaper on the right wall surface only. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (bathroom with ONLY left wall marked - wall has towel rack and drawers on it):
"The bathroom has a triangular sloped ceiling meeting two walls at clean angles, creating a peaked roofline. The left wall extends from floor to ceiling with a chrome towel rack mounted on it and small floating drawers attached to it, meeting the right wall at a right angle in the back corner. A modern white porcelain toilet sits against the right wall. A wall-mounted floating vanity cabinet with white countertop and rectangular mirror is positioned on the back wall, with two crystal pendant lights hanging above. The floor has gray marble-look large format tiles with subtle veining throughout. The left wall currently has gray marble-look tiles with subtle veining from floor to ceiling, with the chrome towel rack and small drawers mounted on the surface. The green enclosed area covers approximately 75% of the left wall's visible area (including the area behind/around the towel rack and drawers). Replace the left wall gray marble-look tiles from floor to ceiling with dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image. Keep the exact bathroom layout, triangular ceiling, right wall, back wall, floor tiles, toilet, vanity, mirror, towel rack, drawers, crystal pendant lights, lighting, shadows, and camera angle completely unchanged. The towel rack and drawers remain in their current positions on the transformed wall surface. Photorealistic quality with accurate lighting, shadows, and reflections. Natural integration of the wallpaper on the left wall surface only. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

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