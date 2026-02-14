# Generate Flashcards Function

Appwrite serverless function that generates flashcards using GROQ AI.

## Features

- Generate 5-50 flashcards per request
- Support for multiple difficulty levels (easy, medium, hard)
- Multi-language support
- Automatic logging of generation attempts
- Error handling and validation
- JSON response format

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
GROQ_API_KEY=your_groq_api_key_here
APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
```

## Request Format

```json
{
  "topic": "JavaScript Promises",
  "count": 10,
  "difficulty": "medium",
  "language": "en",
  "userId": "user123",
  "deckId": "deck456"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "flashcards": [
      {
        "front_content": "What is a Promise in JavaScript?",
        "back_content": "A Promise is an object representing the eventual completion or failure of an asynchronous operation.",
        "difficulty": "medium",
        "tags": ["javascript", "async", "promises"],
        "order_index": 0
      }
    ],
    "count": 10,
    "topic": "JavaScript Promises",
    "difficulty": "medium"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Failed to generate flashcards",
  "message": "Detailed error message"
}
```

## Deployment

### Using Appwrite CLI

1. Install Appwrite CLI:

```bash
npm install -g appwrite-cli
```

2. Login to Appwrite:

```bash
appwrite login
```

3. Initialize function:

```bash
appwrite init function
```

4. Deploy function:

```bash
appwrite deploy function
```

### Manual Deployment

1. Go to Appwrite Console
2. Navigate to Functions
3. Create new function
4. Set runtime to Node.js 18+
5. Upload the function code
6. Set environment variables
7. Deploy

## Testing

Test the function using curl:

```bash
curl -X POST https://your-appwrite-endpoint/v1/functions/generate-flashcards/executions \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: your-project-id" \
  -d '{
    "topic": "React Hooks",
    "count": 5,
    "difficulty": "medium",
    "language": "en",
    "userId": "test-user-123"
  }'
```

## Rate Limiting

Consider implementing rate limiting to prevent abuse:

- Max 10 requests per user per hour
- Max 50 cards per request
- Monitor GROQ API usage

## Error Codes

- `400`: Bad request (invalid parameters)
- `405`: Method not allowed (only POST is supported)
- `500`: Internal server error

## Monitoring

All generation attempts are logged in the `ai_generation_logs` collection for monitoring and debugging purposes.
