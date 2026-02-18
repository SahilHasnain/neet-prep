# Flashcard Templates Feature

## Overview

The Templates feature allows users to quickly start learning with pre-made flashcard decks covering essential NEET topics in Physics, Chemistry, and Biology.

## Features

### Template Library

- 6 pre-made templates covering core NEET topics
- Physics: Laws of Motion, Thermodynamics
- Chemistry: Periodic Table, Chemical Bonding
- Biology: Cell Structure, Photosynthesis
- Each template includes 6-8 high-quality flashcards

### Template Browsing

- Search templates by title, description, or topic
- Filter by subject category (Physics, Chemistry, Biology)
- View template details including:
  - Card count
  - Difficulty level (Easy, Medium, Hard)
  - Topic and description
  - Subject category

### One-Click Deck Creation

- Create a complete deck from any template with one tap
- All cards are automatically added to the new deck
- Navigate directly to the new deck or continue browsing

## User Flow

1. **Access Templates**
   - From home screen: Tap "Browse Templates" button
   - From empty state: Tap "Or Start with a Template"

2. **Browse & Search**
   - Use search bar to find specific topics
   - Filter by subject using category chips
   - View template cards with full details

3. **Create Deck**
   - Tap "Use Template" on any template card
   - Deck is created with all flashcards
   - Choose to view the new deck or browse more templates

## Technical Implementation

### Files Created

- `src/config/templates.config.ts` - Template data and helper functions
- `src/services/template.service.ts` - Template operations
- `app/templates/index.tsx` - Templates browsing screen

### Files Modified

- `app/index.tsx` - Added template access buttons

### Data Structure

```typescript
interface FlashcardTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  topic: string;
  cardCount: number;
  difficulty: DifficultyLevel;
  cards: TemplateCard[];
  icon: string;
}
```

## Adding New Templates

To add new templates, edit `src/config/templates.config.ts`:

```typescript
{
  id: "unique-template-id",
  title: "Template Title",
  description: "Brief description",
  category: "Physics" | "Chemistry" | "Biology",
  topic: "Specific Topic",
  cardCount: 6,
  difficulty: DifficultyLevel.MEDIUM,
  icon: "icon-name",
  cards: [
    {
      front_content: "Question",
      back_content: "Answer",
      difficulty: DifficultyLevel.EASY,
      tags: ["tag1", "tag2"],
    },
    // ... more cards
  ],
}
```

## Future Enhancements

- User-created templates (share your decks as templates)
- Template ratings and reviews
- More templates covering all NEET topics
- Template customization before creation
- Community template marketplace
- Template preview with sample cards
- Difficulty-based filtering
- Topic-based recommendations
