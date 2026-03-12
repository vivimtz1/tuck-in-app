import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ArrowLeft, Wind, Volume2, Lightbulb, Smartphone, Check } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { router } from 'expo-router';
import { useWindDown } from '@/contexts/WindDownContext';

const ICON_MAP: Record<string, any> = {
  meditation: Wind,
  phone: Smartphone,
  lights: Lightbulb,
  audio: Volume2,
  music: Volume2,
  stretching: Wind,
  journaling: Smartphone,
  reading: Lightbulb,
  gratitude: Wind,
};

const DESCRIPTIONS: Record<string, string> = {
  meditation: 'Guided meditation to relax and center yourself',
  phone: 'Time to disconnect from screens',
  lights: 'Create a sleep-friendly environment',
  audio: 'Choose calming sounds for sleep',
  music: 'Listen to calming music to unwind',
  stretching: 'Gentle stretches to release tension',
  journaling: 'Reflect on your day and clear your mind',
  reading: 'Read something calming before bed',
  gratitude: 'Practice gratitude and positive reflection',
};


function PhoneContent() {
  return (
    <View style={styles.expandedContent}>
      <Text style={styles.expandedMessage}>
        Place your phone face down or in another room to avoid distractions.
      </Text>
      <Card style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Tip</Text>
        <Text style={styles.tipText}>
          Blue light from screens interferes with melatonin production. Putting your phone away 30 minutes before bed improves sleep quality.
        </Text>
      </Card>
    </View>
  );
}

function LightsContent() {
  return (
    <View style={styles.expandedContent}>
      <Text style={styles.expandedMessage}>
        Dim your lights to signal to your body that it's time to wind down. Lower lighting helps trigger your natural sleep response.
      </Text>
      <View style={styles.brightnessControl}>
        <Text style={styles.brightnessLabel}>Recommended brightness</Text>
        <View style={styles.brightnessBar}>
          <View style={styles.brightnessLevel} />
        </View>
        <Text style={styles.brightnessValue}>20%</Text>
      </View>
    </View>
  );
}

function AudioContent() {
  return (
    <View style={styles.expandedContent}>
      <Text style={styles.expandedMessage}>Choose a calming sound to help you drift off to sleep.</Text>
      <View style={styles.audioOptions}>
        {[['🌧️', 'Rain Sounds'], ['🌊', 'Ocean Waves'], ['🔥', 'Campfire']].map(([emoji, name]) => (
          <TouchableOpacity key={name} style={styles.audioOption}>
            <Text style={styles.audioEmoji}>{emoji}</Text>
            <Text style={styles.audioName}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function DefaultContent({ description }: { description: string }) {
  return (
    <View style={styles.expandedContent}>
      <Text style={styles.expandedMessage}>{description}</Text>
    </View>
  );
}

export default function WindDownScreen() {
  const { getEnabledItems, checkedItems, toggleCheckedItem, isRoutineComplete } = useWindDown();
  const routineItems = getEnabledItems().sort((a, b) => a.order - b.order);

  const steps = routineItems.map(item => ({
    id: item.id,
    title: item.title,
    icon: ICON_MAP[item.type] || Wind,
    description: DESCRIPTIONS[item.type] || '',
    emoji: item.icon,
    duration: item.duration,
  }));

  const [expanded, setExpanded] = useState<string | null>(steps[0]?.id ?? null);

  const toggleExpand = (id: string) => {
    setExpanded(prev => (prev === id ? null : id));
  };

  const completedCount = steps.filter(s => checkedItems.has(s.id)).length;
  const totalCount = steps.length;
  const allDone = isRoutineComplete;

  const renderStepContent = (id: string, description: string) => {
    switch (id) {
      case 'phone':  return <PhoneContent />;
      case 'lights': return <LightsContent />;
      case 'audio':
      case 'music':  return <AudioContent />;
      default:       return <DefaultContent description={description} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.cream} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wind-Down Routine</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completedCount}/{totalCount} completed
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {allDone ? (
          <View style={styles.allDoneContainer}>
            <Text style={styles.allDoneEmoji}>🌙</Text>
            <Text style={styles.allDoneTitle}>Routine Complete!</Text>
            <Text style={styles.allDoneText}>You've finished your wind-down routine. Sweet dreams!</Text>
            <TouchableOpacity style={styles.allDoneButton} onPress={() => router.back()}>
              <Text style={styles.allDoneButtonText}>Head to Bed</Text>
            </TouchableOpacity>
          </View>
        ) : (
          steps.map((step) => {
            const isChecked = checkedItems.has(step.id);
            const isExpanded = expanded === step.id;

            return (
              <View key={step.id} style={[styles.itemCard, isChecked && styles.itemCardDone]}>
                {/* Row: checkbox · icon+title · expand tap */}
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={() => toggleExpand(step.id)}
                  activeOpacity={0.8}
                >
                  {/* Checkbox */}
                  <TouchableOpacity
                    style={[styles.checkbox, isChecked && styles.checkboxDone]}
                    onPress={() => toggleCheckedItem(step.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {isChecked && <Check color={colors.dark} size={14} strokeWidth={3} />}
                  </TouchableOpacity>

                  {/* Emoji icon */}
                  <View style={[styles.itemEmoji, isChecked && styles.itemEmojiDone]}>
                    <Text style={styles.itemEmojiText}>{step.emoji}</Text>
                  </View>

                  {/* Title + duration */}
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, isChecked && styles.itemTitleDone]}>{step.title}</Text>
                    <Text style={styles.itemDuration}>{step.duration} min</Text>
                  </View>

                  {/* Expand chevron */}
                  <Text style={styles.expandChevron}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {/* Expanded content */}
                {isExpanded && !isChecked && (
                  <>
                    {renderStepContent(step.id, step.description)}
                    <TouchableOpacity
                      style={styles.markDoneButton}
                      onPress={() => {
                        toggleCheckedItem(step.id);
                        // Auto-expand next unchecked item
                        const nextUnchecked = steps.find(s => s.id !== step.id && !checkedItems.has(s.id));
                        setExpanded(nextUnchecked?.id ?? null);
                      }}
                    >
                      <Check color={colors.dark} size={16} strokeWidth={3} />
                      <Text style={styles.markDoneText}>Mark as Done</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { ...typography.h3, color: colors.cream },

  progressSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },

  // Item card
  itemCard: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemCardDone: {
    opacity: 0.55,
    borderColor: colors.success + '60',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  itemEmoji: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmojiDone: { opacity: 0.5 },
  itemEmojiText: { fontSize: 22 },
  itemInfo: { flex: 1 },
  itemTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    marginBottom: 2,
  },
  itemTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  itemDuration: { ...typography.caption, color: colors.textMuted },
  expandChevron: { fontSize: 10, color: colors.textMuted },

  // Expanded content
  expandedContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  expandedMessage: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },

  // Mark done button
  markDoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  markDoneText: {
    ...typography.body,
    color: colors.dark,
    fontFamily: 'Fredoka-Medium',
  },

  // All done state
  allDoneContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  allDoneEmoji: { fontSize: 72, marginBottom: spacing.lg },
  allDoneTitle: { ...typography.h1, color: colors.cream, marginBottom: spacing.md },
  allDoneText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  allDoneButton: {
    backgroundColor: colors.cream,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  allDoneButtonText: {
    ...typography.body,
    fontFamily: 'Fredoka-Medium',
    color: colors.dark,
  },

  // Tip card
  tipCard: {
    backgroundColor: colors.gold + '20',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  tipTitle: {
    ...typography.body,
    color: colors.gold,
    fontFamily: 'Fredoka-Medium',
    marginBottom: spacing.xs,
  },
  tipText: { ...typography.caption, color: colors.text, lineHeight: 20 },

  // Lights
  brightnessControl: { alignItems: 'center' },
  brightnessLabel: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  brightnessBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  brightnessLevel: {
    width: '20%',
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: borderRadius.full,
  },
  brightnessValue: { ...typography.h2, color: colors.cream },

  // Audio
  audioOptions: { gap: spacing.sm },
  audioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  audioEmoji: { fontSize: 28 },
  audioName: { ...typography.body, color: colors.cream, fontFamily: 'Fredoka-Medium' },
});
