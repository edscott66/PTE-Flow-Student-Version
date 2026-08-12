import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { scoreService, RecentActivity } from '../../services/scoreService';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { generateDailyGoals } from '../../logic/daily_goals_engine';
// ─── FIXED: added Firebase imports to restore scores from cloud on load ───────
import { db, auth } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ─────────────────────────────────────────────────────────────────────────────

// --- PRACTICE MODULES DATA ---
const PRACTICE_MODULES = [
  {
    id: 'speaking',
    title: 'Speaking',
    displayTitle: 'Speaking 8 Task Types',
    icon: 'mic-outline',
    color: '#2563EB',
    tasks: ['Read Aloud', 'Repeat Sentence', 'Describe Image', 'Summarize Group Discussion', 'Retell Lecture', 'Answer Short Question', 'Personal Intro', 'Situational Response'],
  },
  {
    id: 'writing',
    title: 'Writing',
    displayTitle: 'Writing 2 Task Types',
    icon: 'create-outline',
    color: '#F97316',
    tasks: ['Summarize Written Text', 'Essay'],
  },
  {
    id: 'reading',
    title: 'Reading',
    displayTitle: 'Reading 5 Task Types',
    icon: 'book-outline',
    color: '#10B981',
    tasks: ['Fill in the Blanks', 'Re-order Paragraphs', 'MC Single Answer', 'MC Multiple Answer', 'Reading FIB'],
  },
  {
    id: 'listening',
    title: 'Listening',
    displayTitle: 'Listening 8 Task Types',
    icon: 'headset-outline',
    color: '#8B5CF6',
    tasks: ['Summarize Spoken Text', 'Write From Dictation', 'Highlight Incorrect Words', 'Select Missing Word', 'Highlight Correct Summary', 'MC Single', 'MC Multiple', 'Dictation'],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("PTE Student");
  const [streak, setStreak] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [cfa, setCfa] = useState(0); // Correct First Attempts
  const [ffa, setFfa] = useState(0); // Failed First Attempts
  const [totalGoalQuestions, setTotalGoalQuestions] = useState(1);
  const { colors, isDark } = useTheme();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -1, duration: 150, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -1, duration: 150, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.delay(2000),
      ])
    ).start();
  }, [pulseAnim, waveAnim]);

  const borderOpacityAnim = pulseAnim.interpolate({
    inputRange: [1, 1.05],
    outputRange: [0, 1]
  });

  const waveRotation = waveAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-20deg', '0deg', '20deg']
  });

  useEffect(() => {
    const loadUser = async () => {
      const name = await scoreService.getUserName();
      if (name) setUserName(name);
    };
    loadUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const activity = await scoreService.getRecentActivity();
        setRecentActivity(activity);

        const currentStreak = await scoreService.getStreak();
        setStreak(currentStreak);

        const studyTime = await scoreService.getTotalStudyTime();
        setTotalStudyTime(studyTime);

        const mistakes = await scoreService.getMistakes();
        setMistakeCount(mistakes.length);

        // ─── FIXED ────────────────────────────────────────────────────────────
        // Previously: read cfa/ffa from AsyncStorage only. After logout,
        // clearAllLocalData() wiped AsyncStorage so both returned 0 even though
        // Firebase held the real scores. Now: if both are zero AND a Firebase
        // user is signed in, we fetch the cloud score and restore it locally
        // before displaying — so the home screen always shows the correct totals
        // immediately on load rather than catching up after a few questions.
        // ─────────────────────────────────────────────────────────────────────
        let correctFirsts = await scoreService.getCorrectFirstAttempts();
        let failedFirsts = await scoreService.getFailedFirstAttempts();

        if (correctFirsts === 0 && failedFirsts === 0 && auth.currentUser) {
          try {
            const uid =
              (await AsyncStorage.getItem('pte_flow_user_id')) ||
              auth.currentUser.uid;
            const snap = await getDoc(doc(db, 'leaderboard', uid));
            if (snap.exists()) {
              const data = snap.data();
              const cloudScore = data.score || 0;
              if (cloudScore > 0) {
                // Restore cloud score into local storage so subsequent reads
                // are instant and don't need another network round-trip.
                await scoreService.setScore(cloudScore);
                await scoreService.setCorrectFirstAttempts(cloudScore);
                correctFirsts = cloudScore;
              }
            }
          } catch (e) {
            console.warn('[Home] Could not fetch score from Firebase:', e);
          }
        }
        // ─────────────────────────────────────────────────────────────────────

        setCfa(correctFirsts);
        setFfa(failedFirsts);

        const perf = await scoreService.getPerformance();
        const goals = generateDailyGoals(perf, 'intermediate', 15);
        const totalQ = goals.daily_goals.reduce((acc, task) => acc + task.estimated_time_minutes, 0);
        setTotalGoalQuestions(totalQ > 0 ? totalQ : 15);
      };
      loadData();
    }, [])
  );

  const formatTimeAgo = (timestampString: string) => {
    const date = new Date(timestampString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const progressPercentage = Math.min(100, Math.round(((cfa + ffa) / totalGoalQuestions) * 100));

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: 20 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    welcomeText: { fontSize: 14, color: colors.subtext },
    userName: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    profileButton: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
    avatarImage: { width: '100%', height: '100%', borderRadius: 24 },

    progressReportCard: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    prTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
    prRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    prLabelContainer: { flexDirection: 'row', alignItems: 'center' },
    prLabel: { fontSize: 14, color: colors.text, marginLeft: 8 },
    prValue: { fontSize: 16, fontWeight: 'bold' },

    progressCard: { backgroundColor: colors.primary, padding: 20, borderRadius: 20, marginBottom: 24 },

    progressInfo: { marginBottom: 12 },
    progressTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    progressSub: { color: isDark ? '#BFDBFE' : '#BFDBFE', fontSize: 14, marginBottom: 12, opacity: 0.8 },
    progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4 },
    progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },

    mockExamCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B981',
      padding: 20,
      borderRadius: 20,
      marginBottom: 12,
      shadowColor: '#10B981',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    customMockCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#8B5CF6',
      padding: 20,
      borderRadius: 20,
      marginBottom: 24,
      shadowColor: '#8B5CF6',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    mockExamIcon: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    mockExamInfo: { flex: 1 },
    mockExamTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    mockExamSub: { color: '#D1FAE5', fontSize: 12 },
    customMockSub: { color: '#EDE9FE', fontSize: 12 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    moduleCard: {
      backgroundColor: colors.surface,
      width: '48%',
      padding: 20,
      borderRadius: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    iconContainer: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    moduleTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    moduleTasks: { fontSize: 12, color: colors.subtext },

    activityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    activityIcon: { marginRight: 12 },
    activityInfo: { flex: 1 },
    activityTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
    activityTime: { fontSize: 12, color: colors.subtext, marginTop: 2 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12 },
    statBox: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border
    },
    statValue: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginLeft: 8 },
    statLabel: { fontSize: 12, color: colors.subtext, marginLeft: 8 },

    mistakesCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#450a0a' : '#fef2f2',
      padding: 20,
      borderRadius: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isDark ? '#991b1b' : '#fecaca',
    },
    mistakesIcon: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    mistakesInfo: { flex: 1 },
    mistakesTitle: { color: isDark ? '#f87171' : '#b91c1c', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    mistakesSub: { color: isDark ? '#fca5a5' : '#ef4444', fontSize: 12 },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView contentContainerStyle={dynamicStyles.scroll}>

        {/* Header with User Name */}
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.welcomeText}>Welcome back,</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={dynamicStyles.userName}>{userName}</Text>
              <Animated.Text style={[dynamicStyles.userName, { transform: [{ rotate: waveRotation }], marginLeft: 8 }]}>
                👋
              </Animated.Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/profile'); }}>
            <Animated.View style={[dynamicStyles.profileButton, {
              transform: [{ scale: pulseAnim }],
              borderColor: '#c09c32',
              borderWidth: 2,
              overflow: 'hidden'
            }]}>
              <Image source={require('../../assets/images/icon.png')} style={dynamicStyles.avatarImage} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* User Stats Row */}
        <View style={dynamicStyles.statsRow}>
          <View style={dynamicStyles.statBox}>
            <MaterialCommunityIcons name="fire" size={24} color={streak > 0 ? "#F97316" : colors.subtext} />
            <View>
              <Text style={dynamicStyles.statValue}>{streak}</Text>
              <Text style={dynamicStyles.statLabel}>Day Streak</Text>
            </View>
          </View>
          <View style={dynamicStyles.statBox}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
            <View>
              <Text style={dynamicStyles.statValue}>{totalStudyTime}m</Text>
              <Text style={dynamicStyles.statLabel}>Total Study</Text>
            </View>
          </View>
        </View>

        {/* Progress Report (Private First Attempts) */}
        <View style={dynamicStyles.progressReportCard}>
          <Text style={dynamicStyles.prTitle}>Progress report</Text>
          <View style={dynamicStyles.prRow}>
            <View style={dynamicStyles.prLabelContainer}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color="#10B981" />
              <Text style={dynamicStyles.prLabel}>Correct questions</Text>
            </View>
            <Text style={[dynamicStyles.prValue, { color: '#10B981' }]}>{cfa}</Text>
          </View>
          <View style={dynamicStyles.prRow}>
            <View style={dynamicStyles.prLabelContainer}>
              <MaterialCommunityIcons name="close-circle-outline" size={20} color="#EF4444" />
              <Text style={dynamicStyles.prLabel}>Incorrect questions</Text>
            </View>
            <Text style={[dynamicStyles.prValue, { color: '#EF4444' }]}>{ffa}</Text>
          </View>
        </View>

        {/* Daily Progress Card */}
        <TouchableOpacity
          style={dynamicStyles.progressCard}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/daily-goals'); }}
        >
          <View style={dynamicStyles.progressInfo}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={dynamicStyles.progressTitle}>Daily Goal</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
            </View>
            <Text style={dynamicStyles.progressSub}>{cfa + ffa} / {totalGoalQuestions} questions completed</Text>
          </View>
          <View style={dynamicStyles.progressBarBg}>
            <View style={[dynamicStyles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>
        </TouchableOpacity>

        {/* Mock Exam Section */}
        <TouchableOpacity
          style={dynamicStyles.mockExamCard}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/module/mock-exam'); }}
        >
          <View style={dynamicStyles.mockExamIcon}>
            <MaterialCommunityIcons name="file-document-edit-outline" size={32} color="#fff" />
          </View>
          <View style={dynamicStyles.mockExamInfo}>
            <Text style={dynamicStyles.mockExamTitle}>Full Mock Exam</Text>
            <Text style={dynamicStyles.mockExamSub}>Timed practice with all 20+ task types</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Custom Mock Exam Section */}
        <TouchableOpacity
          style={dynamicStyles.customMockCard}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/custom-mock'); }}
        >
          <View style={dynamicStyles.mockExamIcon}>
            <MaterialCommunityIcons name="cog-outline" size={32} color="#fff" />
          </View>
          <View style={dynamicStyles.mockExamInfo}>
            <Text style={dynamicStyles.mockExamTitle}>Custom Mock Test</Text>
            <Text style={dynamicStyles.customMockSub}>Select specific questions to practice</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Mistakes Bank Section */}
        <TouchableOpacity
          style={dynamicStyles.mistakesCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/module/mistakes');
          }}
        >
          <View style={dynamicStyles.mistakesIcon}>
            <MaterialCommunityIcons name="alert-decagram" size={32} color="#fff" />
          </View>
          <View style={dynamicStyles.mistakesInfo}>
            <Text style={dynamicStyles.mistakesTitle}>Review Mistakes</Text>
            <Text style={dynamicStyles.mistakesSub}>{mistakeCount} questions in your private bank</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? '#f87171' : '#b91c1c'} />
        </TouchableOpacity>

        {/* Practice Modules Grid */}
        <Text style={dynamicStyles.sectionTitle}>Practice Modules</Text>
        <View style={dynamicStyles.grid}>
          {PRACTICE_MODULES.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={dynamicStyles.moduleCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/module/${module.id}`); }}
            >
              <View style={[dynamicStyles.iconContainer, { backgroundColor: isDark ? `${module.color}30` : `${module.color}15` }]}>
                <Ionicons name={module.icon as any} size={28} color={isDark ? colors.primary : module.color} />
              </View>
              <Text style={dynamicStyles.moduleTitle}>{module.displayTitle || module.title}</Text>
              <Text style={dynamicStyles.moduleTasks}>{module.tasks.length} Exercises Available</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        {recentActivity && (
          <>
            <Text style={dynamicStyles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity
              style={dynamicStyles.activityCard}
              onPress={() => router.push(`/module/${recentActivity.moduleId}?startIndex=${recentActivity.questionIndex}`)}
            >
              <View style={dynamicStyles.activityIcon}>
                <Ionicons name="time-outline" size={24} color={colors.primary} />
              </View>
              <View style={dynamicStyles.activityInfo}>
                <Text style={dynamicStyles.activityTitle}>{recentActivity.moduleTitle}</Text>
                <Text style={dynamicStyles.activityTime}>
                  {formatTimeAgo(recentActivity.timestamp)} • Continue at Q{recentActivity.questionIndex + 1}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
