import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      <SafeAreaView className={`${THEME_CLASSES.screen} items-center justify-center`}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className={`${THEME_CLASSES.body} mt-4`}>Loading your study path...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className={`${THEME_CLASSES.screen} items-center justify-center px-6`}>
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className={`${THEME_CLASSES.heading2} mt-4`}>Error</Text>
        <Text className={`${THEME_CLASSES.body} mt-2 text-center`}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!studyPath) {
    return (
      <SafeAreaView className={THEME_CLASSES.screen}>
        <ScrollView>
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
      </SafeAreaView>
    );
  }

  const completedCount = topicsWithProgress.filter(t => t.progress?.status === 'completed').length;
  const unlockedCount = topicsWithProgress.filter(t => t.progress?.status === 'unlocked').length;
  const inProgressCount = topicsWithProgress.filter(t => t.progress?.status === 'in_progress').length;

  return (
    <SafeAreaView className={THEME_CLASSES.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View className="px-4 pt-4 pb-6">
        {/* Header with Progress */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-text-primary mb-2">
            Your Study Path
          </Text>
          <Text className="text-sm text-text-secondary mb-4">
            {studyPath.topics_completed}/{studyPath.total_topics} topics completed
          </Text>
          
          {/* Progress Bar */}
          <View className="bg-background-secondary rounded-xl p-4 border border-border-subtle">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Overall Progress
              </Text>
              <Text className="text-lg font-bold text-accent-primary">
                {studyPath.progress_percentage}%
              </Text>
            </View>
            <View className="h-3 overflow-hidden rounded-full bg-background-tertiary">
              <View 
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
                style={{ width: `${studyPath.progress_percentage}%` }}
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            Quick Actions
          </Text>
          
          <View className="flex-row gap-3 mb-3">
            {/* Daily Tasks - Primary */}
            <TouchableOpacity
              onPress={() => router.push('/study-path/daily' as any)}
              className="flex-1 bg-accent-primary rounded-xl p-4 active:opacity-90"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center">
                  <Ionicons name="calendar" size={20} color="#fff" />
                </View>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
              <Text className="text-base font-bold text-white mb-1">
                Today's Tasks
              </Text>
              <Text className="text-xs text-white/80">
                Your daily study plan
              </Text>
            </TouchableOpacity>

            {/* Retake Diagnostic */}
            <TouchableOpacity
              onPress={() => router.push('/diagnostic' as any)}
              className="flex-1 bg-background-secondary border border-border-subtle rounded-xl p-4 active:bg-background-tertiary"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="w-10 h-10 rounded-xl bg-biology/20 items-center justify-center">
                  <Ionicons name="refresh" size={20} color="#ec4899" />
                </View>
                <Ionicons name="chevron-forward" size={18} color="#717171" />
              </View>
              <Text className="text-base font-bold text-text-primary mb-1">
                Retake Test
              </Text>
              <Text className="text-xs text-text-tertiary">
                Update your path
              </Text>
            </TouchableOpacity>
          </View>

          {/* Revert Option */}
          {showRevertOption && (
            <TouchableOpacity
              onPress={handleRevertPath}
              className="flex-row items-center justify-between p-4 bg-background-secondary border border-accent-warning/30 rounded-xl active:bg-background-tertiary"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-xl bg-accent-warning/20 items-center justify-center mr-3">
                  <Ionicons name="arrow-undo" size={20} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-text-primary">
                    Revert to Previous Path
                  </Text>
                  <Text className="text-xs text-text-tertiary">
                    Restore your previous study path
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#717171" />
            </TouchableOpacity>
          )}
        </View>

        {/* Enhanced Topics List */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Learning Path
            </Text>
            <View className="flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-accent-success" />
              <View className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
              <View className="w-1.5 h-1.5 rounded-full bg-text-disabled" />
            </View>
          </View>
        
          {topicsWithProgress.map((topic, index) => {
            const isLocked = topic.progress?.status === 'locked';
            const isCompleted = topic.progress?.status === 'completed';
            const isUnlocked = topic.progress?.status === 'unlocked';
            const isInProgress = topic.progress?.status === 'in_progress';
            
            // Get subject color
            const subjectColor = topic.subject === 'Physics' ? '#3b82f6' : 
                                 topic.subject === 'Chemistry' ? '#10b981' : '#ec4899';
            
            return (
              <View key={topic.id} className="mb-3">
                <TouchableOpacity
                  disabled={isLocked}
                  onPress={() => router.push(`/study-path/topic/${topic.id}` as any)}
                  className={`bg-background-secondary rounded-2xl overflow-hidden border ${
                    isCompleted ? 'border-accent-success/30' :
                    isInProgress ? 'border-accent-primary/30' :
                    isUnlocked ? 'border-accent-primary/20' :
                    'border-border-subtle'
                  } ${isLocked ? 'opacity-50' : ''} active:bg-background-tertiary`}
                >
                  {/* Status Indicator Bar */}
                  <View 
                    className="h-1"
                    style={{ 
                      backgroundColor: isCompleted ? '#10b981' : 
                                      isInProgress ? '#8b5cf6' : 
                                      isUnlocked ? '#3b82f6' : '#272727' 
                    }}
                  />
                  
                  <View className="p-4">
                    <View className="flex-row items-start">
                      {/* Status Icon */}
                      <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${
                        isCompleted ? 'bg-accent-success/20' :
                        isInProgress ? 'bg-accent-primary/20' :
                        isUnlocked ? 'bg-accent-secondary/20' :
                        'bg-background-tertiary'
                      }`}>
                        {isCompleted ? (
                          <Ionicons name="checkmark-circle" size={26} color="#10b981" />
                        ) : isLocked ? (
                          <Ionicons name="lock-closed" size={22} color="#525252" />
                        ) : isInProgress ? (
                          <Ionicons name="play-circle" size={26} color="#8b5cf6" />
                        ) : (
                          <Text className="text-lg font-bold text-accent-primary">{index + 1}</Text>
                        )}
                      </View>

                      {/* Topic Info */}
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2 flex-wrap">
                          <View 
                            className="px-2.5 py-1 rounded-lg mr-2"
                            style={{ backgroundColor: `${subjectColor}20` }}
                          >
                            <Text 
                              className="text-xs font-bold"
                              style={{ color: subjectColor }}
                            >
                              {topic.subject}
                            </Text>
                          </View>
                          <View className="flex-row items-center mr-2">
                            <Ionicons name="time-outline" size={12} color="#717171" />
                            <Text className="text-xs text-text-tertiary ml-1">
                              {topic.estimatedHours}h
                            </Text>
                          </View>
                          <View 
                            className="px-2 py-0.5 rounded-lg"
                            style={{ 
                              backgroundColor: topic.difficulty === 'foundation' ? '#10b98120' : 
                                             topic.difficulty === 'intermediate' ? '#f59e0b20' : '#ef444420' 
                            }}
                          >
                            <Text 
                              className="text-xs font-bold capitalize"
                              style={{ 
                                color: topic.difficulty === 'foundation' ? '#10b981' : 
                                       topic.difficulty === 'intermediate' ? '#f59e0b' : '#ef4444' 
                              }}
                            >
                              {topic.difficulty}
                            </Text>
                          </View>
                        </View>
                        
                        <Text className="text-base font-bold text-text-primary mb-1">
                          {topic.name}
                        </Text>
                        
                        {topic.progress && topic.progress.mastery_level > 0 && (
                          <View className="mt-2">
                            <View className="flex-row items-center justify-between mb-1.5">
                              <Text className="text-xs text-text-tertiary">
                                Mastery Progress
                              </Text>
                              <Text className="text-xs font-bold text-accent-primary">
                                {topic.progress.mastery_level}%
                              </Text>
                            </View>
                            <View className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                              <View 
                                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
                                style={{ width: `${topic.progress.mastery_level}%` }}
                              />
                            </View>
                          </View>
                        )}
                      </View>

                      {/* Arrow */}
                      {!isLocked && (
                        <View className="w-8 h-8 rounded-xl bg-background-tertiary items-center justify-center ml-2">
                          <Ionicons name="chevron-forward" size={18} color="#8b5cf6" />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                
                {/* Connection Line to Next Topic */}
                {index < topicsWithProgress.length - 1 && (
                  <View className="flex-row items-center ml-6 my-1">
                    <View className="w-0.5 h-4 bg-border-primary" />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
