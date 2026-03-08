# API Keys Setup Guide

This guide explains how to set up and use the API keys collection in Appwrite.

## Overview

Instead of storing API keys in environment variables, we now store them securely in an Appwrite collection. This provides:

- Centralized key management
- Easy key rotation without redeployment
- Ability to enable/disable keys without code changes
- Better security through Appwrite's access controls

## Setup Steps

### 1. Create the Collection

Run the setup script to create the `api-keys` collection:

```bash
npm run setup:api-keys
```

This will create a collection with the following attributes:
- `key_name` (string, required): The name of the API key (e.g., "GROQ_API_KEY")
- `key_value` (string, required): The actual API key value
- `description` (string, optional): Description of what the key is used for
- `is_active` (boolean, required): Whether the key is currently active

### 2. Add Your API Keys

1. Go to your Appwrite Console
2. Navigate to Databases → flashcard_db → api-keys collection
3. Click "Add Document"
4. Add your API keys with the following structure:

#### GROQ API Key (Required)
```json
{
  "key_name": "GROQ_API_KEY",
  "key_value": "gsk_...",
  "description": "Groq API key for AI-powered study features",
  "is_active": true
}
```

#### Optional: OpenAI API Key
```json
{
  "key_name": "OPENAI_API_KEY",
  "key_value": "sk-...",
  "description": "OpenAI API key for advanced AI features",
  "is_active": true
}
```

#### Optional: Gemini API Key
```json
{
  "key_name": "GEMINI_API_KEY",
  "key_value": "AIza...",
  "description": "Google Gemini API key",
  "is_active": true
}
```

### 3. Permissions

The collection is set up with `Permission.read(Role.any())` by default, which allows the app to read API keys. Make sure to review and adjust permissions based on your security requirements.

## Usage in Code

### Fetching API Keys

```typescript
import { ApiKeysService } from '@/src/services/api-keys.service';

// Get a specific API key
const groqKey = await ApiKeysService.getApiKey('GROQ_API_KEY');

// Or use convenience methods
const openaiKey = await ApiKeysService.getOpenAIKey();
const geminiKey = await ApiKeysService.getGeminiKey();

// Check if a key is available
const isAvailable = await ApiKeysService.isKeyAvailable('GROQ_API_KEY');
```

### Caching

API keys are cached for 5 minutes to reduce database calls. To clear the cache:

```typescript
ApiKeysService.clearCache();
```

## Services Using API Keys

The following services now fetch API keys from Appwrite:

1. **StudyPathAIService** - Uses GROQ_API_KEY for:
   - Generating key points
   - Creating practice questions
   - Analyzing diagnostic results
   - Generating study recommendations

2. **AINotesService** - Uses GROQ_API_KEY for:
   - Generating personalized study notes
   - Creating concept maps
   - Generating formula sheets

## Migration from Environment Variables

If you were previously using environment variables:

1. Run the setup script: `npm run setup:api-keys`
2. Add your API keys to the Appwrite collection
3. The code will automatically use keys from Appwrite
4. You can keep the environment variable as a fallback (optional)

## Security Best Practices

1. **Never commit API keys** to version control
2. **Rotate keys regularly** by updating the `key_value` in Appwrite
3. **Use `is_active` flag** to temporarily disable keys without deleting them
4. **Monitor usage** through your API provider's dashboard
5. **Set appropriate permissions** on the collection based on your needs

## Troubleshooting

### API Key Not Found

If you get "API key not found" errors:

1. Check that the collection exists in Appwrite
2. Verify the key_name matches exactly (case-sensitive)
3. Ensure `is_active` is set to `true`
4. Check collection permissions allow reading

### Cache Issues

If keys aren't updating after changes:

```typescript
// Clear the cache to force a fresh fetch
ApiKeysService.clearCache();
```

### Fallback to Environment Variables

If needed, you can temporarily fall back to environment variables by checking the `GROQ_API_KEY` export in `src/config/appwrite.config.ts`.

## Future Enhancements

Potential improvements:

- Add key expiration dates
- Track key usage statistics
- Implement key rotation automation
- Add webhook notifications for key changes
- Support multiple keys per service (load balancing)
