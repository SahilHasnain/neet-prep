import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface VideoPhaseProps {
  onVideoPress: () => void;
  onComplete: () => void;
}

export function VideoPhase({ onVideoPress, onComplete }: VideoPhaseProps) {
  return (
    <View className="flex-1 justify-center min-h-[400px]">
      <View className={`${THEME_CLASSES.card} items-center py-8`}>
        <View className="bg-accent-primary/10 rounded-full p-6 mb-4">
          <Ionicons name="play-circle" size={64} color="#8b5cf6" />
        </View>
        
        <Text className={`${THEME_CLASSES.heading2} mb-2 text-center`}>
          Watch Video Lesson
        </Text>
        <Text className={`${THEME_CLASSES.body} text-center mb-6 px-4`}>
          Focus on understanding the core concepts. Take notes if needed.
        </Text>

        <TouchableOpacity
          onPress={onVideoPress}
          className={THEME_CLASSES.buttonPrimary}
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text className="text-white font-bold ml-2">Open Video</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onComplete}
          className="mt-4 bg-background-secondary rounded-xl px-6 py-3"
        >
          <Text className={`${THEME_CLASSES.body} font-semibold`}>
            I've Watched the Video →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
