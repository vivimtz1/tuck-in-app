import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';

const SLEEP_BARRIERS = [
  { id: 'doomscrolling', label: 'Doomscrolling', description: 'Can\'t stop scrolling at night' },
  { id: 'stress', label: 'Stress & Anxiety', description: 'Worrying keeps me awake' },
  { id: 'irregular', label: 'Irregular Schedule', description: 'No consistent bedtime' },
  { id: 'caffeine', label: 'Late Caffeine', description: 'Coffee or tea past 3 PM' },
  { id: 'screens', label: 'Screen Time', description: 'Devices before bed' },
  { id: 'overthinking', label: 'Overthinking', description: 'Mind racing at night' },
  { id: 'naps', label: 'Late Naps', description: 'Napping too long or too late' },
  { id: 'other', label: 'Other', description: 'Something else' },
];

export default function BarriersScreen() {
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>([]);

  const toggleBarrier = (id: string) => {
    setSelectedBarriers((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    // Store barriers for later use (could save to async storage or context)
    router.push('/onboarding/schedule');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={colors.cream} size={24} />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.step}>Step 1 of 4</Text>
          <Text style={styles.title}>What's keeping you up?</Text>
          <Text style={styles.subtitle}>
            Select the barriers that affect your sleep.{'\n'}This helps us personalize your experience.
          </Text>

          <View style={styles.barriersGrid}>
            {SLEEP_BARRIERS.map((barrier) => {
              const isSelected = selectedBarriers.includes(barrier.id);
              return (
                <TouchableOpacity
                  key={barrier.id}
                  style={[styles.barrierCard, isSelected && styles.barrierCardSelected]}
                  onPress={() => toggleBarrier(barrier.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.barrierHeader}>
                    <Text style={[styles.barrierLabel, isSelected && styles.barrierLabelSelected]}>
                      {barrier.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Check color={colors.dark} size={14} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.barrierDescription}>{barrier.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="large"
          fullWidth
          disabled={selectedBarriers.length === 0}
        />
        <TouchableOpacity onPress={() => router.push('/onboarding/schedule')}>
          <Text style={styles.skipText}>Skip this step</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.cream,
    borderRadius: borderRadius.full,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  step: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.cream,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  barriersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  barrierCard: {
    width: '47%',
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  barrierCardSelected: {
    borderColor: colors.cream,
    backgroundColor: colors.surface,
  },
  barrierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barrierLabel: {
    ...typography.body,
    fontFamily: 'Fredoka-Medium',
    color: colors.text,
    flex: 1,
  },
  barrierLabelSelected: {
    color: colors.cream,
  },
  barrierDescription: {
    ...typography.small,
    color: colors.textMuted,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  skipText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
