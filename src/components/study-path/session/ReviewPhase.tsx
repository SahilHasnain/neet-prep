import { CircularProgress } from '@/src/components/study-path/CircularProgress';
import { THEME_CLASSES } from '@/src/config/theme.config';
import type { QuizAnswer } from '@/src/hooks/useGuidedSession';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ReviewPhaseProps {
  answers: QuizAnswer[];
  totalQuestions: number;
  onComplete: () => void;
}

export function ReviewPhase({ answers, totalQuestions, onComplete }: ReviewPhaseProps) {
  const correctCount = answers.filter(a => a.isCorrect).length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  
  const correctAndConfident = answers.filter(a => a.isCorrect && a.confidence === 'very-confident').length;
  const correctButUnsure = answers.filter(a => a.isCorrect && a.confidence !== 'very-confident').length;
  const incorrectButConfident = answers.filter(a => !a.isCorrect && (a.confidence === 'very-confident' || a.confidence === 'somewhat')).length;

  return (
    <View className="flex-1 justify-center min-h-[500px]">
      <View className={`${THEME_CLASSES.card} items-center py-8`}>
        <CircularProgress percentage={percentage} size={120} />
        
        <Text className={`${THEME_CLASSES.heading2} mt-6 mb-2 text-center`}>
          Session Review
        </Text>
        <Text className={`${THEME_CLASSES.body} text-center mb-6`}>
          You got {correctCount} out of {totalQuestions} questions correct
        </Text>

        {/* Confidence Insights */}
        <View className="w-full mb-6">
          <Text className={`${THEME_CLASSES.heading3} mb-3`}>
            📊 Confidence Analysis
          </Text>
          
          <View>
            {correctAndConfident > 0 && (
              <View className="bg-accent-success/10 rounded-xl p-4 border border-accent-success/30 mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text className="text-accent-success font-semibold ml-2">
                      Truly Mastered
                    </Text>
                  </View>
                  <Text className="text-accent-success font-bold">{correctAndConfident}</Text>
                </View>
                <Text className={`${THEME_CLASSES.bodySmall} text-text-secondary mt-1`}>
                  Correct + Confident = Strong understanding ✓
                </Text>
              </View>
            )}
            
            {correctButUnsure > 0 && (
              <View className="bg-accent-warning/10 rounded-xl p-4 border border-accent-warning/30 mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Ionicons name="help-circle" size={20} color="#f59e0b" />
                    <Text className="text-accent-warning font-semibold ml-2">
                      Lucky Guesses
                    </Text>
                  </View>
                  <Text className="text-accent-warning font-bold">{correctButUnsure}</Text>
                </View>
                <Text className={`${THEME_CLASSES.bodySmall} text-text-secondary mt-1`}>
                  Correct but unsure - needs more practice
                </Text>
              </View>
            )}
            
            {incorrectButConfident > 0 && (
              <View className="bg-accent-error/10 rounded-xl p-4 border border-accent-error/30">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                    <Text className="text-accent-error font-semibold ml-2">
                      Misconceptions
                    </Text>
                  </View>
                  <Text className="text-accent-error font-bold">{incorrectButConfident}</Text>
                </View>
                <Text className={`${THEME_CLASSES.bodySmall} text-text-secondary mt-1`}>
                  Wrong but confident - review these carefully!
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="w-full mb-6">
          {correctCount === totalQuestions && (
            <View className="bg-accent-success/10 rounded-xl p-4 border border-accent-success/30 mb-3">
              <Text className="text-accent-success font-semibold text-center">
                🎉 Perfect Score! You've mastered this topic!
              </Text>
            </View>
          )}
          
          {correctCount >= totalQuestions * 0.6 && correctCount < totalQuestions && (
            <View className="bg-accent-info/10 rounded-xl p-4 border border-accent-info/30 mb-3">
              <Text className="text-accent-info font-semibold text-center">
                👍 Good job! Review the explanations to strengthen understanding
              </Text>
            </View>
          )}
          
          {correctCount < totalQuestions * 0.6 && (
            <View className="bg-accent-warning/10 rounded-xl p-4 border border-accent-warning/30">
              <Text className="text-accent-warning font-semibold text-center">
                💪 Keep practicing! Consider reviewing the video again
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={onComplete}
          className={`${THEME_CLASSES.buttonPrimary} w-full`}
        >
          <Text className="text-white font-bold">Complete Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
