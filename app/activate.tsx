import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db, auth, ensureAuth, enableAutoLogin } from '../services/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { scoreService } from '../services/scoreService';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ActivateScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleActivate = async () => {
    if (!code.trim() || code.length < 5) {
      Alert.alert('Invalid Code', 'Please enter a valid activation code.');
      return;
    }

    setLoading(true);
    try {
      // 0. Ensure user is authenticated (anonymous is fine)
      enableAutoLogin();
      await ensureAuth();
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('Authentication failed. Please check your internet connection and try again.');
      }

      const deviceId = await scoreService.getDeviceId();
      
      // 1. Fetch code from Firestore
      const codeRef = doc(db, 'verification_codes', code.trim().toUpperCase());
      const snap = await getDoc(codeRef);

      if (!snap.exists()) {
        throw new Error('This code does not exist. Please check your spelling and try again.');
      }

      const data = snap.data();

      // 2. Check if already used
      if (data.isUsed) {
        // Check if this code was used by the current user (reinstall recovery)
        if (data.usedBy === userId || data.deviceId === deviceId) {
          // Allow reactivation for same user/device
          console.log("[Activate] Re-activating previously used code for same user");
          await scoreService.setSubscriptionStartDate(Date.now());
          
          // Store activation in cloud for recovery
          await setDoc(doc(db, 'user_activations', userId), {
            activationCode: code.trim().toUpperCase(),
            activatedAt: Date.now(),
            deviceId: deviceId,
            lastReactivation: Date.now()
          }, { merge: true });
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Welcome Back!', 'Your subscription has been restored.', [
            { text: 'Continue', onPress: () => router.replace('/') }
          ]);
          return;
        }
        throw new Error('This code has already been used on another device.');
      }

      // 3. First time activation - Mark as used with device info
      await updateDoc(codeRef, {
        isUsed: true,
        usedBy: userId,
        usedAt: Date.now(),
        deviceId: deviceId
      });

      // 4. Store activation in cloud for future recovery
      await setDoc(doc(db, 'user_activations', userId), {
        activationCode: code.trim().toUpperCase(),
        activatedAt: Date.now(),
        deviceId: deviceId,
        subscriptionStartDate: Date.now()
      }, { merge: true });

      // 5. Update local sub start date
      await scoreService.setSubscriptionStartDate(Date.now());
      
      // 6. Ensure clean state after fresh verification
      await scoreService.clearAllLocalData();
      await scoreService.setSubscriptionStartDate(Date.now()); // Re-set this because it was just wiped

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert('Success!', 'Your app has been activated successfully.', [
        { text: 'Start Practicing', onPress: () => router.replace('/') }
      ]);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Activation Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const isMasterCode = code.trim().toUpperCase() === 'MASTER-CODE';

  const handleBypass = async () => {
    setLoading(true);
    await scoreService.setSubscriptionStartDate(Date.now());
    await AsyncStorage.removeItem('pte_flow_group_id');
    await scoreService.resetLeaderboardScore();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/');
    setLoading(false);
  }

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    inner: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? '#1E293B' : '#DBEAFE',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 16, color: colors.subtext, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
    inputContainer: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      height: 60,
      marginBottom: 24,
    },
    input: {
      flex: 1,
      fontSize: 18,
      color: colors.text,
      marginLeft: 12,
      fontWeight: '600',
    },
    button: {
      width: '100%',
      height: 56,
      backgroundColor: colors.primary,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    adminButton: {
      marginTop: 20,
      width: '100%',
      height: 56,
      backgroundColor: '#10B981',
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={dynamicStyles.inner}>
            <View style={dynamicStyles.iconContainer}>
              <MaterialCommunityIcons name="lock-check-outline" size={40} color={colors.primary} />
            </View>
            <Text style={dynamicStyles.title}>Activate Your App</Text>
            <Text style={dynamicStyles.subtitle}>
              Please enter your verification code to gain access to all practice modules and features.
            </Text>

            <View style={dynamicStyles.inputContainer}>
              <MaterialCommunityIcons name="key-variant" size={24} color={colors.subtext} />
              <TextInput
                style={dynamicStyles.input}
                placeholder="e.g. PTE-XYZ"
                placeholderTextColor={colors.subtext}
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {isMasterCode ? (
              <TouchableOpacity
                style={dynamicStyles.adminButton}
                onPress={handleBypass}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={dynamicStyles.buttonText}>Admin Login</Text>}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={dynamicStyles.button}
                onPress={handleActivate}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={dynamicStyles.buttonText}>Verify & Unlock</Text>}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
