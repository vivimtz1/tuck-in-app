import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const SUCCESS_MESSAGES = [
  { title: "You did it! 🎉", body: "Teddy is SO proud of you!\nYou hit your sleep goal tonight!" },
  { title: "Sleep champion! 🏆", body: "Teddy did a little happy dance\njust for you!" },
  { title: "Goal unlocked! ⭐", body: "Sweet dreams AND a sleep goal?\nYou're absolutely incredible!" },
  { title: "Yay, superstar! 🌟", body: "Teddy says you're the best\nsleeper in the whole world!" },
  { title: "You're on fire! 🔥", body: "Another night, another goal crushed.\nTeddy is beaming with pride!" },
];

const ENCOURAGE_MESSAGES = [
  { title: "Good morning!", body: "Every night is a fresh start.\nTeddy believes in you!" },
  { title: "You woke up!", body: "Sleep is a journey, not a race.\nTomorrow's another chance!" },
  { title: "Rise and shine!", body: "You're doing great.\nLet's aim for the goal tonight!" },
  { title: "Hey sleepyhead!", body: "Not quite 7 hours, but\nthat's okay—you've got this!" },
];

type Props = {
  visible: boolean;
  durationMinutes: number;
  goalMet: boolean;
  onDismiss: () => void;
};

export function CelebrationModal({ visible, durationMinutes, goalMet, onDismiss }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const successIndex = useRef(Math.floor(Math.random() * SUCCESS_MESSAGES.length)).current;
  const encourageIndex = useRef(Math.floor(Math.random() * ENCOURAGE_MESSAGES.length)).current;
  const message = goalMet ? SUCCESS_MESSAGES[successIndex] : ENCOURAGE_MESSAGES[encourageIndex];

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
          <Text style={styles.confetti}>{goalMet ? '🎊 ✨ 🎊' : ''}</Text>

          {/* Teddy */}
          <View style={[styles.teddyWrap, !goalMet && styles.teddyWrapMissed]}>
            <Text style={styles.teddyEmoji}>🧸</Text>
          </View>

          {/* Stars */}
          <Text style={styles.stars}>{goalMet ? '⭐ ⭐ ⭐' : ''}</Text>

          <Text style={styles.title}>{message.title}</Text>
          <Text style={styles.body}>{message.body}</Text>

          {/* Sleep duration badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>You slept</Text>
            <Text style={styles.badgeValue}>{durationLabel}</Text>
            <Text style={styles.badgeLabel}>tonight</Text>
          </View>

          <TouchableOpacity style={[styles.button, !goalMet && styles.buttonMissed]} onPress={onDismiss} activeOpacity={0.85}>
            <Text style={styles.buttonText}>{goalMet ? 'Awesome!' : 'Got it!'}</Text>
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
  teddyWrapMissed: {
    borderColor: colors.blue + '66',
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
  buttonMissed: {
    backgroundColor: colors.blue,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Fredoka-Medium',
    color: colors.dark,
  },
});
