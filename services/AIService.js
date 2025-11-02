export async function generatePromptFromImages(markedImage, textureImage, anthropicAPI) {
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
                            text: `You are generating a prompt for Google's Gemini 2.5 Flash Image AI for an interior design transformation task.

SYSTEM ARCHITECTURE:
- INPUT (to you): Image 1 (markedImage - room with green lines marking areas) + Image 2 (textureImage - material reference)
- OUTPUT (from you): A complete prompt for Gemini
- CRITICAL: Gemini will receive TWO images: [Image 2 (texture), unmarked original room, your prompt]
- Gemini will NOT see the green lines - you must convert visual markings into spatial text descriptions

YOUR TASK:
Analyze both images and generate a prompt that FIRST establishes what Gemini sees in the room (context), THEN specifies the transformation.

PROMPT STRUCTURE (4 PARTS):

PART 1 - ROOM CONTEXT: "The room contains [comprehensive description]..."
PART 2 - TRANSFORMATION: "Replace [specific surface with current material] with [detailed new material] from the first image"
PART 3 - PRESERVATION: "Keep everything else unchanged..."
PART 4 - QUALITY: "Photorealistic quality..."

REQUIREMENTS:

1. ANALYZE IMAGE 1 (markedImage) - Full room analysis:
   
   A. DESCRIBE THE ENTIRE ROOM (for context):
      - Spatial layout: room type, shape, ceiling type (flat, sloped, triangular, vaulted)
      - Walls: how many walls visible, their positions (left wall, right wall, back wall, front wall)
      - Spatial relationships: how surfaces connect (walls meeting at corners, floor-to-ceiling connections)
      - Floor: type, coverage, material/appearance
      - Ceiling: shape, height, material/appearance
      - ALL objects and fixtures: toilets, sinks, bathtubs, furniture, cabinets, windows, doors, mirrors, lights, decorations
      - Position of objects relative to walls and each other
      - Lighting conditions: natural light, artificial light sources
      - Overall style and atmosphere
   
   B. IDENTIFY MARKED AREAS (surfaces to transform):
      
      CRITICAL - CYAN OVERLAY DETECTION METHOD:
      Selected surfaces are marked with a SEMI-TRANSPARENT CYAN OVERLAY (rgba(0, 255, 255, 0.4)) and GREEN BOUNDARY LINES.
      The cyan overlay makes the selected surface highly visible - simply identify which surface(s) have the cyan tint.
      
      DETECTION PROCESS:
      
      1. SCAN FOR CYAN OVERLAY:
         Look for surfaces with a cyan/turquoise tint overlaid on them
         - The cyan color: rgba(0, 255, 255, 0.4) - semi-transparent light blue/turquoise
         - You'll see the original surface texture through the cyan overlay
         - Green boundary lines surround the cyan area
      
      2. IDENTIFY THE SURFACE TYPE:
         Determine which surface has the cyan overlay:
         - CEILING (top surface - flat, triangular, sloped, vaulted)
         - FLOOR (bottom surface)
         - LEFT WALL (left side from camera perspective)
         - RIGHT WALL (right side from camera perspective)
         - BACK WALL (far wall behind objects)
      
      3. CHECK FOR MULTIPLE SURFACES:
         - Multiple surfaces can be marked at once
         - Check ALL surfaces systematically - don't stop after finding one
         - If both floor and right wall have cyan → mark BOTH
         - List ALL surfaces with cyan overlay
      
      EXAMPLES:
      
      ✅ Right wall has cyan overlay → You detect: right wall ONLY
      ✅ Floor has cyan overlay → You detect: floor ONLY
      ✅ Both floor and right wall have cyan overlay → You detect: floor + right wall
      ✅ Ceiling, left wall, and back wall all have cyan overlay → You detect: ceiling + left wall + back wall
      ✅ Triangular ceiling has cyan overlay → You detect: ceiling ONLY
      
      ❌ Right wall has cyan, but you detected: right wall + floor (WRONG - floor has no cyan)
      ❌ Ceiling has cyan, but you detected: all walls (WRONG - walls have no cyan, only ceiling does)
      ❌ Floor and right wall have cyan, but you detected: right wall ONLY (WRONG - missed floor, check all surfaces)
      
      IMPORTANT NOTES:
      - Fixtures (toilet, towel racks, mirrors, cabinets) are always preserved - only the wall/floor/ceiling surface material changes
      - The cyan overlay may cover fixtures - this is normal, transform the surface behind them
      - Be systematic: check ceiling, floor, left wall, right wall, back wall - mark ALL that have cyan
      
      For each marked surface, identify:
      - What surfaces are marked: walls, floors, ceiling, specific objects
      - Current material/finish on marked surfaces (e.g., "white painted drywall", "beige ceramic tiles", "concrete flooring")
      - Precise location descriptions (e.g., "the left wall from floor to ceiling", "all floor area", "back wall only")
      - Extent of marked area (full or partial coverage)
      - Spatial relationships of marked areas to other elements

2. ANALYZE IMAGE 2 (textureImage) - Extract complete material details:
   - Base color + undertones (e.g., "warm white with cream undertones")
   - Pattern details: veining, grain, geometric patterns (direction, scale, spacing, characteristics)
   - Finish type: matte, satin, glossy, polished, brushed, textured
   - Reflectivity level: non-reflective, slight sheen, mirror-like, high reflectivity
   - Material type: marble, wood, ceramic, tiles, metal, fabric, stone, wallpaper, paint
   - Texture qualities: smooth, rough, polished, textured, embossed
   - Any distinctive features or characteristics

3. CONSTRUCT THE PROMPT:

   PART 1 - CONTEXT (2-4 sentences):
   "The room contains [describe all structural elements: ceiling type, walls positions and relationships, floor]. [Describe all objects and fixtures with their positions]. [Current material on surfaces that will be changed]."
   
   Example: "The bathroom has a triangular sloped ceiling meeting two walls. The left wall extends from floor to ceiling, meeting the right wall at a right angle in the back corner. A white porcelain toilet sits against the left wall, with a chrome towel rack mounted on the right wall. The walls currently have white painted drywall, and the floor has beige ceramic tiles."

   PART 2 - TRANSFORMATION (1-2 sentences):
   "Replace the [specific marked surfaces with current material description] with [complete detailed material description] from the first image."
   
   Example: "Replace the left wall white painted drywall from floor to ceiling with white Calacatta marble tiles featuring soft gray diagonal veining in irregular patterns, polished to a mirror-like finish with high reflectivity and subtle cream undertones from the first image."

   PART 3 - PRESERVATION (1 sentence):
   "Keep the exact room layout, all unmarked surfaces, fixtures, furniture, lighting, shadows, and camera angle completely unchanged."

   PART 4 - QUALITY (2 sentences):
   "Photorealistic quality with accurate lighting, shadows, reflections, and perspective matching the original room. Natural integration of the new material. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (bathroom with floor + right wall marked - BOTH surfaces 80%+ coverage):
"The bathroom has a triangular sloped ceiling meeting two walls at clean angles, creating a peaked roofline. The left wall extends from floor to ceiling with a chrome towel rack mounted on it, meeting the right wall at a right angle in the back corner. A modern white porcelain toilet sits against the right wall. A wall-mounted floating vanity cabinet with white countertop and rectangular mirror is positioned on the back wall, with two crystal pendant lights hanging above. The floor has gray marble-look large format tiles with subtle veining throughout the entire floor area. The right wall currently has gray marble-look tiles with subtle veining from floor to ceiling, appearing connected to the floor tiles with the same material. The green enclosed area covers approximately 85% of the right wall's visible area AND 80% of the floor's visible area. Replace the right wall gray marble-look tiles from floor to ceiling AND the entire floor gray marble-look tiles with dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image. Keep the exact bathroom layout, triangular ceiling, left wall, back wall, toilet, vanity, mirror, towel rack, crystal pendant lights, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the botanical material on both the right wall surface and floor surface. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (bathroom with ONLY left wall marked):
"The bathroom has a triangular sloped ceiling meeting two walls at clean angles. The left wall extends from floor to ceiling, meeting the right wall at a right angle in the back corner, creating an enclosed corner space. A modern white porcelain toilet sits against the left wall, with a chrome towel rack mounted on the right wall above a small chrome toilet paper holder. The left wall currently has white painted drywall with a smooth matte finish. The right wall has white painted drywall, and the floor has beige ceramic tiles. Replace the left wall white painted drywall from floor to ceiling with white Calacatta marble tiles featuring soft gray diagonal veining in irregular patterns, polished to a mirror-like finish with high reflectivity and subtle cream undertones from the first image. Keep the exact bathroom layout, the right wall, floor, toilet, towel rack, toilet paper holder, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the new material. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (living room with wallpaper on single wall):
"The living room contains a flat white ceiling spanning the width of the space. Three walls are visible: the back wall spans the full width from floor to ceiling, meeting perpendicular side walls on the left and right. A beige fabric sofa sits centered against the back wall, flanked by two wooden side tables with table lamps. A coffee table sits in front of the sofa on a cream area rug. The back wall currently has smooth off-white painted drywall, the side walls have light gray paint, and the floor is light oak hardwood. Replace the back wall off-white painted drywall from floor to ceiling with dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image. Keep the exact room layout, all furniture, side walls, floor, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting and perspective matching the original room. Natural integration of the wallpaper. Do not extend image boundaries. Same frame size. In-place editing only."

COMPLETE EXAMPLE OUTPUT (empty room with floor + right wall marked):
"The room is an empty residential space with a flat white ceiling. Three walls are visible: a back wall with a large black-framed window, a left wall with smooth white painted drywall, and a right wall meeting the back wall at a right angle. The floor is unfinished concrete with a rough, mottled gray surface covering the entire floor area. The right wall currently has white painted drywall with a smooth matte finish, and the floor currently has rough gray concrete. Replace the right wall white painted drywall from floor to ceiling and the entire concrete floor surface with dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image. Keep the exact room layout, ceiling, back wall, left wall, window, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting and perspective. Natural integration of the material. Do not extend image boundaries. Same frame size. In-place editing only."

COMPLETE EXAMPLE OUTPUT (busy bathroom with ONLY triangular ceiling marked):
"The bathroom has a triangular sloped ceiling meeting two walls at clean angles, creating a peaked roofline. The left wall extends from floor to ceiling with a chrome towel rack mounted on it, meeting the right wall at a right angle in the back corner. A modern white porcelain toilet sits against the right wall. A wall-mounted floating vanity cabinet with white countertop and rectangular mirror is positioned on the back wall, with two crystal pendant lights hanging above. The floor has gray marble-look large format tiles with subtle veining. The triangular ceiling currently has smooth white painted drywall. The walls have gray marble-look tiles, and the floor has matching gray marble tiles. Replace the triangular sloped ceiling smooth white painted drywall with dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image. Keep the exact bathroom layout, all walls, floor tiles, toilet, vanity, mirror, towel rack, crystal pendant lights, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the wallpaper on the ceiling surface only. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (bathroom with ONLY right wall marked - green area covers wall but barely touches floor):
"The bathroom has a triangular sloped ceiling meeting two walls at clean angles, creating a peaked roofline. The left wall extends from floor to ceiling with a chrome towel rack mounted on it, meeting the right wall at a right angle in the back corner. A modern white porcelain toilet sits against the right wall. A wall-mounted floating vanity cabinet with white countertop and rectangular mirror is positioned on the back wall, with two crystal pendant lights hanging above. The floor has gray marble-look large format tiles with subtle veining throughout the entire floor area. The right wall currently has gray marble-look tiles with subtle veining from floor to ceiling. The green enclosed area covers approximately 80% of the right wall's visible area, while only touching the very bottom edge of the floor (less than 5% of floor area). Replace the right wall gray marble-look tiles from floor to ceiling with dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image. Keep the exact bathroom layout, triangular ceiling, left wall, back wall, floor tiles, toilet, vanity, mirror, towel rack, crystal pendant lights, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the botanical wallpaper on the right wall surface only. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

COMPLETE EXAMPLE OUTPUT (bathroom with ONLY left wall marked - wall has towel rack and drawers on it):
"The bathroom has a triangular sloped ceiling meeting two walls at clean angles, creating a peaked roofline. The left wall extends from floor to ceiling with a chrome towel rack mounted on it and small floating drawers attached to it, meeting the right wall at a right angle in the back corner. A modern white porcelain toilet sits against the right wall. A wall-mounted floating vanity cabinet with white countertop and rectangular mirror is positioned on the back wall, with two crystal pendant lights hanging above. The floor has gray marble-look large format tiles with subtle veining throughout. The left wall currently has gray marble-look tiles with subtle veining from floor to ceiling, with the chrome towel rack and small drawers mounted on the surface. The green enclosed area covers approximately 75% of the left wall's visible area (including the area behind/around the towel rack and drawers). Replace the left wall gray marble-look tiles from floor to ceiling with dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image. Keep the exact bathroom layout, triangular ceiling, right wall, back wall, floor tiles, toilet, vanity, mirror, towel rack, drawers, crystal pendant lights, lighting, shadows, and camera angle completely unchanged. The towel rack and drawers remain in their current positions on the transformed wall surface. Photorealistic quality with accurate lighting, shadows, and reflections. Natural integration of the wallpaper on the left wall surface only. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

Return ONLY the optimized prompt text following this structure, nothing else.`
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