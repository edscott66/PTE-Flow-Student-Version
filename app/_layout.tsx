import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

import { listenToTeacherBroadcast } from '../services/broadcastListener';
import BroadcastModal from '../components/BroadcastModal';
import BroadcastBanner from '../components/BroadcastBanner';
import { scoreService } from '../services/scoreService';
import { ensureAuth } from '../services/firebase';

import { updateStudentStatus } from '../services/studentStatusService';
import { updateStudentActivity } from '../services/studentActivityService';

function RootLayoutContent() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const [isRestoring, setIsRestoring] = useState(true);
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  const [broadcast, setBroadcast] = useState<any | null>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const isFrozen = broadcast?.freeze === true;
  const isLocked = !!broadcast?.moduleType;
  const [forced, setForced] = useState(false);

  // ⭐ SAFE NAVIGATION HELPERS ⭐
  const safeNavigateToModule = () => {
    if (!broadcast?.moduleType) return;
    if (!navigationState?.key) return;
    router.push(`/module/${broadcast.moduleType}`);
  };

  const safeReplaceToModule = () => {
    if (!broadcast?.moduleType) return;
    if (!navigationState?.key) return;
    router.replace(`/module/${broadcast.moduleType}`);
  };

  const safeReplaceToRoot = () => {
    if (!navigationState?.key) return;
    router.replace('/');
  };

  const safePushToRoot = () => {
    if (!navigationState?.key) return;
    router.push('/');
  };

  // Listen for teacher broadcasts
  useEffect(() => {
    const unsub = listenToTeacherBroadcast((data) => {
      setBroadcast(data);
      setShowBroadcastModal(!!data);

      if (data?.moduleType) {
        updateStudentStatus("joined");
        updateStudentActivity("joined");
      }
    });

    const unsubscribe: () => void = typeof unsub === 'function' ? unsub : () => {};
    return () => unsubscribe();
  }, []);

  // Auto‑navigate into module when broadcast starts
  useEffect(() => {
    if (broadcast?.moduleType && navigationState?.key) {
      safeNavigateToModule();
      updateStudentStatus("in-progress");
      updateStudentActivity("in-progress");
    }
  }, [broadcast?.moduleType, navigationState?.key]);

  // Auto‑exit when broadcast ends
  useEffect(() => {
    if (!broadcast && navigationState?.key) {
      safePushToRoot();
      updateStudentStatus("disconnected");
      updateStudentActivity("disconnected");
    }
  }, [broadcast, navigationState?.key]);

  // Timer sync effect
  useEffect(() => {
    if (!broadcast?.timerSeconds || !broadcast?.timerStartedAt) {
      setRemainingTime(null);
      return;
    }

    const start = broadcast.timerStartedAt;
    const duration = broadcast.timerSeconds * 1000;

    const update = () => {
      const now = Date.now();
      const elapsed = now - start;
      const left = Math.max(0, Math.floor((duration - elapsed) / 1000));
      setRemainingTime(left);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [broadcast]);

  // Force Submit Mode
  useEffect(() => {
    if (broadcast?.forceSubmit && !forced && navigationState?.key) {
      setForced(true);

      globalThis.forceSubmitNow?.();
      updateStudentStatus("force-submitted");
      updateStudentActivity("force-submitted");

      safeReplaceToRoot();
    }
  }, [broadcast?.forceSubmit, forced, navigationState?.key]);

  // Freeze Screen Mode status
  useEffect(() => {
    if (isFrozen) {
      updateStudentStatus("frozen");
      updateStudentActivity("frozen");
    }
  }, [isFrozen]);

  // ⭐ PATCHED BLOCK — SAFE LOCK MODE OVERRIDE ⭐
  useEffect(() => {
    if (!isLocked) return;

    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (path: any) => {
      const target =
        typeof path === 'string'
          ? path
          : typeof path?.pathname === 'string'
          ? path.pathname
          : null;

      if (target && target.startsWith('/module/')) {
        originalPush(path);
      } else {
        console.warn("Blocked navigation while locked:", path);
      }
    };

    router.replace = (path: any) => {
      const target =
        typeof path === 'string'
          ? path
          : typeof path?.pathname === 'string'
          ? path.pathname
          : null;

      if (target && target.startsWith('/module/')) {
        originalReplace(path);
      } else {
        console.warn("Blocked replace while locked:", path);
      }
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [isLocked, router]);

  // If locked and user escapes, force them back
  useEffect(() => {
    if (isLocked && navigationState?.key) {
      const current = segments.join('/');
      if (!current.startsWith('module')) {
        safeReplaceToModule();
      }
    }
  }, [segments, isLocked, broadcast?.moduleType, navigationState?.key]);

  // Activation logic
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await ensureAuth();

        const isActivateScreen = segments[0] === 'activate';
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

      <BroadcastBanner
        broadcast={broadcast}
        remainingTime={remainingTime}
        onPress={safeNavigateToModule}
      />

      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: colors.background },
          gestureEnabled: !isLocked
        }}
      >
        <Stack.Screen name="activate" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="module/[id]" options={{ title: 'Practice', gestureEnabled: false }} />
      </Stack>

      <BroadcastModal
        visible={showBroadcastModal}
        broadcast={broadcast}
        onJoin={() => {
          setShowBroadcastModal(false);
          safeNavigateToModule();
          updateStudentStatus("in-progress");
          updateStudentActivity("in-progress");
        }}
        onClose={() => setShowBroadcastModal(false)}
      />

      {isFrozen && (
        <TouchableWithoutFeedback>
          <View style={styles.freezeOverlay}>
            <Text style={styles.freezeText}>Screen Frozen</Text>
          </View>
        </TouchableWithoutFeedback>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  freezeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  freezeText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  }
});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}