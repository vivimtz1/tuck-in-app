import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const TEDDY_NAMES = ['Teddy', 'Snuggles', 'Cocoa', 'Patches', 'Honey', 'Buttons'];

export default function TeddyScreen() {
  const [teddyName, setTeddyName] = useState('Teddy');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNameSelect = (name: string) => {
    setTeddyName(name);
    setShowCustomInput(false);
  };

  const handleCustomName = () => {
    setShowCustomInput(true);
    if (customName) {
      setTeddyName(customName);
    }
    // Scroll to bottom after a short delay to show the input
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleContinue = () => {
    // Store teddy preferences
    router.push('/onboarding/complete');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={colors.cream} size={24} />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
          <Text style={styles.step}>Step 4 of 4</Text>
          <Text style={styles.title}>Meet Your Companion</Text>
          <Text style={styles.subtitle}>
            Personalize your teddy bear companion.{'\n'}They'll help guide you to better sleep!
          </Text>

          <View style={styles.teddyPreview}>
            <View style={styles.teddyCircle}>
              <Text style={styles.teddyEmoji}>🧸</Text>
            </View>
            <Text style={styles.teddyNamePreview}>{teddyName}</Text>
            <Text style={styles.teddyIntro}>"Hi! I'm {teddyName}!"</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose a Name</Text>
            <View style={styles.namesGrid}>
              {TEDDY_NAMES.map((name) => (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.nameChip,
                    teddyName === name && !showCustomInput && styles.nameChipSelected,
                  ]}
                  onPress={() => handleNameSelect(name)}
                >
                  <Text
                    style={[
                      styles.nameChipText,
                      teddyName === name && !showCustomInput && styles.nameChipTextSelected,
                    ]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.nameChip, showCustomInput && styles.nameChipSelected]}
                onPress={handleCustomName}
              >
                <Text style={[styles.nameChipText, showCustomInput && styles.nameChipTextSelected]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {showCustomInput && (
              <TextInput
                style={styles.customInput}
                placeholder="Enter a custom name"
                placeholderTextColor={colors.textMuted}
                value={customName}
                onChangeText={(text) => {
                  setCustomName(text);
                  setTeddyName(text || 'Teddy');
                }}
                maxLength={12}
                autoFocus
              />
            )}
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button
          title="Complete Setup"
          onPress={handleContinue}
          variant="primary"
          size="large"
          fullWidth
        />
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
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
  teddyPreview: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  teddyCircle: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.brown,
    marginBottom: spacing.md,
  },
  teddyEmoji: {
    fontSize: 64,
  },
  teddyNamePreview: {
    ...typography.h2,
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  teddyIntro: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.cream,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  namesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  nameChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardBg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  nameChipSelected: {
    backgroundColor: colors.cream,
    borderColor: colors.cream,
  },
  nameChipText: {
    ...typography.body,
    color: colors.text,
  },
  nameChipTextSelected: {
    color: colors.dark,
    fontFamily: 'Fredoka-Medium',
  },
  customInput: {
    marginTop: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.cream,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
