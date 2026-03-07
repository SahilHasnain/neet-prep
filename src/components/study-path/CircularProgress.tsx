/**
 * Circular Progress Component
 * Animated circular progress indicator using View components
 */

import React from 'react';
import { Text, View } from 'react-native';

interface CircularProgressProps {
  percentage: number;
  size?: number;
}

export function CircularProgress({
  percentage,
  size = 120
}: CircularProgressProps) {
  const getColor = () => {
    if (percentage >= 80) return '#10b981'; // green
    if (percentage >= 60) return '#3b82f6'; // blue
    if (percentage >= 40) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  return (
    <View 
      style={{ width: size, height: size }} 
      className="items-center justify-center relative"
    >
      {/* Outer ring */}
      <View 
        style={{ width: size, height: size }}
        className="rounded-full border-8 border-background-secondary absolute"
      />
      
      {/* Progress ring (simplified - shows as partial border) */}
      <View 
        style={{ 
          width: size, 
          height: size,
          borderWidth: 8,
          borderColor: getColor(),
          borderRadius: size / 2,
          transform: [{ rotate: '-90deg' }]
        }}
        className="absolute"
      />
      
      {/* Center content */}
      <View className="items-center justify-center">
        <Text className="text-text-primary text-3xl font-bold">{percentage}%</Text>
        <Text className="text-text-tertiary text-xs mt-1">Score</Text>
      </View>
    </View>
  );
}
