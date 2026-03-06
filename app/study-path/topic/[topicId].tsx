import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getDependents, getPrerequisites, getTopicById } from '../../../src/config/knowledge-graph.config';
import { useStudyPath } from '../../../src/hooks/useStudyPath';
import { StudyPathAIService } from '../../../src/services/study-path-ai.service';
import { getOrCreateUserId } from '../../../src/utils/user-id';

export default function TopicDetailScreen() {
  const { topicId } = useLocalSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [studyTips, setStudyTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);

  useEffect(() => {
    getOrCreateUserId().then(setUserId);
  }, []);

  const { topicsWithProgress, completeTopic } = useStudyPath(userId || '');
  
  const topic = getTopicById(topicId as string);
  const prerequisites = getPrerequisites(topicId as string);
  const dependents = getDependents(topicId as string);
  const topicProgress = topicsWithProgress.find(t => t.id === topicId);

  // Load AI study tips
  useEffect(() => {
    if (topic && !loadingTips && studyTips.length === 0) {
      loadStudyTips();
    }
  }, [topic]);

  const loadStudyTips = async () => {
    if (!topic) return;
    
    setLoadingTips(true);
    try {
      const tips = await StudyPathAIService.generateStudyTips(
        topic.name,
        topic.subject,
        topic.difficulty
      );
      setStudyTips(tips);
    } catch (error) {
      console.error('Error loading study tips:', error);
    } finally {
      setLoadingTips(false);
    }
  };

  if (!topic) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-600">Topic not found</Text>
      </View>
    );
  }

  const handleStartStudy = () => {
    // Navigate to study materials or flashcards for this topic
    Alert.alert(
      'Start Studying',
      `Ready to study ${topic.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Flashcards',
          onPress: () => {
            // Navigate to create deck with this topic pre-filled
            router.back();
            router.push('/' as any);
          }
        }
      ]
    );
  };

  const handleCompleteTopic = () => {
    Alert.alert(
      'Complete Topic',
      `Mark ${topic.name} as completed? This will unlock dependent topics.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await completeTopic(topicId as string);
            Alert.alert('Success!', 'Topic completed. Dependent topics unlocked!');
            router.back();
          }
        }
      ]
    );
  };

  const isCompleted = topicProgress?.progress?.status === 'completed';
  const isLocked = topicProgress?.progress?.status === 'locked';

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 pt-12 pb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text className="text-white text-2xl font-bold mb-2">
          {topic.name}
        </Text>
        <Text className="text-blue-100 text-sm mb-4">
          {topic.description}
        </Text>

        {/* Status Badge */}
        <View className={`self-start px-3 py-1 rounded-full ${
          isCompleted ? 'bg-green-500' :
          isLocked ? 'bg-gray-500' :
          'bg-blue-500'
        }`}>
          <Text className="text-white text-xs font-semibold">
            {isCompleted ? '✓ Completed' :
             isLocked ? '🔒 Locked' :
             '🔓 Unlocked'}
          </Text>
        </View>
      </View>

      <View className="px-4 py-6">
        {/* Topic Info */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Ionicons name="information-circle" size={24} color="#3b82f6" />
            </View>
            <Text className="text-lg font-semibold text-gray-900">Topic Details</Text>
          </View>

          <View className="space-y-2">
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Subject</Text>
              <Text className="font-semibold text-gray-900">{topic.subject}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Difficulty</Text>
              <Text className="font-semibold text-gray-900 capitalize">{topic.difficulty}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Estimated Time</Text>
              <Text className="font-semibold text-gray-900">{topic.estimatedHours} hours</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">NEET Weightage</Text>
              <Text className="font-semibold text-gray-900">{topic.neetWeightage}%</Text>
            </View>
          </View>
        </View>

        {/* AI Study Tips */}
        <View className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 mb-4 border border-purple-200">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
              <Ionicons name="bulb" size={24} color="#8b5cf6" />
            </View>
            <Text className="text-lg font-semibold text-gray-900">AI Study Tips</Text>
          </View>
          
          {loadingTips ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#8b5cf6" />
              <Text className="text-gray-600 text-sm mt-2">Generating personalized tips...</Text>
            </View>
          ) : studyTips.length > 0 ? (
            <View className="space-y-2">
              {studyTips.map((tip, index) => (
                <View key={index} className="flex-row items-start py-2">
                  <Text className="text-purple-600 font-bold mr-2">{index + 1}.</Text>
                  <Text className="flex-1 text-gray-700">{tip}</Text>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              onPress={loadStudyTips}
              className="bg-purple-600 rounded-lg p-3 items-center"
            >
              <Text className="text-white font-semibold">Generate Study Tips</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress */}
        {topicProgress?.progress && topicProgress.progress.mastery_level > 0 && (
          <View className="bg-white rounded-xl p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Your Progress</Text>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">Mastery Level</Text>
              <Text className="font-semibold text-gray-900">
                {topicProgress.progress.mastery_level}%
              </Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
              <View 
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${topicProgress.progress.mastery_level}%` }}
              />
            </View>
            <View className="flex-row justify-between text-sm">
              <Text className="text-gray-600">
                Time: {topicProgress.progress.time_spent_minutes} min
              </Text>
              <Text className="text-gray-600">
                Quizzes: {topicProgress.progress.quiz_attempts}
              </Text>
            </View>
          </View>
        )}

        {/* Prerequisites */}
        {prerequisites.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="arrow-down-circle" size={20} color="#f59e0b" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                Prerequisites ({prerequisites.length})
              </Text>
            </View>
            {prerequisites.map(prereq => (
              <View key={prereq.id} className="flex-row items-center py-2 border-b border-gray-100">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text className="ml-2 text-gray-700">{prereq.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Dependents */}
        {dependents.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="arrow-up-circle" size={20} color="#8b5cf6" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                Unlocks ({dependents.length})
              </Text>
            </View>
            <Text className="text-sm text-gray-600 mb-3">
              Complete this topic to unlock:
            </Text>
            {dependents.map(dep => (
              <View key={dep.id} className="flex-row items-center py-2 border-b border-gray-100">
                <Ionicons name="lock-closed" size={16} color="#9ca3af" />
                <Text className="ml-2 text-gray-700">{dep.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        {!isLocked && (
          <View className="space-y-3">
            <TouchableOpacity
              onPress={handleStartStudy}
              className="bg-blue-600 rounded-xl p-4 items-center"
            >
              <Text className="text-white text-base font-semibold">
                {isCompleted ? 'Review Topic' : 'Start Studying'}
              </Text>
            </TouchableOpacity>

            {!isCompleted && (
              <TouchableOpacity
                onPress={handleCompleteTopic}
                className="bg-green-600 rounded-xl p-4 items-center"
              >
                <Text className="text-white text-base font-semibold">
                  Mark as Completed
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isLocked && (
          <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="lock-closed" size={20} color="#f59e0b" />
              <Text className="ml-2 text-yellow-800 font-semibold">Topic Locked</Text>
            </View>
            <Text className="text-yellow-700 text-sm">
              Complete the prerequisite topics first to unlock this topic.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
