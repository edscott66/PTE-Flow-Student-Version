import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Switch,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { scoreService } from '../../services/scoreService';
import { db, auth, disableAutoLogin } from '../../services/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import CustomLoader from '../../components/CustomLoader';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00 AM');
  const [subscriptionDetails, setSubscriptionDetails] = useState({
    daysRemaining: 60,
    text: 'Active — 60 days remaining',
    color: '#10B981',
    isExpired: false,
  });
  const [coachVoice, setCoachVoice] = useState('Aoede');
  const router = useRouter();
  const { colors, toggleTheme, isDark } = useTheme();

  useFocusEffect(
    useCallback(() => {
      scoreService.getIsCreator().then(setIsCreator);

      const loadSubscription = async () => {
        const details = await scoreService.getSubscriptionStatus();
        setSubscriptionDetails(details);
      };
      loadSubscription();
    }, [])
  );

  useEffect(() => {
    const loadPrefs = async () => {
      const enabled = await AsyncStorage.getItem('pte_reminders_enabled');
      const time = await AsyncStorage.getItem('pte_reminder_time');
      const voice = await AsyncStorage.getItem('pte_coach_voice');
      setRemindersEnabled(enabled === 'true');
      if (time) setReminderTime(time);
      if (voice) setCoachVoice(voice);
    };

    loadPrefs();
  }, []);

  const changeVoice = async () => {
    const voices = [
      { name: 'Aoede (British)', id: 'Aoede' },
      { name: 'Puck (Young)', id: 'Puck' },
      { name: 'Kore (Female)', id: 'Kore' },
      { name: 'Zephyr (Deep)', id: 'Zephyr' },
    ];

    Alert.alert(
      'Choose Coach Voice',
      'Select a preferred voice for AI responses.',
      voices.map(v => ({
        text: v.name,
        onPress: async () => {
          setCoachVoice(v.id);
          await AsyncStorage.setItem('pte_coach_voice', v.id);
        },
      }))
    );
  };

  const toggleReminders = async (value: boolean) => {
    setRemindersEnabled(value);
    await AsyncStorage.setItem('pte_reminders_enabled', value.toString());
    if (value) {
      Alert.alert('Reminders Enabled', `You will be nudged daily at ${reminderTime} to complete your goals.`);
    }
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open link.'));
  };

  const handleFeedback = async (type: 'bug' | 'feature') => {
    const userName = (await scoreService.getUserName()) || 'User';
    const subject = type === 'bug' ? 'Bug Report: PTE Flow' : 'Feature Request: PTE Flow';
    const body = `Hi Team,\n\nI'm using the PTE Flow app and wanted to ${
      type === 'bug' ? 'report a bug' : 'suggest a feature'
    }:\n\n\n\nFrom: ${userName}`;
    const mailto = `mailto:projectgazzy@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body
    )}`;
    Linking.openURL(mailto).catch(() =>
      Alert.alert('Error', 'Could not open mail app. Please email us at projectgazzy@gmail.com')
    );
  };

  const handleRenewSubscription = async () => {
    const userName = (await scoreService.getUserName()) || 'User';
    const subject = 'Subscription Renewal Request';
    const body = `Please renew my subscription.\n\nFrom: ${userName}`;
    const mailto = `mailto:projectgazzy@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body
    )}`;
    Linking.openURL(mailto).catch(() =>
      Alert.alert('Error', 'Could not open mail app. Please email us at projectgazzy@gmail.com')
    );
  };

  const handleGenerateCode = async () => {
    try {
      setLoading(true);
      const randomCode = 'PTE-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      const { setDoc, doc } = await import('firebase/firestore');
      const codeRef = doc(db, 'verification_codes', randomCode);
      const userId = auth.currentUser?.uid || 'anonymous';
      await setDoc(codeRef, {
        code: randomCode,
        isUsed: false,
        daysGranted: 60,
        createdAt: Date.now(),
        createdBy: userId,
        usedBy: null,
        usedAt: null,
        adminSecret: 'BIGBEN2026',
      });

      Alert.alert('Code Generated!', `Your new code is:\n\n${randomCode}\n\n(Write this down or copy it)`, [
        {
          text: 'Copy to Clipboard',
          onPress: async () => {
            await Clipboard.setStringAsync(randomCode);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('', 'Copied to clipboard!');
          },
        },
        { text: 'Done' },
      ]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate code. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalReset = async () => {
    Alert.alert(
      'End Leaderboard',
      'This will end your current leaderboard. All users will be deleted from it, and it will be completely erased. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Leaderboard',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              const user = auth.currentUser;
              if (!user) {
                Alert.alert('Error', 'You must be logged in to perform this action.');
                setLoading(false);
                return;
              }
              await user.getIdToken(true);

              const resetTime = new Date().toISOString();
              const myGroupId = (await scoreService.getGroupId()) || user.uid;

              const q = query(collection(db, 'leaderboard'), where('groupId', '==', myGroupId));
              const snapshot = await getDocs(q);

              const resetPromises = snapshot.docs.map(d => {
                if (d.id === user.uid) {
                  return setDoc(
                    doc(db, 'leaderboard', d.id),
                    {
                      score: 0,
                      groupId: user.uid,
                      lastUpdate: new Date().toISOString(),
                    },
                    { merge: true }
                  );
                } else {
                  return deleteDoc(doc(db, 'leaderboard', d.id));
                }
              });
              await Promise.all(resetPromises);

              await AsyncStorage.setItem('pte_flow_last_reset', resetTime);
              await scoreService.setGroupId(user.uid);
              await scoreService.resetLeaderboardScore();

              await setDoc(doc(db, 'config', 'reset'), {
                timestamp: resetTime,
                reason: 'admin_wipe',
                adminId: user.uid,
                targetGroupId: myGroupId,
                message: 'The leaderboard has been ended by the Admin. You have been placed into a private group.',
                adminSecret: 'BIGBEN2026',
              });

              Alert.alert('Success', 'Leaderboard has been Ended. You are now in a private group.', [
                { text: 'OK', onPress: () => router.replace('/') },
              ]);
            } catch (error) {
              console.error('End leaderboard failed:', error);
              Alert.alert('Error', 'Failed to end the leaderboard. Please check your connection.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLocalReset = async () => {
    Alert.alert(
      'Reset My Progress',
      'This will clear your progress report, daily streaks, global leaderboard score, and all saved data. You will start completely fresh.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const firebaseUid = auth.currentUser?.uid;
              const currentGroupId = await scoreService.getGroupId();

              if (firebaseUid) {
                await setDoc(
                  doc(db, 'leaderboard', firebaseUid),
                  {
                    score: 0,
                    groupId: currentGroupId || firebaseUid,
                    attemptedQuestions: [],
                    localBackup: {},
                    lastUpdate: new Date().toISOString(),
                  },
                  { merge: true }
                );
              }

              await scoreService.clearProgressOnly();

              if (currentGroupId) {
                await scoreService.setGroupId(currentGroupId);
              }

              await AsyncStorage.removeItem('pte_flow_user_name');
              await AsyncStorage.removeItem('pte_flow_has_synced_v2');

              router.replace('/');
            } catch (e) {
              console.warn('Reset error:', e);
              Alert.alert('Error', 'Could not fully reset cloud data.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const [tapCount, setTapCount] = useState(0);
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  const handleVersionTap = () => {
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 7) {
        setTimeout(() => setAdminModalVisible(true), 0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return 0;
      }
      return newCount;
    });
  };

  const handleAdminVerify = async () => {
    if (adminCode === 'BIGBEN2026') {
      await scoreService.setIsCreator(true);
      setIsCreator(true);
      setAdminModalVisible(false);
      setAdminCode('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Administrative Controls Unlocked.');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Invalid access code.');
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      padding: 24,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.text },
    subtitle: { fontSize: 14, color: colors.subtext, marginTop: 4 },

    content: { flex: 1 },

    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: isDark ? colors.subtext : '#94A3B8',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
      marginLeft: 8,
    },

    item: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    itemText: { flex: 1 },
    itemTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    itemDesc: { fontSize: 12, color: colors.subtext, marginTop: 2 },

    adminSection: { marginTop: 32, paddingBottom: 32 },
    adminHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      marginLeft: 8,
      gap: 6,
    },
    adminTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.danger,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    dangerItem: { borderColor: isDark ? colors.danger : '#FEE2E2', borderWidth: 1 },
    adminNote: {
      fontSize: 12,
      color: colors.subtext,
      textAlign: 'center',
      marginTop: 12,
      fontStyle: 'italic',
    },

    footer: { padding: 40, alignItems: 'center' },
    version: { fontSize: 12, fontWeight: 'bold', color: colors.border },
    copyright: { fontSize: 10, color: colors.border, marginTop: 4 },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    modalDesc: {
      fontSize: 14,
      color: colors.subtext,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    modalInput: {
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
      borderRadius: 12,
      padding: 16,
      color: colors.text,
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalButtonText: { fontSize: 15, fontWeight: 'bold' },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Settings</Text>
        <Text style={dynamicStyles.subtitle}>Manage your group and app data</Text>
      </View>

      <ScrollView style={dynamicStyles.content}>
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Appearance & Study</Text>

          <View style={dynamicStyles.item}>
            <View
              style={[
                dynamicStyles.iconContainer,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <MaterialCommunityIcons
                name={isDark ? 'weather-night' : 'weather-sunny'}
                size={24}
                color={isDark ? '#3B82F6' : '#F59E0B'}
              />
            </View>
            <View style={dynamicStyles.itemText}>
              <Text style={dynamicStyles.itemTitle}>Dark Mode</Text>
              <Text style={dynamicStyles.itemDesc}>Adjust the app's color scheme.</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
            />
          </View>

          <View style={dynamicStyles.item}>
            <View
              style={[
                dynamicStyles.iconContainer,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <MaterialCommunityIcons name="bell-ring" size={24} color={colors.primary} />
            </View>
            <View style={dynamicStyles.itemText}>
              <Text style={dynamicStyles.itemTitle}>Daily Study Reminders</Text>
              <Text style={dynamicStyles.itemDesc}>Nudge me at {reminderTime}</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={toggleReminders}
              trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
            />
          </View>

          <TouchableOpacity style={dynamicStyles.item} onPress={changeVoice}>
            <View
              style={[
                dynamicStyles.iconContainer,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <MaterialCommunityIcons name="microphone" size={24} color="#8B5CF6" />
            </View>
            <View style={dynamicStyles.itemText}>
              <Text style={dynamicStyles.itemTitle}>AI Coach Voice</Text>
              <Text style={dynamicStyles.itemDesc}>Selected: {coachVoice}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.border} />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>PTE Quick Guide</Text>

          <TouchableOpacity
            style={dynamicStyles.item}
            onPress={() => handleOpenLink('https://www.pearsonpte.com/')}
          >
            <View
              style={[
                dynamicStyles.iconContainer,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <MaterialCommunityIcons name="earth" size={24} color="#0EA5E9" />
            </View>
            <View style={dynamicStyles.itemText}>
              <Text style={dynamicStyles.itemTitle}>Pearson Official Website</Text>
              <Text style={dynamicStyles.itemDesc}>Official news and test booking.</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={20} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.item}
            onPress={() =>
              handleOpenLink('https://www.pearsonpte.com/preparation/practice-tests')
            }
          >
            <View
              style={[
                dynamicStyles.iconContainer,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <MaterialCommunityIcons name="book-open-variant" size={24} color="#8B5CF6" />
            </View>
            <View style={dynamicStyles.itemText}>
              <Text style={dynamicStyles.itemTitle}>Official Practice Tests</Text>
              <Text style={dynamicStyles.itemDesc}>Official Pearson preparation materials.</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={20} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.item}
            onPress={() =>
              handleOpenLink('https://www.pearsonpte.com/pte-academic-handbook')
            }
          >
            <View
              style={[
                dynamicStyles.iconContainer,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <MaterialCommunityIcons
                name="file-document-outline"
                size={24}
                color="#F43F5E"
              />
            </View>
            <View style={dynamicStyles.itemText}>
              <Text style={dynamicStyles.itemTitle}>PTE Academic Handbook</Text>
              <Text style={dynamicStyles.itemDesc}>Download the official guide (PDF).</Text>
            </View>
            <MaterialCommunityIcons name="download" size={20} color={colors.border} />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Support & Feedback</Text>

          <TouchableOpacity
            style={dynamicStyles.item}
            onPress={() => handleFeedback('bug')}
          >
            <View
              style={[
                dynamicStyles.iconContainer,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <MaterialCommunityIcons name="bug-outline" size={24} color={colors.danger} />
            </View>
            <View style={dynamicStyles.itemText}>
              <Text style={dynamicStyles.itemTitle}>Report a Bug</Text>
              <Text style={dynamicStyles.itemDesc}>Found an issue? Let us know.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.item}
            onPress={() => handleFeedback('feature')}
          >
            <View
              style={[
                dynamicStyles.iconContainer,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={24}
                color="#EAB308"
              />
            </View>
            <View style={dynamicStyles.itemText}>
              <Text style={dynamicStyles.itemTitle}>Suggest a Feature</Text>
              <Text style={dynamicStyles.itemDesc}>How can we make PTE Flow better?</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Account</Text>

          <View
            style={[
              dynamicStyles.item,
              { borderLeftWidth: 4, borderLeftColor: subscriptionDetails.color },
            ]}
          >
            <View
              style={[
                dynamicStyles.iconContainer,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <MaterialCommunityIcons
                name="timer-sand"
                size={24}
                color={subscriptionDetails.color}
              />
            </View>
            <View style={dynamicStyles.itemText}>
              <Text style={dynamicStyles.itemTitle}>Subscription Status</Text>
              <Text
                style={[
                  dynamicStyles.itemDesc,
                  { color: subscriptionDetails.color, fontWeight: 'bold' },
                ]}
              >
                {subscriptionDetails.text}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={dynamicStyles.item}
            onPress={handleRenewSubscription}
          >
            <View
              style={[
                dynamicStyles.iconContainer,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <MaterialCommunityIcons
                name="email-fast-outline"
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={dynamicStyles.itemText}>
              <Text style={dynamicStyles.itemTitle}>Renew Subscription</Text>
              <Text style={dynamicStyles.itemDesc}>Contact us to extend your access.</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={dynamicStyles.item} onPress={handleLocalReset}>
            <View
              style={[
                dynamicStyles.iconContainer,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <MaterialCommunityIcons
                name="account-remove"
                size={24}
                color={colors.subtext}
              />
            </View>
            <View style={dynamicStyles.itemText}>
              <Text style={dynamicStyles.itemTitle}>Reset My Progress</Text>
              <Text style={dynamicStyles.itemDesc}>
                Clear your name and score from this device.
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.item}
            onPress={async () => {
              disableAutoLogin();

              try {
                const userName = await scoreService.getUserName();
                const firebaseUid = auth.currentUser?.uid;
                if (userName && firebaseUid) {
                  const localBackup = await scoreService.getAllLocalData();
                  const score = await scoreService.getScore();
                  const attempted = await scoreService.getAttemptedQuestions();
                  const groupId = (await scoreService.getGroupId()) || firebaseUid;
                  const userDocRef = doc(db, 'leaderboard', firebaseUid);

                  await setDoc(
                    userDocRef,
                    {
                      userId: firebaseUid,
                      name: userName,
                      score,
                      groupId,
                      attemptedQuestions: attempted,
                      localBackup,
                      lastUpdate: new Date().toISOString(),
                    },
                    { merge: true }
                  );
                  console.log('[Settings] Final backup to cloud complete.');
                }
              } catch (e) {
                console.warn('Backup failed:', e);
              }

              router.replace('/');
            }}
          >
            <View
              style={[
                dynamicStyles.iconContainer,
                { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2' },
              ]}
            >
              <MaterialCommunityIcons name="logout" size={24} color={colors.danger} />
            </View>
            <View style={dynamicStyles.itemText}>
              <Text
                style={[
                  dynamicStyles.itemTitle,
                  { color: isDark ? colors.danger : '#B91C1C' },
                ]}
              >
                Log Out
              </Text>
              <Text style={dynamicStyles.itemDesc}>Sign out of your account.</Text>
            </View>
          </TouchableOpacity>
        </View>

        {isCreator && (
          <View style={[dynamicStyles.section, dynamicStyles.adminSection]}>
            <View style={dynamicStyles.adminHeader}>
              <MaterialCommunityIcons name="shield-check" size={20} color={colors.danger} />
              <Text style={dynamicStyles.adminTitle}>Admin Controls</Text>
            </View>

            <TouchableOpacity
              style={[dynamicStyles.item, { marginBottom: 12 }]}
              onPress={handleGenerateCode}
              disabled={loading}
            >
              <View
                style={[
                  dynamicStyles.iconContainer,
                  {
                    backgroundColor: isDark
                      ? 'rgba(16, 185, 129, 0.1)'
                      : '#D1FAE5',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="ticket-percent-outline"
                  size={24}
                  color="#10B981"
                />
              </View>
              <View style={dynamicStyles.itemText}>
                <Text style={dynamicStyles.itemTitle}>Generate Subscription Code</Text>
                <Text style={dynamicStyles.itemDesc}>
                  Generate a secure activation code for users.
                </Text>
              </View>
              {loading ? (
                <CustomLoader size={30} />
              ) : (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={colors.border}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[dynamicStyles.item, dynamicStyles.dangerItem]}
              onPress={handleGlobalReset}
              disabled={loading}
            >
              <View
                style={[
                  dynamicStyles.iconContainer,
                  {
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.1)'
                      : '#FEE2E2',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="refresh-circle"
                  size={24}
                  color={colors.danger}
                />
              </View>
              <View style={dynamicStyles.itemText}>
                <Text
                  style={[
                    dynamicStyles.itemTitle,
                    { color: isDark ? colors.danger : '#B91C1C' },
                  ]}
                >
                  End Current Leaderboard
                </Text>
                <Text style={dynamicStyles.itemDesc}>
                  Erase the current leaderboard and move users to a private group.
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={dynamicStyles.adminNote}>
              Admin actions are permanent. Use with caution.
            </Text>
          </View>
        )}

        <View style={dynamicStyles.footer}>
          <TouchableOpacity onPress={handleVersionTap}>
            <Text style={dynamicStyles.version}>PTE Flow v1.0.0</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.copyright}>© 2026 PTE Flow</Text>
        </View>
      </ScrollView>

      <Modal
        visible={adminModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAdminModalVisible(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>Admin Access</Text>
            <Text style={dynamicStyles.modalDesc}>
              Enter the administrative access code to unlock advanced controls.
            </Text>
            <TextInput
              style={dynamicStyles.modalInput}
              value={adminCode}
              onChangeText={setAdminCode}
              placeholder="Enter admin code"
              placeholderTextColor={colors.subtext}
            />
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[
                  dynamicStyles.modalButton,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => {
                  setAdminModalVisible(false);
                  setAdminCode('');
                }}
              >
                <Text
                  style={[
                    dynamicStyles.modalButtonText,
                    { color: colors.text },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  dynamicStyles.modalButton,
                  { backgroundColor: colors.danger },
                ]}
                onPress={handleAdminVerify}
              >
                <Text
                  style={[
                    dynamicStyles.modalButtonText,
                    { color: '#fff' },
                  ]}
                >
                  Unlock
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}