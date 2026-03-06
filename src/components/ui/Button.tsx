import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { THEME_CLASSES } from '../../config/theme.config';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled }: ButtonProps) {
  const isDisabled = disabled || loading;

  const getButtonClass = () => {
    if (variant === 'secondary') return THEME_CLASSES.buttonSecondary;
    if (variant === 'danger') return 'bg-accent-error rounded-xl p-3 items-center active:bg-accent-error/80';
    return THEME_CLASSES.buttonPrimary;
  };

  return (
    <TouchableOpacity
      className={`${getButtonClass()} ${isDisabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-white text-base font-semibold">{title}</Text>
      )}
    </TouchableOpacity>
  );
}
