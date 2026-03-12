import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ArrowLeft, Moon, Sun, Lock, Calendar, X, ChevronRight } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TimePicker } from '@/components/TimePicker';
import { router } from 'expo-router';

type TimeValue = { hours: number; minutes: number; period: 'AM' | 'PM' };

type DaySchedule = {
  bedtime: TimeValue;
  wakeTime: TimeValue;
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_ABBREVS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const defaultSchedule: DaySchedule = {
  bedtime: { hours: 11, minutes: 0, period: 'PM' },
  wakeTime: { hours: 7, minutes: 30, period: 'AM' },
};

export default function ScheduleScreen() {
  const [bedtime, setBedtime] = useState<TimeValue>({ hours: 11, minutes: 0, period: 'PM' });
  const [wakeTime, setWakeTime] = useState<TimeValue>({ hours: 7, minutes: 30, period: 'AM' });
  const [useDifferentSchedule, setUseDifferentSchedule] = useState(false);
  const [lockDays, setLockDays] = useState(7);
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  
  // Per-day schedule state
  const [daySchedules, setDaySchedules] = useState<Record<string, DaySchedule>>(() => {
    const initial: Record<string, DaySchedule> = {};
    DAYS_OF_WEEK.forEach(day => {
      initial[day] = { ...defaultSchedule };
    });
    return initial;
  });
  const [showDaysModal, setShowDaysModal] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'bedtime' | 'wakeTime' | null>(null);
  const [showDayTimePicker, setShowDayTimePicker] = useState(false);

  const formatTime = (time: TimeValue) => {
    return `${time.hours}:${time.minutes.toString().padStart(2, '0')} ${time.period}`;
  };

  const handleToggleDifferentSchedule = () => {
    if (!useDifferentSchedule) {
      // When enabling, sync all days to current bedtime/wake time
      const synced: Record<string, DaySchedule> = {};
      DAYS_OF_WEEK.forEach(day => {
        synced[day] = { bedtime: { ...bedtime }, wakeTime: { ...wakeTime } };
      });
      setDaySchedules(synced);
      setShowDaysModal(true);
    }
    setUseDifferentSchedule(!useDifferentSchedule);
  };

  const handleEditDayTime = (day: string, type: 'bedtime' | 'wakeTime') => {
    setEditingDay(day);
    setEditingType(type);
    setShowDaysModal(false); // Close days modal first
    setTimeout(() => {
      setShowDayTimePicker(true);
    }, 300); // Wait for days modal to close
  };

  const handleSaveDayTime = (time: TimeValue) => {
    if (editingDay && editingType) {
      setDaySchedules(prev => ({
        ...prev,
        [editingDay]: {
          ...prev[editingDay],
          [editingType]: time,
        },
      }));
    }
    setShowDayTimePicker(false);
    setTimeout(() => {
      setEditingDay(null);
      setEditingType(null);
      setShowDaysModal(true); // Reopen days modal
    }, 300);
  };

  const handleCancelDayTime = () => {
    setShowDayTimePicker(false);
    setTimeout(() => {
      setEditingDay(null);
      setEditingType(null);
      setShowDaysModal(true); // Reopen days modal
    }, 300);
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
          onPress={handleToggleDifferentSchedule}
        >
          <View style={styles.optionIcon}>
            <Calendar color={colors.blue} size={20} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Different Weekday/Weekend Schedule</Text>
            <Text style={styles.optionDescription}>
              Set different times for each day of the week
            </Text>
          </View>
          <View style={[styles.checkbox, useDifferentSchedule && styles.checkboxActive]}>
            {useDifferentSchedule && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        {useDifferentSchedule && (
          <TouchableOpacity
            style={styles.editDaysButton}
            onPress={() => setShowDaysModal(true)}
          >
            <Text style={styles.editDaysText}>Edit Daily Schedule</Text>
            <ChevronRight color={colors.blue} size={20} />
          </TouchableOpacity>
        )}

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

      {/* Days of week modal */}
      <Modal
        visible={showDaysModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDaysModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Schedule</Text>
              <TouchableOpacity onPress={() => setShowDaysModal(false)}>
                <X color={colors.textMuted} size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {DAYS_OF_WEEK.map((day, index) => (
                <View key={day} style={styles.dayRow}>
                  <Text style={styles.dayName}>{day}</Text>
                  <View style={styles.dayTimes}>
                    <TouchableOpacity
                      style={styles.dayTimeButton}
                      onPress={() => handleEditDayTime(day, 'bedtime')}
                    >
                      <Moon color={colors.cream} size={14} />
                      <Text style={styles.dayTimeText}>
                        {formatTime(daySchedules[day].bedtime)}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.dayTimeSeparator}>—</Text>
                    <TouchableOpacity
                      style={styles.dayTimeButton}
                      onPress={() => handleEditDayTime(day, 'wakeTime')}
                    >
                      <Sun color={colors.gold} size={14} />
                      <Text style={styles.dayTimeText}>
                        {formatTime(daySchedules[day].wakeTime)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={() => setShowDaysModal(false)}
            >
              <Text style={styles.modalSaveText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Day-specific time picker */}
      <TimePicker
        visible={showDayTimePicker}
        time={editingDay && editingType ? daySchedules[editingDay][editingType] : defaultSchedule.bedtime}
        onClose={handleCancelDayTime}
        onSave={handleSaveDayTime}
        title={editingDay && editingType ? `Set ${editingType === 'bedtime' ? 'Bedtime' : 'Wake Time'} for ${editingDay}` : 'Set Time'}
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
    marginRight: spacing.md,
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
    marginLeft: spacing.sm,
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
  editDaysButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.blue + '20',
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  editDaysText: {
    ...typography.body,
    color: colors.blue,
    fontFamily: 'Fredoka-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.cream,
  },
  modalScroll: {
    paddingHorizontal: spacing.lg,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayName: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    width: 100,
  },
  dayTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dayTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  dayTimeText: {
    ...typography.caption,
    color: colors.text,
  },
  dayTimeSeparator: {
    color: colors.textMuted,
  },
  modalSaveButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.blue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalSaveText: {
    ...typography.body,
    color: colors.dark,
    fontFamily: 'Fredoka-Medium',
  },
});
