import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

interface ActiveRecallPhaseProps {
  topicName: string;
  onComplete: () => void;
  onReviewVideo: () => void;
}

export function ActiveRecallPhase({ topicName, onComplete, onReviewVideo }: ActiveRecallPhaseProps) {
  const handleNeedReview = () => {
    Alert.alert(
      'Need More Time?',
      'Take a moment to review the video again if needed. Active recall works best when you genuinely try to remember.',
      [
        { text: 'Review Video', onPress: onReviewVideo },
        { text: 'Continue', onPress: onComplete }
      ]
    );
  };

  return (
    <View className="flex-1 min-h-[500px]">
      <View className="bg-accent-info/10 rounded-xl p-4 mb-4 border border-accent-info/30">
        <View className="flex-row items-center mb-2">
          <Ionicons name="bulb" size={24} color="#3b82f6" />
          <Text className={`${THEME_CLASSES.heading3} ml-2`}>Active Recall Check</Text>
        </View>
        <Text className={THEME_CLASSES.bodySmall}>
          Testing yourself improves retention by 50%! Answer without looking back.
        </Text>
      </View>

      <View className={THEME_CLASSES.card}>
        <Text className={`${THEME_CLASSES.heading3} mb-4`}>
          Quick Check: What Did You Learn?
        </Text>
        
        <View className="space-y-4 mb-6">
          <View className="bg-background-secondary rounded-xl p-4">
            <Text className={`${THEME_CLASSES.body} font-semibold mb-2`}>
              📝 In your own words, explain:
            </Text>
            <Text className={THEME_CLASSES.body}>
              What are the 2-3 most important concepts you just learned about {topicName}?
            </Text>
          </View>

          <View className="bg-accent-warning/10 rounded-xl p-4 border border-accent-warning/30">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#f59e0b" />
              <View className="flex-1 ml-2">
                <Text className="text-accent-warning font-semibold text-sm mb-1">
                  Why This Matters
                </Text>
                <Text className={`${THEME_CLASSES.bodySmall} text-text-secondary`}>
                  Retrieving information from memory (not just recognizing it) creates stronger neural pathways. This is proven to boost long-term retention.
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-background-secondary rounded-xl p-4 min-h-[120px]">
            <Text className={`${THEME_CLASSES.bodySmall} text-text-tertiary mb-2`}>
              Your answer (mental note):
            </Text>
            <Text className={THEME_CLASSES.body}>
              Think through your answer mentally. Don't worry about writing it down - the act of recalling is what matters!
            </Text>
          </View>
        </View>

        <View className="space-y-3">
          <TouchableOpacity
            onPress={onComplete}
            className={THEME_CLASSES.buttonPrimary}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text className="text-white font-bold ml-2">I've Recalled the Key Points</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNeedReview}
            className="bg-background-secondary rounded-xl px-6 py-3 items-center"
          >
            <Text className={`${THEME_CLASSES.body} font-semibold`}>
              I Need to Review
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-4 bg-accent-success/10 rounded-xl p-3 border border-accent-success/30">
          <Text className={`${THEME_CLASSES.bodySmall} text-center`}>
            💡 Pro Tip: Even if you can't remember everything, the effort of trying strengthens your memory!
          </Text>
        </View>
      </View>
    </View>
  );
}
