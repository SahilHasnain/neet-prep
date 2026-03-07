import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SessionIntroProps {
  onStart: () => void;
}

export function SessionIntro({ onStart }: SessionIntroProps) {
  return (
    <View className="flex-1 justify-center items-center min-h-[600px]">
      <View className="bg-accent-primary/10 rounded-full p-8 mb-6">
        <Ionicons name="school" size={64} color="#8b5cf6" />
      </View>
      
      <Text className={`${THEME_CLASSES.heading1} mb-3 text-center`}>
        Ready to Learn?
      </Text>
      <Text className={`${THEME_CLASSES.body} text-center mb-8 px-6`}>
        This 25-minute focused session will guide you through structured learning
      </Text>

      <View className="w-full max-w-md space-y-4 mb-8">
        <View className="flex-row items-start">
          <View className="w-8 h-8 rounded-full bg-accent-primary items-center justify-center mr-3">
            <Text className="text-white font-bold">1</Text>
          </View>
          <View className="flex-1">
            <Text className={`${THEME_CLASSES.body} font-semibold`}>Watch Video Lesson</Text>
            <Text className={THEME_CLASSES.bodySmall}>Learn key concepts at your pace</Text>
          </View>
        </View>

        <View className="flex-row items-start">
          <View className="w-8 h-8 rounded-full bg-accent-primary items-center justify-center mr-3">
            <Text className="text-white font-bold">2</Text>
          </View>
          <View className="flex-1">
            <Text className={`${THEME_CLASSES.body} font-semibold`}>Active Recall</Text>
            <Text className={THEME_CLASSES.bodySmall}>Test what you remember</Text>
          </View>
        </View>

        <View className="flex-row items-start">
          <View className="w-8 h-8 rounded-full bg-accent-primary items-center justify-center mr-3">
            <Text className="text-white font-bold">3</Text>
          </View>
          <View className="flex-1">
            <Text className={`${THEME_CLASSES.body} font-semibold`}>Quick Quiz</Text>
            <Text className={THEME_CLASSES.bodySmall}>Test understanding with 3 questions</Text>
          </View>
        </View>

        <View className="flex-row items-start">
          <View className="w-8 h-8 rounded-full bg-accent-primary items-center justify-center mr-3">
            <Text className="text-white font-bold">4</Text>
          </View>
          <View className="flex-1">
            <Text className={`${THEME_CLASSES.body} font-semibold`}>Review & Insights</Text>
            <Text className={THEME_CLASSES.bodySmall}>Get personalized feedback</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={onStart}
        className={`${THEME_CLASSES.buttonPrimary} w-full max-w-md`}
      >
        <Ionicons name="play" size={20} color="#fff" />
        <Text className="text-white font-bold ml-2">Start Session</Text>
      </TouchableOpacity>

      <Text className="text-text-tertiary text-xs mt-4">
        💡 Tip: Find a quiet space and minimize distractions
      </Text>
    </View>
  );
}
