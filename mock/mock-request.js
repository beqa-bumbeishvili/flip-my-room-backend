// Mock request for testing Imagen API endpoint
// Replace the placeholder base64 strings with actual image data

const mockImagenRequest = {
  originalImage: "BASE64_ENCODED_BATHROOM_IMAGE_HERE",
  // Example: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD..."
  
  textureImage: "BASE64_ENCODED_MARBLE_TEXTURE_IMAGE_HERE",
  // Example: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD..."
  
  prompt: "I have two images: Image 1 shows white marble with gray veining (the texture I want). Image 2 shows a bathroom with gray tiles (the room to edit).\n\nTask: Replace ALL the gray marble tiles in the bathroom (Image 2) with the white marble pattern from Image 1. This is a material replacement, NOT an image blend or merge.\n\nRequirements:\n- Keep the exact bathroom layout, camera angle, and perspective from Image 2\n- Preserve all fixtures: toilet, sink, vanity, mirror, towel warmer, ceiling lights, and electrical outlet\n- Maintain the original lighting, shadows, and reflections\n- Only change the tile surfaces (walls, floor, and ceiling) from gray to white marble\n- Apply the white marble texture and veining pattern from Image 1 to all tile surfaces\n- Do not extend, expand, or add new elements to the scene\n- The result should be the same bathroom view with different tile color/texture only\n- Ensure photorealistic quality with proper depth and lighting consistency\n- No blending of the two images - use Image 1 only as a texture reference for the tiles in Image 2"
};

// Function to test the endpoint
async function testImagenEndpoint() {
  try {
    const response = await fetch('http://localhost:3000/api/generate_imagen_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockImagenRequest)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✓ Success! Image generated');
      console.log('Transformed image length:', result.transformedImage?.length || 0, 'characters');
      
      // Optionally save the image
      // const fs = require('fs');
      // const base64Data = result.transformedImage.replace(/^data:image\/\w+;base64,/, '');
      // fs.writeFileSync('output-image.jpg', Buffer.from(base64Data, 'base64'));
      // console.log('Image saved as output-image.jpg');
    } else {
      console.error('✗ Error:', result.error);
      console.error('Details:', result.details);
    }
  } catch (error) {
    console.error('✗ Request failed:', error.message);
  }
}

// Export for use
module.exports = {
  mockImagenRequest,
  testImagenEndpoint
};

// Run test if called directly
if (require.main === module) {
  console.log('Testing Imagen endpoint...\n');
  testImagenEndpoint();
}
