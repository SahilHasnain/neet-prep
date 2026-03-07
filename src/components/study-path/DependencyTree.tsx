/**
 * Dependency Tree Visualization Component
 * Shows prerequisite relationships and knowledge gaps
 */

import { getPrerequisites, getTopicById } from '@/src/config/knowledge-graph.config';
import { THEME_CLASSES } from '@/src/config/theme.config';
import type { TopicProgress } from '@/src/types/study-path.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface DependencyTreeProps {
  currentTopicId: string;
  allProgress: TopicProgress[];
  onTopicPress?: (topicId: string) => void;
  showGaps?: boolean;
}

interface TreeNode {
  id: string;
  name: string;
  status: 'completed' | 'current';
  mastery: number;
  hasGap?: boolean;
  gapSeverity?: 'critical' | 'moderate' | 'minor';
  level: number;
}

export function DependencyTree({ 
  currentTopicId, 
  allProgress, 
  onTopicPress,
  showGaps = true 
}: DependencyTreeProps) {
  const buildTree = (): TreeNode[] => {
    const nodes: TreeNode[] = [];
    const visited = new Set<string>();

    const addNode = (topicId: string, level: number) => {
      if (visited.has(topicId)) return;
      visited.add(topicId);

      const topic = getTopicById(topicId);
      if (!topic) return;

      const progress = allProgress.find(p => p.topic_id === topicId);
      const isCurrent = topicId === currentTopicId;
      
      // Check for gaps - only relevant for prerequisites
      const currentProgress = allProgress.find(p => p.topic_id === currentTopicId);
      const gap = currentProgress?.conceptual_gaps?.find(g => g.prerequisite_id === topicId);

      // Prerequisites must be completed for current topic to be accessible
      // So we only show 'completed' or 'current' status
      nodes.push({
        id: topicId,
        name: topic.name,
        status: isCurrent ? 'current' : 'completed',
        mastery: progress?.mastery_level || 0,
        hasGap: !isCurrent && !!gap, // Only show gaps on prerequisites, not current topic
        gapSeverity: gap?.gap_severity,
        level
      });

      // Add prerequisites recursively
      const prereqs = getPrerequisites(topicId);
      prereqs.forEach(prereq => addNode(prereq.id, level + 1));
    };

    // Start with current topic
    addNode(currentTopicId, 0);

    return nodes;
  };

  const nodes = buildTree();
  const maxLevel = Math.max(...nodes.map(n => n.level));

  // Group nodes by level
  const nodesByLevel = Array.from({ length: maxLevel + 1 }, (_, i) => 
    nodes.filter(n => n.level === i)
  );

  const getNodeColor = (node: TreeNode) => {
    if (node.status === 'current') return 'bg-accent-primary';
    if (node.hasGap && showGaps) {
      if (node.gapSeverity === 'critical') return 'bg-accent-error';
      if (node.gapSeverity === 'moderate') return 'bg-accent-warning';
      return 'bg-accent-info';
    }
    // All prerequisites are completed (otherwise current topic wouldn't be accessible)
    return 'bg-accent-success';
  };

  const getNodeBorderColor = (node: TreeNode) => {
    if (node.status === 'current') return 'border-accent-primary';
    if (node.hasGap && showGaps) {
      if (node.gapSeverity === 'critical') return 'border-accent-error';
      if (node.gapSeverity === 'moderate') return 'border-accent-warning';
      return 'border-accent-info';
    }
    return 'border-accent-success';
  };

  const getNodeIcon = (node: TreeNode): any => {
    if (node.status === 'current') return 'radio-button-on';
    if (node.hasGap && showGaps) return 'alert-circle';
    return 'checkmark-circle';
  };

  return (
    <View className={THEME_CLASSES.card}>
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-full bg-accent-primary/20 items-center justify-center mr-3">
          <Ionicons name="git-network" size={24} color="#8b5cf6" />
        </View>
        <Text className={THEME_CLASSES.heading3}>Knowledge Path</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="py-4">
          {nodesByLevel.map((levelNodes, levelIdx) => (
            <View key={levelIdx} className="mb-6">
              {/* Level Label */}
              <Text className={`${THEME_CLASSES.bodySmall} text-text-tertiary mb-2 text-center`}>
                {levelIdx === 0 ? 'Current Topic' : 
                 levelIdx === 1 ? 'Prerequisites' : 
                 `Level ${levelIdx}`}
              </Text>

              {/* Nodes */}
              <View className="flex-row items-center justify-center flex-wrap">
                {levelNodes.map((node, nodeIdx) => (
                  <View key={node.id} className="items-center mx-2 mb-4">
                    <TouchableOpacity
                      onPress={() => onTopicPress?.(node.id)}
                      className={`${getNodeColor(node)} ${getNodeBorderColor(node)} border-2 rounded-xl p-3 min-w-[140px] max-w-[180px]`}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center mb-2">
                        <Ionicons 
                          name={getNodeIcon(node)} 
                          size={18} 
                          color="#fff" 
                        />
                        <Text className="text-white text-xs font-semibold ml-2 flex-1" numberOfLines={2}>
                          {node.name}
                        </Text>
                      </View>

                      {/* Mastery Bar */}
                      {node.mastery > 0 && (
                        <View className="mt-2">
                          <View className="bg-white/30 rounded-full h-1.5 overflow-hidden">
                            <View 
                              className="bg-white h-full rounded-full"
                              style={{ width: `${node.mastery}%` }}
                            />
                          </View>
                          <Text className="text-white text-xs mt-1 text-center">
                            {node.mastery}%
                          </Text>
                        </View>
                      )}

                      {/* Gap Indicator */}
                      {node.hasGap && showGaps && (
                        <View className="mt-2 bg-white/20 rounded px-2 py-1">
                          <Text className="text-white text-xs font-semibold text-center">
                            {node.gapSeverity === 'critical' ? '⚠️ Critical Gap' :
                             node.gapSeverity === 'moderate' ? '⚠️ Review Needed' :
                             'ℹ️ Minor Gap'}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Connection Line to next level */}
                    {levelIdx < maxLevel && (
                      <View className="h-6 w-0.5 bg-border-subtle" />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View className="mt-4 pt-4 border-t border-border-subtle">
        <Text className={`${THEME_CLASSES.bodySmall} font-semibold mb-2`}>Legend:</Text>
        <View className="flex-row flex-wrap">
          <View className="flex-row items-center mr-4 mb-2">
            <View className="w-3 h-3 rounded-full bg-accent-primary mr-1" />
            <Text className={THEME_CLASSES.bodySmall}>Current Topic</Text>
          </View>
          <View className="flex-row items-center mr-4 mb-2">
            <View className="w-3 h-3 rounded-full bg-accent-error mr-1" />
            <Text className={THEME_CLASSES.bodySmall}>Critical Gap</Text>
          </View>
          <View className="flex-row items-center mr-4 mb-2">
            <View className="w-3 h-3 rounded-full bg-accent-warning mr-1" />
            <Text className={THEME_CLASSES.bodySmall}>Moderate Gap</Text>
          </View>
          <View className="flex-row items-center mr-4 mb-2">
            <View className="w-3 h-3 rounded-full bg-accent-info mr-1" />
            <Text className={THEME_CLASSES.bodySmall}>Minor Gap</Text>
          </View>
          <View className="flex-row items-center mr-4 mb-2">
            <View className="w-3 h-3 rounded-full bg-accent-success mr-1" />
            <Text className={THEME_CLASSES.bodySmall}>Mastered</Text>
          </View>
        </View>
        <Text className={`${THEME_CLASSES.bodySmall} text-text-tertiary mt-2`}>
          Note: All prerequisites shown are completed (required to access current topic). Gaps indicate concepts needing review.
        </Text>
      </View>
    </View>
  );
}
