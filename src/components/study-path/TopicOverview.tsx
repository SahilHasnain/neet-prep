import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { WhyLockedExplanation } from './WhyLockedExplanation';

interface TopicOverviewProps {
  topic: {
    name: string;
    subject: string;
    difficulty: string;
    estimatedHours: number;
    neetWeightage: number;
  };
  topicProgress: any;
  prerequisites: any[];
  dependents: any[];
  isLocked: boolean;
  isCompleted: boolean;
  allProgress: any[];
  topicId: string;
  onStartStudy: () => void;
  onStartGuidedSession?: () => void;
  onCompleteTopic: () => void;
  onMicroIntervention: (gap: any) => void;
}

export function TopicOverview({
  topic,
  topicProgress,
  prerequisites,
  dependents,
  isLocked,
  isCompleted,
  allProgress,
  topicId,
  onStartStudy,
  onStartGuidedSession,
  onCompleteTopic,
  onMicroIntervention,
}: TopicOverviewProps) {
  return (
    <View className="pb-4">
      {/* Topic Info */}
      <View className={`${THEME_CLASSES.card} mb-4`}>
        <View className="flex-row items-center mb-3">
          <View className="w-10 h-10 rounded-full bg-accent-primary/20 items-center justify-center mr-3">
            <Ionicons name="information-circle" size={24} color="#8b5cf6" />
          </View>
          <Text className={THEME_CLASSES.heading3}>Topic Details</Text>
        </View>

        <View>
          <View className="flex-row justify-between py-2 border-b border-border-subtle mb-2">
            <Text className={THEME_CLASSES.body}>Subject</Text>
            <Text className={THEME_CLASSES.heading3}>{topic.subject}</Text>
          </View>
          <View className="flex-row justify-between py-2 border-b border-border-subtle mb-2">
            <Text className={THEME_CLASSES.body}>Difficulty</Text>
            <Text className={`${THEME_CLASSES.heading3} capitalize`}>{topic.difficulty}</Text>
          </View>
          <View className="flex-row justify-between py-2 border-b border-border-subtle mb-2">
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

      {/* Prerequisites with Gaps */}
      {prerequisites.length > 0 && (
        <View className={`${THEME_CLASSES.card} mb-4`}>
          <View className="flex-row items-center mb-3">
            <Ionicons name="arrow-down-circle" size={20} color="#f59e0b" />
            <Text className={`${THEME_CLASSES.heading3} ml-2`}>Prerequisites ({prerequisites.length})</Text>
          </View>
          
          {topicProgress?.progress?.conceptual_gaps && topicProgress.progress.conceptual_gaps.length > 0 && (
            <View className="bg-accent-warning/10 border border-accent-warning/30 rounded-lg p-3 mb-3">
              <View className="flex-row items-center mb-2">
                <Ionicons name="alert-circle" size={18} color="#f59e0b" />
                <Text className="ml-2 text-accent-warning font-semibold text-sm">Knowledge Gaps Detected</Text>
              </View>
              {topicProgress.progress.conceptual_gaps.map((gap: any, idx: number) => (
                <View key={idx} className="mt-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className={`w-2 h-2 rounded-full mr-2 ${
                        gap.gap_severity === 'critical' ? 'bg-accent-error' :
                        gap.gap_severity === 'moderate' ? 'bg-accent-warning' :
                        'bg-accent-info'
                      }`} />
                      <Text className={`${THEME_CLASSES.bodySmall} font-semibold flex-1`}>
                        {gap.prerequisite_name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => onMicroIntervention(gap)}
                      className="bg-accent-primary rounded-lg px-3 py-1.5 ml-2"
                    >
                      <Text className="text-white text-xs font-semibold">Quick Fix</Text>
                    </TouchableOpacity>
                  </View>
                  {gap.sub_concepts && gap.sub_concepts.length > 0 && (
                    <View className="ml-4 mt-1">
                      {gap.sub_concepts.map((sub: string, subIdx: number) => (
                        <Text key={subIdx} className={`${THEME_CLASSES.bodySmall} text-text-tertiary`}>
                          • {sub}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
          
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
        <View className="mb-8">
          {onStartGuidedSession && (
            <TouchableOpacity 
              onPress={onStartGuidedSession} 
              className="bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl p-4 flex-row items-center justify-center border-2 border-accent-primary/50 mb-3"
            >
              <View className="bg-white/20 rounded-full p-2 mr-3">
                <Ionicons name="school" size={24} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-bold">Start Guided Session</Text>
                <Text className="text-white/80 text-xs mt-0.5">25-min structured learning</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onStartStudy} className={`${THEME_CLASSES.buttonPrimary} mb-3`}>
            <Text className="text-white text-base font-semibold">
              {isCompleted ? 'Review Topic' : 'Free Study Mode'}
            </Text>
          </TouchableOpacity>

          {!isCompleted && (
            <TouchableOpacity onPress={onCompleteTopic} className={THEME_CLASSES.buttonSuccess}>
              <Text className="text-white text-base font-semibold">Mark as Completed</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isLocked && (
        <View className="mb-4">
          <WhyLockedExplanation
            topicId={topicId}
            allProgress={allProgress}
            onPrerequisitePress={(prereqId) => router.push(`/study-path/topic/${prereqId}`)}
          />
        </View>
      )}
    </View>
  );
}
