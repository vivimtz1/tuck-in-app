import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Wind, Calendar } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const bedtime = '11:00 PM';
  const wakeTime = '7:30 AM';
  const lastNightSleep = { hours: 7, minutes: 33 };
  const sleepQuality = 8;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getTimeUntilBedtime = () => {
    const now = new Date();
    const target = new Date();
    target.setHours(23, 0, 0, 0);

    if (now > target) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  };

  const timeUntilBedtime = getTimeUntilBedtime();

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
});
