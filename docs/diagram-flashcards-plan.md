# Diagram-Based Flashcards Feature Plan

## Overview

Add support for interactive diagram-based flashcards where students can upload images (anatomy, cell structures, circuits, etc.) and add labeled hotspots for interactive learning.

---

## Phase 1: Basic Image Support (Week 1)

### 1.1 Database Schema Updates

**New Fields in `flashcards` collection:**

- `has_image` (boolean) - Whether card has an image
- `image_url` (string) - Appwrite Storage file URL
- `image_id` (string) - Appwrite Storage file ID for deletion

**New Collection: `flashcard_labels`**

```
- label_id (string, unique)
- card_id (string, indexed)
- label_text (string, max 100 chars)
- x_position (float, 0-100) - Percentage from left
- y_position (float, 0-100) - Percentage from top
- order_index (integer)
- created_at (datetime)
```

### 1.2 Appwrite Storage Setup

- Create bucket: `flashcard_images`
- Max file size: 5MB
- Allowed formats: jpg, jpeg, png
- Permissions: User (owner) can read/write/delete

### 1.3 UI Components

**New Components:**

- `ImageUploader.tsx` - Upload/preview images
- `DiagramViewer.tsx` - Display image with labels
- `LabelEditor.tsx` - Add/edit/delete labels on image
- `InteractiveDiagram.tsx` - Quiz mode with clickable hotspots

**Updates:**

- `FlashCard.tsx` - Support image display
- `CreateFlashcardModal` - Add image upload option

### 1.4 Services

**New: `storage.service.ts`**

```typescript
- uploadImage(file: File): Promise<string>
- deleteImage(fileId: string): Promise<void>
- getImageUrl(fileId: string): string
```

**New: `label.service.ts`**

```typescript
- createLabel(cardId, data): Promise<Label>
- getCardLabels(cardId): Promise<Label[]>
- updateLabel(labelId, data): Promise<Label>
- deleteLabel(labelId): Promise<void>
```

---

## Phase 2: Interactive Label Creation (Week 2)

### 2.1 Label Editor Features

- Click on image to add label
- Drag to reposition labels
- Edit label text inline
- Delete labels
- Visual indicators (numbered dots/pins)
- Preview mode vs Edit mode

### 2.2 Label Types

**Basic (MVP):**

- Simple text labels with position

**Future:**

- Lines/arrows pointing to parts
- Multi-part labels (e.g., "Mitochondria → Powerhouse")
- Color coding by category

### 2.3 Mobile Optimization

- Touch-friendly label placement
- Pinch to zoom on diagrams
- Responsive label positioning
- Landscape mode support

---

## Phase 3: Quiz Mode (Week 3)

### 3.1 Study Modes

**Mode 1: Show & Tell**

- Display diagram with all labels visible
- Student studies the diagram
- Flip to see back content (explanation)

**Mode 2: Label Quiz**

- Display diagram with numbered dots
- Hide label text
- Student clicks dot and types/selects answer
- Show correct/incorrect feedback
- Reveal all labels at end

**Mode 3: Identification Quiz**

- Show label text
- Student clicks the correct position on diagram
- Highlight correct area on success

### 3.2 Progress Tracking

- Track accuracy per label
- Identify weak labels (frequently missed)
- Spaced repetition for individual labels
- Overall diagram mastery score

### 3.3 Feedback System

- Visual feedback (green checkmark, red X)
- Shake animation for wrong answers
- Confetti for perfect score
- Progress stats after each session

---

## Phase 4: AI Enhancement (Week 4)

### 4.1 AI Label Suggestions

**Using GROQ Vision API:**

- Upload diagram image
- AI identifies key parts
- Suggests label positions and text
- User can accept/edit/reject suggestions

**Prompt Example:**

```
"Analyze this biology diagram and identify all labeled parts.
Return JSON with: part_name, x_position, y_position, description"
```

### 4.2 AI-Generated Questions

- Generate questions based on diagram labels
- "What is the function of [label]?"
- "Identify the structure at position X"
- Multiple choice options

### 4.3 Diagram Quality Check

- Detect if image is clear enough
- Suggest better contrast/brightness
- Warn if image is too small/blurry

---

## Phase 5: Advanced Features (Future)

### 5.1 Diagram Templates

- Pre-made templates for common NEET topics
  - Human heart anatomy
  - Plant cell structure
  - Periodic table sections
  - Physics circuit symbols
- One-click import and customize

### 5.2 Collaborative Diagrams

- Share diagrams with classmates
- Community-contributed diagrams
- Rating system for quality
- Report inappropriate content

### 5.3 Diagram Collections

- Group related diagrams (e.g., "Digestive System Series")
- Study entire system progressively
- Track completion across collection

### 5.4 Drawing Tools

- Built-in diagram creator
- Basic shapes (circles, rectangles, arrows)
- Text annotations
- Color palette
- Export as image

---

## Technical Implementation Details

### File Structure

```
src/
├── components/
│   ├── diagram/
│   │   ├── ImageUploader.tsx
│   │   ├── DiagramViewer.tsx
│   │   ├── LabelEditor.tsx
│   │   ├── InteractiveDiagram.tsx
│   │   ├── LabelDot.tsx
│   │   └── DiagramQuiz.tsx
│   └── flashcard/
│       └── FlashCard.tsx (updated)
├── services/
│   ├── storage.service.ts (new)
│   └── label.service.ts (new)
├── hooks/
│   ├── useImageUpload.ts (new)
│   └── useLabels.ts (new)
└── types/
    └── diagram.types.ts (new)
```

### New Types

```typescript
// diagram.types.ts
export interface DiagramLabel {
  label_id: string;
  card_id: string;
  label_text: string;
  x_position: number; // 0-100
  y_position: number; // 0-100
  order_index: number;
  created_at: string;
}

export interface DiagramFlashcard extends Flashcard {
  has_image: boolean;
  image_url?: string;
  image_id?: string;
  labels?: DiagramLabel[];
}

export interface LabelQuizResult {
  label_id: string;
  is_correct: boolean;
  user_answer: string;
  correct_answer: string;
  time_taken: number;
}
```

### Dependencies to Add

```json
{
  "expo-image-picker": "~15.0.7",
  "react-native-gesture-handler": "~2.28.0", // Already installed
  "react-native-svg": "~15.8.0"
}
```

---

## User Flow

### Creating a Diagram Flashcard

1. User clicks "Add Card" → "Add Diagram Card"
2. Upload image or take photo
3. Image appears in editor
4. Click on image to add labels
5. Enter label text for each point
6. Add back content (explanation/notes)
7. Save card

### Studying Diagram Flashcards

1. User starts study session
2. Diagram card appears with labels visible
3. User studies the diagram
4. Flips to see explanation
5. Marks correct/incorrect
6. Next card

### Quiz Mode

1. User selects "Quiz Mode"
2. Diagram appears with numbered dots
3. Labels are hidden
4. User clicks dot and types answer
5. System checks answer
6. Shows correct/incorrect feedback
7. Reveals all labels at end
8. Shows score and weak areas

---

## Success Metrics

### Phase 1-2 (Basic Implementation)

- 50% of users create at least 1 diagram card
- Average 5 labels per diagram card
- 80% successful image uploads

### Phase 3 (Quiz Mode)

- 70% of users try quiz mode
- Average 3 quiz sessions per week
- 60% accuracy rate on first attempt

### Phase 4 (AI Features)

- 40% of users use AI label suggestions
- 80% acceptance rate for AI suggestions
- 30% reduction in card creation time

---

## Risk Mitigation

### Technical Risks

**Risk**: Large image files slow down app
**Mitigation**:

- Compress images on upload
- Lazy load images
- Cache frequently accessed images

**Risk**: Complex label positioning on different screen sizes
**Mitigation**:

- Use percentage-based positioning
- Test on multiple devices
- Provide zoom functionality

### User Experience Risks

**Risk**: Label editor too complex for mobile
**Mitigation**:

- Simple tap-to-add interface
- Clear visual feedback
- Tutorial on first use

**Risk**: Users don't understand quiz mode
**Mitigation**:

- Interactive tutorial
- Example diagram cards
- Clear instructions

---

## Timeline Summary

**Week 1**: Database + Storage + Basic UI
**Week 2**: Label Editor + Mobile Optimization  
**Week 3**: Quiz Mode + Progress Tracking
**Week 4**: AI Integration + Testing

**Total**: 4 weeks for MVP
**Future Enhancements**: Ongoing

---

## Next Steps

1. ✅ Review and approve plan
2. Set up Appwrite Storage bucket
3. Update database schema
4. Create basic UI components
5. Implement image upload
6. Build label editor
7. Add quiz mode
8. Integrate AI features
9. Test with real NEET diagrams
10. Launch beta to users

---

## Notes

- Start with Biology diagrams (most visual NEET subject)
- Keep UI simple and intuitive
- Focus on mobile-first design
- Ensure offline support for downloaded diagrams
- Consider bandwidth usage in India (compress images)
