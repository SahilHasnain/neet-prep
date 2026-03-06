import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { InteractiveQuiz } from '../../../src/components/study-path/InteractiveQuiz';
import { VideoLessons } from '../../../src/components/study-path/VideoLessons';
import { getDependents, getPrerequisites, getTopicById } from '../../../src/config/knowledge-graph.config';
import { useStudyPath } from '../../../src/hooks/useStudyPath';
import { StudyPathAIService } from '../../../src/services/study-path-ai.service';
import { StudyPathService } from '../../../src/services/study-path.service';
import { getOrCreateUserId } from '../../../src/utils/user-id';
import { StudyNotes } from '@/src/components/study-path/StudyNotes';

export default function TopicDetailScreen() {
  const { topicId } = useLocalSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [studyTips, setStudyTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'quiz' | 'notes' | 'tips'>('overview');

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

  const generateQuizQuestions = async () => {
    if (!topic) return [];
    return await StudyPathAIService.generatePracticeQuestions(
      topic.name,
      topic.subject,
      5
    );
  };

  const handleQuizComplete = async (score: number, totalQuestions: number, timeSpent: number) => {
    if (!userId || !topicProgress?.progress) return;

    // Calculate new mastery level based on quiz performance
    const quizPercentage = (score / totalQuestions) * 100;
    const currentMastery = topicProgress.progress.mastery_level || 0;
    const newMastery = Math.min(100, Math.round((currentMastery + quizPercentage) / 2));

    try {
      // Update topic progress
      await StudyPathService.updateTopicProgress(
        topicProgress.progress.progress_id,
        {
          mastery_level: newMastery,
          quiz_attempts: (topicProgress.progress.quiz_attempts || 0) + 1,
          quiz_average_score: Math.round(
            ((topicProgress.progress.quiz_average_score || 0) * (topicProgress.progress.quiz_attempts || 0) + quizPercentage) /
            ((topicProgress.progress.quiz_attempts || 0) + 1)
          ),
          time_spent_minutes: (topicProgress.progress.time_spent_minutes || 0) + Math.ceil(timeSpent / 60)
        }
      );

      Alert.alert(
        'Quiz Complete!',
        `Your mastery level increased to ${newMastery}%`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating progress:', error);
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
    Alert.alert(
      'Start Studying',
      `Ready to study ${topic.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Flashcards',
          onPress: () => {
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

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'information-circle' },
    { id: 'videos' as const, label: 'Videos', icon: 'play-circle' },
    { id: 'quiz' as const, label: 'Quiz', icon: 'help-circle' },
    { id: 'notes' as const, label: 'Notes', icon: 'document-text' },
    { id: 'tips' as const, label: 'Study Tips', icon: 'bulb' },
  ];

  return (
    <View className={THEME_CLASSES.screen}>
      {/* Header */}
      <View className="bg-gradient-to-br from-accent-primary to-accent-secondary px-4 pt-12 pb-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text className="text-white text-2xl font-bold mb-2">{topic.name}</Text>
        <Text className="text-text-secondary text-sm mb-4">{topic.description}</Text>

        {/* Status Badge */}
        <View className={`self-start px-3 py-1 rounded-full ${
          isCompleted ? 'bg-accent-success/30 border border-accent-success/50' :
          isLocked ? 'bg-text-disabled/30 border border-text-disabled/50' :
          'bg-accent-primary/30 border border-accent-primary/50'
        }`}>
          <Text className="text-white text-xs font-semibold">
            {isCompleted ? '✓ Completed' : isLocked ? '🔒 Locked' : '🔓 Unlocked'}
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-background-secondary border-b border-border-subtle">
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            className={`flex-1 flex-row items-center justify-center py-3 border-b-2 ${
              activeTab === tab.id ? 'border-accent-primary' : 'border-transparent'
            }`}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={18} 
              color={activeTab === tab.id ? '#8b5cf6' : '#717171'} 
            />
            <Text className={`ml-1 text-xs font-semibold ${
              activeTab === tab.id ? 'text-accent-primary' : 'text-text-tertiary'
            }`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView className={THEME_CLASSES.section}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
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

            {/* Progress */}
            {topicProgress?.progress && topicProgress.progress.mastery_level > 0 && (
              <View className={`${THEME_CLASSES.card} mb-4`}>
                <Text className={`${THEME_CLASSES.heading3} mb-3`}>Your Progress</Text>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className={THEME_CLASSES.body}>Mastery Level</Text>
                  <Text className={THEME_CLASSES.heading3}>{topicProgress.progress.mastery_level}%</Text>
                </View>
                <View className={`${THEME_CLASSES.progressBar} mb-4`}>
                  <View 
                    className={THEME_CLASSES.progressFill}
                    style={{ width: `${topicProgress.progress.mastery_level}%` }}
                  />
                </View>
                <View className="flex-row justify-between text-sm">
                  <Text className={THEME_CLASSES.body}>Time: {topicProgress.progress.time_spent_minutes} min</Text>
                  <Text className={THEME_CLASSES.body}>Quizzes: {topicProgress.progress.quiz_attempts}</Text>
                </View>
              </View>
            )}

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <View className={`${THEME_CLASSES.card} mb-4`}>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="arrow-down-circle" size={20} color="#f59e0b" />
                  <Text className={`${THEME_CLASSES.heading3} ml-2`}>Prerequisites ({prerequisites.length})</Text>
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
                  <Text className={`${THEME_CLASSES.heading3} ml-2`}>Unlocks ({dependents.length})</Text>
                </View>
                <Text className={`${THEME_CLASSES.bodySmall} mb-3`}>Complete this topic to unlock:</Text>
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
                <TouchableOpacity onPress={handleStartStudy} className={THEME_CLASSES.buttonPrimary}>
                  <Text className="text-white text-base font-semibold">
                    {isCompleted ? 'Review Topic' : 'Start Studying'}
                  </Text>
                </TouchableOpacity>

                {!isCompleted && (
                  <TouchableOpacity onPress={handleCompleteTopic} className={THEME_CLASSES.buttonSuccess}>
                    <Text className="text-white text-base font-semibold">Mark as Completed</Text>
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
          </>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <VideoLessons topicId={topicId as string} topicName={topic.name} />
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <InteractiveQuiz
            topicId={topicId as string}
            topicName={topic.name}
            subject={topic.subject}
            onComplete={handleQuizComplete}
            generateQuestions={generateQuizQuestions}
          />
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && userId && (
          <StudyNotes
            topicId={topicId as string}
            topicName={topic.name}
            userId={userId}
          />
        )}

        {/* Study Tips Tab */}
        {activeTab === 'tips' && (
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
        )}
      </ScrollView>
    </View>
  );
}
