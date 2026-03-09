import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Calendar, TrendingUp, Award, Flame } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { useSleepLog } from '@/contexts/SleepLogContext';
import { CelebrationModal } from '@/components/CelebrationModal';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 180;
const GOAL_HOURS = 7;

export default function ProgressScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const { stats, weekData, entries, lastEntry, celebration, dismissCelebration } = useSleepLog();

  const hasAnyData = entries.some(e => e.durationMinutes > 0);

  const avgLabel = stats.avgSleepHours > 0
    ? `${stats.avgSleepHours}h`
    : '—';

  const consistencyLabel = hasAnyData ? `${stats.consistency}%` : '—';

  const maxHours = 10;

  const getRecommendation = () => {
    if (!hasAnyData) return "Start logging your sleep to get personalized recommendations!";
    if (stats.avgSleepHours >= GOAL_HOURS) return "You're doing great! Keep maintaining this sleep schedule — consistency is key.";
    if (stats.avgSleepHours >= 6) return "You're close to your goal! Try going to bed 30 minutes earlier tonight.";
    return "You're getting less sleep than recommended. Try setting a consistent bedtime and sticking to it.";
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your sleep journey</Text>
        </View>

        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.periodButton, selectedPeriod === p && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(p)}
            >
              <Text style={[styles.periodText, selectedPeriod === p && styles.periodTextActive]}>
                {p === 'week' ? '1W' : p === 'month' ? '1M' : '1Y'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Flame color={colors.gold} size={24} />
            </View>
            <Text style={styles.statValue}>{stats.streak > 0 ? stats.streak : '—'}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Award color={colors.blue} size={24} />
            </View>
            <Text style={styles.statValue}>
              {hasAnyData ? `${stats.goalsThisWeek}/${stats.totalThisWeek}` : '—'}
            </Text>
            <Text style={styles.statLabel}>Goals Hit</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp color={colors.cream} size={24} />
            </View>
            <Text style={styles.statValue}>{avgLabel}</Text>
            <Text style={styles.statLabel}>Avg Sleep</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Calendar color={colors.success} size={24} />
            </View>
            <Text style={styles.statValue}>{consistencyLabel}</Text>
            <Text style={styles.statLabel}>Consistency</Text>
          </Card>
        </View>

        {/* Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Sleep Duration (This Week)</Text>
          {!hasAnyData ? (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartEmoji}>🧸</Text>
              <Text style={styles.emptyChartText}>
                No sleep logged yet.{'\n'}Head to Home to log your first night!
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.chart}>
                <View style={styles.chartGrid}>
                  {[10, 8, 6, 4, 2].map(hour => (
                    <View key={hour} style={styles.gridLine}>
                      <Text style={styles.gridLabel}>{hour}h</Text>
                      <View style={styles.gridDash} />
                    </View>
                  ))}
                </View>
                <View style={styles.chartBars}>
                  {weekData.map((data, index) => {
                    const barHeight = data.hasData
                      ? Math.max((data.hours / maxHours) * (CHART_HEIGHT - 20), 6)
                      : 4;
                    return (
                      <View key={index} style={styles.barContainer}>
                        <View style={styles.barWrapper}>
                          <View
                            style={[
                              styles.bar,
                              data.goalMet && styles.barSuccess,
                              !data.hasData && styles.barEmpty,
                              { height: barHeight },
                            ]}
                          />
                        </View>
                        <Text style={styles.barLabel}>{data.day}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.blue }]} />
                  <Text style={styles.legendText}>Logged</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.legendText}>Goal Met (7h+)</Text>
                </View>
              </View>
            </>
          )}
        </Card>

        {/* Insights */}
        <Card style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Tonight's Insights</Text>

          {lastEntry && lastEntry.durationMinutes > 0 ? (
            <>
              <View style={styles.goalStatus}>
                <Text style={styles.goalStatusLabel}>Last night's goal:</Text>
                <Text style={[styles.goalStatusValue, { color: lastEntry.goalMet ? colors.success : colors.warning }]}>
                  {lastEntry.goalMet ? '✓ Met' : '✗ Missed'}
                </Text>
              </View>
              <View style={styles.sleepSummary}>
                <Text style={styles.sleepTime}>
                  {Math.floor(lastEntry.durationMinutes / 60)}h {lastEntry.durationMinutes % 60}m
                </Text>
                <Text style={styles.sleepLabel}>Last Night</Text>
              </View>
            </>
          ) : (
            <View style={styles.noDataRow}>
              <Text style={styles.noDataText}>No sleep logged yet — tap "Going to Bed" on the Home tab to start!</Text>
            </View>
          )}

          <View style={styles.recommendation}>
            <Text style={styles.recommendationTitle}>Recommendation:</Text>
            <Text style={styles.recommendationText}>{getRecommendation()}</Text>
          </View>
        </Card>

        {/* Achievements */}
        <Card style={styles.achievementsCard}>
          <Text style={styles.achievementsTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            <View style={[styles.achievementItem, stats.streak >= 5 && styles.achievementItemUnlocked]}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>{stats.streak >= 5 ? '🏆' : '🔒'}</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementName, !stats.streak && styles.achievementLocked]}>5 Day Streak</Text>
                <Text style={styles.achievementDate}>
                  {stats.streak >= 5 ? 'Unlocked!' : `${stats.streak}/5 days`}
                </Text>
              </View>
            </View>

            <View style={[styles.achievementItem, stats.goalsThisWeek >= 5 && styles.achievementItemUnlocked]}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>{stats.goalsThisWeek >= 5 ? '⭐' : '🔒'}</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementName, stats.goalsThisWeek < 5 && styles.achievementLocked]}>Week Warrior</Text>
                <Text style={styles.achievementDate}>
                  {stats.goalsThisWeek >= 5 ? 'Unlocked!' : `${stats.goalsThisWeek}/5 goals this week`}
                </Text>
              </View>
            </View>

            <View style={[styles.achievementItem, entries.length >= 7 && styles.achievementItemUnlocked]}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>{entries.length >= 7 ? '🌙' : '🔒'}</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementName, entries.length < 7 && styles.achievementLocked]}>Sleep Master</Text>
                <Text style={styles.achievementDate}>
                  {entries.length >= 7 ? 'Unlocked!' : `${entries.length}/7 nights logged`}
                </Text>
              </View>
            </View>
          </View>
        </Card>

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
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  periodButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodButtonActive: {
    backgroundColor: colors.cream,
    borderColor: colors.cream,
  },
  periodText: {
    ...typography.body,
    color: colors.textMuted,
    fontFamily: 'Fredoka-Medium',
  },
  periodTextActive: {
    color: colors.dark,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    alignItems: 'center',
    padding: spacing.lg,
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  chartTitle: {
    ...typography.h3,
    color: colors.cream,
    marginBottom: spacing.lg,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyChartEmoji: {
    fontSize: 40,
  },
  emptyChartText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  chart: {
    height: CHART_HEIGHT,
    position: 'relative',
  },
  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
  },
  gridLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridLabel: {
    ...typography.small,
    color: colors.textMuted,
    width: 30,
  },
  gridDash: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.sm,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: CHART_HEIGHT,
    paddingLeft: 40,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: CHART_HEIGHT - 20,
  },
  bar: {
    width: '100%',
    backgroundColor: colors.blue,
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
    minHeight: 4,
  },
  barSuccess: {
    backgroundColor: colors.success,
  },
  barEmpty: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  barLabel: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
  },
  legendText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  insightsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  insightsTitle: {
    ...typography.h3,
    color: colors.cream,
    marginBottom: spacing.md,
  },
  goalStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalStatusLabel: {
    ...typography.body,
    color: colors.textMuted,
  },
  goalStatusValue: {
    ...typography.h3,
    color: colors.blue,
  },
  sleepSummary: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sleepTime: {
    ...typography.h1,
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  sleepLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  noDataRow: {
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  noDataText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  recommendation: {
    marginBottom: 0,
  },
  recommendationTitle: {
    ...typography.body,
    color: colors.blue,
    fontFamily: 'Fredoka-Medium',
    marginBottom: spacing.xs,
  },
  recommendationText: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  achievementsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  achievementsTitle: {
    ...typography.h3,
    color: colors.cream,
    marginBottom: spacing.md,
  },
  achievementsList: {
    gap: spacing.md,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    opacity: 0.5,
  },
  achievementItemUnlocked: {
    opacity: 1,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginBottom: 2,
  },
  achievementLocked: {
    color: colors.textMuted,
  },
  achievementDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
