import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { FlashcardDeck } from '../../types/flashcard.types';

interface DeckCardProps {
  deck: FlashcardDeck;
  onPress: () => void;
}

export function DeckCard({ deck, onPress }: DeckCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {deck.title}
        </Text>
        {deck.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{deck.category}</Text>
          </View>
        )}
      </View>
      
      {deck.description && (
        <Text style={styles.description} numberOfLines={2}>
          {deck.description}
        </Text>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.cardCount}>
          {deck.card_count} {deck.card_count === 1 ? 'card' : 'cards'}
        </Text>
        <Text style={styles.date}>
          {new Date(deck.updated_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
