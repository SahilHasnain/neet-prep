/**
 * Home Screen - Study Path Focused
 * Primary entry point emphasizing guided learning
 */

import { ReviewSession } from "@/src/components/flashcard/ReviewSession";
import { THEME_CLASSES } from "@/src/config/theme.config";
import { useSpacedRepetition } from "@/src/hooks/useSpacedRepetition";
import { useStudyPath } from "@/src/hooks/useStudyPath";
import { getOrCreateUserId } from "@/src/utils/user-id";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  const { studyPath, topicsWithProgress, loading: pathLoading } = useStudyPath(userId || "");
  const {
    dueCount,
    stats,
    loading: reviewLoading,
    refresh: refreshReviews,
  } = useSpacedRepetition();

  // Initialize user ID on mount
  useEffect(() => {
    getOrCreateUserId().then(setUserId);
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        refreshReviews();
      }
    }, [userId, refreshReviews]),
  );

  if (!userId || pathLoading) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-base text-text-secondary mt-4">Loading...</Text>
      </View>
    );
  }

  // Calculate study path stats
  const completedTopics = topicsWithProgress.filter(t => t.progress?.status === 'completed').length;
  const inProgressTopics = topicsWithProgress.filter(t => t.progress?.status === 'in_progress').length;
  const unlockedTopics = topicsWithProgress.filter(t => t.progress?.status === 'unlocked').length;

  return (
    <SafeAreaView className={THEME_CLASSES.screen} edges={["top", "bottom"]}>
      <ScrollView className="flex-1">
        {/* Hero Header */}
        <View className="bg-gradient-to-br from-accent-primary to-accent-secondary px-4 pt-6 pb-8">
          <Text className="text-3xl font-bold text-white mb-2">NeuroPrep</Text>
          <Text className="text-base text-white/90">
            Your AI-Powered NEET Study Companion
          </Text>
        </View>

        <View className="px-4 -mt-4">
          {/* Daily Review Card */}
          {dueCount > 0 && (
            <View className="mb-4">
              <ReviewSession dueCount={dueCount} />
            </View>
          )}

          {/* Study Path Status */}
          {studyPath ? (
            <TouchableOpacity
              onPress={() => router.push("/study-path/" as any)}
              className="bg-background-secondary rounded-xl p-5 mb-4 border border-border-subtle active:bg-interactive-hover"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className={THEME_CLASSES.heading2}>Your Study Path</Text>
                <Ionicons name="chevron-forward" size={24} color="#8b5cf6" />
              </View>

              {/* Progress Bar */}
              <View className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className={THEME_CLASSES.caption}>Overall Progress</Text>
                  <Text className={`${THEME_CLASSES.caption} font-semibold`}>
                    {studyPath.progress_percentage}%
                  </Text>
                </View>
                <View className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <View
                    className="h-full bg-accent-primary rounded-full"
                    style={{ width: `${studyPath.progress_percentage}%` }}
                  />
                </View>
              </View>

              {/* Stats */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-accent-success">
                    {completedTopics}
                  </Text>
                  <Text className={THEME_CLASSES.caption}>Completed</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-accent-primary">
                    {inProgressTopics}
                  </Text>
                  <Text className={THEME_CLASSES.caption}>In Progress</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-biology">
                    {unlockedTopics}
                  </Text>
                  <Text className={THEME_CLASSES.caption}>Available</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            /* No Study Path - Get Started */
            <View className="bg-background-secondary rounded-xl p-6 mb-4 border border-border-subtle">
              <View className="items-center mb-4">
                <View className="w-20 h-20 rounded-full bg-accent-primary/20 items-center justify-center mb-3">
                  <Ionicons name="map" size={40} color="#8b5cf6" />
                </View>
                <Text className={`${THEME_CLASSES.heading2} text-center mb-2`}>
                  Welcome to NeuroPrep!
                </Text>
                <Text className={`${THEME_CLASSES.body} text-center mb-4`}>
                  Get started with a personalized study path based on your current knowledge
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/diagnostic/" as any)}
                className={`${THEME_CLASSES.buttonPrimary} mb-3`}
              >
                <Ionicons name="rocket" size={20} color="#fff" />
                <Text className="text-white text-base font-semibold ml-2">
                  Take Diagnostic Test
                </Text>
              </TouchableOpacity>

              <Text className={`${THEME_CLASSES.caption} text-center mb-2`}>
                Or explore pre-made content:
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/templates/" as any)}
                className="bg-background-tertiary rounded-lg p-3 flex-row items-center justify-center active:bg-interactive-hover"
              >
                <Ionicons name="albums" size={18} color="#8b5cf6" />
                <Text className="text-accent-primary text-sm font-semibold ml-2">
                  Browse Templates
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions */}
          <View className="mb-4">
            <Text className={`${THEME_CLASSES.heading3} mb-3`}>Quick Actions</Text>
            
            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity
                onPress={() => router.push("/study-path/" as any)}
                className="flex-1 bg-background-secondary rounded-xl p-4 border border-border-subtle active:bg-interactive-hover"
              >
                <View className="w-12 h-12 rounded-full bg-accent-primary/20 items-center justify-center mb-2">
                  <Ionicons name="map" size={24} color="#8b5cf6" />
                </View>
                <Text className={`${THEME_CLASSES.heading3} mb-1`}>
                  Study Path
                </Text>
                <Text className={THEME_CLASSES.caption}>
                  Continue learning
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/study-path/daily" as any)}
                className="flex-1 bg-background-secondary rounded-xl p-4 border border-border-subtle active:bg-interactive-hover"
              >
                <View className="w-12 h-12 rounded-full bg-accent-secondary/20 items-center justify-center mb-2">
                  <Ionicons name="calendar" size={24} color="#3b82f6" />
                </View>
                <Text className={`${THEME_CLASSES.heading3} mb-1`}>
                  Daily Tasks
                </Text>
                <Text className={THEME_CLASSES.caption}>
                  Today's plan
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => router.push("/templates/" as any)}
                className="flex-1 bg-background-secondary rounded-xl p-4 border border-border-subtle active:bg-interactive-hover"
              >
                <View className="w-12 h-12 rounded-full bg-accent-success/20 items-center justify-center mb-2">
                  <Ionicons name="albums" size={24} color="#10b981" />
                </View>
                <Text className={`${THEME_CLASSES.heading3} mb-1`}>
                  Templates
                </Text>
                <Text className={THEME_CLASSES.caption}>
                  Quick start
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/insights/" as any)}
                className="flex-1 bg-background-secondary rounded-xl p-4 border border-border-subtle active:bg-interactive-hover"
              >
                <View className="w-12 h-12 rounded-full bg-accent-warning/20 items-center justify-center mb-2">
                  <Ionicons name="analytics" size={24} color="#f59e0b" />
                </View>
                <Text className={`${THEME_CLASSES.heading3} mb-1`}>
                  Insights
                </Text>
                <Text className={THEME_CLASSES.caption}>
                  Your stats
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Study Streak */}
          {stats && stats.streak_days > 0 && (
            <View className="bg-gradient-to-r from-accent-warning/20 to-accent-error/20 rounded-xl p-4 mb-4 border border-accent-warning/30">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-accent-warning/30 items-center justify-center mr-3">
                  <Ionicons name="flame" size={28} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-text-primary">
                    {stats.streak_days} Day Streak!
                  </Text>
                  <Text className={THEME_CLASSES.caption}>
                    Keep it going! Review daily to maintain your streak
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
