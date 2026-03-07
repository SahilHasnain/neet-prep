import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface StudyTipsTabProps {
  studyTips: string[];
  loadingTips: boolean;
  onLoadTips: () => void;
}

export function StudyTipsTab({ studyTips, loadingTips, onLoadTips }: StudyTipsTabProps) {
  return (
    <View className="pb-4">
      <View className="bg-biology/10 rounded-xl p-4 mb-4 border border-biology/30">
        <View className="flex-row items-center mb-3">
          <View className="w-10 h-10 rounded-full bg-biology/20 items-center justify-center mr-3">
            <Ionicons name="bulb" size={24} color="#ec4899" />
          </View>
          <Text className={THEME_CLASSES.heading3}>AI Study Tips</Text>
        </View>
        
        {loadingTips ? (
          <View className="py-4 items-center">
            <ActivityIndicator color="#ec4899" />
            <Text className={`${THEME_CLASSES.bodySmall} mt-2`}>Generating personalized tips...</Text>
          </View>
        ) : studyTips.length > 0 ? (
          <View className="space-y-2">
            {studyTips.map((tip, index) => (
              <View key={index} className="flex-row items-start py-2">
                <Text className="text-biology-light font-bold mr-2">{index + 1}.</Text>
                <Text className={`flex-1 ${THEME_CLASSES.body}`}>{tip}</Text>
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            onPress={onLoadTips}
            className="bg-biology rounded-lg p-3 items-center active:bg-biology/80"
          >
            <Text className="text-white font-semibold">Generate Study Tips</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
