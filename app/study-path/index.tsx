import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useStudyPath } from '../../src/hooks/useStudyPath';
import { getOrCreateUserId } from '../../src/utils/user-id';

export default function StudyPathScreen() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getOrCreateUserId().then(setUserId);
  }, []);

  const { studyPath, topicsWithProgress, loading, error } = useStudyPath(userId || '');

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading your study path...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="mt-4 text-xl font-bold text-gray-900">Error</Text>
        <Text className="mt-2 text-gray-600 text-center">{error}</Text>
      </View>
    );
  }

  if (!studyPath) {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        <View className="px-4 py-6">
          <View className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 mb-6">
            <Text className="text-white text-2xl font-bold mb-2">
              Your Personalized Study Path
            </Text>
            <Text className="text-blue-100 text-sm">
              AI-generated learning roadmap based on your diagnostic results
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Get Started
            </Text>
            <Text className="text-gray-600 mb-4">
              Take our diagnostic quiz to identify your strengths and weaknesses, then get a personalized study path.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/diagnostic')}
              className="bg-blue-600 rounded-xl p-4 items-center"
            >
              <Text className="text-white text-base font-semibold">
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
        <View className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 mb-6">
          <Text className="text-white text-2xl font-bold mb-2">
            Your Study Path
          </Text>
          <Text className="text-blue-100 text-sm mb-4">
            {studyPath.topics_completed} of {studyPath.total_topics} topics completed
          </Text>
          
          {/* Progress Bar */}
          <View className="h-3 bg-white/20 rounded-full overflow-hidden">
            <View 
              className="h-full bg-white rounded-full"
              style={{ width: `${studyPath.progress_percentage}%` }}
            />
          </View>
          <Text className="text-white text-sm mt-2 font-semibold">
            {studyPath.progress_percentage}% Complete
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row mb-6 gap-3">
          <View className="flex-1 bg-white rounded-xl p-4">
            <Text className="text-2xl font-bold text-green-600">{completedCount}</Text>
            <Text className="text-xs text-gray-600 mt-1">Completed</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4">
            <Text className="text-2xl font-bold text-blue-600">{unlockedCount}</Text>
            <Text className="text-xs text-gray-600 mt-1">Unlocked</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4">
            <Text className="text-2xl font-bold text-purple-600">{inProgressCount}</Text>
            <Text className="text-xs text-gray-600 mt-1">In Progress</Text>
          </View>
        </View>

        {/* Retake Diagnostic Button */}
        <TouchableOpacity
          onPress={() => router.push('/diagnostic')}
          className="bg-white rounded-xl p-4 mb-6 flex-row items-center justify-between border border-gray-200"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
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

        {/* Topics List */}
        <Text className="text-lg font-bold text-gray-900 mb-3">Learning Path</Text>
        
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
                    <Text className="text-blue-600 font-bold">{index + 1}</Text>
                  )}
                </View>

                {/* Topic Info */}
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {topic.name}
                  </Text>
                  <Text className="text-xs text-gray-500 mb-2">
                    {topic.subject} • {topic.estimatedHours}h • {topic.difficulty}
                  </Text>
                  
                  {topic.progress && topic.progress.mastery_level > 0 && (
                    <View className="mt-2">
                      <View className="flex-row justify-between items-center mb-1">
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
