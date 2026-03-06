import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { VideoLessons } from '../../../src/components/study-path/VideoLessons';
import { getDependents, getPrerequisites, getTopicById } from '../../../src/config/knowledge-graph.config';
import { useStudyPath } from '../../../src/hooks/useStudyPath';
import { StudyPathAIService } from '../../../src/services/study-path-ai.service';
import { getOrCreateUserId } from '../../../src/utils/user-id';

export default function TopicDetailScreen() {
  const { topicId } = useLocalSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [studyTips, setStudyTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

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

  const loadPracticeQuestions = async () => {
    if (!topic) return;
    
    setLoadingQuestions(true);
    try {
      const questions = await StudyPathAIService.generatePracticeQuestions(
        topic.name,
        topic.subject,
        5
      );
      setPracticeQuestions(questions);
      setShowQuestions(true);
    } catch (error) {
      console.error('Error loading practice questions:', error);
      Alert.alert('Error', 'Failed to generate practice questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  if (!topic) {
    return (
      <View className={`${THEME_CLASSES.screen} items-center justify-center`}>
        <Text className={THEME_CLASSES.body}>Topic not found</Text>
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
    <ScrollView className={THEME_CLASSES.screen}>
      {/* Header */}
      <View className="bg-gradient-to-br from-accent-primary to-accent-secondary px-4 pt-12 pb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text className="text-white text-2xl font-bold mb-2">
          {topic.name}
        </Text>
        <Text className="text-text-secondary text-sm mb-4">
          {topic.description}
        </Text>

        {/* Status Badge */}
        <View className={`self-start px-3 py-1 rounded-full ${
          isCompleted ? 'bg-accent-success/30 border border-accent-success/50' :
          isLocked ? 'bg-text-disabled/30 border border-text-disabled/50' :
          'bg-accent-primary/30 border border-accent-primary/50'
        }`}>
          <Text className="text-white text-xs font-semibold">
            {isCompleted ? '✓ Completed' :
             isLocked ? '🔒 Locked' :
             '🔓 Unlocked'}
          </Text>
        </View>
      </View>

      <View className={THEME_CLASSES.section}>
        {/* Topic Info */}
        <View className={`${THEME_CLASSES.card} mb-4`}>
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-accent-primary/20 items-center justify-center mr-3">
              <Ionicons name="information-circle" size={24} color="#8b5cf6" />
            </View>
            <Text className={THEME_CLASSES.heading3}>Topic Details</Text>
          </View>

          <View className="space-y-2">
            <View className="flex-row justify-between py-2 border-b border-border-subtle">
              <Text className={THEME_CLASSES.body}>Subject</Text>
              <Text className={THEME_CLASSES.heading3}>{topic.subject}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-border-subtle">
              <Text className={THEME_CLASSES.body}>Difficulty</Text>
              <Text className={`${THEME_CLASSES.heading3} capitalize`}>{topic.difficulty}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-border-subtle">
              <Text className={THEME_CLASSES.body}>Estimated Time</Text>
              <Text className={THEME_CLASSES.heading3}>{topic.estimatedHours} hours</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className={THEME_CLASSES.body}>NEET Weightage</Text>
              <Text className={THEME_CLASSES.heading3}>{topic.neetWeightage}%</Text>
            </View>
          </View>
        </View>

        {/* Video Lessons */}
        <View className="mb-4">
          <VideoLessons topicId={topicId as string} topicName={topic.name} />
        </View>

        {/* AI Study Tips */}
        <View className="bg-biology/10 rounded-xl p-4 mb-4 border border-biology/30">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-biology/20 items-center justify-center mr-3">
              <Ionicons name="bulb" size={24} color="#ec4899" />
            </View>
            <Text className={THEME_CLASSES.heading3}>AI Study Tips</Text>
          </View>
          
          {loadingTips ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#ec4899" />
              <Text className={`${THEME_CLASSES.bodySmall} mt-2`}>Generating personalized tips...</Text>
            </View>
          ) : studyTips.length > 0 ? (
            <View className="space-y-2">
              {studyTips.map((tip, index) => (
                <View key={index} className="flex-row items-start py-2">
                  <Text className="text-biology-light font-bold mr-2">{index + 1}.</Text>
                  <Text className={`flex-1 ${THEME_CLASSES.body}`}>{tip}</Text>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              onPress={loadStudyTips}
              className="bg-biology rounded-lg p-3 items-center active:bg-biology/80"
            >
              <Text className="text-white font-semibold">Generate Study Tips</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* AI Practice Questions */}
        <View className="bg-accent-success/10 rounded-xl p-4 mb-4 border border-accent-success/30">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-accent-success/20 items-center justify-center mr-3">
              <Ionicons name="help-circle" size={24} color="#10b981" />
            </View>
            <Text className={THEME_CLASSES.heading3}>Practice Questions</Text>
          </View>
          
          {loadingQuestions ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#10b981" />
              <Text className={`${THEME_CLASSES.bodySmall} mt-2`}>Generating questions...</Text>
            </View>
          ) : showQuestions && practiceQuestions.length > 0 ? (
            <View className="space-y-3">
              {practiceQuestions.map((q, index) => (
                <View key={index} className="bg-background-tertiary rounded-lg p-3 border border-border-secondary">
                  <Text className={`${THEME_CLASSES.bodySmall} font-semibold mb-2`}>
                    Q{index + 1}. {q.question}
                  </Text>
                  {q.options.map((option: string, optIndex: number) => (
                    <View 
                      key={optIndex} 
                      className={`flex-row items-center p-2 rounded mt-1 ${
                        optIndex === q.correctAnswer ? 'bg-accent-success/20' : 'bg-background-secondary'
                      }`}
                    >
                      <Text className={`text-xs font-semibold mr-2 ${
                        optIndex === q.correctAnswer ? 'text-accent-success' : 'text-text-tertiary'
                      }`}>
                        {String.fromCharCode(65 + optIndex)}.
                      </Text>
                      <Text className={`flex-1 text-xs ${
                        optIndex === q.correctAnswer ? 'text-accent-success font-medium' : 'text-text-secondary'
                      }`}>
                        {option}
                      </Text>
                      {optIndex === q.correctAnswer && (
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                      )}
                    </View>
                  ))}
                  {q.explanation && (
                    <View className="mt-2 p-2 bg-accent-secondary/10 rounded">
                      <Text className="text-xs text-accent-secondary">
                        <Text className="font-semibold">Explanation: </Text>
                        {q.explanation}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              onPress={loadPracticeQuestions}
              className="bg-accent-success rounded-lg p-3 items-center active:bg-accent-success/80"
            >
              <Text className="text-white font-semibold">Generate Practice Questions</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress */}
        {topicProgress?.progress && topicProgress.progress.mastery_level > 0 && (
          <View className={`${THEME_CLASSES.card} mb-4`}>
            <Text className={`${THEME_CLASSES.heading3} mb-3`}>Your Progress</Text>
            <View className="flex-row justify-between items-center mb-2">
              <Text className={THEME_CLASSES.body}>Mastery Level</Text>
              <Text className={THEME_CLASSES.heading3}>
                {topicProgress.progress.mastery_level}%
              </Text>
            </View>
            <View className={`${THEME_CLASSES.progressBar} mb-4`}>
              <View 
                className={THEME_CLASSES.progressFill}
                style={{ width: `${topicProgress.progress.mastery_level}%` }}
              />
            </View>
            <View className="flex-row justify-between text-sm">
              <Text className={THEME_CLASSES.body}>
                Time: {topicProgress.progress.time_spent_minutes} min
              </Text>
              <Text className={THEME_CLASSES.body}>
                Quizzes: {topicProgress.progress.quiz_attempts}
              </Text>
            </View>
          </View>
        )}

        {/* Prerequisites */}
        {prerequisites.length > 0 && (
          <View className={`${THEME_CLASSES.card} mb-4`}>
            <View className="flex-row items-center mb-3">
              <Ionicons name="arrow-down-circle" size={20} color="#f59e0b" />
              <Text className={`${THEME_CLASSES.heading3} ml-2`}>
                Prerequisites ({prerequisites.length})
              </Text>
            </View>
            {prerequisites.map(prereq => (
              <View key={prereq.id} className="flex-row items-center py-2 border-b border-border-subtle">
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text className={`ml-2 ${THEME_CLASSES.body}`}>{prereq.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Dependents */}
        {dependents.length > 0 && (
          <View className={`${THEME_CLASSES.card} mb-4`}>
            <View className="flex-row items-center mb-3">
              <Ionicons name="arrow-up-circle" size={20} color="#ec4899" />
              <Text className={`${THEME_CLASSES.heading3} ml-2`}>
                Unlocks ({dependents.length})
              </Text>
            </View>
            <Text className={`${THEME_CLASSES.bodySmall} mb-3`}>
              Complete this topic to unlock:
            </Text>
            {dependents.map(dep => (
              <View key={dep.id} className="flex-row items-center py-2 border-b border-border-subtle">
                <Ionicons name="lock-closed" size={16} color="#717171" />
                <Text className={`ml-2 ${THEME_CLASSES.body}`}>{dep.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        {!isLocked && (
          <View className="space-y-3">
            <TouchableOpacity
              onPress={handleStartStudy}
              className={THEME_CLASSES.buttonPrimary}
            >
              <Text className="text-white text-base font-semibold">
                {isCompleted ? 'Review Topic' : 'Start Studying'}
              </Text>
            </TouchableOpacity>

            {!isCompleted && (
              <TouchableOpacity
                onPress={handleCompleteTopic}
                className={THEME_CLASSES.buttonSuccess}
              >
                <Text className="text-white text-base font-semibold">
                  Mark as Completed
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isLocked && (
          <View className="bg-accent-warning/10 border border-accent-warning/30 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="lock-closed" size={20} color="#f59e0b" />
              <Text className="ml-2 text-accent-warning font-semibold">Topic Locked</Text>
            </View>
            <Text className={THEME_CLASSES.bodySmall}>
              Complete the prerequisite topics first to unlock this topic.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
