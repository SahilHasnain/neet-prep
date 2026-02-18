import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_ID_KEY = "@neuroprep_user_id";

// Dev flag - set to true to use temp user for testing
// This allows you to share data across all dev instances
export const USE_TEMP_USER = false;
const TEMP_USER_ID = "temp-user-123";

/**
 * Generates a unique user ID for anonymous users
 * This ID persists across app sessions until authentication is implemented
 *
 * Set USE_TEMP_USER to true to use a shared temp user for testing
 */
export async function getOrCreateUserId(): Promise<string> {
  // Use temp user if flag is enabled
  if (USE_TEMP_USER) {
    return TEMP_USER_ID;
  }
  try {
    // Try to get existing user ID
    const existingId = await AsyncStorage.getItem(USER_ID_KEY);

    if (existingId) {
      return existingId;
    }

    // Generate new unique ID
    const newId = generateUniqueId();

    // Store it for future use
    await AsyncStorage.setItem(USER_ID_KEY, newId);

    return newId;
  } catch (error) {
    console.error("Error managing user ID:", error);
    // Fallback to session-based ID if storage fails
    return generateUniqueId();
  }
}

/**
 * Clears the stored user ID (useful for testing or when implementing auth)
 */
export async function clearUserId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
  } catch (error) {
    console.error("Error clearing user ID:", error);
  }
}

/**
 * Generates a unique ID using timestamp and random values
 */
function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `user_${timestamp}_${randomPart}`;
}
