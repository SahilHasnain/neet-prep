import { StudyPathAIService } from '@/src/services/study-path-ai.service';
import { StudyPathService } from '@/src/services/study-path.service';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getTopicById } from '../../src/config/knowledge-graph.config';
import { getOrCreateUserId } from '../../src/utils/user-id';

export default function DiagnosticResultsScreen() {
  const params = useLocalSearchParams();
  const [generating, setGenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  // Parse params once using useMemo
  const totalScore = useMemo(() => parseInt(params.totalScore as string), [params.totalScore]);
  const physicsScore = useMemo(() => parseInt(params.physicsScore as string), [params.physicsScore]);
  const chemistryScore = useMemo(() => parseInt(params.chemistryScore as string), [params.chemistryScore]);
  const biologyScore = useMemo(() => parseInt(params.biologyScore as string), [params.biologyScore]);
  const weakTopics = useMemo(() => JSON.parse(params.weakTopics as string) as string[], [params.weakTopics]);
  const strongTopics = useMemo(() => JSON.parse(params.strongTopics as string) as string[], [params.strongTopics]);

  useEffect(() => {
    getOrCreateUserId().then(setUserId);
  }, []);

  const loadAIAnalysis = useCallback(async () => {
    if (loadingAnalysis || aiAnalysis || !params.detailedResults) return;
    
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
  }, [loadingAnalysis, aiAnalysis, params.detailedResults, totalScore, physicsScore, chemistryScore, biologyScore, weakTopics]);

  useEffect(() => {
    loadAIAnalysis();
  }, [loadAIAnalysis]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const handleGeneratePath = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    setGenerating(true);
    try {
      // Save diagnostic results
      const detailedResults = JSON.parse(params.detailedResults as string);
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

      // Generate study path
      await StudyPathService.generateStudyPath(
        userId,
        diagnosticResult.result_id,
        weakTopics
      );

      Alert.alert(
        'Success!',
        'Your personalized study path has been generated',
        [
          {
            text: 'View Path',
            onPress: () => router.replace('/study-path' as any)
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate study path');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        {/* Overall Score */}
        <View className="bg-white rounded-2xl p-6 mb-4 items-center">
          <Text className="text-gray-600 text-sm mb-2">Your Overall Score</Text>
          <View className={`w-32 h-32 rounded-full ${getScoreBg(totalScore)} items-center justify-center mb-3`}>
            <Text className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>
              {totalScore}%
            </Text>
          </View>
          <Text className="text-lg font-semibold text-gray-800">
            {totalScore >= 80 ? 'Excellent!' : 
             totalScore >= 60 ? 'Good Job!' :
             totalScore >= 40 ? 'Keep Going!' :
             'Needs Improvement'}
          </Text>
        </View>

        {/* Subject-wise Scores */}
        <View className="bg-white rounded-2xl p-6 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Subject-wise Performance
          </Text>
          
          <View className="space-y-4">
            {/* Physics */}
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-medium text-gray-700">Physics</Text>
                <Text className={`text-sm font-bold ${getScoreColor(physicsScore)}`}>
                  {physicsScore}%
                </Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${physicsScore}%` }}
                />
              </View>
            </View>

            {/* Chemistry */}
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-medium text-gray-700">Chemistry</Text>
                <Text className={`text-sm font-bold ${getScoreColor(chemistryScore)}`}>
                  {chemistryScore}%
                </Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-green-600 rounded-full"
                  style={{ width: `${chemistryScore}%` }}
                />
              </View>
            </View>

            {/* Biology */}
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-medium text-gray-700">Biology</Text>
                <Text className={`text-sm font-bold ${getScoreColor(biologyScore)}`}>
                  {biologyScore}%
                </Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${biologyScore}%` }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* AI Analysis */}
        {loadingAnalysis ? (
          <View className="bg-white rounded-2xl p-6 mb-4 items-center">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-sm text-gray-600 mt-2">Analyzing your performance...</Text>
          </View>
        ) : aiAnalysis && (
          <View className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-4">
            <View className="flex-row items-center mb-4">
              <Text className="text-xl mr-2">🤖</Text>
              <Text className="text-lg font-semibold text-gray-900">AI Analysis</Text>
            </View>

            {/* Overall Analysis */}
            <View className="bg-white rounded-xl p-4 mb-3">
              <Text className="text-sm text-gray-700 leading-5">
                {aiAnalysis.overallAnalysis}
              </Text>
            </View>

            {/* Study Strategy */}
            {aiAnalysis.studyStrategy?.length > 0 && (
              <View className="bg-white rounded-xl p-4 mb-3">
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Recommended Strategy
                </Text>
                {aiAnalysis.studyStrategy.map((strategy: string, index: number) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Text className="text-blue-600 mr-2">•</Text>
                    <Text className="flex-1 text-sm text-gray-700">{strategy}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Focus Areas */}
            {aiAnalysis.focusAreas?.length > 0 && (
              <View className="bg-white rounded-xl p-4 mb-3">
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Priority Focus Areas
                </Text>
                {aiAnalysis.focusAreas.map((area: string, index: number) => (
                  <View key={index} className="flex-row items-center bg-purple-50 px-3 py-2 rounded-lg mb-2">
                    <Text className="text-purple-600 mr-2">→</Text>
                    <Text className="flex-1 text-sm text-gray-700">{area}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Time Allocation */}
            {aiAnalysis.timeAllocation?.length > 0 && (
              <View className="bg-white rounded-xl p-4">
                <Text className="text-sm font-semibold text-gray-900 mb-3">
                  Suggested Time Allocation
                </Text>
                {aiAnalysis.timeAllocation.map((allocation: any, index: number) => (
                  <View key={index} className="mb-3">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-sm text-gray-700">{allocation.subject}</Text>
                      <Text className="text-sm font-semibold text-gray-900">
                        {allocation.percentage}%
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View 
                        className={`h-full rounded-full ${
                          allocation.subject === 'Physics' ? 'bg-blue-600' :
                          allocation.subject === 'Chemistry' ? 'bg-green-600' :
                          'bg-purple-600'
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
          <View className="bg-white rounded-2xl p-6 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Topics to Focus On
            </Text>
            <View className="space-y-2">
              {weakTopics.map(topicId => {
                const topic = getTopicById(topicId);
                return topic ? (
                  <View key={topicId} className="flex-row items-center bg-red-50 p-3 rounded-lg">
                    <View className="w-2 h-2 rounded-full bg-red-500 mr-3" />
                    <Text className="flex-1 text-sm text-gray-800">{topic.name}</Text>
                    <Text className="text-xs text-gray-500">{topic.subject}</Text>
                  </View>
                ) : null;
              })}
            </View>
          </View>
        )}

        {/* Strong Topics */}
        {strongTopics.length > 0 && (
          <View className="bg-white rounded-2xl p-6 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Your Strong Areas
            </Text>
            <View className="space-y-2">
              {strongTopics.map(topicId => {
                const topic = getTopicById(topicId);
                return topic ? (
                  <View key={topicId} className="flex-row items-center bg-green-50 p-3 rounded-lg">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-3" />
                    <Text className="flex-1 text-sm text-gray-800">{topic.name}</Text>
                    <Text className="text-xs text-gray-500">{topic.subject}</Text>
                  </View>
                ) : null;
              })}
            </View>
          </View>
        )}

        {/* Generate Study Path Button */}
        <TouchableOpacity
          onPress={handleGeneratePath}
          disabled={generating}
          className="bg-blue-600 rounded-xl p-4 items-center mb-4"
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-base font-semibold">
              Generate My Personalized Study Path
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-200 rounded-xl p-4 items-center"
        >
          <Text className="text-gray-700 text-base font-medium">
            Retake Diagnostic
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
