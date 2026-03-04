import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const params = useLocalSearchParams();
  const [isSignUp, setIsSignUp] = useState(params.mode !== 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp && !name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Create user profile
          await supabase.from('users').insert({
            id: data.user.id,
            name: name.trim(),
            onboarding_completed: false,
          });

          // Navigate to onboarding
          router.replace('/onboarding/barriers');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check if onboarding is completed
          const { data: userData } = await supabase
            .from('users')
            .select('onboarding_completed')
            .eq('id', data.user.id)
            .single();

          if (userData?.onboarding_completed) {
            router.replace('/(tabs)');
          } else {
            router.replace('/onboarding/barriers');
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes, allow skipping auth
  const handleSkip = () => {
    router.replace('/onboarding/barriers');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color={colors.cream} size={24} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.teddyCircle}>
              <Text style={styles.teddyEmoji}>🧸</Text>
            </View>
            <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Let\'s start your journey to better sleep'
                : 'Sign in to continue your sleep journey'}
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                  <User color={colors.textMuted} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Mail color={colors.textMuted} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <Lock color={colors.textMuted} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff color={colors.textMuted} size={20} />
                  ) : (
                    <Eye color={colors.textMuted} size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {!isSignUp && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={isSignUp ? 'Create Account' : 'Sign In'}
              onPress={handleSubmit}
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
            />

            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.switchTextBold}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip for now (Demo)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  teddyCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  teddyEmoji: {
    fontSize: 48,
  },
  title: {
    ...typography.h1,
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  inputContainer: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: 52,
    ...typography.body,
    color: colors.text,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginLeft: spacing.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
  switchText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  switchTextBold: {
    color: colors.cream,
    fontFamily: 'Fredoka-Medium',
  },
  skipButton: {
    paddingVertical: spacing.sm,
  },
  skipText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
