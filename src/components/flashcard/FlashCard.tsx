import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

interface Label {
  label_id: string;
  label_text: string;
  x_position: number;
  y_position: number;
  order_index: number;
}

interface FlashCardProps {
  front: string;
  back: string;
  imageUrl?: string;
  hasImage?: boolean;
  cardId?: string;
  onFlip?: (isFlipped: boolean) => void;
}

export function FlashCard({
  front,
  back,
  imageUrl,
  hasImage,
  cardId,
  onFlip,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (hasImage && cardId) {
      fetchLabels();
    }
  }, [hasImage, cardId]);

  const fetchLabels = async () => {
    try {
      const { LabelService } = await import("../../services/label.service");
      const fetchedLabels = await LabelService.getCardLabels(cardId!);
      setLabels(fetchedLabels);
    } catch (error) {
      console.error("Error fetching labels:", error);
    }
  };

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
    <TouchableOpacity
      onPress={handleFlip}
      activeOpacity={0.9}
      style={styles.container}
    >
      <View style={styles.card}>
        <Animated.View
          style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}
        >
          {hasImage && imageUrl ? (
            <View style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.image}
                  resizeMode="contain"
                  onLayout={(event) => {
                    const { width, height } = event.nativeEvent.layout;
                    setImageSize({ width, height });
                  }}
                />
                {labels.map((label, index) => (
                  <View
                    key={label.label_id}
                    style={[
                      styles.labelDot,
                      {
                        left: `${label.x_position}%`,
                        top: `${label.y_position}%`,
                      },
                    ]}
                  >
                    <View style={styles.dotCircle}>
                      <Text style={styles.dotNumber}>{index + 1}</Text>
                    </View>
                  </View>
                ))}
              </View>
              {labels.length > 0 && (
                <ScrollView
                  style={styles.labelList}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {labels.map((label, index) => (
                    <View key={label.label_id} style={styles.labelItem}>
                      <Text style={styles.labelItemText}>
                        {index + 1}. {label.label_text}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            <Text style={styles.text}>{front}</Text>
          )}
          <Text style={styles.hint}>Tap to flip</Text>
        </Animated.View>

        <Animated.View
          style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}
        >
          <ScrollView contentContainerStyle={styles.backContent}>
            <Text style={styles.text}>{back}</Text>
          </ScrollView>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1.5,
  },
  card: {
    flex: 1,
    position: "relative",
  },
  cardFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backfaceVisibility: "hidden",
  },
  cardFront: {
    backgroundColor: "#007AFF",
  },
  cardBack: {
    backgroundColor: "#34C759",
  },
  backContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  labelDot: {
    position: "absolute",
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  dotCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dotNumber: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  labelList: {
    maxHeight: 40,
    marginTop: 8,
  },
  labelItem: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  labelItemText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  hint: {
    position: "absolute",
    bottom: 16,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
