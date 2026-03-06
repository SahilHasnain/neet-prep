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
| topic_id    | string(50)  | No       | Key     | -       | Linked study path topic |
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
- `topic_id_idx` (key) on topic_id

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

---

## Collection: mistake_patterns

Tracks recurring mistakes by concept for personalized remediation.

### Attributes

| Field             | Type          | Required | Indexed | Default | Description                |
| ----------------- | ------------- | -------- | ------- | ------- | -------------------------- |
| pattern_id        | string(36)    | Yes      | Unique  | -       | Unique identifier          |
| user_id           | string(36)    | Yes      | Key     | -       | User ID                    |
| subject           | string(50)    | Yes      | -       | -       | Subject (physics/chem/bio) |
| topic             | string(100)   | Yes      | -       | -       | Topic within subject       |
| concept_id        | string(200)   | Yes      | Key     | -       | Unique concept identifier  |
| mistake_count     | integer       | Yes      | -       | 0       | Number of mistakes         |
| last_occurrence   | datetime      | Yes      | -       | -       | Last mistake timestamp     |
| related_questions | string(10000) | No       | -       | []      | JSON array of question IDs |

### Permissions

- Read: User (owner)
- Create: Any authenticated user
- Update: User (owner)
- Delete: User (owner)

---

## Collection: quiz_attempts

Logs all quiz attempts with detailed wrong answer tracking.

### Attributes

| Field           | Type          | Required | Indexed | Default | Description                 |
| --------------- | ------------- | -------- | ------- | ------- | --------------------------- |
| attempt_id      | string(36)    | Yes      | Unique  | -       | Unique identifier           |
| user_id         | string(36)    | Yes      | Key     | -       | User ID                     |
| card_id         | string(36)    | Yes      | -       | -       | Flashcard ID                |
| deck_id         | string(36)    | Yes      | Key     | -       | Deck ID                     |
| quiz_mode       | string(50)    | Yes      | -       | -       | Quiz type                   |
| score           | integer       | Yes      | -       | -       | Score percentage (0-100)    |
| total_questions | integer       | Yes      | -       | -       | Number of questions         |
| wrong_answers   | string(50000) | No       | -       | []      | JSON array of wrong answers |
| completed_at    | datetime      | Yes      | -       | -       | Completion timestamp        |

### Permissions

- Read: User (owner)
- Create: Any authenticated user
- Update: User (owner)
- Delete: User (owner)


---

## Collection: diagnostic_results

Stores diagnostic quiz results for personalized study path generation.

### Attributes

| Field            | Type          | Required | Indexed | Default | Description                    |
| ---------------- | ------------- | -------- | ------- | ------- | ------------------------------ |
| result_id        | string(36)    | Yes      | Unique  | -       | Unique identifier              |
| user_id          | string(36)    | Yes      | Key     | -       | User ID                        |
| total_score      | integer       | Yes      | -       | -       | Overall score (0-100)          |
| physics_score    | integer       | Yes      | -       | -       | Physics score (0-100)          |
| chemistry_score  | integer       | Yes      | -       | -       | Chemistry score (0-100)        |
| biology_score    | integer       | Yes      | -       | -       | Biology score (0-100)          |
| weak_topics      | string(10000) | Yes      | -       | -       | JSON array of weak topic IDs   |
| strong_topics    | string(10000) | Yes      | -       | -       | JSON array of strong topic IDs |
| detailed_results | string(50000) | Yes      | -       | -       | JSON object with all answers   |
| completed_at     | datetime      | Yes      | -       | -       | Completion timestamp           |

### Permissions

- Read: User (owner)
- Create: Any authenticated user
- Update: User (owner)
- Delete: User (owner)

---

## Collection: study_paths

Stores personalized learning paths generated from diagnostic results.

### Attributes

| Field               | Type          | Required | Indexed | Default | Description                      |
| ------------------- | ------------- | -------- | ------- | ------- | -------------------------------- |
| path_id             | string(36)    | Yes      | Unique  | -       | Unique identifier                |
| user_id             | string(36)    | Yes      | Key     | -       | User ID                          |
| diagnostic_id       | string(36)    | Yes      | Key     | -       | Reference to diagnostic result   |
| topic_sequence      | string(50000) | Yes      | -       | -       | JSON array of ordered topic IDs  |
| current_topic_id    | string(50)    | No       | -       | -       | Currently active topic           |
| progress_percentage | integer       | Yes      | -       | -       | Overall progress (0-100)         |
| topics_completed    | integer       | Yes      | -       | -       | Number of completed topics       |
| total_topics        | integer       | Yes      | -       | -       | Total topics in path             |
| status              | string(20)    | Yes      | -       | -       | active, completed, paused        |
| created_at          | datetime      | Yes      | -       | -       | Creation timestamp               |
| updated_at          | datetime      | Yes      | -       | -       | Last update timestamp            |

### Permissions

- Read: User (owner)
- Create: Any authenticated user
- Update: User (owner)
- Delete: User (owner)

---

## Collection: topic_progress

Tracks individual topic progress within study paths.

### Attributes

| Field              | Type       | Required | Indexed   | Default | Description                           |
| ------------------ | ---------- | -------- | --------- | ------- | ------------------------------------- |
| progress_id        | string(36) | Yes      | Unique    | -       | Unique identifier                     |
| user_id            | string(36) | Yes      | Composite | -       | User ID                               |
| path_id            | string(36) | Yes      | Key       | -       | Study path ID                         |
| topic_id           | string(50) | Yes      | Composite | -       | Topic ID from knowledge graph         |
| status             | string(20) | Yes      | -         | -       | locked, unlocked, in_progress, completed |
| mastery_level      | integer    | Yes      | -         | -       | Mastery percentage (0-100)            |
| time_spent_minutes | integer    | Yes      | -         | -       | Total time spent on topic             |
| quiz_attempts      | integer    | Yes      | -         | -       | Number of quiz attempts               |
| quiz_average_score | integer    | Yes      | -         | -       | Average quiz score (0-100)            |
| started_at         | datetime   | No       | -         | -       | When topic was started                |
| completed_at       | datetime   | No       | -         | -       | When topic was completed              |
| last_accessed      | datetime   | No       | -         | -       | Last access timestamp                 |

### Indexes

- Unique composite: (user_id, topic_id)
- Key: path_id

### Permissions

- Read: User (owner)
- Create: Any authenticated user
- Update: User (owner)
- Delete: User (owner)

---

## Collection: daily_tasks

Stores daily study tasks generated from study paths.

### Attributes

| Field              | Type        | Required | Indexed   | Default | Description                      |
| ------------------ | ----------- | -------- | --------- | ------- | -------------------------------- |
| task_id            | string(36)  | Yes      | Unique    | -       | Unique identifier                |
| user_id            | string(36)  | Yes      | Composite | -       | User ID                          |
| path_id            | string(36)  | Yes      | Key       | -       | Study path ID                    |
| topic_id           | string(50)  | Yes      | -         | -       | Topic ID from knowledge graph    |
| task_type          | string(50)  | Yes      | -         | -       | study, practice, review, quiz    |
| title              | string(200) | Yes      | -         | -       | Task title                       |
| description        | string(500) | No       | -         | -       | Task description                 |
| estimated_minutes  | integer     | Yes      | -         | -       | Estimated time to complete       |
| status             | string(20)  | Yes      | -         | -       | pending, in_progress, completed, skipped |
| scheduled_date     | datetime    | Yes      | Composite | -       | Scheduled date                   |
| completed_at       | datetime    | No       | -         | -       | Completion timestamp             |
| created_at         | datetime    | Yes      | -         | -       | Creation timestamp               |

### Indexes

- Unique: task_id
- Composite key: (user_id, scheduled_date)
- Key: path_id

### Permissions

- Read: User (owner)
- Create: Any authenticated user
- Update: User (owner)
- Delete: User (owner)
