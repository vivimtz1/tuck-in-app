import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Calendar, TrendingUp, Award, Flame } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 180;

export default function ProgressScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const streakCount = 5;
  const goalsThisWeek = 4;
  const totalGoals = 5;
  const avgSleep = 7.5;
  const consistency = 78;

  const weeklyData = [
    { day: 'M', hours: 7.5, goal: true },
    { day: 'T', hours: 6.8, goal: false },
    { day: 'W', hours: 8.2, goal: true },
    { day: 'T', hours: 7.3, goal: true },
    { day: 'F', hours: 7.8, goal: true },
    { day: 'S', hours: 6.5, goal: false },
    { day: 'S', hours: 8.0, goal: true },
  ];

  const maxHours = 10;
  const chartHeight = CHART_HEIGHT;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your sleep journey</Text>
        </View>

        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'week' && styles.periodTextActive]}>
              1W
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextActive]}>
              1M
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'year' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('year')}
          >
            <Text style={[styles.periodText, selectedPeriod === 'year' && styles.periodTextActive]}>
              1Y
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Flame color={colors.gold} size={24} />
            </View>
            <Text style={styles.statValue}>{streakCount}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Award color={colors.blue} size={24} />
            </View>
            <Text style={styles.statValue}>{goalsThisWeek}/{totalGoals}</Text>
            <Text style={styles.statLabel}>Goals Hit</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp color={colors.cream} size={24} />
            </View>
            <Text style={styles.statValue}>{avgSleep}h</Text>
            <Text style={styles.statLabel}>Avg Sleep</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}>
              <Calendar color={colors.success} size={24} />
            </View>
            <Text style={styles.statValue}>{consistency}%</Text>
            <Text style={styles.statLabel}>Consistency</Text>
          </Card>
        </View>

        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Sleep Duration (This Week)</Text>
          <View style={styles.chart}>
            <View style={styles.chartGrid}>
              {[10, 8, 6, 4, 2].map((hour) => (
                <View key={hour} style={styles.gridLine}>
                  <Text style={styles.gridLabel}>{hour}h</Text>
                  <View style={styles.gridDash} />
                </View>
              ))}
            </View>
            <View style={styles.chartBars}>
              {weeklyData.map((data, index) => {
                const barHeight = (data.hours / maxHours) * chartHeight;
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.bar,
                          { height: barHeight },
                          data.goal && styles.barSuccess,
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
              <Text style={styles.legendText}>Actual Sleep</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Goal Met</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Today's Insights</Text>
          <View style={styles.goalStatus}>
            <Text style={styles.goalStatusLabel}>Goals:</Text>
            <Text style={styles.goalStatusValue}>{goalsThisWeek}/{totalGoals}</Text>
          </View>
          <View style={styles.sleepSummary}>
            <Text style={styles.sleepTime}>7hr : 33min</Text>
            <Text style={styles.sleepLabel}>Last Night</Text>
          </View>
          <View style={styles.recommendation}>
            <Text style={styles.recommendationTitle}>Recommendation:</Text>
            <Text style={styles.recommendationText}>
              You're doing great! Try to maintain consistency by going to bed around the same time each night.
            </Text>
          </View>
          <TouchableOpacity style={styles.viewFullButton}>
            <Text style={styles.viewFullText}>View Full Recommendations</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.achievementsCard}>
          <Text style={styles.achievementsTitle}>Recent Achievements</Text>
          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>🏆</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>5 Day Streak</Text>
                <Text style={styles.achievementDate}>Earned today</Text>
              </View>
            </View>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>⭐</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>Week Warrior</Text>
                <Text style={styles.achievementDate}>2 days ago</Text>
              </View>
            </View>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>🌙</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>Sleep Master</Text>
                <Text style={styles.achievementDate}>5 days ago</Text>
              </View>
            </View>
          </View>
        </Card>

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
  recommendation: {
    marginBottom: spacing.md,
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
  viewFullButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  viewFullText: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
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
  achievementDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
