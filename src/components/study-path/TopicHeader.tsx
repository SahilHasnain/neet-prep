import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TopicHeaderProps {
  topicName: string;
  difficulty: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export function TopicHeader({ topicName, difficulty, isCompleted, isLocked }: TopicHeaderProps) {
  return (
    <View className="bg-accent-primary px-4 pt-12 pb-3 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text className="text-white text-xl font-bold flex-1" numberOfLines={1}>
          {topicName}
        </Text>
      </View>
      
      <View className={`px-2 py-1 rounded-full ml-2 ${
        isCompleted ? 'bg-accent-success/40' :
        isLocked ? 'bg-text-disabled/40' :
        'bg-white/20'
      }`}>
        <Text className="text-white text-xs font-semibold">
          {isCompleted ? '✓' : isLocked ? '🔒' : difficulty}
        </Text>
      </View>
    </View>
  );
}
