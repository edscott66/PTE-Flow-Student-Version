import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { db, auth, ensureAuth } from '../services/firebase';
import { scoreService } from '../services/scoreService';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function RootLayoutContent() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [isRestoring, setIsRestoring] = useState(true);
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await ensureAuth();

        const isActivateScreen = segments[0] === 'activate';

        // Student app activation check
        const subscriptionStart = await scoreService.getSubscriptionStartDate();
        const isActivated = !!subscriptionStart;

        if (!isActivated && !isActivateScreen) {
          setTargetRoute('/activate');
        }

        if (isActivated && isActivateScreen) {
          setTargetRoute('/');
        }

      } catch (error) {
        console.error("[Layout] Initialization error:", error);
        setTargetRoute('/activate');
      } finally {
        setIsRestoring(false);
      }
    };

    initializeApp();
  }, [segments]);

  useEffect(() => {
    if (!isRestoring && targetRoute && navigationState?.key) {
      router.replace(targetRoute as any);
      setTargetRoute(null);
    }
  }, [isRestoring, targetRoute, router, navigationState?.key]);

  if (isRestoring) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="activate" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="module/[id]" options={{ title: 'Practice' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}