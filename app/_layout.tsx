import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Fredoka_400Regular,
  Fredoka_500Medium,
} from '@expo-google-fonts/fredoka';
import { SplashScreen } from 'expo-router';
import { colors } from '@/constants/theme';
import { WindDownProvider } from '@/contexts/WindDownContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Fredoka-Regular': Fredoka_400Regular,
    'Fredoka-Medium': Fredoka_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
    <WindDownProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="checkin" />
        <Stack.Screen name="schedule" />
        <Stack.Screen name="winddown" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </WindDownProvider>
  );
}
