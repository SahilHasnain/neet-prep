import { THEME_CLASSES } from '@/src/config/theme.config';
import type { ConfidenceLevel } from '@/src/hooks/useGuidedSession';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ConfidenceRatingProps {
  selectedConfidence: ConfidenceLevel | null;
  onSelect: (confidence: ConfidenceLevel) => void;
}

export function ConfidenceRating({ selectedConfidence, onSelect }: ConfidenceRatingProps) {
  return (
    <View className="mt-4 mb-4">
      <Text className={`${THEME_CLASSES.body} font-semibold mb-3 text-center`}>
        How confident are you in this answer?
      </Text>
      <View className="space-y-2">
        <TouchableOpacity
          onPress={() => onSelect('very-confident')}
          className={`p-4 rounded-xl border-2 flex-row items-center ${
            selectedConfidence === 'very-confident'
              ? 'bg-accent-success/20 border-accent-success'
              : 'bg-background-secondary border-border-secondary'
          }`}
        >
          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
            selectedConfidence === 'very-confident'
              ? 'border-accent-success bg-accent-success'
              : 'border-text-tertiary'
          }`}>
            {selectedConfidence === 'very-confident' && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </View>
          <View className="flex-1">
            <Text className={`font-semibold ${
              selectedConfidence === 'very-confident' ? 'text-accent-success' : 'text-text-primary'
            }`}>
              😊 Very Confident
            </Text>
            <Text className={`${THEME_CLASSES.bodySmall} text-text-tertiary`}>
              I'm sure this is correct
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelect('somewhat')}
          className={`p-4 rounded-xl border-2 flex-row items-center ${
            selectedConfidence === 'somewhat'
              ? 'bg-accent-info/20 border-accent-info'
              : 'bg-background-secondary border-border-secondary'
          }`}
        >
          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
            selectedConfidence === 'somewhat'
              ? 'border-accent-info bg-accent-info'
              : 'border-text-tertiary'
          }`}>
            {selectedConfidence === 'somewhat' && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </View>
          <View className="flex-1">
            <Text className={`font-semibold ${
              selectedConfidence === 'somewhat' ? 'text-accent-info' : 'text-text-primary'
            }`}>
              😐 Somewhat Confident
            </Text>
            <Text className={`${THEME_CLASSES.bodySmall} text-text-tertiary`}>
              I think this is right
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelect('not-sure')}
          className={`p-4 rounded-xl border-2 flex-row items-center ${
            selectedConfidence === 'not-sure'
              ? 'bg-accent-warning/20 border-accent-warning'
              : 'bg-background-secondary border-border-secondary'
          }`}
        >
          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
            selectedConfidence === 'not-sure'
              ? 'border-accent-warning bg-accent-warning'
              : 'border-text-tertiary'
          }`}>
            {selectedConfidence === 'not-sure' && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </View>
          <View className="flex-1">
            <Text className={`font-semibold ${
              selectedConfidence === 'not-sure' ? 'text-accent-warning' : 'text-text-primary'
            }`}>
              😕 Not Sure
            </Text>
            <Text className={`${THEME_CLASSES.bodySmall} text-text-tertiary`}>
              I'm guessing
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View className="mt-3 bg-accent-info/10 rounded-lg p-3 border border-accent-info/30">
        <Text className={`${THEME_CLASSES.bodySmall} text-center`}>
          💡 Be honest! This helps identify concepts you need to review
        </Text>
      </View>
    </View>
  );
}
