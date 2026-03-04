import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.spacer} />

        <View style={styles.logoSection}>
          <View style={styles.teddyCircle}>
            <Text style={styles.teddyEmoji}>🧸</Text>
          </View>
          <Text style={styles.appName}>tuck in</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={() => router.push('/login')}
            variant="primary"
            size="large"
            fullWidth
          />
          <Button
            title="I already have an account"
            onPress={() => router.push('/login?mode=signin')}
            variant="outline"
            size="medium"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  spacer: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    flex: 2,
    justifyContent: 'center',
  },
  teddyCircle: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.brown,
    marginBottom: spacing.lg,
  },
  teddyEmoji: {
    fontSize: 80,
  },
  appName: {
    fontSize: 42,
    fontFamily: 'Fredoka-Medium',
    color: colors.cream,
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
});
