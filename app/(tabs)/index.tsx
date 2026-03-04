import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Wind, Calendar, ChevronDown, ChevronUp, Clock } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { useWindDown } from '@/contexts/WindDownContext';

type ScheduleItem = {
  id: string;
  title: string;
  time: Date;
  icon: string;
};

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const { getEnabledItems } = useWindDown();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // TODO: Fetch from Supabase - for now using defaults
  const bedtime = '11:00 PM';
  const wakeTime = '7:30 AM';
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
    const enabledItems = getEnabledItems();

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

        <View style={{ height: spacing.xl }} />
      </ScrollView>
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
});
