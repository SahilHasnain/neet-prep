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
      <View className="items-center justify-center flex-1 bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading your study path...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-gray-50">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="mt-4 text-xl font-bold text-gray-900">Error</Text>
        <Text className="mt-2 text-center text-gray-600">{error}</Text>
      </View>
    );
  }

  if (!studyPath) {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        <View className="px-4 py-6">
          <View className="p-6 mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
            <Text className="mb-2 text-2xl font-bold text-white">
              Your Personalized Study Path
            </Text>
            <Text className="text-sm text-blue-100">
              AI-generated learning roadmap based on your diagnostic results
            </Text>
          </View>

          <View className="p-6 mb-4 bg-white rounded-2xl">
            <Text className="mb-4 text-lg font-semibold text-gray-900">
              Get Started
            </Text>
            <Text className="mb-4 text-gray-600">
              Take our diagnostic quiz to identify your strengths and weaknesses, then get a personalized study path.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/diagnostic' as any)}
              className="items-center p-4 bg-blue-600 rounded-xl"
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
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        {/* Header */}
        <View className="p-6 mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
          <Text className="mb-2 text-2xl font-bold text-white">
            Your Study Path
          </Text>
          <Text className="mb-4 text-sm text-blue-100">
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
          <View className="flex-1 p-4 bg-white rounded-xl">
            <Text className="text-2xl font-bold text-green-600">{completedCount}</Text>
            <Text className="mt-1 text-xs text-gray-600">Completed</Text>
          </View>
          <View className="flex-1 p-4 bg-white rounded-xl">
            <Text className="text-2xl font-bold text-blue-600">{unlockedCount}</Text>
            <Text className="mt-1 text-xs text-gray-600">Unlocked</Text>
          </View>
          <View className="flex-1 p-4 bg-white rounded-xl">
            <Text className="text-2xl font-bold text-purple-600">{inProgressCount}</Text>
            <Text className="mt-1 text-xs text-gray-600">In Progress</Text>
          </View>
        </View>

        {/* Retake Diagnostic Button */}
        <TouchableOpacity
          onPress={() => router.push('/diagnostic' as any)}
          className="flex-row items-center justify-between p-4 mb-3 bg-white border border-gray-200 rounded-xl"
        >
          <View className="flex-row items-center">
            <View className="items-center justify-center w-10 h-10 mr-3 bg-purple-100 rounded-full">
              <Ionicons name="refresh" size={20} color="#9333ea" />
            </View>
            <View>
              <Text className="text-base font-semibold text-gray-900">
                Retake Diagnostic Test
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                Update your study path based on current knowledge
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        {/* Revert to Previous Path Button */}
        {showRevertOption && (
          <TouchableOpacity
            onPress={handleRevertPath}
            className="flex-row items-center justify-between p-4 mb-6 bg-white border border-orange-200 rounded-xl"
          >
            <View className="flex-row items-center">
              <View className="items-center justify-center w-10 h-10 mr-3 bg-orange-100 rounded-full">
                <Ionicons name="arrow-undo" size={20} color="#f97316" />
              </View>
              <View>
                <Text className="text-base font-semibold text-gray-900">
                  Revert to Previous Path
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  Restore your previous study path
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}

        {/* Topics List */}
        <Text className="mb-3 text-lg font-bold text-gray-900">Learning Path</Text>
        
        {topicsWithProgress.map((topic, index) => {
          const isLocked = topic.progress?.status === 'locked';
          const isCompleted = topic.progress?.status === 'completed';
          const isUnlocked = topic.progress?.status === 'unlocked';
          
          return (
            <TouchableOpacity
              key={topic.id}
              disabled={isLocked}
              onPress={() => router.push(`/study-path/topic/${topic.id}` as any)}
              className={`bg-white rounded-xl p-4 mb-3 ${isLocked ? 'opacity-50' : ''}`}
            >
              <View className="flex-row items-start">
                {/* Status Icon */}
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  isCompleted ? 'bg-green-100' :
                  isUnlocked ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {isCompleted ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  ) : isLocked ? (
                    <Ionicons name="lock-closed" size={20} color="#9ca3af" />
                  ) : (
                    <Text className="font-bold text-blue-600">{index + 1}</Text>
                  )}
                </View>

                {/* Topic Info */}
                <View className="flex-1">
                  <Text className="mb-1 text-base font-semibold text-gray-900">
                    {topic.name}
                  </Text>
                  <Text className="mb-2 text-xs text-gray-500">
                    {topic.subject} • {topic.estimatedHours}h • {topic.difficulty}
                  </Text>
                  
                  {topic.progress && topic.progress.mastery_level > 0 && (
                    <View className="mt-2">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-xs text-gray-600">Mastery</Text>
                        <Text className="text-xs font-semibold text-gray-900">
                          {topic.progress.mastery_level}%
                        </Text>
                      </View>
                      <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <View 
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${topic.progress.mastery_level}%` }}
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Arrow */}
                {!isLocked && (
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
