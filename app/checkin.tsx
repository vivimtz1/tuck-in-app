import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ArrowLeft, Sun, Moon, Heart, Smile, Meh, Frown, Angry } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { router } from 'expo-router';

const qualityEmojis = [
  { value: 1, emoji: '😫', label: 'Terrible' },
  { value: 2, emoji: '😟', label: 'Poor' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
  { value: 6, emoji: '🤩', label: 'Amazing' },
  { value: 7, emoji: '😴', label: 'Restful' },
  { value: 8, emoji: '✨', label: 'Refreshed' },
  { value: 9, emoji: '🌟', label: 'Excellent' },
  { value: 10, emoji: '💯', label: 'Perfect' },
];

const stressLevels = [
  { value: 1, label: 'Very Calm', color: colors.success },
  { value: 2, label: 'Calm', color: colors.blue },
  { value: 3, label: 'Neutral', color: colors.gold },
  { value: 4, label: 'Stressed', color: colors.warning },
  { value: 5, label: 'Very Stressed', color: colors.error },
];

export default function CheckInScreen() {
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [sleepDuration, setSleepDuration] = useState({ hours: 7, minutes: 30 });
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    router.back();
  };

  const handleSkip = () => {
    router.back();
  };

  const adjustHours = (increment: boolean) => {
    setSleepDuration((prev) => ({
      ...prev,
      hours: Math.max(0, Math.min(12, prev.hours + (increment ? 1 : -1))),
    }));
  };

  const adjustMinutes = (increment: boolean) => {
    setSleepDuration((prev) => {
      const newMinutes = prev.minutes + (increment ? 15 : -15);
      if (newMinutes >= 60) {
        return { hours: prev.hours + 1, minutes: 0 };
      } else if (newMinutes < 0) {
        return { hours: Math.max(0, prev.hours - 1), minutes: 45 };
      } else {
        return { ...prev, minutes: newMinutes };
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.cream} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Morning Check-In</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text style={styles.greetingEmoji}>☀️</Text>
          <Text style={styles.greetingTitle}>Good Morning!</Text>
          <Text style={styles.greetingText}>
            Let's record how you slept last night. This helps Teddy give you better recommendations.
          </Text>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>How was your sleep quality?</Text>
          <Text style={styles.sectionSubtitle}>Rate from 1 (terrible) to 10 (perfect)</Text>
          <View style={styles.qualityGrid}>
            {qualityEmojis.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.qualityOption,
                  sleepQuality === item.value && styles.qualityOptionActive,
                ]}
                onPress={() => setSleepQuality(item.value)}
              >
                <Text style={styles.qualityEmoji}>{item.emoji}</Text>
                <Text
                  style={[
                    styles.qualityValue,
                    sleepQuality === item.value && styles.qualityValueActive,
                  ]}
                >
                  {item.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {sleepQuality && (
            <Text style={styles.selectedLabel}>
              {qualityEmojis.find((e) => e.value === sleepQuality)?.label}
            </Text>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>How long did you sleep?</Text>
          <Text style={styles.sectionSubtitle}>Adjust to match your actual sleep time</Text>
          <View style={styles.durationPicker}>
            <View style={styles.durationControl}>
              <TouchableOpacity
                style={styles.durationButton}
                onPress={() => adjustHours(false)}
              >
                <Text style={styles.durationButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.durationDisplay}>
                <Text style={styles.durationValue}>{sleepDuration.hours}</Text>
                <Text style={styles.durationUnit}>hours</Text>
              </View>
              <TouchableOpacity
                style={styles.durationButton}
                onPress={() => adjustHours(true)}
              >
                <Text style={styles.durationButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.durationSeparator}>:</Text>

            <View style={styles.durationControl}>
              <TouchableOpacity
                style={styles.durationButton}
                onPress={() => adjustMinutes(false)}
              >
                <Text style={styles.durationButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.durationDisplay}>
                <Text style={styles.durationValue}>{sleepDuration.minutes}</Text>
                <Text style={styles.durationUnit}>min</Text>
              </View>
              <TouchableOpacity
                style={styles.durationButton}
                onPress={() => adjustMinutes(true)}
              >
                <Text style={styles.durationButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>How stressed do you feel?</Text>
          <Text style={styles.sectionSubtitle}>This helps us understand your sleep patterns</Text>
          <View style={styles.stressList}>
            {stressLevels.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.stressOption,
                  stressLevel === item.value && styles.stressOptionActive,
                  { borderColor: item.color },
                ]}
                onPress={() => setStressLevel(item.value)}
              >
                <View
                  style={[
                    styles.stressIndicator,
                    { backgroundColor: item.color },
                    stressLevel === item.value && styles.stressIndicatorActive,
                  ]}
                />
                <Text
                  style={[
                    styles.stressLabel,
                    stressLevel === item.value && styles.stressLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Any notes? (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Anything that affected your sleep or how you feel
          </Text>
          <TextInput
            style={styles.notesInput}
            placeholder="E.g., woke up several times, had coffee late..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
        </Card>

        <View style={styles.actions}>
          <Button
            title="Log Sleep Data"
            onPress={handleSubmit}
            fullWidth
            disabled={sleepQuality === null || stressLevel === null}
          />
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>I'll do this later</Text>
          </TouchableOpacity>
        </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.cream,
  },
  skipText: {
    ...typography.body,
    color: colors.blue,
    fontFamily: 'Fredoka-Medium',
  },
  scrollView: {
    flex: 1,
  },
  greeting: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  greetingEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  greetingTitle: {
    ...typography.h2,
    color: colors.cream,
    marginBottom: spacing.sm,
  },
  greetingText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  qualityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  qualityOption: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  qualityOptionActive: {
    backgroundColor: colors.blue + '30',
    borderColor: colors.blue,
  },
  qualityEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  qualityValue: {
    ...typography.caption,
    color: colors.textMuted,
    fontFamily: 'Fredoka-Medium',
  },
  qualityValueActive: {
    color: colors.blue,
  },
  selectedLabel: {
    ...typography.body,
    color: colors.blue,
    textAlign: 'center',
    fontFamily: 'Fredoka-Medium',
  },
  durationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  durationControl: {
    alignItems: 'center',
    gap: spacing.md,
  },
  durationButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationButtonText: {
    ...typography.h2,
    color: colors.cream,
  },
  durationDisplay: {
    alignItems: 'center',
  },
  durationValue: {
    ...typography.h1,
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  durationUnit: {
    ...typography.caption,
    color: colors.textMuted,
  },
  durationSeparator: {
    ...typography.h1,
    color: colors.textMuted,
  },
  stressList: {
    gap: spacing.sm,
  },
  stressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    gap: spacing.md,
  },
  stressOptionActive: {
    backgroundColor: colors.cardBg,
  },
  stressIndicator: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
  },
  stressIndicatorActive: {
    width: 20,
    height: 20,
  },
  stressLabel: {
    ...typography.body,
    color: colors.textMuted,
  },
  stressLabelActive: {
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
  notesInput: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
  },
  actions: {
    marginHorizontal: spacing.lg,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  skipButtonText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
