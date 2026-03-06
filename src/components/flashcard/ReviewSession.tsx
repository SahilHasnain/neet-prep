/**
 * Review Session Component
 * Displays due cards count and review progress
 */

import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { THEME_CLASSES } from "../../config/theme.config";

interface ReviewSessionProps {
  dueCount: number;
  deckId?: string;
  deckTitle?: string;
}

export const ReviewSession = ({
  dueCount,
  deckId,
  deckTitle,
}: ReviewSessionProps) => {
  const router = useRouter();

  if (dueCount === 0) {
    return (
      <View className="mb-4">
        <View className="bg-background-tertiary rounded-xl p-8 items-center border-2 border-border-primary border-dashed">
          <Text className="text-5xl mb-3">✨</Text>
          <Text className={`${THEME_CLASSES.heading3} mb-1`}>
            All caught up!
          </Text>
          <Text className="text-sm text-text-tertiary">
            No cards due for review
          </Text>
        </View>
      </View>
    );
  }

  const handleStartReview = () => {
    if (deckId) {
      router.push(`/study/${deckId}?reviewMode=true`);
    } else {
      console.warn(
        "No deckId provided for review session - unable to start review",
      );
    }
  };

  return (
    <View className="mb-4">
      <View className={`${THEME_CLASSES.card} border-l-4 border-accent-success`}>
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 rounded-full bg-accent-success justify-center items-center mr-3">
            <Text className="text-white text-xl font-bold">{dueCount}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-text-primary">
              Cards Due for Review
            </Text>
            {deckTitle && (
              <Text className="text-xs text-text-tertiary mt-0.5">
                {deckTitle}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          className={`${THEME_CLASSES.buttonSuccess} flex-row gap-2 py-3`}
          onPress={handleStartReview}
          activeOpacity={0.8}
        >
          <Text className="text-white text-sm font-semibold">
            Start Review
          </Text>
          <Text className="text-white text-base font-semibold">→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
