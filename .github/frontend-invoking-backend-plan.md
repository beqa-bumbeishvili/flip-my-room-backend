# Backend API - Quick Reference

**Base URL:** `http://localhost:3000`

Send 3 images as base64 + prompt, get back a transformed image.

---

## Endpoint 1: Claude (text only, not working yet)
```javascript
fetch('http://localhost:3000/api/generate_image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markedImage: 'data:image/png;base64,...',
    originalImage: 'data:image/png;base64,...',
    textureImage: 'data:image/png;base64,...',
    prompt: 'Modern minimalist living room'
  })
})
```

---

## Endpoint 2: Google Imagen 4 ✅ (WORKING)
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
