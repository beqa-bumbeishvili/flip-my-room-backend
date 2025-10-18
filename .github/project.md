# SnapFacade

## Product Overview

SnapFacade is a single-button solution that enables home improvement companies to offer instant exterior renovation visualization on their websites. The product allows homeowners to see exactly how new exterior materials (siding, façade panels, roofing, etc.) would look on their actual home before making purchasing decisions.

## Core Functionality

SnapFacade provides:
1. A lightweight, embeddable button that integrates into any product page
2. AI-powered image transformation using Google's Nano Banana technology with Claude AI for refining prompts
3. Instant before/after visualization of exterior renovations
4. Zero technical integration effort for businesses

## Detailed User Flow

### For Businesses (Integration)
1. Add a simple script tag to their website: `<script src="snapfacade.js"></script>`
2. Add a button with the SnapFacade data attribute and texture URL:
   ```html
   <button data-snapfacade data-texture-url="path/to/texture.jpg">
     See on Your Home
   </button>
   ```
3. The script automatically detects and initializes all SnapFacade buttons
4. Zero configuration needed - just provide the texture image URL

### For Homeowners (End Users)
1. **Discovery**: The homeowner browses a renovation product (e.g., cedar-look vinyl siding) on a home improvement website
2. **Engagement**: They notice the "See on Your Home" SnapFacade button next to the product
3. **Initiation**: Upon clicking the button, a modal window opens within the website
4. **Image Upload**: The homeowner is prompted to upload a photo of their home's exterior
   - Can use their own photo from device
   - Mobile users can take a photo directly
   - Option to use sample homes if they don't have a photo
5. **Area Selection**: Using a simple brush tool, they mark which areas they want to renovate
6. **Processing**: The AI processes the image (typically 3-5 seconds)
   - Clear loading indicator shows progress
   - Brief tips about the product are displayed during processing
7. **Visualization**: The homeowner sees the result with an interactive slider panel
   - Drag the slider to reveal before/after views
   - Realistic rendering shows the new material applied to their home
8. **Sharing**: Option to download or share the visualization
   - Download the image
   - Share to social media (Facebook, Twitter)
   - Share as story format (Instagram, Facebook, TikTok) with 9:16 aspect ratio

SnapFacade delivers instant gratification for homeowners while boosting conversion rates for businesses selling exterior renovation products—all through a simple button that requires virtually no integration effort.