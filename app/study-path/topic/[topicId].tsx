import { AINotesModal } from '@/src/components/study-path/AINotesModal';
import { DependencyTree } from '@/src/components/study-path/DependencyTree';
import { GuidedStudySession } from '@/src/components/study-path/GuidedStudySession';
import { InteractiveQuiz } from '@/src/components/study-path/InteractiveQuiz';
import { MicroInterventionModal } from '@/src/components/study-path/MicroInterventionModal';
import { StudyTipsTab } from '@/src/components/study-path/StudyTipsTab';
import { TopicHeader } from '@/src/components/study-path/TopicHeader';
import { TopicOverview } from '@/src/components/study-path/TopicOverview';
import { VideoLessons } from '@/src/components/study-path/VideoLessons';
import { getDependents, getPrerequisites, getTopicById } from '@/src/config/knowledge-graph.config';
import { THEME_CLASSES } from '@/src/config/theme.config';
import { useTopicDetail } from '@/src/hooks/useTopicDetail';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TopicDetailScreen() {
  const { topicId } = useLocalSearchParams();
  const [showMicroIntervention, setShowMicroIntervention] = useState(false);
  const [interventionData, setInterventionData] = useState<any>(null);
  const [showAINotes, setShowAINotes] = useState(false);
  const [showGuidedSession, setShowGuidedSession] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  
  const topic = getTopicById(topicId as string);
  const prerequisites = getPrerequisites(topicId as string);
  const dependents = getDependents(topicId as string);

  const {
    userId,
    activeTab,
    setActiveTab,
    topicProgress,
    allProgress,
    studyTips,
    loadingTips,
    loadStudyTips,
    generateQuizQuestions,
    handleQuizComplete: baseHandleQuizComplete,
    handleCompleteTopic,
    isCompleted,
    isLocked,
  } = useTopicDetail(
    topicId as string,
    topic?.name || '',
    topic?.subject || '',
    topic?.difficulty || ''
  );

  const handleQuizComplete = async (score: number, totalQuestions: number, timeSpent: number) => {
    const result = await baseHandleQuizComplete(score, totalQuestions, timeSpent);
    
    if (result?.hasGaps && result.gaps && result.gaps.length > 0) {
      Alert.alert(
        'Knowledge Gaps Detected',
        result.explanation,
        [
          { text: 'Get Quick Help', onPress: () => handleMicroIntervention(result.gaps[0]) },
          { text: 'Review Later', style: 'cancel' }
        ]
      );
    }
  };

  const handleMicroIntervention = async (gap: any) => {
    if (!topic) return;
    
    setShowMicroIntervention(true);
    setInterventionData({ gap, loading: true });

    try {
      const { MicroInterventionService } = await import('@/src/services/micro-intervention.service');
      const intervention = await MicroInterventionService.generateIntervention(
        topic.name,
        gap.prerequisite_name,
        gap.sub_concepts || []
      );
      setInterventionData({ gap, ...intervention, loading: false });
    } catch (error) {
      console.error('Error generating intervention:', error);
      setInterventionData({ gap, loading: false, error: true });
    }
  };

  if (!topic) {
    return (
      <View className={`${THEME_CLASSES.screen} items-center justify-center`}>
        <Text className={THEME_CLASSES.body}>Topic not found</Text>
      </View>
    );
  }

  const handleStartStudy = () => setActiveTab('videos');

  const handleStartGuidedSession = () => {
    setShowGuidedSession(true);
  };

  const handleGuidedSessionComplete = async (masteryGained: number, timeSpent: number) => {
    if (!userId || !topicProgress?.progress) return;
    
    const currentMastery = topicProgress.progress.mastery_level || 0;
    const newMastery = Math.min(100, currentMastery + masteryGained);
    
    try {
      const { StudyPathService } = await import('@/src/services/study-path.service');
      await StudyPathService.updateTopicProgress(topicProgress.progress.progress_id, {
        mastery_level: newMastery,
        time_spent_minutes: (topicProgress.progress.time_spent_minutes || 0) + Math.ceil(timeSpent / 60)
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'information-circle' },
    { id: 'dependencies' as const, label: 'Path', icon: 'git-network' },
    { id: 'videos' as const, label: 'Videos', icon: 'play-circle' },
    { id: 'quiz' as const, label: 'Quiz', icon: 'help-circle' },
    { id: 'notes' as const, label: 'Notes', icon: 'document-text' },
    { id: 'tips' as const, label: 'Study Tips', icon: 'bulb' },
  ];

  return (
    <SafeAreaView edges={['bottom']} className={THEME_CLASSES.screen}>
      <TopicHeader
        topicName={topic.name}
        difficulty={topic.difficulty}
        isCompleted={isCompleted}
        isLocked={isLocked}
      />

      {/* Tab Navigation */}
      <View className="bg-background-secondary border-b border-border-subtle">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          style={{ height: 48 }}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className="flex-row items-center justify-center px-3 h-full"
              style={{ minHeight: 48 }}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={18} 
                color={activeTab === tab.id ? '#8b5cf6' : '#717171'} 
              />
              <Text className={`ml-1.5 text-xs font-medium ${
                activeTab === tab.id ? 'text-accent-primary' : 'text-text-tertiary'
              }`}>
                {tab.label}
              </Text>
              {activeTab === tab.id && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView className="px-4 pt-4">
        {activeTab === 'overview' && (
          <TopicOverview
            topic={topic}
            topicProgress={topicProgress}
            prerequisites={prerequisites}
            dependents={dependents}
            isLocked={isLocked}
            isCompleted={isCompleted}
            allProgress={allProgress}
            topicId={topicId as string}
            onStartStudy={handleStartStudy}
            onStartGuidedSession={handleStartGuidedSession}
            onCompleteTopic={handleCompleteTopic}
            onMicroIntervention={handleMicroIntervention}
          />
        )}

        {activeTab === 'dependencies' && (
          <View className="pb-4">
            <DependencyTree
              currentTopicId={topicId as string}
              allProgress={allProgress}
              onTopicPress={(id) => id !== topicId && router.push(`/study-path/topic/${id}`)}
              showGaps={true}
            />
          </View>
        )}

        {activeTab === 'videos' && (
          <View className="pb-4">
            <VideoLessons 
              topicId={topicId as string} 
              topicName={topic.name}
              onVideoProgress={setVideoProgress}
            />
          </View>
        )}

        {activeTab === 'quiz' && (
          <View className="pb-4">
            <InteractiveQuiz
              topicId={topicId as string}
              topicName={topic.name}
              subject={topic.subject}
              onComplete={handleQuizComplete}
              generateQuestions={generateQuizQuestions}
            />
          </View>
        )}

        {activeTab === 'notes' && (
          <View className="pb-4">
            <View className={`${THEME_CLASSES.card} items-center py-8`}>
              <View className="bg-accent-primary/10 rounded-full p-6 mb-4">
                <Ionicons name="sparkles" size={48} color="#8b5cf6" />
              </View>
              <Text className={`${THEME_CLASSES.heading2} mb-2 text-center`}>
                AI-Generated Study Notes
              </Text>
              <Text className={`${THEME_CLASSES.body} text-center mb-6 px-4`}>
                Get personalized, comprehensive notes tailored to your learning progress and performance
              </Text>
              
              <View className="w-full px-4 mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text className="text-text-secondary text-sm ml-2">Progressive unlocking based on your progress</Text>
                </View>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text className="text-text-secondary text-sm ml-2">Available in English or Hinglish</Text>
                </View>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text className="text-text-secondary text-sm ml-2">Multiple formats: Comprehensive, Formulas, Quick Revision</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text className="text-text-secondary text-sm ml-2">Personalized based on your weak areas</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowAINotes(true)}
                className={THEME_CLASSES.buttonPrimary}
              >
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text className="text-white font-bold ml-2">Generate AI Notes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'tips' && (
          <StudyTipsTab studyTips={studyTips} loadingTips={loadingTips} onLoadTips={loadStudyTips} />
        )}
      </ScrollView>

      <MicroInterventionModal
        visible={showMicroIntervention}
        onClose={() => setShowMicroIntervention(false)}
        interventionData={interventionData}
        currentTopicName={topic.name}
      />

      <AINotesModal
        visible={showAINotes}
        onClose={() => setShowAINotes(false)}
        userId={userId || ''}
        topicId={topicId as string}
        topicName={topic.name}
        subject={topic.subject}
        difficulty={topic.difficulty as 'beginner' | 'intermediate' | 'advanced'}
        progress={{
          videoProgress: videoProgress || 0,
          quizAttempts: topicProgress?.progress?.quiz_attempts || 0,
          masteryLevel: topicProgress?.progress?.mastery_level || 0
        }}
        weakAreas={topicProgress?.progress?.conceptual_gaps?.map((g: any) => g.prerequisite_name) || []}
        quizPerformance={
          topicProgress?.progress?.quiz_attempts && topicProgress?.progress?.quiz_attempts > 0
            ? {
                score: topicProgress.progress.quiz_average_score || 0,
                missedConcepts: topicProgress.progress.conceptual_gaps?.map((g: any) => g.prerequisite_name) || []
              }
            : undefined
        }
      />

      <GuidedStudySession
        visible={showGuidedSession}
        onClose={() => setShowGuidedSession(false)}
        topicId={topicId as string}
        topicName={topic.name}
        subject={topic.subject}
        videoUrl={(() => {
          const { getVideosForTopic, getYouTubeUrl } = require('@/src/config/video-lessons.config');
          const videos = getVideosForTopic(topicId as string);
          return videos.length > 0 ? getYouTubeUrl(videos[0].youtubeId) : undefined;
        })()}
        generateQuestions={generateQuizQuestions}
        onSessionComplete={handleGuidedSessionComplete}
      />
    </SafeAreaView>
  );
}
  
