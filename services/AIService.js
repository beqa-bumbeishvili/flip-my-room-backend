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
Analyze both images and generate a prompt that tells Gemini where to apply the material and what material to use.

PROMPT STRUCTURE:
[Action verb] + [detailed material from Image 2] + [specific location from Image 1 markings] + [preservation instructions] + [quality requirements]

REQUIREMENTS:

1. ANALYZE IMAGE 1 (markedImage) - identify marked areas:
   - Look for green line markings indicating surfaces to transform
   - Determine what surfaces are marked (walls, floors, specific objects)
   - Describe the location precisely (e.g., "the left wall from floor to ceiling", "all floor tiles", "the back wall")
   - Note the extent of marked area (full or partial coverage)
   - Spatial relationships: which parts of room are affected

2. ANALYZE IMAGE 2 (textureImage) - extract material details:
   - Base color + undertones (e.g., "warm white with cream undertones")
   - Pattern details: veining, grain, geometric patterns (direction, scale, characteristics)
   - Finish type: matte, satin, glossy, polished, brushed
   - Reflectivity level: non-reflective, slight sheen, mirror-like
   - Material type: marble, wood, ceramic, tiles, metal, fabric, stone, wallpaper
   - Texture qualities: smooth, rough, polished, textured

3. CREATE THE PROMPT:
   - Start with action verb: "Apply/Replace"
   - Reference material as "from the first image" with full description
   - Reference location as "in the second image" with specific areas
   - Format: "Apply the [full material details] from the first image to [specific locations] in the second image"

4. PRESERVATION:
   - "Keep the exact room layout, all unmarked surfaces, fixtures, furniture, lighting, shadows, and camera angle completely unchanged"

5. QUALITY:
   - "Photorealistic quality with accurate lighting, shadows, reflections, and perspective matching the original room"
   - "Natural integration of the new material"

6. BOUNDARIES:
   - "Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only"

EXAMPLE OUTPUT (for wall tiles):
"Apply the white Calacatta marble tiles featuring soft gray diagonal veining in irregular patterns, polished to a mirror-like finish with high reflectivity and subtle cream undertones, from the first image to the left wall from floor to ceiling, the right wall from floor to ceiling, and all floor tiles throughout the bathroom in the second image. Keep the exact bathroom layout, all unmarked surfaces, fixtures, furniture, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting, shadows, and reflections matching the original room. Natural integration of the new material. Do not extend image boundaries. Same frame size and aspect ratio. In-place editing only."

EXAMPLE OUTPUT (for wallpaper):
"Apply the dark blue tropical botanical wallpaper featuring layered palm fronds, monstera leaves, and large tropical foliage in navy blue, teal, and forest green tones with a painterly matte finish from the first image to the back wall from floor to ceiling in the second image. Keep the exact room layout, all unmarked surfaces, fixtures, furniture, lighting, shadows, and camera angle completely unchanged. Photorealistic quality with accurate lighting and perspective. Natural integration of the wallpaper. Same frame size. In-place editing only."

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