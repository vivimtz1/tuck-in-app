import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Wind, Calendar, ChevronDown, ChevronUp, Clock, Settings2, Pencil, X } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { router } from 'expo-router';
import { useWindDown } from '@/contexts/WindDownContext';
import { useSleepLog } from '@/contexts/SleepLogContext';
import { CelebrationModal } from '@/components/CelebrationModal';

type ScheduleItem = {
  id: string;
  title: string;
  time: Date;
  icon: string;
};

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [editingTime, setEditingTime] = useState<'bedtime' | 'wake'>('bedtime');
  const [tonightBedtime, setTonightBedtime] = useState({ hour: 11, minute: '00', period: 'PM' });
  const [tonightWakeTime, setTonightWakeTime] = useState({ hour: 7, minute: '30', period: 'AM' });
  const { getEnabledItems } = useWindDown();
  const enabledItems = getEnabledItems();
  const hasNoWindDownRoutine = enabledItems.length === 0;

  const { activeSession, logBedtime, logWakeTime, lastEntry, celebration, dismissCelebration } = useSleepLog();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // TODO: Fetch from Supabase - for now using defaults
  const bedtime = `${tonightBedtime.hour}:${tonightBedtime.minute} ${tonightBedtime.period}`;
  const wakeTime = `${tonightWakeTime.hour}:${tonightWakeTime.minute} ${tonightWakeTime.period}`;
  const lastNightSleep = { hours: 7, minutes: 33 };
  const sleepQuality = 8;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Parse time string like "11:00 PM" to Date object for today
  const parseTimeString = (timeStr: string): Date => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) hour24 = hours + 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    date.setHours(hour24, minutes, 0, 0);
    
    // If time has passed today, set for tomorrow
    const now = new Date();
    if (date < now) {
      date.setDate(date.getDate() + 1);
    }
    
    return date;
  };

  // Generate schedule timeline based on bedtime and user's wind-down routine
  const generateSchedule = (bedtimeStr: string): ScheduleItem[] => {
    const bedtimeDate = parseTimeString(bedtimeStr);
    const schedule: ScheduleItem[] = [];

    // Add wind-down routine items based on user configuration
    enabledItems.forEach(item => {
      const itemTime = new Date(bedtimeDate);
      itemTime.setMinutes(itemTime.getMinutes() - item.minutesBeforeBedtime);
      schedule.push({
        id: item.id,
        title: item.title,
        time: itemTime,
        icon: item.icon,
      });
    });

    // Always add bedtime at the end
    schedule.push({
      id: 'bedtime',
      title: 'Bedtime',
      time: bedtimeDate,
      icon: '🌙',
    });

    return schedule.sort((a, b) => a.time.getTime() - b.time.getTime());
  };

  const schedule = generateSchedule(bedtime);
  const now = currentTime;

  // Check if within 15 minutes of bedtime
  const bedtimeDate = parseTimeString(bedtime);
  const minutesUntilBedtime = (bedtimeDate.getTime() - now.getTime()) / (1000 * 60);
  const isWithin15Minutes = minutesUntilBedtime >= 0 && minutesUntilBedtime <= 15;

  // Check if between bedtime and wake time (sleeping hours)
  const wakeTimeDate = parseTimeString(wakeTime);
  // If wake time is earlier than bedtime (e.g., 7 AM vs 11 PM), it's next day
  if (wakeTimeDate < bedtimeDate) {
    wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
  }
  const isBetweenBedtimeAndWake = now >= bedtimeDate || now < wakeTimeDate;

  // Find next upcoming item
  const nextItem = schedule.find(item => item.time > now) || schedule[0];
  const nextItemIndex = schedule.findIndex(item => item === nextItem);

  // Format time for display
  const formatScheduleTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Check if item is in the past
  const isPast = (item: ScheduleItem) => item.time < now;

  // Check if item is next
  const isNext = (item: ScheduleItem) => item === nextItem;

  // Time adjustment helpers
  const MINUTES = ['00', '15', '30', '45'];

  // Calculate sleep duration in minutes
  const calculateSleepDuration = () => {
    let bedHour = tonightBedtime.hour;
    if (tonightBedtime.period === 'PM' && bedHour !== 12) bedHour += 12;
    if (tonightBedtime.period === 'AM' && bedHour === 12) bedHour = 0;

    let wakeHour = tonightWakeTime.hour;
    if (tonightWakeTime.period === 'PM' && wakeHour !== 12) wakeHour += 12;
    if (tonightWakeTime.period === 'AM' && wakeHour === 12) wakeHour = 0;

    const bedMinutes = bedHour * 60 + parseInt(tonightBedtime.minute);
    let wakeMinutes = wakeHour * 60 + parseInt(tonightWakeTime.minute);

    // If wake time is before bedtime, it's the next day
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }

    return wakeMinutes - bedMinutes;
  };

  const sleepDurationMinutes = calculateSleepDuration();
  const sleepDurationHours = Math.floor(sleepDurationMinutes / 60);
  const sleepDurationMins = sleepDurationMinutes % 60;

  // Validation: sleep should be between 3 and 14 hours
  const isValidSleepDuration = sleepDurationMinutes >= 180 && sleepDurationMinutes <= 840;
  const getValidationError = () => {
    if (sleepDurationMinutes < 180) {
      return 'Sleep duration is less than 3 hours. Please adjust your times.';
    }
    if (sleepDurationMinutes > 840) {
      return 'Sleep duration is more than 14 hours. Please adjust your times.';
    }
    return null;
  };
  const validationError = getValidationError();
  
  const getCurrentEditTime = () => editingTime === 'bedtime' ? tonightBedtime : tonightWakeTime;
  const setCurrentEditTime = (value: { hour: number; minute: string; period: string }) => {
    if (editingTime === 'bedtime') {
      setTonightBedtime(value);
    } else {
      setTonightWakeTime(value);
    }
  };

  const adjustHour = (delta: number) => {
    const current = getCurrentEditTime();
    let newHour = current.hour + delta;
    if (newHour > 12) newHour = 1;
    if (newHour < 1) newHour = 12;
    setCurrentEditTime({ ...current, hour: newHour });
  };

  const adjustMinute = (delta: number) => {
    const current = getCurrentEditTime();
    const currentIndex = MINUTES.indexOf(current.minute);
    let newIndex = currentIndex + delta;
    if (newIndex >= MINUTES.length) newIndex = 0;
    if (newIndex < 0) newIndex = MINUTES.length - 1;
    setCurrentEditTime({ ...current, minute: MINUTES[newIndex] });
  };

  const togglePeriod = () => {
    const current = getCurrentEditTime();
    setCurrentEditTime({ ...current, period: current.period === 'PM' ? 'AM' : 'PM' });
  };

  const openTimeEditor = (type: 'bedtime' | 'wake') => {
    setEditingTime(type);
    setShowTimeModal(true);
  };

  const handleModalDone = () => {
    if (isValidSleepDuration) {
      setShowTimeModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Text style={styles.appName}>tuck in</Text>
              <View style={styles.teddyIcon}>
                <Text style={styles.teddyEmoji}>🧸</Text>
              </View>
            </View>
            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
          </View>
          <Text style={styles.greeting}>Good Night</Text>
        </View>

        {/* Show bedtime card only if within 15 minutes of bedtime */}
        {isWithin15Minutes && !isBetweenBedtimeAndWake ? (
          <Card style={styles.bedtimeCard}>
            <View style={styles.bedtimeHeader}>
              <Bell color={colors.blue} size={24} />
              <Text style={styles.bedtimeTitle}>It's Bedtime!</Text>
            </View>

            <View style={styles.teddyContainer}>
              <Text style={styles.teddyLarge}>🧸</Text>
            </View>

            <Text style={styles.bedtimeMessage}>
              Sweet dreams, your alarm is set for {wakeTime}
            </Text>

            <View style={styles.bedtimeActions}>
              <TouchableOpacity style={styles.changeButton}>
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : hasNoWindDownRoutine ? (
          /* New user: prompt to set up wind-down routine */
          <TouchableOpacity
            style={styles.windDownEmptyCard}
            onPress={() => router.push('/winddown-routine')}
            activeOpacity={0.85}
          >
            <View style={styles.windDownEmptyIconWrap}>
              <Wind color={colors.blue} size={22} />
            </View>
            <View style={styles.windDownEmptyContent}>
              <Text style={styles.windDownEmptyTitle}>Set up your wind-down routine</Text>
              <Text style={styles.windDownEmptyDescription}>Add activities before bed, then we’ll build your timeline.</Text>
            </View>
            <Settings2 color={colors.textMuted} size={20} />
          </TouchableOpacity>
        ) : (
          /* Show schedule timeline */
          <Card style={styles.scheduleCard}>
            <TouchableOpacity
              style={styles.scheduleHeader}
              onPress={() => setIsTimelineExpanded(!isTimelineExpanded)}
            >
              <View style={styles.scheduleHeaderLeft}>
                <Clock color={colors.blue} size={24} />
                <View style={styles.scheduleHeaderText}>
                  <Text style={styles.scheduleTitle}>
                    {nextItem.title}
                  </Text>
                  <Text style={styles.scheduleSubtitle}>
                    {formatScheduleTime(nextItem.time)}
                  </Text>
                </View>
              </View>
              {isTimelineExpanded ? (
                <ChevronUp color={colors.textMuted} size={20} />
              ) : (
                <ChevronDown color={colors.textMuted} size={20} />
              )}
            </TouchableOpacity>

            {isTimelineExpanded && (
              <>
                <View style={styles.timeline}>
                  {schedule.map((item, index) => {
                    const isLast = index === schedule.length - 1;
                    const itemIsPast = isPast(item);
                    const itemIsNext = isNext(item);

                    return (
                      <View key={item.id} style={styles.timelineItem}>
                        <View style={styles.timelineLeft}>
                          <View
                            style={[
                              styles.timelineDot,
                              itemIsPast && styles.timelineDotPast,
                              itemIsNext && styles.timelineDotNext,
                            ]}
                          >
                            <Text style={styles.timelineIcon}>{item.icon}</Text>
                          </View>
                          {!isLast && (
                            <View
                              style={[
                                styles.timelineLine,
                                itemIsPast && styles.timelineLinePast,
                              ]}
                            />
                          )}
                        </View>
                        <View style={styles.timelineContent}>
                          <Text
                            style={[
                              styles.timelineTitle,
                              itemIsPast && styles.timelineTitlePast,
                              itemIsNext && styles.timelineTitleNext,
                            ]}
                          >
                            {item.title}
                          </Text>
                          <Text
                            style={[
                              styles.timelineTime,
                              itemIsPast && styles.timelineTimePast,
                            ]}
                          >
                            {formatScheduleTime(item.time)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
                <TouchableOpacity
                  style={styles.timelineEditButton}
                  onPress={() => router.push('/winddown-routine')}
                >
                  <Pencil color={colors.blue} size={18} />
                  <Text style={styles.timelineEditText}>Edit routine</Text>
                </TouchableOpacity>
              </>
            )}
          </Card>
        )}

        <View style={styles.scheduleRow}>
          <TouchableOpacity 
            style={styles.scheduleItem}
            onPress={() => openTimeEditor('bedtime')}
            activeOpacity={0.7}
          >
            <Moon color={colors.cream} size={28} />
            <Text style={styles.scheduleTime}>{bedtime}</Text>
            <Text style={styles.scheduleLabel}>Bedtime</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.scheduleItem}
            onPress={() => openTimeEditor('wake')}
            activeOpacity={0.7}
          >
            <Sun color={colors.gold} size={28} />
            <Text style={styles.scheduleTime}>{wakeTime}</Text>
            <Text style={styles.scheduleLabel}>Wake Up</Text>
          </TouchableOpacity>
        </View>

        {/* Sleep Log Card */}
        <Text style={styles.sectionTitle}>Log Your Sleep</Text>
        <Card style={styles.sleepLogCard}>
          {activeSession ? (
            /* In bed — show wake up button */
            <>
              <View style={styles.sleepLogInBed}>
                <View style={styles.sleepLogInBedText}>
                  <Text style={styles.sleepLogInBedTitle}>Sleep well!</Text>
                  <Text style={styles.sleepLogInBedSub}>
                    Went to bed at{' '}
                    {activeSession.bedtime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.wakeButton} onPress={logWakeTime}>
                <Sun color={colors.dark} size={18} />
                <Text style={styles.wakeButtonText}>Good Morning! I Just Woke Up</Text>
              </TouchableOpacity>
            </>
          ) : lastEntry && lastEntry.durationMinutes > 0 ? (
            /* Completed entry — show summary + option to log again */
            <>
              <View style={styles.sleepLogSummary}>
                <View style={styles.sleepLogSummaryItem}>
                  <Text style={styles.sleepLogSummaryValue}>
                    {Math.floor(lastEntry.durationMinutes / 60)}h {lastEntry.durationMinutes % 60}m
                  </Text>
                  <Text style={styles.sleepLogSummaryLabel}>Last Night</Text>
                </View>
                <View style={styles.sleepLogDivider} />
                <View style={styles.sleepLogSummaryItem}>
                  <Text style={[styles.sleepLogSummaryValue, { color: lastEntry.goalMet ? colors.success : colors.warning }]}>
                    {lastEntry.goalMet ? '✓ Goal Met' : '✗ Goal Missed'}
                  </Text>
                  <Text style={styles.sleepLogSummaryLabel}>7h target</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.bedButton} onPress={logBedtime}>
                <Moon color={colors.dark} size={16} />
                <Text style={styles.bedButtonText}>Going to Bed</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* No active session, no recent entry */
            <>
              <Text style={styles.sleepLogPrompt}>
                Tap when you're heading to bed or waking up — Teddy will track your sleep for you!
              </Text>
              <View style={styles.sleepLogButtons}>
                <TouchableOpacity style={styles.bedButton} onPress={logBedtime}>
                  <Moon color={colors.dark} size={16} />
                  <Text style={styles.bedButtonText}>Going to Bed</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.wakeButtonOutline} onPress={logWakeTime}>
                  <Sun color={colors.gold} size={16} />
                  <Text style={styles.wakeButtonOutlineText}>Just Woke Up</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Card>

        <TouchableOpacity onPress={() => router.push('/(tabs)/progress')} activeOpacity={0.7}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Last Night</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {lastNightSleep.hours}h {lastNightSleep.minutes}m
                </Text>
                <Text style={styles.summaryLabel}>Sleep Duration</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{sleepQuality}/10</Text>
                <Text style={styles.summaryLabel}>Sleep Quality</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/winddown')}>
          <View style={styles.actionIcon}>
            <Wind color={colors.blue} size={24} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Start Wind-Down Routine</Text>
            <Text style={styles.actionDescription}>
              Begin your bedtime preparation
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/schedule')}>
          <View style={styles.actionIcon}>
            <Calendar color={colors.cream} size={24} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Adjust Sleep Schedule</Text>
            <Text style={styles.actionDescription}>
              Change your bedtime or wake time
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/winddown-routine')}>
          <View style={styles.actionIcon}>
            <Settings2 color={colors.blue} size={24} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Adjust Wind-Down Routine</Text>
            <Text style={styles.actionDescription}>
              Customize your pre-bed activities and order
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <CelebrationModal
        visible={celebration}
        durationMinutes={lastEntry?.durationMinutes ?? 0}
        goalMet={lastEntry?.goalMet ?? false}
        onDismiss={dismissCelebration}
      />

      {/* Time Adjustment Modal */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTime === 'bedtime' ? 'Tonight\'s Bedtime' : 'Tomorrow\'s Wake Time'}
              </Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)} style={styles.modalClose}>
                <X color={colors.textMuted} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerRow}>
              <View style={styles.timeColumn}>
                <TouchableOpacity onPress={() => adjustHour(1)} style={styles.arrowButton}>
                  <ChevronUp color={colors.textSecondary} size={28} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>{getCurrentEditTime().hour}</Text>
                <TouchableOpacity onPress={() => adjustHour(-1)} style={styles.arrowButton}>
                  <ChevronDown color={colors.textSecondary} size={28} />
                </TouchableOpacity>
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              <View style={styles.timeColumn}>
                <TouchableOpacity onPress={() => adjustMinute(1)} style={styles.arrowButton}>
                  <ChevronUp color={colors.textSecondary} size={28} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>{getCurrentEditTime().minute}</Text>
                <TouchableOpacity onPress={() => adjustMinute(-1)} style={styles.arrowButton}>
                  <ChevronDown color={colors.textSecondary} size={28} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={togglePeriod} style={styles.periodButton}>
                <Text style={styles.periodText}>{getCurrentEditTime().period}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sleepDurationPreview}>
              <Text style={styles.sleepDurationLabel}>Sleep Duration</Text>
              <Text style={[
                styles.sleepDurationValue,
                !isValidSleepDuration && styles.sleepDurationValueError
              ]}>
                {sleepDurationHours}h {sleepDurationMins}m
              </Text>
            </View>

            {validationError && (
              <View style={styles.validationError}>
                <Text style={styles.validationErrorText}>{validationError}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[
                styles.modalDoneButton,
                !isValidSleepDuration && styles.modalDoneButtonDisabled
              ]} 
              onPress={handleModalDone}
              disabled={!isValidSleepDuration}
            >
              <Text style={[
                styles.modalDoneText,
                !isValidSleepDuration && styles.modalDoneTextDisabled
              ]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appName: {
    ...typography.h2,
    color: colors.cream,
  },
  teddyIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teddyEmoji: {
    fontSize: 18,
  },
  currentTime: {
    ...typography.body,
    color: colors.textSecondary,
  },
  greeting: {
    ...typography.h1,
    color: colors.cream,
  },
  bedtimeCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.blue,
    padding: spacing.lg,
  },
  bedtimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bedtimeTitle: {
    ...typography.h3,
    color: colors.dark,
  },
  teddyContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  teddyLarge: {
    fontSize: 64,
  },
  bedtimeMessage: {
    ...typography.body,
    color: colors.dark,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  bedtimeActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  changeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.brown,
    alignItems: 'center',
  },
  changeButtonText: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cream,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...typography.body,
    color: colors.dark,
    fontFamily: 'Fredoka-Medium',
  },
  scheduleRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  scheduleItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  scheduleTime: {
    ...typography.h2,
    color: colors.cream,
  },
  scheduleLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.cream,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  summaryItem: {
    flex: 1,
  },
  summaryValue: {
    ...typography.h2,
    color: colors.blue,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.cream,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginBottom: 4,
  },
  actionDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  scheduleCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  windDownEmptyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  windDownEmptyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.blue + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  windDownEmptyContent: {
    flex: 1,
  },
  windDownEmptyTitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginBottom: 2,
  },
  windDownEmptyDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  // Sleep Log Card
  sleepLogCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sleepLogPrompt: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  sleepLogButtons: {
    gap: spacing.sm,
  },
  bedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  bedButtonText: {
    ...typography.body,
    color: colors.dark,
    fontFamily: 'Fredoka-Medium',
  },
  wakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  wakeButtonText: {
    ...typography.body,
    color: colors.dark,
    fontFamily: 'Fredoka-Medium',
  },
  wakeButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  wakeButtonOutlineText: {
    ...typography.body,
    color: colors.gold,
    fontFamily: 'Fredoka-Medium',
  },
  sleepLogInBed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sleepLogEmoji: {
    fontSize: 40,
  },
  sleepLogInBedText: {
    flex: 1,
  },
  sleepLogInBedTitle: {
    ...typography.h3,
    color: colors.cream,
    marginBottom: 2,
  },
  sleepLogInBedSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sleepLogSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sleepLogSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  sleepLogSummaryValue: {
    ...typography.h3,
    color: colors.blue,
    marginBottom: 2,
  },
  sleepLogSummaryLabel: {
    ...typography.small,
    color: colors.textMuted,
  },
  sleepLogDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  scheduleHeaderText: {
    flex: 1,
  },
  scheduleTitle: {
    ...typography.h3,
    color: colors.cream,
    marginBottom: 2,
  },
  scheduleSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timeline: {
    marginTop: spacing.lg,
    paddingLeft: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 32,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  timelineDotPast: {
    backgroundColor: colors.success + '30',
    borderColor: colors.success,
  },
  timelineDotNext: {
    backgroundColor: colors.blue + '30',
    borderColor: colors.blue,
    borderWidth: 3,
  },
  timelineIcon: {
    fontSize: 16,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
    minHeight: 20,
  },
  timelineLinePast: {
    backgroundColor: colors.success,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    ...typography.body,
    color: colors.textMuted,
    fontFamily: 'Fredoka-Regular',
    marginBottom: 2,
  },
  timelineTitlePast: {
    color: colors.textMuted,
    opacity: 0.6,
  },
  timelineTitleNext: {
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
  timelineTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timelineTimePast: {
    opacity: 0.6,
  },
  timelineEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timelineEditText: {
    ...typography.body,
    color: colors.blue,
    fontFamily: 'Fredoka-Medium',
  },
  // Time adjustment modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.cream,
  },
  modalClose: {
    padding: spacing.xs,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  timeColumn: {
    alignItems: 'center',
    width: 70,
  },
  arrowButton: {
    padding: spacing.sm,
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
  modalDoneButton: {
    backgroundColor: colors.cream,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalDoneButtonDisabled: {
    backgroundColor: colors.border,
  },
  modalDoneText: {
    ...typography.body,
    fontFamily: 'Fredoka-Medium',
    color: colors.dark,
  },
  modalDoneTextDisabled: {
    color: colors.textMuted,
  },
  sleepDurationPreview: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  sleepDurationLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  sleepDurationValue: {
    ...typography.h3,
    color: colors.success,
  },
  sleepDurationValueError: {
    color: colors.error,
  },
  validationError: {
    backgroundColor: colors.error + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  validationErrorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
  },
});
