import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { scoreService } from '../services/scoreService';
import { db, auth, ensureAuth, enableAutoLogin, handleFirestoreError, OperationType } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const { colors, isDark } = useTheme();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | null = null;

    if (!isLoggingIn) {
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animationLoop.start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      animationLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animationLoop.start();
    }

    return () => {
      if (animationLoop) animationLoop.stop();
    };
  }, [isLoggingIn]);

  const opacityAnim = pulseAnim.interpolate({
    inputRange: [1, 1.05],
    outputRange: [1, 0.8],
  });

  const rotationInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    const checkUser = async () => {
      const savedName = await scoreService.getUserName();

      // If a name exists, prefill it so the user sees their registered identity
      if (savedName) {
        setName(savedName);
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  const syncWithLeaderboard = async (userName: string) => {
    try {
      await ensureAuth();
      const firebaseUid = auth.currentUser?.uid;
      if (!firebaseUid) return;

      const userDocRef = doc(db, 'leaderboard', firebaseUid);

      const attempted = await scoreService.getAttemptedQuestions();
      const localBackup = await scoreService.getAllLocalData();
      const deviceId = await scoreService.getDeviceId();
      const groupId = await scoreService.getGroupId();
      const currentScore = await scoreService.getScore();

      const updateData: any = {
        userId: firebaseUid,
        deviceId,
        name: userName,
        attemptedQuestions: attempted,
        localBackup,
        lastUpdate: new Date().toISOString(),
        score: currentScore,
      };

      if (groupId) updateData.groupId = groupId;

      await setDoc(userDocRef, updateData, { merge: true });

      console.log('User successfully synced to Firebase Leaderboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leaderboard/${userName}`);
    }
  };

  const handleStart = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Wait!', 'Please enter your name to continue.');
      return;
    }

    setIsLoggingIn(true);
    enableAutoLogin();

    const trimmedName = name.trim();

    try {
      const existingName = await scoreService.getUserName();

      // ⭐ NAME LOCK: if a name already exists, it must match
      if (existingName && existingName !== trimmedName) {
        Alert.alert(
        "Name Locked",
        "This device already has a registered user.\n\nTo use a different name, please go to Settings and tap 'Reset My Progress'.",
        [{ text: "OK" }]
      );
        setIsLoggingIn(false);
        return;
      }

      // First login OR same name as before
      await scoreService.setUserName(trimmedName);
      await syncWithLeaderboard(trimmedName);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      console.error('Login process failed:', e);
      Alert.alert('Login Error', e?.message || 'An error occurred. Please try again.');
      setIsLoggingIn(false);
    }
  };

  if (loading) return null;

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? colors.background : '#2563EB' },
    heroSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    logoContainer: {
      width: 120,
      height: 120,
      backgroundColor: '#fff',
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    contentSection: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      padding: 40,
      paddingBottom: 60,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 24,
    },
    inputContainer: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: 'bold', color: colors.subtext, marginBottom: 8 },
    input: {
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    footerText: { fontSize: 12, color: colors.subtext, textAlign: 'center', marginTop: 24 },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style="light" />

      <View style={dynamicStyles.heroSection}>
        <Animated.View
          style={[
            dynamicStyles.logoContainer,
            {
              transform: [{ scale: pulseAnim }, { rotate: rotationInterpolate }],
              opacity: opacityAnim,
              borderWidth: 3,
              borderColor: '#c09c32',
            },
          ]}
        >
          <Image
            source={require('../assets/images/icon2.png')}
            style={{ width: '100%', height: '100%', borderRadius: 27 }}
            resizeMode="cover"
          />
        </Animated.View>
      </View>

      <View style={dynamicStyles.contentSection}>
        <Text style={dynamicStyles.title}>
          Master the PTE Exam with AI and Big Ben Academy
        </Text>

        <View style={dynamicStyles.inputContainer}>
          <Text style={dynamicStyles.label}>Enter your name to join:</Text>
          <TextInput
            style={dynamicStyles.input}
            placeholder="Student Name"
            placeholderTextColor={colors.subtext}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <TouchableOpacity style={dynamicStyles.button} onPress={handleStart}>
          <Text style={dynamicStyles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={dynamicStyles.footerText}>
          Your name will be used for the local leaderboard.
        </Text>
      </View>
    </SafeAreaView>
  );
}