/**
 * Micro-Intervention Modal Component
 * Shows targeted help for prerequisite gaps
 */

import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface MicroInterventionModalProps {
  visible: boolean;
  onClose: () => void;
  interventionData: {
    gap: {
      prerequisite_id: string;
      prerequisite_name: string;
    };
    keyConcepts?: string[];
    bridgeExplanation?: string;
    practiceQuestions?: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
    loading?: boolean;
    error?: boolean;
  } | null;
  currentTopicName: string;
}

export function MicroInterventionModal({
  visible,
  onClose,
  interventionData,
  currentTopicName
}: MicroInterventionModalProps) {
  if (!interventionData) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background-primary rounded-t-3xl max-h-[85%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-border-subtle">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-accent-primary/20 items-center justify-center mr-3">
                <Ionicons name="flash" size={24} color="#8b5cf6" />
              </View>
              <Text className={THEME_CLASSES.heading3}>Quick Refresh</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#717171" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4">
            {interventionData.loading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text className={`${THEME_CLASSES.body} mt-4`}>
                  Generating targeted help...
                </Text>
              </View>
            ) : interventionData.error ? (
              <View className="py-8 items-center">
                <Ionicons name="alert-circle" size={48} color="#ef4444" />
                <Text className={`${THEME_CLASSES.body} mt-4`}>
                  Failed to generate intervention
                </Text>
              </View>
            ) : (
              <View>
                {/* Gap Info */}
                <View className="bg-accent-warning/10 border border-accent-warning/30 rounded-xl p-4 mb-4">
                  <Text className={`${THEME_CLASSES.heading3} mb-2`}>
                    {interventionData.gap.prerequisite_name}
                  </Text>
                  <Text className={THEME_CLASSES.bodySmall}>
                    You need to strengthen this concept to master {currentTopicName}
                  </Text>
                </View>

                {/* Key Concepts */}
                {interventionData.keyConcepts && interventionData.keyConcepts.length > 0 && (
                  <View className={`${THEME_CLASSES.card} mb-4`}>
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="bulb" size={20} color="#8b5cf6" />
                      <Text className={`${THEME_CLASSES.heading3} ml-2`}>Key Concepts</Text>
                    </View>
                    {interventionData.keyConcepts.map((concept, idx) => (
                      <View key={idx} className="flex-row items-start mb-2">
                        <Text className="text-accent-primary font-bold mr-2">{idx + 1}.</Text>
                        <Text className={`flex-1 ${THEME_CLASSES.body}`}>{concept}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Bridge Explanation */}
                {interventionData.bridgeExplanation && (
                  <View className={`${THEME_CLASSES.card} mb-4`}>
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="git-branch" size={20} color="#ec4899" />
                      <Text className={`${THEME_CLASSES.heading3} ml-2`}>How It Connects</Text>
                    </View>
                    <Text className={THEME_CLASSES.body}>
                      {interventionData.bridgeExplanation}
                    </Text>
                  </View>
                )}

                {/* Practice Questions */}
                {interventionData.practiceQuestions && interventionData.practiceQuestions.length > 0 && (
                  <View className={`${THEME_CLASSES.card} mb-4`}>
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="help-circle" size={20} color="#10b981" />
                      <Text className={`${THEME_CLASSES.heading3} ml-2`}>Quick Practice</Text>
                    </View>
                    <Text className={`${THEME_CLASSES.bodySmall} mb-3`}>
                      Test your understanding with these focused questions:
                    </Text>
                    {interventionData.practiceQuestions.map((q, idx) => (
                      <View key={idx} className="mb-4 p-3 bg-background-secondary rounded-lg">
                        <Text className={`${THEME_CLASSES.body} font-semibold mb-2`}>
                          Q{idx + 1}. {q.question}
                        </Text>
                        {q.options.map((opt, optIdx) => (
                          <Text key={optIdx} className={`${THEME_CLASSES.bodySmall} ml-4 mb-1`}>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </Text>
                        ))}
                        <TouchableOpacity
                          onPress={() => Alert.alert(
                            'Answer', 
                            `Correct answer: ${String.fromCharCode(65 + q.correctAnswer)}\n\n${q.explanation}`
                          )}
                          className="mt-2 bg-accent-primary/20 rounded-lg p-2"
                        >
                          <Text className="text-accent-primary text-xs font-semibold text-center">
                            Show Answer
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Buttons */}
                <View className="space-y-3 mb-4">
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      router.push(`/study-path/topic/${interventionData.gap.prerequisite_id}`);
                    }}
                    className={THEME_CLASSES.buttonPrimary}
                  >
                    <Text className="text-white text-base font-semibold">
                      Study {interventionData.gap.prerequisite_name}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onClose}
                    className="bg-background-secondary border border-border-subtle rounded-xl p-4 items-center"
                  >
                    <Text className={`${THEME_CLASSES.body} font-semibold`}>
                      Continue Later
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
