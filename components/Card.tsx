import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/constants/theme';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outline';
  padding?: keyof typeof spacing;
};

export function Card({ children, style, variant = 'default', padding = 'md' }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        styles[variant],
        { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardBg,
  },
  default: {},
  elevated: {
    ...shadows.md,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
