import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Wind, Calendar, ChevronDown, ChevronUp, Clock, Settings2, Pencil, Headphones } from 'lucide-react-native';
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

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [bedtime, setBedtime] = useState('11:00 PM');
  const [wakeTime, setWakeTime] = useState('7:30 AM');
  const { getEnabledItems } = useWindDown();
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
          setBedtime(formatHH24ToDisplay(goals.bedtime));
          setWakeTime(formatHH24ToDisplay(goals.wake_time));
        }
      }
    };
    fetchSchedule();
  }, []);

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
    if (date < now) {
      date.setDate(date.getDate() + 1);
    }
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
  if (wakeTimeDate < bedtimeDate) {
    wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
  }
  const isBetweenBedtimeAndWake = now >= bedtimeDate || now < wakeTimeDate;

  const nextItem = schedule.find(item => item.time > now) || schedule[0];

  const formatScheduleTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const isPast = (item: ScheduleItem) => item.time < now;
  const isNext = (item: ScheduleItem) => item === nextItem;

  const handleCancelBedtime = () => {
    Alert.alert(
      'Cancel sleep log?',
      'This will stop tracking tonight\'s sleep.',
      [
        { text: 'Keep tracking', style: 'cancel' },
        { text: 'Cancel log', style: 'destructive', onPress: cancelBedtime },
      ]
    );
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
              <Text style={styles.windDownEmptyTitle}>Set Up Your Wind-Down Routine</Text>
              <Text style={styles.windDownEmptyDescription}>
                Choose calming activities before bed. Teddy will guide you through them each night.
              </Text>
              <Text style={styles.windDownEmptyCta}>Get Started →</Text>
            </View>
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
                  <Text style={styles.scheduleTitle}>{nextItem.title}</Text>
                  <Text style={styles.scheduleSubtitle}>{formatScheduleTime(nextItem.time)}</Text>
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
                            <View style={[styles.timelineLine, itemIsPast && styles.timelineLinePast]} />
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
                          <Text style={[styles.timelineTime, itemIsPast && styles.timelineTimePast]}>
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
          <View style={styles.scheduleItem}>
            <Moon color={colors.cream} size={28} />
            <Text style={styles.scheduleTime}>{bedtime}</Text>
            <Text style={styles.scheduleLabel}>Bedtime</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scheduleItem}>
            <Sun color={colors.gold} size={28} />
            <Text style={styles.scheduleTime}>{wakeTime}</Text>
            <Text style={styles.scheduleLabel}>Wake Up</Text>
          </View>
        </View>

        {/* Sleep Log Card */}
        <Text style={styles.sectionTitle}>{sleepLogTitle}</Text>
        <Card style={styles.sleepLogCard}>
          {activeSession ? (
            /* In bed — show wake up button + cancel */
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
                <Moon color={colors.cream} size={16} />
                <Text style={styles.bedButtonText}>Going to Bed 🌙</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* No active session, no recent entry */
            <View style={styles.sleepLogButtons}>
              <View style={styles.sleepLogOption}>
                <Text style={styles.sleepLogOptionLabel}>Heading to bed now?</Text>
                <TouchableOpacity style={styles.bedButton} onPress={logBedtime}>
                  <Moon color={colors.cream} size={16} />
                  <Text style={styles.bedButtonText}>Going to Bed 🌙</Text>
                </TouchableOpacity>
                <Text style={styles.sleepLogOptionHint}>Start tracking tonight's sleep</Text>
              </View>
              <View style={styles.sleepLogSeparator} />
              <View style={styles.sleepLogOption}>
                <Text style={styles.sleepLogOptionLabel}>Already woke up?</Text>
                <TouchableOpacity style={styles.wakeButtonOutline} onPress={logWakeTime}>
                  <Sun color={colors.gold} size={16} />
                  <Text style={styles.wakeButtonOutlineText}>Just Woke Up ☀️</Text>
                </TouchableOpacity>
                <Text style={styles.sleepLogOptionHint}>Log last night's sleep</Text>
              </View>
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/winddown')}>
            <View style={styles.actionIcon}>
              <Wind color={colors.blue} size={22} />
            </View>
            <Text style={styles.actionTitle}>Wind-Down Routine</Text>
            <Text style={styles.actionDescription}>Begin bedtime prep</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/schedule')}>
            <View style={styles.actionIcon}>
              <Calendar color={colors.cream} size={22} />
            </View>
            <Text style={styles.actionTitle}>Sleep Schedule</Text>
            <Text style={styles.actionDescription}>Adjust bedtime</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/winddown-routine')}>
            <View style={styles.actionIcon}>
              <Settings2 color={colors.blue} size={22} />
            </View>
            <Text style={styles.actionTitle}>Edit Routine</Text>
            <Text style={styles.actionDescription}>Customize activities</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/content')}>
            <View style={styles.actionIcon}>
              <Headphones color={colors.gold} size={22} />
            </View>
            <Text style={styles.actionTitle}>Content Library</Text>
            <Text style={styles.actionDescription}>Music & podcasts</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <CelebrationModal
        visible={celebration}
        durationMinutes={lastEntry?.durationMinutes ?? 0}
        onDismiss={dismissCelebration}
      />
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
  sectionTitle: {
    ...typography.h3,
    color: colors.cream,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  scheduleCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  windDownEmptyCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.blue + '60',
    borderStyle: 'dashed',
    gap: spacing.md,
  },
  windDownEmptyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.blue + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  windDownEmptyContent: {
    flex: 1,
    gap: spacing.xs,
  },
  windDownEmptyTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
  windDownEmptyDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  windDownEmptyCta: {
    ...typography.caption,
    color: colors.blue,
    fontFamily: 'Fredoka-Medium',
    marginTop: spacing.xs,
  },
  // Sleep Log Card
  sleepLogCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sleepLogButtons: {
    gap: spacing.md,
  },
  sleepLogOption: {
    gap: spacing.xs,
  },
  sleepLogOptionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'Fredoka-Medium',
  },
  sleepLogOptionHint: {
    ...typography.small,
    color: colors.textMuted,
  },
  sleepLogSeparator: {
    height: 1,
    backgroundColor: colors.border,
  },
  bedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brown,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  bedButtonText: {
    ...typography.body,
    color: colors.cream,
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
  cancelLink: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  cancelLinkText: {
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
  // Quick Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    fontSize: 14,
  },
  actionDescription: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Fredoka-Regular',
  },
});
