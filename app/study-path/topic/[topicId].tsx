import { DependencyTree } from '@/src/components/study-path/DependencyTree';
import { InteractiveQuiz } from '@/src/components/study-path/InteractiveQuiz';
import { MicroInterventionModal } from '@/src/components/study-path/MicroInterventionModal';
import { StudyNotes } from '@/src/components/study-path/StudyNotes';
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
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="bg-background-secondary border-b border-border-subtle"
        contentContainerClassName="px-2"
      >
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            className={`flex-row items-center px-4 py-3 mr-2 rounded-t-lg ${
              activeTab === tab.id ? 'bg-accent-primary/10 border-b-2 border-accent-primary' : ''
            }`}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.id ? '#8b5cf6' : '#717171'} 
            />
            <Text className={`ml-2 text-sm font-semibold ${
              activeTab === tab.id ? 'text-accent-primary' : 'text-text-tertiary'
            }`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
            <VideoLessons topicId={topicId as string} topicName={topic.name} />
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

        {activeTab === 'notes' && userId && (
          <View className="pb-4">
            <StudyNotes topicId={topicId as string} topicName={topic.name} userId={userId} />
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
    </SafeAreaView>
  );
}
  
