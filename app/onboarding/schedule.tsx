import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { ArrowLeft, Moon, Sun, ChevronUp, ChevronDown } from 'lucide-react-native';
import { Card } from '@/components/Card';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['PM', 'AM'];

type TimePickerProps = {
  value: { hour: number; minute: string; period: string };
  onChange: (value: { hour: number; minute: string; period: string }) => void;
  label: string;
  icon: React.ReactNode;
};

function TimePicker({ value, onChange, label, icon }: TimePickerProps) {
  const adjustHour = (delta: number) => {
    let newHour = value.hour + delta;
    if (newHour > 12) newHour = 1;
    if (newHour < 1) newHour = 12;
    onChange({ ...value, hour: newHour });
  };

  const adjustMinute = (delta: number) => {
    const currentIndex = MINUTES.indexOf(value.minute);
    let newIndex = currentIndex + delta;
    if (newIndex >= MINUTES.length) newIndex = 0;
    if (newIndex < 0) newIndex = MINUTES.length - 1;
    onChange({ ...value, minute: MINUTES[newIndex] });
  };

  const togglePeriod = () => {
    onChange({ ...value, period: value.period === 'PM' ? 'AM' : 'PM' });
  };

  return (
    <View style={styles.timePickerContainer}>
      <View style={styles.timePickerLabel}>
        {icon}
        <Text style={styles.timePickerLabelText}>{label}</Text>
      </View>
      
      <View style={styles.timePickerRow}>
        <View style={styles.timeColumn}>
          <TouchableOpacity onPress={() => adjustHour(1)} style={styles.arrowButton}>
            <ChevronUp color={colors.textSecondary} size={24} />
          </TouchableOpacity>
          <Text style={styles.timeValue}>{value.hour}</Text>
          <TouchableOpacity onPress={() => adjustHour(-1)} style={styles.arrowButton}>
            <ChevronDown color={colors.textSecondary} size={24} />
          </TouchableOpacity>
        </View>

        <Text style={styles.timeSeparator}>:</Text>

        <View style={styles.timeColumn}>
          <TouchableOpacity onPress={() => adjustMinute(1)} style={styles.arrowButton}>
            <ChevronUp color={colors.textSecondary} size={24} />
          </TouchableOpacity>
          <Text style={styles.timeValue}>{value.minute}</Text>
          <TouchableOpacity onPress={() => adjustMinute(-1)} style={styles.arrowButton}>
            <ChevronDown color={colors.textSecondary} size={24} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={togglePeriod} style={styles.periodButton}>
          <Text style={styles.periodText}>{value.period}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ScheduleScreen() {
  const [bedtime, setBedtime] = useState({ hour: 11, minute: '00', period: 'PM' });
  const [wakeTime, setWakeTime] = useState({ hour: 7, minute: '30', period: 'AM' });

  const calculateSleepDuration = () => {
    let bedHour = bedtime.hour;
    if (bedtime.period === 'PM' && bedHour !== 12) bedHour += 12;
    if (bedtime.period === 'AM' && bedHour === 12) bedHour = 0;

    let wakeHour = wakeTime.hour;
    if (wakeTime.period === 'PM' && wakeHour !== 12) wakeHour += 12;
    if (wakeTime.period === 'AM' && wakeHour === 12) wakeHour = 0;

    const bedMinutes = bedHour * 60 + parseInt(bedtime.minute);
    let wakeMinutes = wakeHour * 60 + parseInt(wakeTime.minute);

    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }

    const durationMinutes = wakeMinutes - bedMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return { hours, minutes };
  };

  const duration = calculateSleepDuration();
  const isRecommendedDuration = duration.hours >= 7 && duration.hours <= 9;

  const handleContinue = () => {
    // Store schedule for later
    router.push('/onboarding/notifications');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={colors.cream} size={24} />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.step}>Step 2 of 4</Text>
          <Text style={styles.title}>Set Your Sleep Schedule</Text>
          <Text style={styles.subtitle}>
            Choose your ideal bedtime and wake time.{'\n'}We recommend 7-9 hours of sleep.
          </Text>

          <Card style={styles.scheduleCard}>
            <TimePicker
              value={bedtime}
              onChange={setBedtime}
              label="Bedtime"
              icon={<Moon color={colors.blue} size={24} />}
            />

            <View style={styles.divider} />

            <TimePicker
              value={wakeTime}
              onChange={setWakeTime}
              label="Wake Time"
              icon={<Sun color={colors.gold} size={24} />}
            />
          </Card>

          <View style={[styles.durationCard, isRecommendedDuration && styles.durationCardGood]}>
            <Text style={styles.durationLabel}>Sleep Duration</Text>
            <Text style={styles.durationValue}>
              {duration.hours}h {duration.minutes}m
            </Text>
            <Text style={[styles.durationHint, isRecommendedDuration && styles.durationHintGood]}>
              {isRecommendedDuration
                ? '✓ Perfect! This is within the recommended range.'
                : 'Try adjusting for 7-9 hours of sleep.'}
            </Text>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Consistency is key!</Text>
              <Text style={styles.tipText}>
                Sticking to the same bedtime helps regulate your body's internal clock.
              </Text>
            </View>
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
        />
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
  scheduleCard: {
    marginBottom: spacing.lg,
  },
  timePickerContainer: {
    paddingVertical: spacing.md,
  },
  timePickerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timePickerLabelText: {
    ...typography.h3,
    color: colors.text,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  timeColumn: {
    alignItems: 'center',
    width: 60,
  },
  arrowButton: {
    padding: spacing.xs,
  },
  timeValue: {
    fontSize: 48,
    fontFamily: 'Fredoka-Medium',
    color: colors.cream,
  },
  timeSeparator: {
    fontSize: 48,
    fontFamily: 'Fredoka-Medium',
    color: colors.cream,
    marginBottom: 16,
  },
  periodButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  periodText: {
    ...typography.body,
    fontFamily: 'Fredoka-Medium',
    color: colors.dark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  durationCard: {
    alignItems: 'center' as const,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardBg,
  },
  durationCardGood: {
    borderColor: colors.success,
    backgroundColor: 'rgba(95, 184, 135, 0.1)',
  },
  durationLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  durationValue: {
    ...typography.h1,
    color: colors.cream,
    marginVertical: spacing.xs,
  },
  durationHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  durationHintGood: {
    color: colors.success,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...typography.body,
    fontFamily: 'Fredoka-Medium',
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  tipText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
