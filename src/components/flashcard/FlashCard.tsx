import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

interface FlashCardProps {
  front: string;
  back: string;
  onFlip?: (isFlipped: boolean) => void;
}

export function FlashCard({ front, back, onFlip }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    const newState = !isFlipped;
    setIsFlipped(newState);
    onFlip?.(newState);
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(isFlipped ? 1 : 0, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      opacity: isFlipped ? 0 : 1,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(isFlipped ? 1 : 0, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      opacity: isFlipped ? 1 : 0,
    };
  });

  return (
    <TouchableOpacity onPress={handleFlip} activeOpacity={0.9} style={styles.container}>
      <View style={styles.card}>
        <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}>
          <Text style={styles.text}>{front}</Text>
          <Text style={styles.hint}>Tap to flip</Text>
        </Animated.View>
        
        <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
          <Text style={styles.text}>{back}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1.5,
  },
  card: {
    flex: 1,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: '#007AFF',
  },
  cardBack: {
    backgroundColor: '#34C759',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  hint: {
    position: 'absolute',
    bottom: 16,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
