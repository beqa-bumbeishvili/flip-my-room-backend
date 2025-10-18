# Nano Banana Prompt Generation Instructions

When a user requests a Nano Banana prompt, follow these guidelines:

## Core Principles

1. **Nano Banana is designed for IMAGE BLENDING, not isolated texture replacement**
2. Multiple images = automatic blending/merging behavior
3. Best results come from single-image edits with descriptive text
4. Multi-turn conversational editing is more effective than complex single prompts

---

## Prompt Structure Framework

### For Single Image Edits (RECOMMENDED)

**Structure:**
```
[Action verb] + [specific target] + [detailed description] + [preservation instructions] + [quality requirements]
```

**Template:**
- Start with clear action: "Change/Replace/Remove/Add/Transform"
- Be specific about what to modify: exact objects, areas, or elements
- Provide rich detail: colors, textures, materials, styles
- Explicitly state what NOT to change: "Keep [X] unchanged/identical/untouched"
- End with quality specs: "photorealistic/maintain lighting/preserve shadows"

**Example:**
```
Replace all wall and floor tiles with white Calacatta marble (white base with soft gray veining, polished finish). Keep the exact bathroom layout, all fixtures, lighting, and camera angle unchanged. Photorealistic quality with accurate reflections.
```

---

### For Multi-Image Scenarios

**⚠️ WARNING: Nano Banana will blend/merge images by default**

**If user insists on multiple images:**

**Structure:**
```
Image [X] is [role]. Image [Y] is [role]. [Explicit instruction about relationship]. [Anti-blending directive].
```

**Template:**
- Clearly label each image's role: "Image 1 is the base/target/scene to edit"
- State the relationship: "Use Image 2 as texture reference only"
- Add anti-blending language: "Do NOT merge or blend these images"
- Reinforce: "This is a [replacement/transfer] task, not a composition"

**Example:**
```
Image 1 is the bathroom to edit. Image 2 shows the tile texture I want. Apply the texture from Image 2 to replace only the tiles in Image 1. Do NOT blend or merge these images into one scene. Keep Image 1's composition completely intact - only change the tile material.
```

---

## Key Phrases for Better Results

### Preservation Phrases
- "Keep [X] exactly as is"
- "Preserve [X] unchanged"
- "Do not modify [X]"
- "Maintain original [lighting/shadows/perspective/composition]"
- "Same [camera angle/layout/dimensions]"

### Quality Phrases
- "Photorealistic quality"
- "Maintain lighting consistency"
- "Accurate shadows and reflections"
- "Natural blending at edges"
- "Sharp details, no blur"

### Anti-Extension Phrases
- "Do not extend image boundaries"
- "Same frame size"
- "Do not add new areas"
- "In-place editing only"

### Specificity Boosters
- Use exact colors: "navy blue" not "blue"
- Describe materials: "polished marble" not "marble"
- Include texture: "with visible veining" not "marbled"
- Specify style: "modern minimalist" not "nice"

---

## Common Pitfalls to Avoid

### ❌ DON'T:
- Use vague terms: "make it better/nicer/prettier"
- Overload with multiple requests in one prompt
- Use conflicting instructions: "keep bright but make darker"
- Assume the model knows context without stating it
- Rely on multiple reference images for texture swaps

### ✅ DO:
- Break complex edits into steps
- Use conversational follow-up prompts
- Be explicit about what to preserve
- Describe desired outcome in detail
- Test on small crops first (20% of image)

---

## Multi-Turn Strategy

For complex edits, structure as conversation:

- **Turn 1:** "Change [major element A]"
- **Turn 2:** "Now adjust [detail B] while keeping [A] unchanged"
- **Turn 3:** "Finally, refine [specific aspect C]"

This maintains consistency better than one complex prompt.

---

## Quality Checks to Include

Always remind users to verify:
- **Edges:** No halos or jagged borders
- **Shadows:** Direction and softness match
- **Color temperature:** Consistent throughout
- **Resolution:** No pixelation or blur

---

## Alternative Recommendations

When Nano Banana isn't ideal, suggest:

- **Photoshop + Generative Fill:** For precise texture replacement with masking
- **MyEdit:** For reference-based edits with visual selection
- **Stable Diffusion + ControlNet:** For advanced texture transfer
- **Descriptive text-only approach:** Instead of reference images

---

## Output Format

When generating prompts, provide:

1. **The optimized prompt in a code block** (easy to copy)
2. **Brief explanation** of why it's structured that way
3. **Expected behavior/limitations warning** if applicable
4. **Alternative approach** if the task is unsuited for Nano Banana

---

## When to Warn Users

Alert users when:
- They request texture replacement with reference images (high failure rate)
- They want surgical precision (suggest mask-based tools instead)
- Task requires >3 distinct changes (break into multi-turn)
- They expect exact replication from reference (Nano Banana interprets creatively)

---

## Use Case Categories

### ✅ Nano Banana Excels At:
- Background replacement
- Adding/removing objects
- Style transfer (photo to painting, etc.)
- Character/face consistency across edits
- Color adjustments
- Lighting changes
- Multi-image blending/compositing
- Conversational iterative editing

### ⚠️ Nano Banana Struggles With:
- Precise texture swapping using reference images
- Maintaining exact proportions across complex edits
- Long text rendering
- Highly technical/surgical edits
- Preventing image extension when using multiple images

---

## Example Prompts by Use Case

### Background Replacement
```
Replace the background with a sunny beach scene. Keep the person in the foreground completely unchanged, including their pose, clothing, and lighting. Match the new background lighting to the subject. Photorealistic quality.
```

### Object Removal
```
Remove the red car from the driveway. Fill the area with matching asphalt texture and maintain the natural shadows from surrounding trees. Seamless integration, no visible edits.
```

### Color Change
```
Change the wall color from beige to navy blue. Keep all furniture, lighting, shadows, and room layout identical. Ensure the blue looks natural under the existing lighting conditions.
```

### Style Transfer
```
Transform this photo into a watercolor painting style. Maintain the subject's likeness and composition. Use soft brush strokes, pastel colors, and visible paper texture. Artistic but recognizable.
```

### Material Change (Single Image)
```
Change the wooden floor to white marble with gray veining (Calacatta style, polished finish). Keep all furniture, walls, lighting, and room proportions exactly as they are. Realistic marble texture with proper reflections.
```

---

## Advanced Techniques

### Iterative Refinement
Start broad, then narrow:
1. "Add a sofa to the living room"
2. "Make the sofa navy blue with velvet texture"
3. "Adjust the sofa angle to face the window"

### Constraint Stacking
Layer specific requirements:
```
Change shirt to red. Constraints: Keep face identical, maintain fabric wrinkles, preserve original lighting direction, same pose, photorealistic cotton texture.
```

### Negative Prompting
Tell it what NOT to do:
```
Remove the person from the photo. Do NOT blur the background, do NOT add artifacts, do NOT change the lighting, do NOT crop the image.
```

---

## Troubleshooting Common Issues

| Problem | Solution |
|---------|----------|
| Image gets extended/expanded | Add "Do not extend image boundaries. Same frame size." |
| Wrong elements change | Be more specific: "Change ONLY the wall tiles, nothing else" |
| Unrealistic results | Add "photorealistic, maintain natural lighting and shadows" |
| Face/character changes | Add "preserve exact likeness, keep facial features identical" |
| Blurry/low quality | Request "sharp details, high resolution, no blur or pixelation" |

---

## Final Checklist

Before finalizing a prompt, verify:
- [ ] Clear action verb at the start
- [ ] Specific target identified
- [ ] Detailed description of desired outcome
- [ ] Explicit preservation instructions
- [ ] Quality requirements stated
- [ ] Anti-blending language (if multiple images)
- [ ] No conflicting instructions
- [ ] Appropriate for Nano Banana's strengths

---

## Quick Reference Card

**Basic Formula:**
```
[DO] + [TO WHAT] + [HOW] + [KEEP WHAT] + [QUALITY]
```

**Example:**
```
Replace + the tiles + with white marble (soft gray veining) + keep all fixtures and layout unchanged + photorealistic quality
```

**For Multiple Images:**
```
Image X is [role] + Image Y is [role] + Use Y to [action] in X + Do NOT blend + Keep X's [elements] intact
```