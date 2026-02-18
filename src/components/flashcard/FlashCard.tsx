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
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity
          onPress={handleFlip}
          activeOpacity={0.9}
          style={StyleSheet.absoluteFill}
          disabled={isFlipped}
        >
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
        </TouchableOpacity>

        <Animated.View
          style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}
          pointerEvents={isFlipped ? "auto" : "none"}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={handleFlip}
            activeOpacity={1}
          >
            <ScrollView
              contentContainerStyle={styles.backContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              <Text style={styles.text}>{back}</Text>
            </ScrollView>
            <View style={styles.flipBackButton}>
              <Text style={styles.hint}>Tap to flip back</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
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
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    backfaceVisibility: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  cardFront: {
    backgroundColor: "#3b82f6",
  },
  cardBack: {
    backgroundColor: "#10b981",
  },
  backContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    lineHeight: 32,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
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
    borderRadius: 12,
  },
  labelDot: {
    position: "absolute",
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  dotCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  dotNumber: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  labelList: {
    maxHeight: 44,
    marginTop: 10,
  },
  labelItem: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  labelItemText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  hint: {
    position: "absolute",
    bottom: 20,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  flipBackButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    alignItems: "center",
  },
});
