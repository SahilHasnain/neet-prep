# Flashcard-Study Path Integration Plan

## Overview
Merge standalone flashcard feature into guided learning (study path) to create a unified learning experience.

## Current Problems
- Two separate learning approaches (decks vs study paths)
- Confusing navigation - users don't know which to use
- Duplicate effort - flashcards and study content are disconnected
- Home screen is flashcard-focused despite study path being the main feature

## Goal
Single unified learning flow: Study Path → Topics → Content + Flashcards + Quizzes

---

## Phase 1: Data Model Integration (Backend)

### Database Changes
- Add `topic_id` field to `decks` collection (nullable for backward compatibility)
- Link existing decks to topics based on category/subject matching
- Keep deck structure but make it topic-scoped

### Migration Script
- Create script to auto-link existing decks to topics
- Handle orphaned decks (no matching topic)

### Service Updates
- Update `DeckService` to support topic-based filtering
- Add methods: `getDecksByTopic()`, `createTopicDeck()`
- Keep existing deck methods for backward compatibility

**Deliverables:**
- Migration script
- Updated database schema
- Modified deck service with topic support

---

## Phase 2: UI Restructuring

### Home Screen Refactor
- Remove deck list from home
- Make study path the primary feature
- Show daily review stats (spaced repetition)
- Quick actions: Continue Learning, Daily Review, Browse Topics

### Topic Detail Enhancement
- Add "Flashcards" tab alongside existing content
- Show topic-specific flashcards
- Create flashcard button within topic context
- Display mastery progress (combines content + flashcard performance)

### Navigation Changes
- Remove `/deck/[deckId]` as standalone route
- Flashcard management moves to `/study-path/topic/[topicId]`
- Keep study/quiz routes but access via topic screen

**Deliverables:**
- Refactored home screen
- Enhanced topic detail screen with flashcard tab
- Updated navigation flow

---

## Phase 3: Feature Integration & Cleanup

### Unified Learning Flow
- Topic screen shows: Overview → Study Content → Practice Flashcards → Take Quiz
- Spaced repetition tied to topics, not standalone decks
- Daily review shows cards from all topics

### Templates Integration
- Convert templates from "deck templates" to "topic quick-start"
- Templates create topic + associated flashcards
- Accessible from study path screen

### Cleanup
- Remove standalone deck creation from home
- Archive old deck-centric screens (keep code for reference)
- Update all documentation

### Polish
- Update empty states to guide users to study paths
- Ensure diagnostic quiz creates study path with linked flashcards
- Test backward compatibility with existing user data

**Deliverables:**
- Unified learning experience
- Converted templates
- Cleaned up navigation
- Updated documentation

---

## Migration Strategy
- Keep old routes functional during transition
- Gradual rollout: Phase 1 → Phase 2 → Phase 3
- No data loss - existing decks become topic-linked
- Users can continue using old flow until Phase 3

## Success Metrics
- Single entry point (study path)
- Flashcards accessible within topic context
- No orphaned decks
- Cleaner navigation (3 screens instead of 6+)
