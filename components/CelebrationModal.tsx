import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const MESSAGES = [
  { title: "You did it! 🎉", body: "Teddy is SO proud of you!\nYou hit your sleep goal tonight!" },
  { title: "Sleep champion! 🏆", body: "Teddy did a little happy dance\njust for you!" },
  { title: "Goal unlocked! ⭐", body: "Sweet dreams AND a sleep goal?\nYou're absolutely incredible!" },
  { title: "Yay, superstar! 🌟", body: "Teddy says you're the best\nsleeper in the whole world!" },
  { title: "You're on fire! 🔥", body: "Another night, another goal crushed.\nTeddy is beaming with pride!" },
];

type Props = {
  visible: boolean;
  durationMinutes: number;
  onDismiss: () => void;
};

export function CelebrationModal({ visible, durationMinutes, onDismiss }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const messageIndex = useRef(Math.floor(Math.random() * MESSAGES.length)).current;
  const message = MESSAGES[messageIndex];

  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationLabel = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          {/* Confetti row */}
          <Text style={styles.confetti}>🎊 ✨ 🎊</Text>

          {/* Teddy */}
          <View style={styles.teddyWrap}>
            <Text style={styles.teddyEmoji}>🧸</Text>
          </View>

          {/* Stars */}
          <Text style={styles.stars}>⭐ ⭐ ⭐</Text>

          <Text style={styles.title}>{message.title}</Text>
          <Text style={styles.body}>{message.body}</Text>

          {/* Sleep duration badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>You slept</Text>
            <Text style={styles.badgeValue}>{durationLabel}</Text>
            <Text style={styles.badgeLabel}>tonight 🌙</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onDismiss} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Awesome! 🎉</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: colors.gold + '55',
  },
  confetti: {
    fontSize: 28,
    marginBottom: spacing.sm,
    letterSpacing: 8,
  },
  teddyWrap: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.brown + '44',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: colors.gold + '66',
  },
  teddyEmoji: {
    fontSize: 52,
  },
  stars: {
    fontSize: 20,
    letterSpacing: 6,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Fredoka-Medium',
    color: colors.cream,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  badge: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  badgeLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  badgeValue: {
    fontSize: 32,
    fontFamily: 'Fredoka-Medium',
    color: colors.gold,
    lineHeight: 38,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Fredoka-Medium',
    color: colors.dark,
  },
});
