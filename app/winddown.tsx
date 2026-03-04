import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Wind, Volume2, Lightbulb, Smartphone, Play, Pause } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { useWindDown } from '@/contexts/WindDownContext';

const ICON_MAP: Record<string, any> = {
  breathing: Wind,
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
  breathing: '4-7-8 breathing to calm your mind',
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

export default function WindDownScreen() {
  const [activeStep, setActiveStep] = useState(0);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const breathAnimation = useRef(new Animated.Value(0)).current;
  const { getEnabledItems } = useWindDown();

  // Convert wind-down items to steps for the routine, sorted by order
  const routineItems = getEnabledItems().sort((a, b) => a.order - b.order);
  const steps = routineItems.map(item => ({
    id: item.id,
    title: item.title,
    icon: ICON_MAP[item.type] || Wind,
    description: DESCRIPTIONS[item.type] || '',
    duration: item.type === 'breathing' || item.type === 'meditation' ? 5 : 
              item.type === 'audio' || item.type === 'music' ? 30 : 
              item.type === 'stretching' ? 10 : 1,
  }));

  // If no items enabled, use default
  const finalSteps = steps.length > 0 ? steps : [
    {
      id: 'breathing',
      title: 'Breathing Exercise',
      icon: Wind,
      description: '4-7-8 breathing to calm your mind',
      duration: 5,
    },
  ];

  const currentStep = finalSteps[activeStep];

  useEffect(() => {
    if (breathingActive) {
      const cycle = () => {
        Animated.sequence([
          Animated.timing(breathAnimation, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(breathAnimation, {
            toValue: 1,
            duration: 7000,
            useNativeDriver: true,
          }),
          Animated.timing(breathAnimation, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setBreathCount((prev) => prev + 1);
          if (breathCount < 5) {
            cycle();
          } else {
            setBreathingActive(false);
            setBreathCount(0);
          }
        });
      };
      cycle();
    }
  }, [breathingActive]);

  const handleNext = () => {
    if (activeStep < finalSteps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    if (activeStep < finalSteps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      router.back();
    }
  };

  const scale = breathAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const renderBreathingStep = () => (
    <View style={styles.breathingContainer}>
      <Animated.View style={[styles.breathCircle, { transform: [{ scale }] }]}>
        <Text style={styles.breathPhaseText}>
          {breathingActive ? (breathCount < 5 ? 'Breathe' : 'Complete!') : 'Ready'}
        </Text>
      </Animated.View>

      <View style={styles.breathInstructions}>
        <Text style={styles.instructionTitle}>4-7-8 Breathing Pattern</Text>
        <View style={styles.instructionList}>
          <Text style={styles.instructionItem}>• Inhale for 4 seconds</Text>
          <Text style={styles.instructionItem}>• Hold for 7 seconds</Text>
          <Text style={styles.instructionItem}>• Exhale for 8 seconds</Text>
        </View>
        <Text style={styles.breathCounter}>{breathCount}/5 cycles complete</Text>
      </View>

      <TouchableOpacity
        style={styles.breathButton}
        onPress={() => setBreathingActive(!breathingActive)}
      >
        {breathingActive ? (
          <Pause color={colors.dark} size={32} />
        ) : (
          <Play color={colors.dark} size={32} />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPhoneStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepIcon}>
        <Smartphone color={colors.cream} size={64} />
      </View>
      <Text style={styles.stepMessage}>
        It's time to put your phone away. Place it face down or in another room to avoid distractions.
      </Text>
      <Card style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Tip</Text>
        <Text style={styles.tipText}>
          Blue light from screens can interfere with melatonin production. Putting your phone away 30 minutes before bed improves sleep quality.
        </Text>
      </Card>
    </View>
  );

  const renderLightsStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepIcon}>
        <Lightbulb color={colors.gold} size={64} />
      </View>
      <Text style={styles.stepMessage}>
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

  const renderAudioStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepIcon}>
        <Volume2 color={colors.blue} size={64} />
      </View>
      <Text style={styles.stepMessage}>
        Choose a calming sound to help you drift off to sleep.
      </Text>
      <View style={styles.audioOptions}>
        <TouchableOpacity style={styles.audioOption}>
          <Text style={styles.audioEmoji}>🌧️</Text>
          <Text style={styles.audioName}>Rain Sounds</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.audioOption}>
          <Text style={styles.audioEmoji}>🌊</Text>
          <Text style={styles.audioName}>Ocean Waves</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.audioOption}>
          <Text style={styles.audioEmoji}>🔥</Text>
          <Text style={styles.audioName}>Campfire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'breathing':
        return renderBreathingStep();
      case 'phone':
        return renderPhoneStep();
      case 'lights':
        return renderLightsStep();
      case 'audio':
        return renderAudioStep();
      default:
        return null;
    }
  };

  const StepIcon = currentStep.icon;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.cream} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wind-Down Routine</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progress}>
        <View style={styles.progressBar}>
          {finalSteps.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.progressSegment,
                index <= activeStep && styles.progressSegmentActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          Step {activeStep + 1} of {finalSteps.length}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <StepIcon color={colors.blue} size={28} />
            <View style={styles.stepHeaderText}>
              <Text style={styles.stepTitle}>{currentStep.title}</Text>
              <Text style={styles.stepDescription}>{currentStep.description}</Text>
            </View>
          </View>
        </Card>

        {renderStepContent()}

        <View style={styles.actions}>
          <Button
            title={activeStep === finalSteps.length - 1 ? 'Finish' : 'Next'}
            onPress={handleNext}
            fullWidth
          />
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
  progress: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  progressBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
  },
  progressSegmentActive: {
    backgroundColor: colors.blue,
  },
  progressText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  stepCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepHeaderText: {
    flex: 1,
  },
  stepTitle: {
    ...typography.h3,
    color: colors.cream,
    marginBottom: 4,
  },
  stepDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  stepContent: {
    paddingHorizontal: spacing.lg,
  },
  stepIcon: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepMessage: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  breathingContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.blue + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 3,
    borderColor: colors.blue,
  },
  breathPhaseText: {
    ...typography.h2,
    color: colors.cream,
  },
  breathInstructions: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  instructionTitle: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  instructionList: {
    backgroundColor: colors.cardBg,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  instructionItem: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  breathCounter: {
    ...typography.caption,
    color: colors.blue,
    textAlign: 'center',
  },
  breathButton: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  tipText: {
    ...typography.caption,
    color: colors.text,
    lineHeight: 20,
  },
  brightnessControl: {
    alignItems: 'center',
  },
  brightnessLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
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
  brightnessValue: {
    ...typography.h2,
    color: colors.cream,
  },
  audioOptions: {
    gap: spacing.md,
  },
  audioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  audioEmoji: {
    fontSize: 32,
  },
  audioName: {
    ...typography.body,
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
  actions: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
});
