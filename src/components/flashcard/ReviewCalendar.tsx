/**
 * Review Calendar Component
 * Shows review stats, streak, and forecast
 */

import { Text, View } from "react-native";
import { THEME_CLASSES } from "../../config/theme.config";
import { ReviewSessionStats } from "../../types/flashcard.types";

interface ReviewCalendarProps {
  stats: ReviewSessionStats | null;
}

export const ReviewCalendar = ({ stats }: ReviewCalendarProps) => {
  if (!stats) {
    return null;
  }

  return (
    <View className={`${THEME_CLASSES.card} mb-4`}>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-base font-semibold text-text-primary">Review Statistics</Text>
        {stats.streak_days > 0 && (
          <View className="flex-row items-center bg-accent-warning/20 px-2 py-1 rounded-full gap-1 border border-accent-warning/30">
            <Text className="text-sm">🔥</Text>
            <Text className="text-xs font-semibold text-accent-warning">
              {stats.streak_days}d
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-2 mb-3">
        <View className="flex-1 bg-background-tertiary p-2 rounded-lg items-center">
          <Text className="text-xl font-bold text-text-primary">
            {stats.reviewed_today}
          </Text>
          <Text className="text-[10px] text-text-tertiary font-semibold">
            Today
          </Text>
        </View>

        <View className="flex-1 bg-background-tertiary p-2 rounded-lg items-center">
          <Text className="text-xl font-bold text-text-primary">
            {stats.total_due}
          </Text>
          <Text className="text-[10px] text-text-tertiary font-semibold">
            Due
          </Text>
        </View>

        <View className="flex-1 bg-background-tertiary p-2 rounded-lg items-center">
          <Text className="text-xl font-bold text-text-primary">
            {stats.new_cards}
          </Text>
          <Text className="text-[10px] text-text-tertiary font-semibold">New</Text>
        </View>

        <View className="flex-1 bg-background-tertiary p-2 rounded-lg items-center">
          <Text className="text-xl font-bold text-text-primary">
            {stats.learning_cards}
          </Text>
          <Text className="text-[10px] text-text-tertiary font-semibold">
            Learning
          </Text>
        </View>
      </View>

      <View className="mb-3">
        <View className="flex-row h-2 rounded-full overflow-hidden mb-2">
          <View
            className="h-full bg-accent-secondary"
            style={{ flex: stats.new_cards || 0.1 }}
          />
          <View
            className="h-full bg-accent-warning"
            style={{ flex: stats.learning_cards || 0.1 }}
          />
          <View
            className="h-full bg-accent-primary"
            style={{ flex: stats.review_cards || 0.1 }}
          />
          <View
            className="h-full bg-accent-success"
            style={{ flex: stats.mastered_cards || 0.1 }}
          />
        </View>
        <View className="flex-row flex-wrap gap-2">
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-full bg-accent-secondary" />
            <Text className="text-[10px] text-text-tertiary">
              New {stats.new_cards}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-full bg-accent-warning" />
            <Text className="text-[10px] text-text-tertiary">
              Learning {stats.learning_cards}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-full bg-accent-primary" />
            <Text className="text-[10px] text-text-tertiary">
              Review {stats.review_cards}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 rounded-full bg-accent-success" />
            <Text className="text-[10px] text-text-tertiary">
              Mastered {stats.mastered_cards}
            </Text>
          </View>
        </View>
      </View>

      <View className="pt-3 border-t border-border-subtle">
        <View className="flex-row gap-2">
          <View className="flex-1 bg-accent-secondary/10 p-2 rounded-lg items-center border border-accent-secondary/20">
            <Text className="text-lg font-bold text-accent-secondary">
              {stats.forecast.tomorrow}
            </Text>
            <Text className="text-[10px] text-accent-secondary font-semibold">
              Tomorrow
            </Text>
          </View>
          <View className="flex-1 bg-accent-secondary/10 p-2 rounded-lg items-center border border-accent-secondary/20">
            <Text className="text-lg font-bold text-accent-secondary">
              {stats.forecast.next_week}
            </Text>
            <Text className="text-[10px] text-accent-secondary font-semibold">
              Next 7d
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
