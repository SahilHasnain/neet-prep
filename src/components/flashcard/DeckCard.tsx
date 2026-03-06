import { Text, TouchableOpacity, View } from 'react-native';
import { THEME_CLASSES } from '../../config/theme.config';
import type { FlashcardDeck } from '../../types/flashcard.types';

interface DeckCardProps {
  deck: FlashcardDeck;
  onPress: () => void;
}

export function DeckCard({ deck, onPress }: DeckCardProps) {
  const getSubjectColor = (category: string) => {
    if (category.toLowerCase().includes('physics')) return 'bg-physics/20 border-physics/30 text-physics';
    if (category.toLowerCase().includes('chemistry')) return 'bg-chemistry/20 border-chemistry/30 text-chemistry';
    if (category.toLowerCase().includes('biology')) return 'bg-biology/20 border-biology/30 text-biology';
    return 'bg-accent-primary/20 border-accent-primary/30 text-accent-primary';
  };

  const categoryColorClass = deck.category ? getSubjectColor(deck.category) : '';
  const [bgClass, borderClass, textClass] = categoryColorClass.split(' ');

  return (
    <TouchableOpacity 
      className={`${THEME_CLASSES.card} mb-3 active:bg-background-tertiary`}
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-text-primary flex-1 mr-2" numberOfLines={2}>
          {deck.title}
        </Text>
        {deck.category && (
          <View className={`px-2 py-1 rounded border ${bgClass} ${borderClass}`}>
            <Text className={`text-xs font-medium ${textClass}`}>
              {deck.category}
            </Text>
          </View>
        )}
      </View>
      
      {deck.description && (
        <Text className="text-sm text-text-secondary mb-3" numberOfLines={2}>
          {deck.description}
        </Text>
      )}
      
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-semibold text-accent-primary">
          {deck.card_count} {deck.card_count === 1 ? 'card' : 'cards'}
        </Text>
        <Text className="text-xs text-text-tertiary">
          {new Date(deck.updated_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
