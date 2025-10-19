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
            model: "claude-3-5-sonnet-20241022",
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

INPUT:
- Image 1: The target room/space to edit (may have marked areas indicating what to change)
- Image 2: A texture/material reference image showing the desired style/material

IMPORTANT: Nano Banana automatically BLENDS multiple images. You must use anti-blending language.

Generate a prompt following this structure:
[Action verb] + [specific target] + [detailed description] + [preservation instructions] + [quality requirements]

REQUIREMENTS:
1. Clearly label each image's role: "Image 1 is the [room/bathroom/space] to edit. Image 2 shows the [texture/material/style] reference."
2. Add STRONG anti-blending language: "Do NOT merge or blend these images into one scene. Do NOT combine them."
3. Be specific about the transformation: exact materials, colors, textures (e.g., "white Calacatta marble with soft gray veining, polished finish")
4. Explicitly preserve what should NOT change: "Keep the exact layout, all fixtures, furniture, lighting, and camera angle unchanged"
5. Include quality specs: "Photorealistic quality with accurate reflections and lighting consistency"
6. Add boundary constraints: "Do not extend image boundaries. Same frame size. In-place editing only."

EXAMPLE OUTPUT:
"Image 1 is the bathroom to edit. Image 2 shows the tile material reference. Replace all wall and floor tiles with the material shown in Image 2 (white marble with gray veining, polished finish). Do NOT blend or merge these images into one scene. Keep Image 1's composition completely intact - only change the tile material. Preserve the exact bathroom layout, all fixtures, lighting, shadows, and camera angle unchanged. Photorealistic quality with accurate reflections. Do not extend image boundaries."

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