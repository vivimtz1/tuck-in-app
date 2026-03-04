import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { ArrowLeft, Bell, Moon, Sun, MessageCircle, Award, Clock } from 'lucide-react-native';
import { Card } from '@/components/Card';

type NotificationSetting = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'bedtime_reminder',
      label: 'Bedtime Reminder',
      description: 'Get reminded 30 minutes before bedtime',
      icon: <Moon color={colors.blue} size={24} />,
      enabled: true,
    },
    {
      id: 'wind_down',
      label: 'Wind-Down Alert',
      description: 'Start your relaxation routine',
      icon: <Clock color={colors.cream} size={24} />,
      enabled: true,
    },
    {
      id: 'morning_checkin',
      label: 'Morning Check-in',
      description: 'Log how you slept each morning',
      icon: <Sun color={colors.gold} size={24} />,
      enabled: true,
    },
    {
      id: 'encouragement',
      label: 'Encouragement Messages',
      description: 'Motivational reminders from Teddy',
      icon: <MessageCircle color={colors.textSecondary} size={24} />,
      enabled: false,
    },
    {
      id: 'achievements',
      label: 'Achievement Alerts',
      description: 'Celebrate your sleep milestones',
      icon: <Award color={colors.gold} size={24} />,
      enabled: true,
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const enableAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, enabled: true })));
  };

  const handleContinue = () => {
    router.push('/onboarding/teddy');
  };

  const enabledCount = notifications.filter((n) => n.enabled).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={colors.cream} size={24} />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.step}>Step 3 of 4</Text>
          <Text style={styles.title}>Stay on Track</Text>
          <Text style={styles.subtitle}>
            Notifications help you build consistent sleep habits.{'\n'}Choose what works for you.
          </Text>
            <TouchableOpacity style={styles.enableAllButton} onPress={enableAll}>
                <Bell color={colors.cream} size={20} />
                <Text style={styles.enableAllText}>Enable All Notifications</Text>
            </TouchableOpacity>
          <Card style={styles.notificationsCard}>
            {notifications.map((notification, index) => (
              <View key={notification.id}>
                <View style={styles.notificationRow}>
                  <View style={styles.notificationIcon}>{notification.icon}</View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationLabel}>{notification.label}</Text>
                    <Text style={styles.notificationDescription}>
                      {notification.description}
                    </Text>
                  </View>
                  <Switch
                    value={notification.enabled}
                    onValueChange={() => toggleNotification(notification.id)}
                    trackColor={{ false: colors.border, true: colors.blue }}
                    thumbColor={notification.enabled ? colors.cream : colors.textMuted}
                  />
                </View>
                {index < notifications.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>

        <Text style={styles.infoText}>
            You can change these settings anytime in your profile.
        </Text>
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
        <TouchableOpacity onPress={handleContinue}>
          <Text style={styles.skipText}>Skip for now</Text>
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
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  bellIconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroText: {
    ...typography.h3,
    color: colors.cream,
  },
  notificationsCard: {
    marginBottom: spacing.lg,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationLabel: {
    ...typography.body,
    fontFamily: 'Fredoka-Medium',
    color: colors.text,
  },
  notificationDescription: {
    ...typography.small,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  enableAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.cream,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  enableAllText: {
    ...typography.body,
    fontFamily: 'Fredoka-Medium',
    color: colors.cream,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
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
