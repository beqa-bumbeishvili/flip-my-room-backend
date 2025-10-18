# SnapFacade Implementation Plan

## **Detailed Implementation Plan for SnapFacade**

---

### **Phase 1: Core Infrastructure & Button Integration**

#### **1.1 Button Integration System**
- **Auto-initialization approach** (easier for businesses):
  - Businesses add `<script src="snapfacade.js"></script>` to their page
  - They add a button with specific data attribute: `<button data-snapfacade data-texture-url="path/to/texture.jpg">See on Your Home</button>`
  - Script auto-detects all elements with `[data-snapfacade]` attribute on page load
  - Attaches click handlers automatically
  - **Benefits**: Zero JavaScript knowledge needed, just HTML

#### **1.2 Configuration via Data Attributes**
```html
<button 
  data-snapfacade 
  data-texture-url="https://example.com/textures/cedar-siding.jpg"
>
  See on Your Home
</button>
```

---

### **Phase 2: Modal UI & Structure**

#### **2.1 Modal Components**
1. **Modal Overlay** - Dark semi-transparent backdrop
2. **Modal Container** - Centered, responsive card
3. **Progress Steps Indicator** - Visual feedback of current step
4. **Content Area** - Switches between different views
5. **Action Buttons** - Context-aware (Next, Back, Process, etc.)
6. **Close Button** - Always accessible

#### **2.2 Modal Views/Steps**
**Step 1: Upload**
- Drag & drop zone
- File input button
- Mobile: Camera capture option
- Preview thumbnail after selection
- Validation: image types only

**Step 2: Mark Area**
- Canvas overlay on uploaded image
- Brush tool for painting selection area
- Semi-transparent colored overlay (e.g., blue/red with 50% opacity)
- Controls: Brush size slider (optional for v1), Undo button, Clear all button
- Original image visible beneath marks

**Step 3: Processing**
- Loading spinner/animation
- Progress indicator
- Rotating pre-written tips about renovations
- "Processing your visualization..." message

**Step 4: Results**
- Before/After slider (custom built with divider panel)
- Download button
- Social sharing buttons (Facebook, Twitter)
- Story sharing buttons (Facebook Stories, Instagram Stories, TikTok) - auto-crops to 9:16

---

### **Phase 3: Technical Implementation Details**

#### **3.1 File Structure**
```
/snapfacade-btn/
├── main.js           # Main library (auto-init, modal, all logic)
├── styles.css        # All styling (injected or linked)
├── index.html        # Demo/playground page
├── assets/
│   └── sample-homes/ # Sample home images (handled later)
└── README.md
```

#### **3.2 main.js Architecture**

**Module Structure:**
```javascript
// 1. Auto-initialization
// 2. Modal manager
// 3. Upload handler
// 4. Canvas brush tool
// 5. Image processor (API calls)
// 6. Before/after slider
// 7. Share/download functionality
// 8. Utility functions
```

**Key Classes/Objects:**
- `SnapFacade` - Main controller
- `Modal` - Modal UI management
- `BrushTool` - Canvas drawing functionality
- `ImageProcessor` - Handles masked image generation & API
- `Slider` - Before/after comparison
- `ShareManager` - Download & social sharing

#### **3.3 Canvas Brush Tool Details**
- Use HTML5 Canvas API
- Mouse/touch event listeners for drawing
- Store brush strokes in array for undo functionality
- Generate marked image: 
  - Layer 1: Original image
  - Layer 2: Semi-transparent overlay on marked areas
  - Export both: visual preview AND machine-readable mask
- Pass complete image with markings to API

#### **3.4 Before/After Slider**
**Custom Implementation:**
- Two image layers (original & transformed)
- Draggable divider with clip-path or overflow hidden
- Mouse/touch drag support
- Smooth animations
- Handle different aspect ratios

#### **3.5 Social Sharing**
**Standard Sharing (Facebook, Twitter):**
- Use Web Share API if available
- Fallback: Direct URL sharing with platform-specific URLs
- Generate shareable image (download to device first)

**Story Sharing (Instagram, TikTok, Facebook Stories):**
- Detect when user clicks story button
- Create canvas with 9:16 aspect ratio (1080x1920)
- Crop/resize before/after composite image
- Combine before/after in single vertical layout
- Download as story-ready format
- Guide user to upload manually (can't directly post to stories from web)

#### **3.6 Loading State with Tips**
**Pre-written Tips Array:**
```javascript
const renovationTips = [
  "Tip: New siding can increase your home's value by up to 15%",
  "Did you know? Quality exterior materials can last 50+ years",
  "Pro tip: Lighter colors can make your home appear larger",
  // ... more tips
];
```
- Rotate tips every 2-3 seconds during processing
- Show animated progress bar (may not reflect actual progress - just visual feedback)

---

### **Phase 4: Styling & UX**

#### **4.1 Design Principles**
- Clean, modern interface
- Desktop-first, mobile-compatible
- Smooth transitions/animations
- Clear visual hierarchy
- Accessible (keyboard navigation, ARIA labels)

#### **4.2 Color Palette**
- Primary: Professional blue/green
- Accent: Call-to-action orange/teal
- Overlay: Semi-transparent dark (modal backdrop)
- Brush overlay: Blue or red with 40-50% opacity
- Success: Green for completion states

#### **4.3 Responsive Behavior**
- Desktop: Large modal (80-90vw max-width: 1200px)
- Tablet: Adjusted proportions
- Mobile: Full-screen or near full-screen modal

---

### **Phase 5: Error Handling**

#### **5.1 Error Scenarios & Responses**
1. **Invalid file type**: "Please upload an image file (JPG, PNG)"
2. **File too large**: "Image must be under 10MB"
3. **No area marked**: "Please mark the area you want to renovate"
4. **API failure**: "Processing failed. Please try again."
5. **Network timeout**: "Request timed out. Check your connection."
6. **No texture URL**: "Configuration error. Please contact support."

#### **5.2 Error Display**
- Toast notifications or inline error messages
- Red/warning color scheme
- Clear, actionable messages
- Retry button where applicable

---

### **Phase 6: Implementation Order**

**Sprint 1: Foundation**
1. Set up basic file structure
2. Implement auto-initialization system
3. Create modal structure & styling
4. Add open/close functionality

**Sprint 2: Upload & Canvas**
5. Build upload UI (drag-drop, file input)
6. Implement canvas brush tool
7. Add undo/clear functionality
8. Generate marked image output

**Sprint 3: Processing & Results**
9. Create loading state with tips
10. Build before/after slider
11. Implement download functionality
12. Add social sharing (standard)

**Sprint 4: Polish**
13. Add story sharing with 9:16 crop
14. Error handling throughout
15. Responsive adjustments
16. Testing & bug fixes

---

### **Key Technical Decisions Summary**

✅ **Zero external dependencies** - Pure vanilla JS/CSS  
✅ **Auto-initialization** - Data attribute detection  
✅ **Canvas-based brush** - Full control, lightweight  
✅ **Custom slider** - No library needed  
✅ **Desktop-first** - With mobile compatibility  
✅ **Simple configuration** - Only texture URL required  
✅ **No user accounts** - No data storage  
✅ **Download only** - No email sharing  
✅ **Story format support** - 9:16 auto-crop  
✅ **Generic tips** - Pre-written array  

---

## Current Implementation Status

### Completed
- [ ] Modal structure and styling
- [ ] Upload UI (drag-drop, file input)
- [ ] Canvas brush tool
- [ ] Undo/clear functionality
- [ ] Step navigation

### In Progress
- None

### Todo
- Loading state with tips
- Before/after slider
- Download functionality
- Social sharing
- Story sharing
- Auto-initialization system
