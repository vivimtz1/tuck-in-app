import { View, Text, StyleSheet, Switch } from 'react-native';
import { AlarmClock } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { formatTimeDisplay, formatDaysDisplay, type Alarm, type DayAbbrev } from '@/types/alarm';

type AlarmCardProps = {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
};

export function AlarmCard({ alarm, onToggle }: AlarmCardProps) {
  const daysDisplay = formatDaysDisplay(alarm.days as DayAbbrev[]);
  const timeDisplay = formatTimeDisplay(alarm.time);

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <AlarmClock color={alarm.enabled ? colors.gold : colors.textMuted} size={24} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.label, !alarm.enabled && styles.labelDisabled]} numberOfLines={1}>
            {alarm.label}
          </Text>
          <Text style={[styles.time, !alarm.enabled && styles.timeDisabled]}>{timeDisplay}</Text>
          <Text style={styles.days}>{daysDisplay}</Text>
        </View>
        <Switch
          value={alarm.enabled}
          onValueChange={(value) => onToggle(alarm.id, value)}
          trackColor={{ false: colors.border, true: colors.blue }}
          thumbColor={colors.cream}
          style={styles.switch}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  label: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginBottom: 2,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
  time: {
    ...typography.h3,
    color: colors.cream,
    marginBottom: 2,
  },
  timeDisabled: {
    color: colors.textMuted,
  },
  days: {
    ...typography.caption,
    color: colors.textMuted,
  },
  switch: {
    marginLeft: spacing.sm,
  },
});
