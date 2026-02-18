import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_ID_KEY = "@neuroprep_user_id";

/**
 * Generates a unique user ID for anonymous users
 * This ID persists across app sessions until authentication is implemented
 */
export async function getOrCreateUserId(): Promise<string> {
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
