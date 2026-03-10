import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Calendar, TrendingUp, Award, Flame, FlaskConical, ArrowLeft } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { useSleepLog } from '@/contexts/SleepLogContext';
import { CelebrationModal } from '@/components/CelebrationModal';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 180;

// ─── Hardcoded demo data ─────────────────────────────────────────────────────

const DEMO_STATS = {
  streak: 12,
  goalsThisWeek: 5,
  totalThisWeek: 7,
  avgSleepHours: 7.5,
  consistency: 86,
};

const DEMO_WEEK_DATA = [
  { day: 'M', hours: 7.5, goalMet: true,  hasData: true },
  { day: 'T', hours: 6.8, goalMet: false, hasData: true },
  { day: 'W', hours: 8.1, goalMet: true,  hasData: true },
  { day: 'T', hours: 7.3, goalMet: true,  hasData: true },
  { day: 'F', hours: 7.9, goalMet: true,  hasData: true },
  { day: 'S', hours: 6.4, goalMet: false, hasData: true },
  { day: 'S', hours: 7.6, goalMet: true,  hasData: true },
];

const DEMO_LAST_NIGHT = { hours: 7, minutes: 33 };

const CLINICAL_INSIGHTS = [
  {
    emoji: '❤️',
    title: '7–9 Hours Protects Your Heart',
    fact: 'Adults who consistently sleep 7–9 hours are significantly less likely to develop heart disease, hypertension, and type 2 diabetes.',
    source: 'CDC — Sleep & Chronic Disease Report',
  },
  {
    emoji: '🧠',
    title: 'Sleep Builds Your Brain',
    fact: 'During deep sleep (N3 stage), your brain consolidates memories and clears metabolic waste linked to cognitive decline — improving next-day recall by up to 40%.',
    source: 'Walker, M. — Why We Sleep; Nature Reviews Neuroscience',
  },
  {
    emoji: '⏰',
    title: 'Consistency Is the Secret',
    fact: 'Keeping your bedtime within a 30-minute window every night strengthens your circadian rhythm and measurably improves both sleep quality and daytime alertness.',
    source: 'National Sleep Foundation, 2023',
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const { celebration, dismissCelebration, lastEntry } = useSleepLog();

  // Use real logged duration if available, otherwise show demo numbers
  const lastNightHours = lastEntry && lastEntry.durationMinutes > 0
    ? Math.floor(lastEntry.durationMinutes / 60)
    : DEMO_LAST_NIGHT.hours;
  const lastNightMins = lastEntry && lastEntry.durationMinutes > 0
    ? lastEntry.durationMinutes % 60
    : DEMO_LAST_NIGHT.minutes;
  const lastNightGoalMet = lastEntry ? lastEntry.goalMet : true;

  const maxHours = 10;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft color={colors.cream} size={24} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Your Progress</Text>
            <Text style={styles.subtitle}>Track your sleep journey</Text>
          </View>
        </View>

        {/* Period selector */}
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
            <View style={styles.statIcon}><Flame color={colors.gold} size={24} /></View>
            <Text style={styles.statValue}>{DEMO_STATS.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}><Award color={colors.blue} size={24} /></View>
            <Text style={styles.statValue}>{DEMO_STATS.goalsThisWeek}/{DEMO_STATS.totalThisWeek}</Text>
            <Text style={styles.statLabel}>Goals Hit</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}><TrendingUp color={colors.cream} size={24} /></View>
            <Text style={styles.statValue}>{DEMO_STATS.avgSleepHours}h</Text>
            <Text style={styles.statLabel}>Avg Sleep</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIcon}><Calendar color={colors.success} size={24} /></View>
            <Text style={styles.statValue}>{DEMO_STATS.consistency}%</Text>
            <Text style={styles.statLabel}>Consistency</Text>
          </Card>
        </View>

        {/* Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Sleep Duration (This Week)</Text>
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
              {DEMO_WEEK_DATA.map((data, index) => {
                const barHeight = Math.max((data.hours / maxHours) * (CHART_HEIGHT - 20), 6);
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      <View style={[styles.bar, data.goalMet && styles.barSuccess, { height: barHeight }]} />
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
              <Text style={styles.legendText}>Below Goal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Goal Met (7h+)</Text>
            </View>
          </View>
        </Card>

        {/* Tonight's Insights */}
        <Card style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Tonight's Insights</Text>

          {/* Sleep summary */}
          <View style={styles.goalStatus}>
            <Text style={styles.goalStatusLabel}>Last night's goal:</Text>
            <Text style={[styles.goalStatusValue, { color: lastNightGoalMet ? colors.success : colors.warning }]}>
              {lastNightGoalMet ? '✓ Met' : '✗ Missed'}
            </Text>
          </View>
          <View style={styles.sleepSummary}>
            <Text style={styles.sleepTime}>{lastNightHours}h {lastNightMins}m</Text>
            <Text style={styles.sleepLabel}>Last Night</Text>
          </View>

          {/* Recommendation */}
          <View style={styles.recommendation}>
            <Text style={styles.recommendationTitle}>Recommendation</Text>
            <Text style={styles.recommendationText}>
              You're building an excellent sleep routine! Keep your bedtime consistent and aim to be in bed by 10:30 PM tonight to maintain your streak. 🌙
            </Text>
          </View>

          {/* Clinical insights */}
          <View style={styles.clinicalHeader}>
            <FlaskConical color={colors.blue} size={16} />
            <Text style={styles.clinicalHeaderText}>Clinically Backed Insights</Text>
          </View>

          <View style={styles.clinicalCards}>
            {CLINICAL_INSIGHTS.map((item, i) => (
              <View key={i} style={styles.clinicalCard}>
                <View style={styles.clinicalCardTop}>
                  <Text style={styles.clinicalEmoji}>{item.emoji}</Text>
                  <Text style={styles.clinicalTitle}>{item.title}</Text>
                </View>
                <Text style={styles.clinicalFact}>{item.fact}</Text>
                <View style={styles.clinicalSourceRow}>
                  <View style={styles.clinicalSourceBadge}>
                    <Text style={styles.clinicalSourceText}>📄 {item.source}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.disclaimer}>
            Information provided is for educational purposes and based on published sleep research. Consult a healthcare provider for personalized advice.
          </Text>
        </Card>

        {/* Achievements */}
        <Card style={styles.achievementsCard}>
          <Text style={styles.achievementsTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            {[
              { emoji: '🏆', name: '12 Day Streak', date: 'Unlocked today!', unlocked: true },
              { emoji: '⭐', name: 'Week Warrior',  date: 'Unlocked 2 days ago', unlocked: true },
              { emoji: '🌙', name: 'Sleep Master',  date: 'Unlocked 5 days ago', unlocked: true },
              { emoji: '🔒', name: 'Month Master',  date: '18/30 nights logged', unlocked: false },
            ].map((a, i) => (
              <View key={i} style={[styles.achievementItem, !a.unlocked && styles.achievementLocked]}>
                <View style={[styles.achievementIcon, a.unlocked && styles.achievementIconUnlocked]}>
                  <Text style={styles.achievementEmoji}>{a.emoji}</Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementName, !a.unlocked && styles.achievementNameLocked]}>
                    {a.name}
                  </Text>
                  <Text style={styles.achievementDate}>{a.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <CelebrationModal
        visible={celebration}
        durationMinutes={lastEntry?.durationMinutes ?? 450}
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
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  headerText: {
    flex: 1,
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
  periodTextActive: { color: colors.dark },

  // Stats
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
  statIcon: { marginBottom: spacing.sm },
  statValue: {
    ...typography.h2,
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Chart
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
    top: 0, left: 0, right: 0,
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
  barSuccess: { backgroundColor: colors.success },
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

  // Insights
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
    color: colors.success,
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
    marginBottom: spacing.lg,
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

  // Clinical insights
  clinicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clinicalHeaderText: {
    ...typography.body,
    color: colors.blue,
    fontFamily: 'Fredoka-Medium',
  },
  clinicalCards: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  clinicalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.blue + '33',
  },
  clinicalCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  clinicalEmoji: {
    fontSize: 18,
  },
  clinicalTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    flex: 1,
  },
  clinicalFact: {
    fontSize: 13,
    fontFamily: 'Fredoka-Regular',
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  clinicalSourceRow: {
    flexDirection: 'row',
  },
  clinicalSourceBadge: {
    backgroundColor: colors.blue + '20',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  clinicalSourceText: {
    fontSize: 11,
    fontFamily: 'Fredoka-Regular',
    color: colors.blue,
  },
  disclaimer: {
    fontSize: 11,
    fontFamily: 'Fredoka-Regular',
    color: colors.textMuted,
    lineHeight: 16,
    textAlign: 'center',
    opacity: 0.7,
  },

  // Achievements
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
  achievementsList: { gap: spacing.md },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  achievementLocked: { opacity: 0.4 },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIconUnlocked: {
    backgroundColor: colors.gold + '22',
    borderWidth: 1,
    borderColor: colors.gold + '55',
  },
  achievementEmoji: { fontSize: 24 },
  achievementInfo: { flex: 1 },
  achievementName: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginBottom: 2,
  },
  achievementNameLocked: { color: colors.textMuted },
  achievementDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
