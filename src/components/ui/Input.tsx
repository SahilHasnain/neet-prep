import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-semibold mb-2 text-text-secondary">
          {label}
        </Text>
      )}
      <TextInput
        className={`border rounded-lg px-4 py-3 text-base bg-background-tertiary text-text-primary ${
          error ? 'border-accent-error' : 'border-border-primary'
        }`}
        placeholderTextColor="#717171"
        style={style}
        {...props}
      />
      {error && (
        <Text className="text-accent-error text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}
