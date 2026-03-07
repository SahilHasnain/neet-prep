/**
 * Why Locked Explanation Component
 * Shows why a topic is locked and what to do next
 */

import { getPrerequisites, getTopicById } from '@/src/config/knowledge-graph.config';
import { THEME_CLASSES } from '@/src/config/theme.config';
import type { TopicProgress } from '@/src/types/study-path.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface WhyLockedExplanationProps {
  topicId: string;
  allProgress: TopicProgress[];
  onPrerequisitePress?: (topicId: string) => void;
}

export function WhyLockedExplanation({ 
  topicId, 
  allProgress,
  onPrerequisitePress 
}: WhyLockedExplanationProps) {
  const topic = getTopicById(topicId);
  const prerequisites = getPrerequisites(topicId);

  if (!topic || prerequisites.length === 0) {
    return null;
  }

  // Find incomplete prerequisites
  const incompletePrereqs = prerequisites.filter(prereq => {
    const progress = allProgress.find(p => p.topic_id === prereq.id);
    return progress?.status !== 'completed';
  });

  if (incompletePrereqs.length === 0) {
    return null; // All prerequisites completed, shouldn't be locked
  }

  // Find the best next prerequisite to work on
  const nextPrereq = incompletePrereqs.find(prereq => {
    const progress = allProgress.find(p => p.topic_id === prereq.id);
    return progress?.status === 'unlocked' || progress?.status === 'in_progress';
  }) || incompletePrereqs[0];

  const nextProgress = allProgress.find(p => p.topic_id === nextPrereq.id);

  return (
    <View className="bg-accent-warning/10 border border-accent-warning/30 rounded-xl p-4">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-full bg-accent-warning/20 items-center justify-center mr-3">
          <Ionicons name="lock-closed" size={24} color="#f59e0b" />
        </View>
        <View className="flex-1">
          <Text className="text-accent-warning font-bold text-base">Why is this locked?</Text>
          <Text className={`${THEME_CLASSES.bodySmall} text-text-secondary mt-1`}>
            You need to master prerequisites first
          </Text>
        </View>
      </View>

      {/* Explanation */}
      <View className="bg-white/50 rounded-lg p-3 mb-3">
        <Text className={THEME_CLASSES.body}>
          <Text className="font-semibold">{topic.name}</Text> requires understanding of{' '}
          <Text className="font-semibold">{incompletePrereqs.length}</Text> prerequisite topic
          {incompletePrereqs.length > 1 ? 's' : ''}.
        </Text>
      </View>

      {/* Incomplete Prerequisites */}
      <View className="mb-3">
        <Text className={`${THEME_CLASSES.bodySmall} font-semibold mb-2`}>
          Complete these first:
        </Text>
        {incompletePrereqs.map(prereq => {
          const progress = allProgress.find(p => p.topic_id === prereq.id);
          const isNext = prereq.id === nextPrereq.id;
          
          return (
            <TouchableOpacity
              key={prereq.id}
              onPress={() => onPrerequisitePress?.(prereq.id)}
              className={`flex-row items-center p-3 rounded-lg mb-2 ${
                isNext ? 'bg-accent-primary/10 border border-accent-primary' : 'bg-white/50'
              }`}
              activeOpacity={0.7}
            >
              <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                progress?.status === 'unlocked' || progress?.status === 'in_progress' 
                  ? 'bg-chemistry/20' 
                  : 'bg-text-disabled/20'
              }`}>
                <Ionicons 
                  name={
                    progress?.status === 'unlocked' || progress?.status === 'in_progress'
                      ? 'ellipse-outline'
                      : 'lock-closed'
                  } 
                  size={16} 
                  color={
                    progress?.status === 'unlocked' || progress?.status === 'in_progress'
                      ? '#ec4899'
                      : '#717171'
                  }
                />
              </View>
              
              <View className="flex-1">
                <Text className={`${THEME_CLASSES.body} font-semibold`}>
                  {prereq.name}
                </Text>
                {progress && progress.mastery_level > 0 && (
                  <View className="flex-row items-center mt-1">
                    <View className="flex-1 bg-border-subtle rounded-full h-1.5 mr-2">
                      <View 
                        className="bg-chemistry h-full rounded-full"
                        style={{ width: `${progress.mastery_level}%` }}
                      />
                    </View>
                    <Text className={`${THEME_CLASSES.bodySmall} text-text-tertiary`}>
                      {progress.mastery_level}%
                    </Text>
                  </View>
                )}
              </View>

              {isNext && (
                <View className="bg-accent-primary rounded-full px-2 py-1 ml-2">
                  <Text className="text-white text-xs font-semibold">Next</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Recommended Action */}
      <View className="bg-accent-primary/10 rounded-lg p-3 border border-accent-primary/30">
        <View className="flex-row items-center mb-2">
          <Ionicons name="bulb" size={18} color="#8b5cf6" />
          <Text className="ml-2 text-accent-primary font-semibold text-sm">
            Recommended Next Step
          </Text>
        </View>
        <Text className={THEME_CLASSES.body}>
          Start with <Text className="font-semibold">{nextPrereq.name}</Text>
          {nextProgress?.mastery_level && nextProgress.mastery_level > 0 
            ? ` (${nextProgress.mastery_level}% complete)` 
            : ''}. Once you master it, you'll be one step closer to unlocking {topic.name}.
        </Text>
      </View>
    </View>
  );
}
