import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { StudyPathAIService } from '../services/study-path-ai.service';
import { StudyPathService } from '../services/study-path.service';
import { getOrCreateUserId } from '../utils/user-id';
import { useStudyPath } from './useStudyPath';

export function useTopicDetail(topicId: string, topicName: string, topicSubject: string, topicDifficulty: string) {
  const [userId, setUserId] = useState<string | null>(null);
  const [studyTips, setStudyTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'quiz' | 'notes' | 'tips' | 'dependencies'>('overview');

  useEffect(() => {
    getOrCreateUserId().then(setUserId);
  }, []);

  const { topicsWithProgress, completeTopic, allProgress } = useStudyPath(userId || '');
  const topicProgress = topicsWithProgress.find(t => t.id === topicId);

  const loadStudyTips = async () => {
    setLoadingTips(true);
    try {
      const tips = await StudyPathAIService.generateStudyTips(topicName, topicSubject, topicDifficulty);
      setStudyTips(tips);
    } catch (error) {
      console.error('Error loading study tips:', error);
    } finally {
      setLoadingTips(false);
    }
  };

  useEffect(() => {
    if (topicName && !loadingTips && studyTips.length === 0) {
      loadStudyTips();
    }
  }, [topicName]);

  const generateQuizQuestions = async () => {
    return await StudyPathAIService.generatePracticeQuestions(topicName, topicSubject, 5);
  };

  const handleQuizComplete = async (score: number, totalQuestions: number, timeSpent: number) => {
    if (!userId || !topicProgress?.progress) return;

    const quizPercentage = (score / totalQuestions) * 100;
    const currentMastery = topicProgress.progress.mastery_level || 0;
    const newMastery = Math.min(100, Math.round((currentMastery + quizPercentage) / 2));
    const newQuizAttempts = (topicProgress.progress.quiz_attempts || 0) + 1;

    try {
      const { GapDetectionService } = await import('../services/gap-detection.service');
      const gaps = await GapDetectionService.analyzeQuizPerformance(
        topicId,
        quizPercentage,
        currentMastery,
        newQuizAttempts
      );

      await StudyPathService.updateTopicProgress(topicProgress.progress.progress_id, {
        mastery_level: newMastery,
        quiz_attempts: newQuizAttempts,
        quiz_average_score: Math.round(
          ((topicProgress.progress.quiz_average_score || 0) * (topicProgress.progress.quiz_attempts || 0) + quizPercentage) /
          newQuizAttempts
        ),
        time_spent_minutes: (topicProgress.progress.time_spent_minutes || 0) + Math.ceil(timeSpent / 60),
        conceptual_gaps: gaps.length > 0 ? gaps : topicProgress.progress.conceptual_gaps
      });

      if (gaps.length > 0) {
        const explanation = await GapDetectionService.generateGapExplanation(topicName, gaps);
        return { hasGaps: true, gaps, explanation };
      } else {
        Alert.alert('Quiz Complete!', `Your mastery level increased to ${newMastery}%`, [{ text: 'OK' }]);
        return { hasGaps: false, newMastery };
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      return { hasGaps: false, error: true };
    }
  };

  const handleCompleteTopic = () => {
    Alert.alert(
      'Complete Topic',
      `Mark ${topicName} as completed? This will unlock dependent topics.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await completeTopic(topicId);
            Alert.alert('Success!', 'Topic completed. Dependent topics unlocked!');
            router.back();
          }
        }
      ]
    );
  };

  return {
    userId,
    activeTab,
    setActiveTab,
    topicProgress,
    allProgress,
    studyTips,
    loadingTips,
    loadStudyTips,
    generateQuizQuestions,
    handleQuizComplete,
    handleCompleteTopic,
    isCompleted: topicProgress?.progress?.status === 'completed',
    isLocked: topicProgress?.progress?.status === 'locked',
  };
}
