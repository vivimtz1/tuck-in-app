import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { Check, Moon, Star, Wind } from 'lucide-react-native';
import { useOnboarding, TimeValue } from '@/contexts/OnboardingContext';
import { supabase } from '@/lib/supabase';

function toHH24(t: TimeValue): string {
  let h = t.hour;
  if (t.period === 'PM' && h !== 12) h += 12;
  if (t.period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${t.minute}`;
}

export default function CompleteScreen() {
  const { data, formatTime } = useOnboarding();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(starsAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleGetStarted = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const userId = session.user.id;
      await supabase.from('sleep_goals').insert({
        user_id: userId,
        bedtime: toHH24(data.bedtime),
        wake_time: toHH24(data.wakeTime),
        is_active: true,
        use_different_schedule: false,
      });
      await supabase.from('users').update({
        onboarding_completed: true,
        teddy_name: data.teddyName,
      }).eq('id', userId);
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.starsContainer,
            {
              opacity: starsAnim,
              transform: [{ scale: starsAnim }],
            },
          ]}
        >
          <View style={[styles.star, styles.star1]}>
            <Star color={colors.gold} size={20} fill={colors.gold} />
          </View>
          <View style={[styles.star, styles.star2]}>
            <Star color={colors.gold} size={16} fill={colors.gold} />
          </View>
          <View style={[styles.star, styles.star3]}>
            <Star color={colors.gold} size={24} fill={colors.gold} />
          </View>
          <View style={[styles.star, styles.star4]}>
            <Star color={colors.cream} size={14} fill={colors.cream} />
          </View>
          <View style={[styles.star, styles.star5]}>
            <Star color={colors.blue} size={18} fill={colors.blue} />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.successCircle,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.teddyCircle}>
            <Text style={styles.teddyEmoji}>🧸</Text>
          </View>
          <View style={styles.checkBadge}>
            <Check color={colors.dark} size={20} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Your sleep journey begins tonight.{'\n'}
            {data.teddyName} is ready to help you build{'\n'}
            better sleep habits.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.featuresContainer, { opacity: fadeAnim }]}>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Moon color={colors.blue} size={20} />
            </View>
            <Text style={styles.featureText}>
              Your bedtime is set for {formatTime(data.bedtime)}
            </Text>
          </View>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Check color={colors.success} size={20} />
            </View>
            <Text style={styles.featureText}>Reminders are enabled</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🧸</Text>
            </View>
            <Text style={styles.featureText}>{data.teddyName} is your sleep companion</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Wind color={colors.cream} size={20} />
            </View>
            <Text style={styles.featureText}>Next: Set up your wind-down routine in the app</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Start Your First Night"
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          fullWidth
        />
        <Text style={styles.footerText}>
          Sweet dreams await!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  starsContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: '15%',
  },
  star: {
    position: 'absolute',
  },
  star1: {
    top: 20,
    left: 30,
  },
  star2: {
    top: 60,
    right: 20,
  },
  star3: {
    bottom: 40,
    left: 10,
  },
  star4: {
    top: 10,
    right: 60,
  },
  star5: {
    bottom: 20,
    right: 40,
  },
  successCircle: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  teddyCircle: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: colors.brown,
  },
  teddyEmoji: {
    fontSize: 80,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background,
  },
  title: {
    ...typography.h1,
    color: colors.cream,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.xl,
  },
  featuresContainer: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
