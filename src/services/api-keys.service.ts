import { Query } from 'react-native-appwrite';
import { databases } from './appwrite';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'api-keys';

// Cache for API keys to avoid repeated fetches
const apiKeyCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class ApiKeysService {
  /**
   * Fetch an API key from Appwrite
   */
  static async getApiKey(keyName: string): Promise<string | null> {
    try {
      // Check cache first
      const cached = apiKeyCache.get(keyName);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.value;
      }

      // Fetch from Appwrite
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('key_name', keyName),
          Query.equal('is_active', true)
        ]
      );

      if (response.documents.length === 0) {
        console.warn(`API key not found: ${keyName}`);
        return null;
      }

      const keyValue = response.documents[0].key_value;

      // Cache the result
      apiKeyCache.set(keyName, {
        value: keyValue,
        timestamp: Date.now()
      });

      return keyValue;
    } catch (error) {
      console.error(`Error fetching API key ${keyName}:`, error);
      return null;
    }
  }

  /**
   * Get OpenAI API key
   */
  static async getOpenAIKey(): Promise<string | null> {
    return this.getApiKey('OPENAI_API_KEY');
  }

  /**
   * Get Gemini API key
   */
  static async getGeminiKey(): Promise<string | null> {
    return this.getApiKey('GEMINI_API_KEY');
  }

  /**
   * Clear the cache (useful for testing or forcing refresh)
   */
  static clearCache(): void {
    apiKeyCache.clear();
  }

  /**
   * Check if a key exists and is active
   */
  static async isKeyAvailable(keyName: string): Promise<boolean> {
    const key = await this.getApiKey(keyName);
    return key !== null && key.length > 0;
  }
}
