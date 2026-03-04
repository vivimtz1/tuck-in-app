import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ArrowLeft, Moon, Sun, Lock, Calendar } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TimePicker } from '@/components/TimePicker';
import { router } from 'expo-router';

export default function ScheduleScreen() {
  const [bedtime, setBedtime] = useState({ hours: 11, minutes: 0, period: 'PM' as 'AM' | 'PM' });
  const [wakeTime, setWakeTime] = useState({ hours: 7, minutes: 30, period: 'AM' as 'AM' | 'PM' });
  const [useDifferentSchedule, setUseDifferentSchedule] = useState(false);
  const [lockDays, setLockDays] = useState(7);
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  const formatTime = (time: { hours: number; minutes: number; period: 'AM' | 'PM' }) => {
    return `${time.hours}:${time.minutes.toString().padStart(2, '0')} ${time.period}`;
  };

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.cream} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep Schedule</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Set Your Sleep Goals</Text>
          <Text style={styles.infoText}>
            Choose a consistent bedtime and wake time to help build healthy sleep habits. Teddy will help remind you when it's time to wind down.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Current Schedule</Text>

        <Card style={styles.timeCard}>
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => setShowBedtimePicker(true)}
          >
            <View style={styles.timeIcon}>
              <Moon color={colors.cream} size={24} />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Bedtime</Text>
              <Text style={styles.timeValue}>{formatTime(bedtime)}</Text>
            </View>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.timeCard}>
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => setShowWakeTimePicker(true)}
          >
            <View style={styles.timeIcon}>
              <Sun color={colors.gold} size={24} />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Wake Time</Text>
              <Text style={styles.timeValue}>{formatTime(wakeTime)}</Text>
            </View>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.sleepDurationCard}>
          <Text style={styles.durationLabel}>Target Sleep Duration</Text>
          <Text style={styles.durationValue}>8h 30m</Text>
        </Card>

        <Text style={styles.sectionTitle}>Schedule Options</Text>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => setUseDifferentSchedule(!useDifferentSchedule)}
        >
          <View style={styles.optionIcon}>
            <Calendar color={colors.blue} size={20} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Different Weekday/Weekend Schedule</Text>
            <Text style={styles.optionDescription}>
              Set different times for weekdays and weekends
            </Text>
          </View>
          <View style={[styles.checkbox, useDifferentSchedule && styles.checkboxActive]}>
            {useDifferentSchedule && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        <Card style={styles.lockCard}>
          <View style={styles.lockHeader}>
            <Lock color={colors.gold} size={20} />
            <Text style={styles.lockTitle}>Lock Schedule</Text>
          </View>
          <Text style={styles.lockDescription}>
            Prevent changes for a set period to build consistency
          </Text>
          <View style={styles.lockOptions}>
            {[3, 7, 10, 14].map((days) => (
              <TouchableOpacity
                key={days}
                style={[styles.lockOption, lockDays === days && styles.lockOptionActive]}
                onPress={() => setLockDays(days)}
              >
                <Text style={[styles.lockOptionText, lockDays === days && styles.lockOptionTextActive]}>
                  {days} days
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.lockNote}>
            We recommend locking for at least 7 days to form a habit
          </Text>
        </Card>

        <Card style={styles.pastSchedulesCard}>
          <Text style={styles.pastTitle}>Past Schedules</Text>
          <View style={styles.pastList}>
            <View style={styles.pastItem}>
              <Text style={styles.pastDate}>Mar 1, 2026</Text>
              <Text style={styles.pastTime}>11:30 PM - 8:00 AM</Text>
            </View>
            <View style={styles.pastItem}>
              <Text style={styles.pastDate}>Feb 25, 2026</Text>
              <Text style={styles.pastTime}>11:00 PM - 7:30 AM</Text>
            </View>
            <View style={styles.pastItem}>
              <Text style={styles.pastDate}>Feb 20, 2026</Text>
              <Text style={styles.pastTime}>12:00 AM - 8:30 AM</Text>
            </View>
          </View>
        </Card>

        <View style={styles.actions}>
          <Button title="Save Schedule" onPress={handleSave} fullWidth />
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <TimePicker
        visible={showBedtimePicker}
        time={bedtime}
        onClose={() => setShowBedtimePicker(false)}
        onSave={setBedtime}
        title="Set Bedtime"
      />

      <TimePicker
        visible={showWakeTimePicker}
        time={wakeTime}
        onClose={() => setShowWakeTimePicker(false)}
        onSave={setWakeTime}
        title="Set Wake Time"
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.cream,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    margin: spacing.lg,
    backgroundColor: colors.blue + '20',
    borderWidth: 1,
    borderColor: colors.blue,
  },
  infoTitle: {
    ...typography.body,
    color: colors.blue,
    fontFamily: 'Fredoka-Medium',
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.text,
    lineHeight: 20,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.cream,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  timeCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: 0,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  timeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 4,
  },
  timeValue: {
    ...typography.h2,
    color: colors.cream,
  },
  changeText: {
    ...typography.body,
    color: colors.blue,
    fontFamily: 'Fredoka-Medium',
  },
  sleepDurationCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  durationLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  durationValue: {
    ...typography.h1,
    color: colors.cream,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginBottom: 4,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  checkmark: {
    color: colors.dark,
    fontSize: 16,
    fontFamily: 'Fredoka-Medium',
  },
  lockCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  lockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  lockTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
  lockDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  lockOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  lockOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  lockOptionActive: {
    backgroundColor: colors.gold + '20',
    borderColor: colors.gold,
  },
  lockOptionText: {
    ...typography.caption,
    color: colors.textMuted,
    fontFamily: 'Fredoka-Medium',
  },
  lockOptionTextActive: {
    color: colors.gold,
  },
  lockNote: {
    ...typography.small,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  pastSchedulesCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  pastTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginBottom: spacing.md,
  },
  pastList: {
    gap: spacing.md,
  },
  pastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pastDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  pastTime: {
    ...typography.caption,
    color: colors.cream,
  },
  actions: {
    marginHorizontal: spacing.lg,
  },
});
