import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Wind, Calendar, ChevronDown, ChevronUp, Clock, Settings2, Pencil, Headphones, X, Check } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { router } from 'expo-router';
import { useWindDown } from '@/contexts/WindDownContext';
import { useSleepLog } from '@/contexts/SleepLogContext';
import { CelebrationModal } from '@/components/CelebrationModal';
import { supabase } from '@/lib/supabase';

type ScheduleItem = {
  id: string;
  title: string;
  time: Date;
  icon: string;
};

function formatHH24ToDisplay(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

const MINUTES = ['00', '15', '30', '45'];

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [bedtime, setBedtime] = useState('11:00 PM');
  const [wakeTime, setWakeTime] = useState('7:30 AM');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [editingTime, setEditingTime] = useState<'bedtime' | 'wake'>('bedtime');
  const [tonightBedtime, setTonightBedtime] = useState({ hour: 11, minute: '00', period: 'PM' });
  const [tonightWakeTime, setTonightWakeTime] = useState({ hour: 7, minute: '30', period: 'AM' });

  const { getEnabledItems, checkedItems, toggleCheckedItem, isRoutineComplete } = useWindDown();
  const enabledItems = getEnabledItems();
  const hasNoWindDownRoutine = enabledItems.length === 0;

  const { activeSession, logBedtime, logWakeTime, cancelBedtime, lastEntry, celebration, dismissCelebration } = useSleepLog();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: goals } = await supabase
          .from('sleep_goals')
          .select('bedtime, wake_time')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .single();
        if (goals) {
          const fetchedBedtime = formatHH24ToDisplay(goals.bedtime);
          const fetchedWakeTime = formatHH24ToDisplay(goals.wake_time);
          setBedtime(fetchedBedtime);
          setWakeTime(fetchedWakeTime);
          // Sync modal state with fetched times
          const [bt, bp] = fetchedBedtime.split(' ');
          const [bh, bm] = bt.split(':').map(Number);
          setTonightBedtime({ hour: bh, minute: String(bm).padStart(2, '0'), period: bp });
          const [wt, wp] = fetchedWakeTime.split(' ');
          const [wh, wm] = wt.split(':').map(Number);
          setTonightWakeTime({ hour: wh, minute: String(wm).padStart(2, '0'), period: wp });
        }
      }
    };
    fetchSchedule();
  }, []);

  // Keep display strings in sync with modal edits
  useEffect(() => {
    setBedtime(`${tonightBedtime.hour}:${tonightBedtime.minute} ${tonightBedtime.period}`);
  }, [tonightBedtime]);

  useEffect(() => {
    setWakeTime(`${tonightWakeTime.hour}:${tonightWakeTime.minute} ${tonightWakeTime.period}`);
  }, [tonightWakeTime]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const parseTimeString = (timeStr: string): Date => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 = hours + 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    date.setHours(hour24, minutes, 0, 0);
    const now = new Date();
    if (date < now) date.setDate(date.getDate() + 1);
    return date;
  };

  const generateSchedule = (bedtimeStr: string): ScheduleItem[] => {
    const bedtimeDate = parseTimeString(bedtimeStr);
    const schedule: ScheduleItem[] = [];
    enabledItems.forEach(item => {
      const itemTime = new Date(bedtimeDate);
      itemTime.setMinutes(itemTime.getMinutes() - item.minutesBeforeBedtime);
      schedule.push({ id: item.id, title: item.title, time: itemTime, icon: item.icon });
    });
    schedule.push({ id: 'bedtime', title: 'Bedtime', time: bedtimeDate, icon: '🌙' });
    return schedule.sort((a, b) => a.time.getTime() - b.time.getTime());
  };

  const schedule = generateSchedule(bedtime);
  const now = currentTime;

  const bedtimeDate = parseTimeString(bedtime);
  const minutesUntilBedtime = (bedtimeDate.getTime() - now.getTime()) / (1000 * 60);
  const isWithin15Minutes = minutesUntilBedtime >= 0 && minutesUntilBedtime <= 15;

  const wakeTimeDate = parseTimeString(wakeTime);
  if (wakeTimeDate < bedtimeDate) wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
  const isBetweenBedtimeAndWake = now >= bedtimeDate || now < wakeTimeDate;

  const nextItem = schedule.find(item => item.time > now) || schedule[0];

  const formatScheduleTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const isPast = (item: ScheduleItem) => item.time < now;
  const isNext = (item: ScheduleItem) => item === nextItem;

  // Time modal helpers
  const calculateSleepDuration = () => {
    let bedHour = tonightBedtime.hour;
    if (tonightBedtime.period === 'PM' && bedHour !== 12) bedHour += 12;
    if (tonightBedtime.period === 'AM' && bedHour === 12) bedHour = 0;
    let wakeHour = tonightWakeTime.hour;
    if (tonightWakeTime.period === 'PM' && wakeHour !== 12) wakeHour += 12;
    if (tonightWakeTime.period === 'AM' && wakeHour === 12) wakeHour = 0;
    const bedMinutes = bedHour * 60 + parseInt(tonightBedtime.minute);
    let wakeMinutes = wakeHour * 60 + parseInt(tonightWakeTime.minute);
    if (wakeMinutes <= bedMinutes) wakeMinutes += 24 * 60;
    return wakeMinutes - bedMinutes;
  };

  const sleepDurationMinutes = calculateSleepDuration();
  const sleepDurationHours = Math.floor(sleepDurationMinutes / 60);
  const sleepDurationMins = sleepDurationMinutes % 60;
  const isValidSleepDuration = sleepDurationMinutes >= 180 && sleepDurationMinutes <= 840;
  const validationError = sleepDurationMinutes < 180
    ? 'Sleep duration is less than 3 hours. Please adjust your times.'
    : sleepDurationMinutes > 840
    ? 'Sleep duration is more than 14 hours. Please adjust your times.'
    : null;

  const getCurrentEditTime = () => editingTime === 'bedtime' ? tonightBedtime : tonightWakeTime;
  const setCurrentEditTime = (value: { hour: number; minute: string; period: string }) => {
    if (editingTime === 'bedtime') setTonightBedtime(value);
    else setTonightWakeTime(value);
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
    if (isValidSleepDuration) setShowTimeModal(false);
  };

  const handleCancelBedtime = () => {
    cancelBedtime();
  };

  const sleepLogTitle = activeSession ? "You're Sleeping..." : "Track Your Sleep";

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
          <TouchableOpacity
            style={styles.windDownEmptyCard}
            onPress={() => router.push('/winddown-routine')}
            activeOpacity={0.85}
          >
            <View style={styles.windDownEmptyIconWrap}>
              <Wind color={colors.blue} size={22} />
            </View>
            <View style={styles.windDownEmptyContent}>
              <Text style={styles.windDownEmptyTitle}>Set Up Your Wind-Down Routine</Text>
              <Text style={styles.windDownEmptyDescription}>
                Choose calming activities before bed. Teddy will guide you through them each night.
              </Text>
              <Text style={styles.windDownEmptyCta}>Get Started →</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Card style={[styles.scheduleCard, isRoutineComplete && styles.scheduleCardComplete]}>
            <TouchableOpacity
              style={styles.scheduleHeader}
              onPress={() => setIsTimelineExpanded(!isTimelineExpanded)}
            >
              <View style={styles.scheduleHeaderLeft}>
                {isRoutineComplete
                  ? <Check color={colors.success} size={24} strokeWidth={2.5} />
                  : <Clock color={colors.blue} size={24} />
                }
                <View style={styles.scheduleHeaderText}>
                  <Text style={[styles.scheduleTitle, isRoutineComplete && styles.scheduleTitleComplete]}>
                    {isRoutineComplete ? 'Routine Complete! 🌙' : 'Wind-Down Routine'}
                  </Text>
                  <Text style={styles.scheduleSubtitle}>
                    {isRoutineComplete
                      ? 'All done for tonight — sweet dreams!'
                      : isTimelineExpanded
                        ? 'Tonight\'s schedule'
                        : `Next: ${nextItem.title} · ${formatScheduleTime(nextItem.time)}`
                    }
                  </Text>
                </View>
              </View>
              <View style={styles.scheduleExpandHint}>
                <Text style={styles.scheduleExpandHintText}>{isTimelineExpanded ? 'Hide' : 'View'}</Text>
                {isTimelineExpanded ? (
                  <ChevronUp color={isRoutineComplete ? colors.success : colors.blue} size={18} />
                ) : (
                  <ChevronDown color={isRoutineComplete ? colors.success : colors.blue} size={18} />
                )}
              </View>
            </TouchableOpacity>

            {isTimelineExpanded && (
              <>
                {/* Progress summary */}
                {(() => {
                  const routineItems = schedule.filter(i => i.id !== 'bedtime');
                  const done = routineItems.filter(i => checkedItems.has(i.id)).length;
                  const total = routineItems.length;
                  if (total === 0) return null;
                  return (
                    <View style={styles.timelineProgress}>
                      <View style={styles.timelineProgressBar}>
                        <View style={[styles.timelineProgressFill, { width: `${(done / total) * 100}%` }]} />
                      </View>
                      <Text style={styles.timelineProgressText}>{done}/{total} done</Text>
                    </View>
                  );
                })()}

                <View style={styles.timeline}>
                  {schedule.map((item, index) => {
                    const isLast = index === schedule.length - 1;
                    const itemIsPast = isPast(item);
                    const itemIsNext = isNext(item);
                    const isBedtime = item.id === 'bedtime';
                    const isChecked = checkedItems.has(item.id);
                    return (
                      <View key={item.id} style={styles.timelineItem}>
                        <View style={styles.timelineLeft}>
                          <View style={[styles.timelineDot, itemIsPast && styles.timelineDotPast, itemIsNext && styles.timelineDotNext, isChecked && styles.timelineDotChecked]}>
                            {isChecked && !isBedtime
                              ? <Check color={colors.dark} size={14} strokeWidth={3} />
                              : <Text style={styles.timelineIcon}>{item.icon}</Text>
                            }
                          </View>
                          {!isLast && <View style={[styles.timelineLine, (itemIsPast || isChecked) && styles.timelineLinePast]} />}
                        </View>
                        <View style={styles.timelineContent}>
                          <Text style={[styles.timelineTitle, itemIsPast && styles.timelineTitlePast, itemIsNext && styles.timelineTitleNext, isChecked && styles.timelineTitleChecked]}>
                            {item.title}
                          </Text>
                          <Text style={[styles.timelineTime, itemIsPast && styles.timelineTimePast]}>
                            {formatScheduleTime(item.time)}
                          </Text>
                        </View>
                        {!isBedtime && (
                          <TouchableOpacity
                            style={[styles.timelineCheckbox, isChecked && styles.timelineCheckboxDone]}
                            onPress={() => toggleCheckedItem(item.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            {isChecked && <Check color={colors.dark} size={12} strokeWidth={3} />}
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
                <TouchableOpacity style={styles.timelineEditButton} onPress={() => router.push('/winddown-routine')}>
                  <Pencil color={colors.blue} size={18} />
                  <Text style={styles.timelineEditText}>Edit routine</Text>
                </TouchableOpacity>
              </>
            )}
          </Card>
        )}

        <View style={styles.scheduleRow}>
          <TouchableOpacity style={styles.scheduleItem} onPress={() => openTimeEditor('bedtime')} activeOpacity={0.7}>
            <Moon color={colors.cream} size={28} />
            <Text style={styles.scheduleTime}>{bedtime}</Text>
            <Text style={styles.scheduleLabel}>Bedtime</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.scheduleItem} onPress={() => openTimeEditor('wake')} activeOpacity={0.7}>
            <Sun color={colors.gold} size={28} />
            <Text style={styles.scheduleTime}>{wakeTime}</Text>
            <Text style={styles.scheduleLabel}>Wake Up</Text>
          </TouchableOpacity>
        </View>

        {/* Sleep Log Card */}
        <Text style={styles.sectionTitle}>{sleepLogTitle}</Text>
        <Card style={styles.sleepLogCard}>
          {activeSession ? (
            <>
              <View style={styles.sleepLogInBed}>
                <Text style={styles.sleepLogEmoji}>😴</Text>
                <View style={styles.sleepLogInBedText}>
                  <Text style={styles.sleepLogInBedTitle}>Tracking tonight's sleep</Text>
                  <Text style={styles.sleepLogInBedSub}>
                    Went to bed at{' '}
                    {activeSession.bedtime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.wakeButton} onPress={logWakeTime}>
                <Sun color={colors.dark} size={18} />
                <Text style={styles.wakeButtonText}>I Just Woke Up ☀️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelLink} onPress={handleCancelBedtime}>
                <Text style={styles.cancelLinkText}>Cancel — I didn't go to bed yet</Text>
              </TouchableOpacity>
            </>
          ) : lastEntry && lastEntry.durationMinutes > 0 ? (
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
                <Moon color={colors.cream} size={16} />
                <Text style={styles.bedButtonText}>Going to Bed 🌙</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.sleepLogOption}>
              <TouchableOpacity style={styles.bedButton} onPress={logBedtime}>
                <Moon color={colors.cream} size={16} />
                <Text style={styles.bedButtonText}>Going to Bed 🌙</Text>
              </TouchableOpacity>
              <Text style={styles.sleepLogOptionHint}>Tap when you're heading to bed to start tracking</Text>
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/winddown')}>
            <View style={styles.actionIcon}><Wind color={colors.blue} size={22} /></View>
            <Text style={styles.actionTitle}>Wind-Down Routine</Text>
            <Text style={styles.actionDescription}>Begin bedtime prep</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/schedule')}>
            <View style={styles.actionIcon}><Calendar color={colors.cream} size={22} /></View>
            <Text style={styles.actionTitle}>Sleep Schedule</Text>
            <Text style={styles.actionDescription}>Adjust bedtime</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/winddown-routine')}>
            <View style={styles.actionIcon}><Settings2 color={colors.blue} size={22} /></View>
            <Text style={styles.actionTitle}>Edit Routine</Text>
            <Text style={styles.actionDescription}>Customize activities</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/content')}>
            <View style={styles.actionIcon}><Headphones color={colors.gold} size={22} /></View>
            <Text style={styles.actionTitle}>Content Library</Text>
            <Text style={styles.actionDescription}>Music & podcasts</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <CelebrationModal
        visible={celebration}
        durationMinutes={lastEntry?.durationMinutes ?? 0}
        goalMet={lastEntry?.goalMet ?? false}
        onDismiss={dismissCelebration}
      />

      {/* Time Adjustment Modal */}
      <Modal visible={showTimeModal} transparent animationType="fade" onRequestClose={() => setShowTimeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTime === 'bedtime' ? "Tonight's Bedtime" : "Tomorrow's Wake Time"}
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
              <Text style={[styles.sleepDurationValue, !isValidSleepDuration && styles.sleepDurationValueError]}>
                {sleepDurationHours}h {sleepDurationMins}m
              </Text>
            </View>

            {validationError && (
              <View style={styles.validationError}>
                <Text style={styles.validationErrorText}>{validationError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.modalDoneButton, !isValidSleepDuration && styles.modalDoneButtonDisabled]}
              onPress={handleModalDone}
              disabled={!isValidSleepDuration}
            >
              <Text style={[styles.modalDoneText, !isValidSleepDuration && styles.modalDoneTextDisabled]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  header: { padding: spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  appName: { ...typography.h2, color: colors.cream },
  teddyIcon: { width: 32, height: 32, borderRadius: borderRadius.full, backgroundColor: colors.brown, alignItems: 'center', justifyContent: 'center' },
  teddyEmoji: { fontSize: 18 },
  currentTime: { ...typography.body, color: colors.textSecondary },
  greeting: { ...typography.h1, color: colors.cream },
  bedtimeCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.blue, padding: spacing.lg },
  bedtimeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  bedtimeTitle: { ...typography.h3, color: colors.dark },
  teddyContainer: { alignItems: 'center', marginVertical: spacing.md },
  teddyLarge: { fontSize: 64 },
  bedtimeMessage: { ...typography.body, color: colors.dark, textAlign: 'center', marginBottom: spacing.lg },
  bedtimeActions: { flexDirection: 'row', gap: spacing.md },
  changeButton: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.brown, alignItems: 'center' },
  changeButtonText: { ...typography.body, color: colors.cream, fontFamily: 'Fredoka-Medium' },
  confirmButton: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.cream, alignItems: 'center' },
  confirmButtonText: { ...typography.body, color: colors.dark, fontFamily: 'Fredoka-Medium' },
  scheduleRow: { flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.cardBg, borderRadius: borderRadius.lg, padding: spacing.lg },
  scheduleItem: { flex: 1, alignItems: 'center', gap: spacing.sm },
  scheduleTime: { ...typography.h2, color: colors.cream },
  scheduleLabel: { ...typography.caption, color: colors.textMuted },
  divider: { width: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.cream, marginHorizontal: spacing.lg, marginBottom: spacing.md },
  scheduleCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  scheduleCardComplete: { borderWidth: 1, borderColor: colors.success + '60' },
  scheduleTitleComplete: { color: colors.success },
  windDownEmptyCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: colors.cardBg, borderRadius: borderRadius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.blue + '60',
    borderStyle: 'dashed', gap: spacing.md,
  },
  windDownEmptyIconWrap: { width: 44, height: 44, borderRadius: borderRadius.full, backgroundColor: colors.blue + '25', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  windDownEmptyContent: { flex: 1, gap: spacing.xs },
  windDownEmptyTitle: { ...typography.body, color: colors.cream, fontFamily: 'Fredoka-Medium' },
  windDownEmptyDescription: { ...typography.caption, color: colors.textMuted, lineHeight: 18 },
  windDownEmptyCta: { ...typography.caption, color: colors.blue, fontFamily: 'Fredoka-Medium', marginTop: spacing.xs },
  sleepLogCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, padding: spacing.lg },
  sleepLogButtons: { gap: spacing.md },
  sleepLogOption: { gap: spacing.xs },
  sleepLogOptionLabel: { ...typography.caption, color: colors.textSecondary, fontFamily: 'Fredoka-Medium' },
  sleepLogOptionHint: { ...typography.small, color: colors.textMuted },
  sleepLogSeparator: { height: 1, backgroundColor: colors.border },
  bedButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.brown, borderRadius: borderRadius.md, paddingVertical: spacing.md },
  bedButtonText: { ...typography.body, color: colors.cream, fontFamily: 'Fredoka-Medium' },
  wakeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.gold, borderRadius: borderRadius.md, paddingVertical: spacing.md },
  wakeButtonText: { ...typography.body, color: colors.dark, fontFamily: 'Fredoka-Medium' },
  wakeButtonOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: 'transparent', borderRadius: borderRadius.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.gold },
  wakeButtonOutlineText: { ...typography.body, color: colors.gold, fontFamily: 'Fredoka-Medium' },
  sleepLogInBed: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  sleepLogEmoji: { fontSize: 40 },
  sleepLogInBedText: { flex: 1 },
  sleepLogInBedTitle: { ...typography.h3, color: colors.cream, marginBottom: 2 },
  sleepLogInBedSub: { ...typography.caption, color: colors.textMuted },
  cancelLink: { alignItems: 'center', paddingTop: spacing.md, paddingVertical: spacing.sm },
  cancelLinkText: { ...typography.caption, color: colors.blue, textDecorationLine: 'underline' },
  sleepLogSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  sleepLogSummaryItem: { flex: 1, alignItems: 'center' },
  sleepLogSummaryValue: { ...typography.h3, color: colors.blue, marginBottom: 2 },
  sleepLogSummaryLabel: { ...typography.small, color: colors.textMuted },
  sleepLogDivider: { width: 1, height: 40, backgroundColor: colors.border, marginHorizontal: spacing.md },
  scheduleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scheduleExpandHint: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  scheduleExpandHintText: { ...typography.caption, color: colors.blue, fontFamily: 'Fredoka-Medium' },
  scheduleHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  scheduleHeaderText: { flex: 1 },
  scheduleTitle: { ...typography.h3, color: colors.cream, marginBottom: 2 },
  scheduleSubtitle: { ...typography.caption, color: colors.textMuted },
  timeline: { marginTop: spacing.lg, paddingLeft: spacing.md },
  timelineProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  timelineProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  timelineProgressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  timelineProgressText: {
    ...typography.caption,
    color: colors.textMuted,
    minWidth: 40,
    textAlign: 'right',
  },
  timelineItem: { flexDirection: 'row', marginBottom: spacing.lg, alignItems: 'flex-start' },
  timelineLeft: { alignItems: 'center', marginRight: spacing.md, width: 32 },
  timelineDot: { width: 32, height: 32, borderRadius: borderRadius.full, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border },
  timelineDotPast: { backgroundColor: colors.success + '30', borderColor: colors.success },
  timelineDotNext: { backgroundColor: colors.blue + '30', borderColor: colors.blue, borderWidth: 3 },
  timelineDotChecked: { backgroundColor: colors.success, borderColor: colors.success },
  timelineIcon: { fontSize: 16 },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: spacing.xs, minHeight: 20 },
  timelineLinePast: { backgroundColor: colors.success },
  timelineContent: { flex: 1, paddingTop: 4 },
  timelineTitle: { ...typography.body, color: colors.textMuted, fontFamily: 'Fredoka-Regular', marginBottom: 2 },
  timelineTitlePast: { color: colors.textMuted, opacity: 0.6 },
  timelineTitleNext: { color: colors.cream, fontFamily: 'Fredoka-Medium' },
  timelineTitleChecked: { textDecorationLine: 'line-through', color: colors.textMuted, opacity: 0.7 },
  timelineCheckbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    marginTop: 2,
  },
  timelineCheckboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  timelineTime: { ...typography.caption, color: colors.textMuted },
  timelineTimePast: { opacity: 0.6 },
  timelineEditButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  timelineEditText: { ...typography.body, color: colors.blue, fontFamily: 'Fredoka-Medium' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.md },
  actionCard: { flex: 1, flexBasis: '47%', backgroundColor: colors.cardBg, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  actionIcon: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { ...typography.body, color: colors.cream, fontFamily: 'Fredoka-Medium', fontSize: 14 },
  actionDescription: { fontSize: 12, color: colors.textMuted, fontFamily: 'Fredoka-Regular' },
  // Time modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: colors.cardBg, borderRadius: borderRadius.xl, padding: spacing.xl, width: '100%', maxWidth: 340 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  modalTitle: { ...typography.h3, color: colors.cream },
  modalClose: { padding: spacing.xs },
  timePickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  timeColumn: { alignItems: 'center', width: 70 },
  arrowButton: { padding: spacing.sm },
  timeValue: { fontSize: 48, fontFamily: 'Fredoka-Medium', color: colors.cream },
  timeSeparator: { fontSize: 48, fontFamily: 'Fredoka-Medium', color: colors.cream, marginBottom: 16 },
  periodButton: { backgroundColor: colors.blue, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, marginLeft: spacing.sm },
  periodText: { ...typography.body, fontFamily: 'Fredoka-Medium', color: colors.dark },
  sleepDurationPreview: { alignItems: 'center', marginBottom: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderRadius: borderRadius.md },
  sleepDurationLabel: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  sleepDurationValue: { ...typography.h3, color: colors.success },
  sleepDurationValueError: { color: colors.error },
  validationError: { backgroundColor: colors.error + '20', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md },
  validationErrorText: { ...typography.caption, color: colors.error, textAlign: 'center' },
  modalDoneButton: { backgroundColor: colors.cream, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  modalDoneButtonDisabled: { backgroundColor: colors.border },
  modalDoneText: { ...typography.body, fontFamily: 'Fredoka-Medium', color: colors.dark },
  modalDoneTextDisabled: { color: colors.textMuted },
});
