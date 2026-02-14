# Flashcard Database Schema

## Database: `flashcard_db`

### Collections Overview

1. **flashcard_decks** - Stores flashcard deck information
2. **flashcards** - Individual flashcard content
3. **user_progress** - Tracks user learning progress
4. **ai_generation_logs** - Logs AI generation attempts

---

## Collection: flashcard_decks

Stores information about flashcard decks created by users.

### Attributes

| Field       | Type        | Required | Indexed | Default | Description           |
| ----------- | ----------- | -------- | ------- | ------- | --------------------- |
| deck_id     | string(36)  | Yes      | Unique  | -       | Unique identifier     |
| user_id     | string(36)  | Yes      | Key     | -       | Owner user ID         |
| title       | string(100) | Yes      | -       | -       | Deck title            |
| description | string(500) | No       | -       | -       | Deck description      |
| category    | string(50)  | No       | Key     | -       | Category/topic        |
| is_public   | boolean     | No       | -       | false   | Public visibility     |
| card_count  | integer     | No       | -       | 0       | Number of cards       |
| created_at  | datetime    | Yes      | -       | -       | Creation timestamp    |
| updated_at  | datetime    | Yes      | -       | -       | Last update timestamp |

### Permissions

- Read: User (owner)
- Create: Any authenticated user
- Update: User (owner)
- Delete: User (owner)

---

## Collection: flashcards

Stores individual flashcard content within decks.

### Attributes

| Field         | Type         | Required | Indexed | Default | Description           |
| ------------- | ------------ | -------- | ------- | ------- | --------------------- |
| card_id       | string(36)   | Yes      | Unique  | -       | Unique identifier     |
| deck_id       | string(36)   | Yes      | Key     | -       | Parent deck ID        |
| front_content | string(1000) | Yes      | -       | -       | Question/front side   |
| back_content  | string(1000) | Yes      | -       | -       | Answer/back side      |
| difficulty    | enum         | Yes      | -       | -       | easy, medium, hard    |
| tags          | string[](50) | No       | -       | []      | Categorization tags   |
| order_index   | integer      | Yes      | -       | -       | Display order         |
| created_at    | datetime     | Yes      | -       | -       | Creation timestamp    |
| updated_at    | datetime     | Yes      | -       | -       | Last update timestamp |

### Permissions

- Read: User (deck owner)
- Create: Any authenticated user
- Update: User (deck owner)
- Delete: User (deck owner)

---

## Collection: user_progress

Tracks individual user progress on flashcards for spaced repetition.

### Attributes

| Field           | Type       | Required | Indexed   | Default | Description       |
| --------------- | ---------- | -------- | --------- | ------- | ----------------- |
| progress_id     | string(36) | Yes      | Unique    | -       | Unique identifier |
| user_id         | string(36) | Yes      | Composite | -       | User ID           |
| card_id         | string(36) | Yes      | Composite | -       | Flashcard ID      |
| deck_id         | string(36) | Yes      | Key       | -       | Deck ID           |
| mastery_level   | integer    | Yes      | -         | 0       | Mastery (0-5)     |
| last_reviewed   | datetime   | Yes      | -         | -       | Last review time  |
| next_review     | datetime   | Yes      | -         | -       | Next review time  |
| review_count    | integer    | No       | -         | 0       | Total reviews     |
| correct_count   | integer    | No       | -         | 0       | Correct answers   |
| incorrect_count | integer    | No       | -         | 0       | Incorrect answers |

### Indexes

- Unique composite: (user_id, card_id)
- Key: deck_id

### Permissions

- Read: User (owner)
- Create: Any authenticated user
- Update: User (owner)
- Delete: User (owner)

---

## Collection: ai_generation_logs

Logs all AI flashcard generation attempts for monitoring and debugging.

### Attributes

| Field           | Type         | Required | Indexed | Default | Description              |
| --------------- | ------------ | -------- | ------- | ------- | ------------------------ |
| log_id          | string(36)   | Yes      | Unique  | -       | Unique identifier        |
| user_id         | string(36)   | Yes      | Key     | -       | User who requested       |
| deck_id         | string(36)   | No       | Key     | -       | Target deck (optional)   |
| prompt          | string(1000) | Yes      | -       | -       | Generation topic         |
| cards_generated | integer      | Yes      | -       | -       | Number generated         |
| status          | enum         | Yes      | -       | -       | pending, success, failed |
| error_message   | string(500)  | No       | -       | -       | Error details            |
| created_at      | datetime     | Yes      | -       | -       | Generation timestamp     |

### Permissions

- Read: User (owner)
- Create: Any authenticated user

---

## Relationships

```
flashcard_decks (1) ──< (N) flashcards
    deck_id              deck_id

flashcards (1) ──< (N) user_progress
    card_id              card_id

flashcard_decks (1) ──< (N) user_progress
    deck_id              deck_id

flashcard_decks (1) ──< (N) ai_generation_logs
    deck_id              deck_id
```

---

## Indexes Summary

### flashcard_decks

- `deck_id_idx` (unique) on deck_id
- `user_id_idx` (key) on user_id
- `category_idx` (key) on category

### flashcards

- `card_id_idx` (unique) on card_id
- `deck_id_idx` (key) on deck_id

### user_progress

- `progress_id_idx` (unique) on progress_id
- `user_card_idx` (unique) on (user_id, card_id)
- `deck_id_idx` (key) on deck_id

### ai_generation_logs

- `log_id_idx` (unique) on log_id
- `user_id_idx` (key) on user_id
- `deck_id_idx` (key) on deck_id
