import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useStudyPath } from '../../src/hooks/useStudyPath';
import { getOrCreateUserId } from '../../src/utils/user-id';

export default function StudyPathScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [showRevertOption, setShowRevertOption] = useState(false);

  useEffect(() => {
    getOrCreateUserId().then(setUserId);
  }, []);

  useEffect(() => {
    if (userId) {
      checkForArchivedPaths();
    }
  }, [userId]);

  const checkForArchivedPaths = async () => {
    if (!userId) return;
    try {
      const { StudyPathService } = await import('../../src/services/study-path.service');
      const allPaths = await StudyPathService.getAllUserStudyPaths(userId);
      const hasArchived = allPaths.some(p => p.status === 'archived');
      setShowRevertOption(hasArchived);
    } catch (error) {
      console.error('Error checking archived paths:', error);
    }
  };

  const handleRevertPath = async () => {
    if (!userId) return;

    Alert.alert(
      'Revert to Previous Path?',
      'This will restore your previous study path and archive the current one.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Revert',
          onPress: async () => {
            try {
              const { StudyPathService } = await import('../../src/services/study-path.service');
              const reverted = await StudyPathService.revertToPreviousPath(userId);
              
              if (reverted) {
                Alert.alert('Success', 'Previous study path restored');
                // Refresh the screen
                router.replace('/study-path' as any);
              } else {
                Alert.alert('Error', 'No previous path found to revert to');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to revert path');
            }
          }
        }
      ]
    );
  };

  const { studyPath, topicsWithProgress, loading, error } = useStudyPath(userId || '');

  if (loading) {
    return (
      <View className={`${THEME_CLASSES.screen} items-center justify-center`}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className={`${THEME_CLASSES.body} mt-4`}>Loading your study path...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className={`${THEME_CLASSES.screen} items-center justify-center px-6`}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className={`${THEME_CLASSES.heading2} mt-4`}>Error</Text>
        <Text className={`${THEME_CLASSES.body} mt-2 text-center`}>{error}</Text>
      </View>
    );
  }

  if (!studyPath) {
    return (
      <ScrollView className={THEME_CLASSES.screen}>
        <View className={THEME_CLASSES.section}>
          <View className={`${THEME_CLASSES.cardGradient} mb-6`}>
            <Text className="mb-2 text-2xl font-bold text-white">
              Your Personalized Study Path
            </Text>
            <Text className="text-sm text-text-secondary">
              AI-generated learning roadmap based on your diagnostic results
            </Text>
          </View>

          <View className={`${THEME_CLASSES.card} mb-4`}>
            <Text className={`${THEME_CLASSES.heading3} mb-4`}>
              Get Started
            </Text>
            <Text className={`${THEME_CLASSES.body} mb-4`}>
              Take our diagnostic quiz to identify your strengths and weaknesses, then get a personalized study path.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/diagnostic' as any)}
              className={THEME_CLASSES.buttonPrimary}
            >
              <Text className="text-base font-semibold text-white">
                Take Diagnostic Quiz
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  const completedCount = topicsWithProgress.filter(t => t.progress?.status === 'completed').length;
  const unlockedCount = topicsWithProgress.filter(t => t.progress?.status === 'unlocked').length;
  const inProgressCount = topicsWithProgress.filter(t => t.progress?.status === 'in_progress').length;

  return (
    <ScrollView className={THEME_CLASSES.screen}>
      <View className={THEME_CLASSES.section}>
        {/* Header */}
        <View className={`${THEME_CLASSES.cardGradient} mb-6`}>
          <Text className="mb-2 text-2xl font-bold text-white">
            Your Study Path
          </Text>
          <Text className="mb-4 text-sm text-text-secondary">
            {studyPath.topics_completed} of {studyPath.total_topics} topics completed
          </Text>
          
          {/* Progress Bar */}
          <View className="h-3 overflow-hidden rounded-full bg-white/20">
            <View 
              className="h-full bg-white rounded-full"
              style={{ width: `${studyPath.progress_percentage}%` }}
            />
          </View>
          <Text className="mt-2 text-sm font-semibold text-white">
            {studyPath.progress_percentage}% Complete
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className={`${THEME_CLASSES.card} flex-1`}>
            <Text className="text-2xl font-bold text-accent-success">{completedCount}</Text>
            <Text className={`${THEME_CLASSES.caption} mt-1`}>Completed</Text>
          </View>
          <View className={`${THEME_CLASSES.card} flex-1`}>
            <Text className="text-2xl font-bold text-accent-primary">{unlockedCount}</Text>
            <Text className={`${THEME_CLASSES.caption} mt-1`}>Unlocked</Text>
          </View>
          <View className={`${THEME_CLASSES.card} flex-1`}>
            <Text className="text-2xl font-bold text-biology">{inProgressCount}</Text>
            <Text className={`${THEME_CLASSES.caption} mt-1`}>In Progress</Text>
          </View>
        </View>

        {/* Retake Diagnostic Button */}
        <TouchableOpacity
          onPress={() => router.push('/diagnostic' as any)}
          className="flex-row items-center justify-between p-4 mb-3 bg-background-secondary border border-border-subtle rounded-xl active:bg-interactive-hover"
        >
          <View className="flex-row items-center">
            <View className="items-center justify-center w-10 h-10 mr-3 bg-biology/20 rounded-full">
              <Ionicons name="refresh" size={20} color="#ec4899" />
            </View>
            <View>
              <Text className={THEME_CLASSES.heading3}>
                Retake Diagnostic Test
              </Text>
              <Text className={`${THEME_CLASSES.caption} mt-0.5`}>
                Update your study path based on current knowledge
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#717171" />
        </TouchableOpacity>

        {/* Daily Tasks Button */}
        <TouchableOpacity
          onPress={() => router.push('/study-path/daily' as any)}
          className="flex-row items-center justify-between p-4 mb-3 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl"
        >
          <View className="flex-row items-center">
            <View className="items-center justify-center w-10 h-10 mr-3 bg-white/20 rounded-full">
              <Ionicons name="calendar" size={20} color="#fff" />
            </View>
            <View>
              <Text className="text-base font-semibold text-white">
                Today's Tasks
              </Text>
              <Text className="text-xs text-white/70 mt-0.5">
                View your daily study schedule
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Revert to Previous Path Button */}
        {showRevertOption && (
          <TouchableOpacity
            onPress={handleRevertPath}
            className="flex-row items-center justify-between p-4 mb-6 bg-background-secondary border border-accent-warning/30 rounded-xl active:bg-interactive-hover"
          >
            <View className="flex-row items-center">
              <View className="items-center justify-center w-10 h-10 mr-3 bg-accent-warning/20 rounded-full">
                <Ionicons name="arrow-undo" size={20} color="#f59e0b" />
              </View>
              <View>
                <Text className={THEME_CLASSES.heading3}>
                  Revert to Previous Path
                </Text>
                <Text className={`${THEME_CLASSES.caption} mt-0.5`}>
                  Restore your previous study path
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#717171" />
          </TouchableOpacity>
        )}

        {/* Topics List */}
        <Text className={`${THEME_CLASSES.heading3} mb-3`}>Learning Path</Text>
        
        {topicsWithProgress.map((topic, index) => {
          const isLocked = topic.progress?.status === 'locked';
          const isCompleted = topic.progress?.status === 'completed';
          const isUnlocked = topic.progress?.status === 'unlocked';
          
          return (
            <TouchableOpacity
              key={topic.id}
              disabled={isLocked}
              onPress={() => router.push(`/study-path/topic/${topic.id}` as any)}
              className={`${THEME_CLASSES.card} mb-3 ${isLocked ? 'opacity-50' : ''} active:bg-background-tertiary`}
            >
              <View className="flex-row items-start">
                {/* Status Icon */}
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  isCompleted ? 'bg-accent-success/20' :
                  isUnlocked ? 'bg-accent-primary/20' :
                  'bg-background-tertiary'
                }`}>
                  {isCompleted ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  ) : isLocked ? (
                    <Ionicons name="lock-closed" size={20} color="#525252" />
                  ) : (
                    <Text className="font-bold text-accent-primary">{index + 1}</Text>
                  )}
                </View>

                {/* Topic Info */}
                <View className="flex-1">
                  <Text className={`${THEME_CLASSES.heading3} mb-1`}>
                    {topic.name}
                  </Text>
                  <Text className={`${THEME_CLASSES.caption} mb-2`}>
                    {topic.subject} • {topic.estimatedHours}h • {topic.difficulty}
                  </Text>
                  
                  {topic.progress && topic.progress.mastery_level > 0 && (
                    <View className="mt-2">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className={THEME_CLASSES.caption}>Mastery</Text>
                        <Text className={`${THEME_CLASSES.caption} font-semibold`}>
                          {topic.progress.mastery_level}%
                        </Text>
                      </View>
                      <View className={THEME_CLASSES.progressBar}>
                        <View 
                          className={THEME_CLASSES.progressFill}
                          style={{ width: `${topic.progress.mastery_level}%` }}
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Arrow */}
                {!isLocked && (
                  <Ionicons name="chevron-forward" size={20} color="#717171" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
