import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getTopicById } from '../../src/config/knowledge-graph.config';
import { THEME_CLASSES } from '../../src/config/theme.config';
import { StudyPathAIService } from '../../src/services/study-path-ai.service';
import { StudyPathService } from '../../src/services/study-path.service';
import { getOrCreateUserId } from '../../src/utils/user-id';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DiagnosticResultsScreen() {
  const params = useLocalSearchParams();
  const [generating, setGenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [hasExistingPath, setHasExistingPath] = useState(false);

  // Parse scores
  const totalScore = parseInt(params.totalScore as string) || 0;
  const physicsScore = parseInt(params.physicsScore as string) || 0;
  const chemistryScore = parseInt(params.chemistryScore as string) || 0;
  const biologyScore = parseInt(params.biologyScore as string) || 0;
  
  // Parse topics
  let weakTopics: string[] = [];
  let strongTopics: string[] = [];
  
  try {
    weakTopics = JSON.parse(params.weakTopics as string);
  } catch (e) {
    weakTopics = [];
  }
  
  try {
    strongTopics = JSON.parse(params.strongTopics as string);
  } catch (e) {
    strongTopics = [];
  }

  useEffect(() => {
    getOrCreateUserId().then(setUserId);
  }, []);

  useEffect(() => {
    if (userId) {
      checkExistingPath();
    }
  }, [userId]);

  const checkExistingPath = async () => {
    if (!userId) return;
    try {
      const existingPath = await StudyPathService.getUserStudyPath(userId);
      setHasExistingPath(!!existingPath);
    } catch (error) {
      console.error('Error checking existing path:', error);
    }
  };

  useEffect(() => {
    if (params.detailedResults && !aiAnalysis && !loadingAnalysis) {
      loadAIAnalysis();
    }
  }, [params.detailedResults]);

  const loadAIAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const detailedResults = JSON.parse(params.detailedResults as string);
      const analysis = await StudyPathAIService.analyzeDiagnosticResults(
        totalScore,
        physicsScore,
        chemistryScore,
        biologyScore,
        weakTopics,
        detailedResults
      );
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Error loading AI analysis:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-accent-success';
    if (score >= 60) return 'text-accent-primary';
    if (score >= 40) return 'text-accent-warning';
    return 'text-accent-error';
  };

  const getScoreBgClass = (score: number) => {
    if (score >= 80) return 'bg-accent-success/20 border-accent-success/30';
    if (score >= 60) return 'bg-accent-primary/20 border-accent-primary/30';
    if (score >= 40) return 'bg-accent-warning/20 border-accent-warning/30';
    return 'bg-accent-error/20 border-accent-error/30';
  };

  const handleGeneratePath = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    // If there's an existing path, confirm replacement
    if (hasExistingPath) {
      Alert.alert(
        'Replace Study Path?',
        'You already have an active study path. Generating a new one will archive your current path. You can revert to it later if needed.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Replace',
            onPress: () => generateNewPath()
          }
        ]
      );
    } else {
      generateNewPath();
    }
  };

  const generateNewPath = async () => {
    if (!userId) return;

    setGenerating(true);
    try {
      const detailedResults = JSON.parse(params.detailedResults as string);
      
      // Save diagnostic results (will reuse if duplicate within 5 minutes)
      const diagnosticResult = await StudyPathService.saveDiagnosticResult({
        user_id: userId,
        total_score: totalScore,
        physics_score: physicsScore,
        chemistry_score: chemistryScore,
        biology_score: biologyScore,
        weak_topics: weakTopics,
        strong_topics: strongTopics,
        detailed_results: detailedResults,
        completed_at: new Date().toISOString()
      });

      // Generate AI-powered study path (will auto-archive existing path)
      const newPath = await StudyPathService.generateStudyPath(
        userId,
        diagnosticResult.result_id,
        weakTopics,
        strongTopics,
        totalScore,
        physicsScore,
        chemistryScore,
        biologyScore
      );

      if (newPath) {
        Alert.alert(
          'Success!',
          'Your AI-powered personalized study path has been generated',
          [
            {
              text: 'View Path',
              onPress: () => router.replace('/study-path' as any)
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Path generation error:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to generate study path. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <ScrollView className="flex-1">
        <View className={THEME_CLASSES.section}>
        {/* Overall Score */}
        <View className={`${THEME_CLASSES.cardLarge} mb-4 items-center`}>
          <Text className="text-text-secondary text-sm mb-2">Your Overall Score</Text>
          <View className={`w-32 h-32 rounded-full ${getScoreBgClass(totalScore)} border-2 items-center justify-center mb-3`}>
            <Text className={`text-4xl font-bold ${getScoreColorClass(totalScore)}`}>
              {totalScore}%
            </Text>
          </View>
          <Text className={THEME_CLASSES.heading3}>
            {totalScore >= 80 ? 'Excellent!' : 
             totalScore >= 60 ? 'Good Job!' :
             totalScore >= 40 ? 'Keep Going!' :
             'Needs Improvement'}
          </Text>
        </View>

        {/* Subject-wise Scores */}
        <View className={`${THEME_CLASSES.cardLarge} mb-4`}>
          <Text className={`${THEME_CLASSES.heading3} mb-4`}>
            Subject-wise Performance
          </Text>
          
          {/* Physics */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-medium text-text-secondary">Physics</Text>
              <Text className={`text-sm font-bold ${getScoreColorClass(physicsScore)}`}>
                {physicsScore}%
              </Text>
            </View>
            <View className={THEME_CLASSES.progressBar}>
              <View 
                className="h-full bg-physics rounded-full"
                style={{ width: `${physicsScore}%` }}
              />
            </View>
          </View>

          {/* Chemistry */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-medium text-text-secondary">Chemistry</Text>
              <Text className={`text-sm font-bold ${getScoreColorClass(chemistryScore)}`}>
                {chemistryScore}%
              </Text>
            </View>
            <View className={THEME_CLASSES.progressBar}>
              <View 
                className="h-full bg-chemistry rounded-full"
                style={{ width: `${chemistryScore}%` }}
              />
            </View>
          </View>

          {/* Biology */}
          <View className="mb-0">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-medium text-text-secondary">Biology</Text>
              <Text className={`text-sm font-bold ${getScoreColorClass(biologyScore)}`}>
                {biologyScore}%
              </Text>
            </View>
            <View className={THEME_CLASSES.progressBar}>
              <View 
                className="h-full bg-biology rounded-full"
                style={{ width: `${biologyScore}%` }}
              />
            </View>
          </View>
        </View>

        {/* AI Analysis */}
        {loadingAnalysis && (
          <View className={`${THEME_CLASSES.card} mb-4 items-center`}>
            <ActivityIndicator size="small" color="#8b5cf6" />
            <Text className="text-sm text-text-secondary mt-2">Analyzing your performance...</Text>
          </View>
        )}

        {aiAnalysis && (
          <View className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 rounded-2xl p-6 mb-4 border border-accent-primary/20">
            <View className="flex-row items-center mb-4">
              <Ionicons name="sparkles" size={20} color="#8b5cf6" />
              <Text className={`${THEME_CLASSES.heading3} ml-2`}>AI Analysis</Text>
            </View>

            {/* Overall Analysis */}
            {aiAnalysis.overallAnalysis && (
              <View className={`${THEME_CLASSES.card} mb-3`}>
                <Text className="text-sm text-text-secondary leading-5">
                  {aiAnalysis.overallAnalysis}
                </Text>
              </View>
            )}

            {/* Study Strategy */}
            {aiAnalysis.studyStrategy?.length > 0 && (
              <View className={`${THEME_CLASSES.card} mb-3`}>
                <Text className="text-sm font-semibold text-text-primary mb-2">
                  Recommended Strategy
                </Text>
                {aiAnalysis.studyStrategy.map((strategy: string, index: number) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-accent-primary mr-2">•</Text>
                    <Text className="flex-1 text-sm text-text-secondary">{strategy}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Focus Areas */}
            {aiAnalysis.focusAreas?.length > 0 && (
              <View className={`${THEME_CLASSES.card} mb-3`}>
                <Text className="text-sm font-semibold text-text-primary mb-2">
                  Priority Focus Areas
                </Text>
                {aiAnalysis.focusAreas.map((area: string, index: number) => (
                  <View key={index} className="flex-row items-center bg-accent-primary/10 px-3 py-2 rounded-lg mb-2 border border-accent-primary/20">
                    <Text className="text-accent-primary mr-2">→</Text>
                    <Text className="flex-1 text-sm text-text-secondary">{area}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Time Allocation */}
            {aiAnalysis.timeAllocation?.length > 0 && (
              <View className={THEME_CLASSES.card}>
                <Text className="text-sm font-semibold text-text-primary mb-3">
                  Suggested Time Allocation
                </Text>
                {aiAnalysis.timeAllocation.map((allocation: any, index: number) => (
                  <View key={index} className="mb-3 last:mb-0">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-sm text-text-secondary">{allocation.subject}</Text>
                      <Text className="text-sm font-semibold text-text-primary">
                        {allocation.percentage}%
                      </Text>
                    </View>
                    <View className={THEME_CLASSES.progressBar}>
                      <View 
                        className={`h-full rounded-full ${
                          allocation.subject === 'Physics' ? 'bg-physics' :
                          allocation.subject === 'Chemistry' ? 'bg-chemistry' :
                          'bg-biology'
                        }`}
                        style={{ width: `${allocation.percentage}%` }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Weak Topics */}
        {weakTopics.length > 0 && (
          <View className={`${THEME_CLASSES.cardLarge} mb-4`}>
            <Text className={`${THEME_CLASSES.heading3} mb-3`}>
              Topics to Focus On
            </Text>
            {weakTopics.map(topicId => {
              const topic = getTopicById(topicId);
              return topic ? (
                <View key={topicId} className="flex-row items-center bg-accent-error/10 p-3 rounded-lg mb-2 last:mb-0 border border-accent-error/20">
                  <View className="w-2 h-2 rounded-full bg-accent-error mr-3" />
                  <Text className="flex-1 text-sm text-text-primary">{topic.name}</Text>
                  <Text className="text-xs text-text-tertiary">{topic.subject}</Text>
                </View>
              ) : null;
            })}
          </View>
        )}

        {/* Strong Topics */}
        {strongTopics.length > 0 && (
          <View className={`${THEME_CLASSES.cardLarge} mb-4`}>
            <Text className={`${THEME_CLASSES.heading3} mb-3`}>
              Your Strong Areas
            </Text>
            {strongTopics.map(topicId => {
              const topic = getTopicById(topicId);
              return topic ? (
                <View key={topicId} className="flex-row items-center bg-accent-success/10 p-3 rounded-lg mb-2 last:mb-0 border border-accent-success/20">
                  <View className="w-2 h-2 rounded-full bg-accent-success mr-3" />
                  <Text className="flex-1 text-sm text-text-primary">{topic.name}</Text>
                  <Text className="text-xs text-text-tertiary">{topic.subject}</Text>
                </View>
              ) : null;
            })}
          </View>
        )}

        {/* Generate Study Path Button */}
        <TouchableOpacity
          onPress={handleGeneratePath}
          disabled={generating}
          className={`${THEME_CLASSES.buttonPrimary} mb-4 ${generating ? 'opacity-60' : ''}`}
        >
          {generating ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#fff" />
              <Text className="text-white text-base font-semibold ml-2">
                AI is creating your path...
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text className="text-white text-base font-semibold ml-2">
                Generate AI-Powered Study Path
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className={THEME_CLASSES.buttonOutline}
        >
          <Text className="text-text-primary text-base font-medium">
            Retake Diagnostic
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
