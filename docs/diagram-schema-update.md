# Diagram Flashcards - Database Schema Update

## Updates to Existing Collection: `flashcards`

Add these new attributes to the `flashcards` collection in Appwrite:

| Field     | Type    | Required | Default | Description                  |
| --------- | ------- | -------- | ------- | ---------------------------- |
| has_image | boolean | No       | false   | Whether card has a diagram   |
| image_url | string  | No       | null    | Appwrite Storage file URL    |
| image_id  | string  | No       | null    | Storage file ID for deletion |

## New Collection: `flashcard_labels`

Create this new collection in Appwrite:

| Field       | Type        | Required | Indexed | Description         |
| ----------- | ----------- | -------- | ------- | ------------------- |
| label_id    | string(36)  | Yes      | Unique  | Unique identifier   |
| card_id     | string(36)  | Yes      | Key     | Parent flashcard ID |
| label_text  | string(100) | Yes      | -       | Label text content  |
| x_position  | float       | Yes      | -       | X position (0-100%) |
| y_position  | float       | Yes      | -       | Y position (0-100%) |
| order_index | integer     | Yes      | -       | Display order       |
| created_at  | datetime    | Yes      | -       | Creation timestamp  |

### Indexes

- `label_id_idx` (unique) on label_id
- `card_id_idx` (key) on card_id

### Permissions

- Read: User (card owner)
- Create: Any authenticated user
- Update: User (card owner)
- Delete: User (card owner)

## Appwrite Storage Bucket: `flashcard_images`

Create a new storage bucket with these settings:

- **Bucket ID**: `flashcard_images`
- **Name**: Flashcard Images
- **Max File Size**: 5MB (5242880 bytes)
- **Allowed File Extensions**: jpg, jpeg, png
- **Compression**: Enabled
- **Encryption**: Enabled
- **Antivirus**: Enabled

### Permissions

- Read: User (file owner)
- Create: Any authenticated user
- Update: User (file owner)
- Delete: User (file owner)

## Manual Setup Steps

1. Go to Appwrite Console → Databases → flashcard_db
2. Select `flashcards` collection → Attributes
3. Add the three new attributes listed above
4. Create new collection `flashcard_labels` with attributes
5. Go to Storage → Create Bucket
6. Configure `flashcard_images` bucket with settings above
7. Set appropriate permissions for all resources
