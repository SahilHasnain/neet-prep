import { StyleSheet, Text, View } from 'react-native';

interface ProgressBarProps {
  mastered: number;
  learning: number;
  newCards: number;
  total: number;
}

export function ProgressBar({ mastered, learning, newCards, total }: ProgressBarProps) {
  const masteredPercent = total > 0 ? (mastered / total) * 100 : 0;
  const learningPercent = total > 0 ? (learning / total) * 100 : 0;
  const newPercent = total > 0 ? (newCards / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {masteredPercent > 0 && (
          <View style={[styles.segment, styles.mastered, { width: `${masteredPercent}%` }]} />
        )}
        {learningPercent > 0 && (
          <View style={[styles.segment, styles.learning, { width: `${learningPercent}%` }]} />
        )}
        {newPercent > 0 && (
          <View style={[styles.segment, styles.new, { width: `${newPercent}%` }]} />
        )}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.mastered]} />
          <Text style={styles.legendText}>Mastered: {mastered}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.learning]} />
          <Text style={styles.legendText}>Learning: {learning}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.new]} />
          <Text style={styles.legendText}>New: {newCards}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  bar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
  mastered: {
    backgroundColor: '#34C759',
  },
  learning: {
    backgroundColor: '#FF9500',
  },
  new: {
    backgroundColor: '#007AFF',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});
