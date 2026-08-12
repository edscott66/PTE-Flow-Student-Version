import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { motion, AnimatePresence } from 'motion/react';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';
import { generateDailyGoals } from '../logic/daily_goals_engine';
import { scoreService, PerformanceMetrics } from '../services/scoreService';
import CustomLoader from '../components/CustomLoader';
import { useTheme } from '../context/ThemeContext';

interface DailyGoalTask {
  task_name: string;
  skill_trained: string;
  why_it_matters_for_pte: string;
  estimated_time_minutes: number;
  module_id: string;
}

interface DailyGoalsData {
  daily_goals: DailyGoalTask[];
  adaptive_adjustments: string;
  micro_feedback: string;
  progress_signals: string[];
  weekly_link: string;
  readiness_score: number;
}

const MotionView = (props: any) => {
  if (Platform.OS === 'web') {
    const Component = motion.create(View);
    return <Component {...props} />;
  }
  // On native, motion often causes addEventListener issues.
  // We strip motion props and return a regular View.
  const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
  return <View {...rest} />;
};

// Cross-platform helper to get API base URL
const getApiBaseUrl = (): string => {
  // For native platforms, use the stored URL or API_BASE_URL
  if (Platform.OS !== 'web') {
    return API_BASE_URL;
  }
  
  // For web platform only, try to get the current origin
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  
  // Fallback for any other case
  return API_BASE_URL;
};

export default function DailyGoalsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DailyGoalsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeAvailable, setTimeAvailable] = useState(15);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [streak, setStreak] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'local'>('local');
  const [userPerformance, setUserPerformance] = useState<PerformanceMetrics | null>(null);
  const { colors, isDark } = useTheme();

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    backBtn: {
      padding: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    placeholder: {
      width: 40,
    },
    prefsCard: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    prefsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.subtext,
      marginBottom: 8,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: isDark ? colors.border : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      color: colors.subtext,
      fontWeight: '600',
    },
    activeChipText: {
      color: '#fff',
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.background,
    },
    loadingTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginTop: 20,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 16,
      color: colors.subtext,
      fontWeight: '500',
    },
    loadingSubText: {
      marginTop: 8,
      fontSize: 12,
      color: colors.subtext,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    errorText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.subtext,
      textAlign: 'center',
      marginBottom: 8,
    },
    apiUrlInfo: {
      fontSize: 12,
      color: colors.subtext,
      textAlign: 'center',
      marginBottom: 24,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    retryBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    retryBtnText: {
      color: '#fff',
      fontWeight: '700',
    },
    settingsBtn: {
      marginTop: 20,
      padding: 12,
    },
    settingsBtnText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    apiSettingsContainer: {
      position: 'absolute',
      top: '20%',
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
      zIndex: 100,
      borderWidth: 1,
      borderColor: colors.border,
    },
    apiSettingsTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    apiSettingsSub: { fontSize: 14, color: colors.subtext, marginBottom: 20, lineHeight: 20 },
    apiInput: {
      backgroundColor: isDark ? colors.background : '#F8FAFC',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 14,
      color: colors.text,
      marginBottom: 20,
    },
    apiSettingsButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
    apiButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginLeft: 12 },
    cancelButton: { backgroundColor: isDark ? colors.border : '#F1F5F9' },
    cancelButtonText: { color: colors.subtext, fontWeight: '600' },
    saveButton: { backgroundColor: colors.primary },
    saveButtonText: { color: '#fff', fontWeight: '600' },
    feedbackCard: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    feedbackHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    feedbackTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
      marginLeft: 8,
    },
    feedbackText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 16,
    },
    adjustmentBadge: {
      backgroundColor: isDark ? '#1E3A8A40' : '#EFF6FF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    adjustmentText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 16,
    },
    explainerCard: {
      backgroundColor: isDark ? '#1E3A8A30' : '#EFF6FF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isDark ? '#2563EB40' : '#BFDBFE',
    },
    explainerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? '#BFDBFE' : '#1E3A8A',
      marginBottom: 6,
    },
    explainerText: {
      fontSize: 14,
      color: isDark ? colors.subtext : '#1E40AF',
      lineHeight: 20,
    },
    taskCard: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    taskIconContainer: {
      width: 48,
      height: 48,
      backgroundColor: isDark ? colors.background : '#F1F5F9',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    taskInfo: {
      flex: 1,
    },
    taskName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    taskSkill: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
      marginBottom: 4,
    },
    taskWhy: {
      fontSize: 13,
      color: colors.subtext,
      lineHeight: 18,
      marginBottom: 8,
    },
    taskFooter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    taskTime: {
      fontSize: 12,
      color: colors.subtext,
      marginLeft: 4,
      fontWeight: '500',
    },
    startBtn: {
      width: 36,
      height: 36,
      backgroundColor: colors.primary,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 12,
    },
    signalsCard: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 20,
      marginTop: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    signalsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    signalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    signalText: {
      fontSize: 14,
      color: colors.subtext,
      marginLeft: 10,
      fontWeight: '500',
    },
    weeklyCard: {
      backgroundColor: isDark ? '#4C1D9530' : '#F5F3FF',
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? '#7C3AED40' : '#DDD6FE',
    },
    weeklyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    weeklyTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: '#7C3AED',
      marginLeft: 8,
    },
    weeklyText: {
      fontSize: 14,
      color: isDark ? colors.subtext : '#5B21B6',
      lineHeight: 20,
      fontWeight: '500',
    },
    sourceBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    sourceLocal: {
      backgroundColor: isDark ? '#92400E40' : '#FEF3C7',
    },
    sourceApi: {
      backgroundColor: isDark ? '#065F4640' : '#DCFCE7',
    },
    sourceText: {
      fontSize: 10,
      fontWeight: '700',
      color: isDark ? '#F59E0B' : '#92400E',
      textTransform: 'uppercase',
    },
    scoreBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
    },
    scoreValue: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.primary,
    },
    scoreLabel: {
      fontSize: 8,
      fontWeight: '700',
      color: colors.subtext,
      textTransform: 'uppercase',
    },
    analysisCard: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    analysisTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    statsGrid: {
      gap: 16,
    },
    statItem: {
      marginBottom: 12,
    },
    statLabel: {
      fontSize: 12,
      color: colors.subtext,
      fontWeight: '600',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 12,
      color: colors.text,
      fontWeight: 'bold',
      marginTop: 4,
      textAlign: 'right',
    },
    barBg: {
      height: 6,
      backgroundColor: isDark ? colors.border : '#E2E8F0',
      borderRadius: 3,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    analysisHelper: {
      fontSize: 12,
      color: colors.subtext,
      marginTop: 12,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 24,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statInfo: {
      marginLeft: 10,
    },
    dailyStatValue: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    dailyStatLabel: {
      fontSize: 10,
      color: colors.subtext,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
  }), [colors, isDark]);

  useEffect(() => {
    const init = async () => {
      // Load user performance first
      const perf = await scoreService.getPerformance();
      setUserPerformance(perf);

      const currentStreak = await scoreService.getStreak();
      setStreak(currentStreak);
      
      const studyTime = await scoreService.getTotalStudyTime();
      setTotalStudyTime(studyTime);

      let currentUrl = '';
      let savedUrl = await AsyncStorage.getItem('pte_flow_api_url');
      
      // Migration: if saved URL is 'ais-dev', clear it to use the new corrected API_BASE_URL
      if (savedUrl && savedUrl.includes('ais-dev-')) {
        console.log('[DEBUG] Clearing stale ais-dev URL to migration to ais-pre');
        await AsyncStorage.removeItem('pte_flow_api_url');
        savedUrl = null;
      }

      if (savedUrl) {
        currentUrl = savedUrl;
        setApiUrl(savedUrl);
      } else {
        currentUrl = API_BASE_URL;
        setApiUrl(API_BASE_URL);
      }
      
      console.log(`[DEBUG] Initializing with API URL: ${currentUrl}`);
      fetchGoals(currentUrl);
    };
    init();
  }, [timeAvailable, level]);

  const saveApiUrl = async (url: string) => {
    const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    await AsyncStorage.setItem('pte_flow_api_url', formattedUrl);
    setApiUrl(formattedUrl);
    setShowApiSettings(false);
    fetchGoals(formattedUrl);
  };

  const fetchGoals = async (overrideUrl?: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[DEBUG] Starting fetchGoals...');
      
      const activeUrl = overrideUrl !== undefined ? overrideUrl : apiUrl;
      // FIXED: Cross-platform URL construction without window reference
      let fetchUrl = activeUrl ? `${activeUrl}/api/daily-goals` : `${getApiBaseUrl()}/api/daily-goals`;
      
      console.log(`[DEBUG] Platform: ${Platform.OS}, Fetch URL: ${fetchUrl}`);
      
      // Get the most up-to-date performance
      const perf = await scoreService.getPerformance();
      setUserPerformance(perf);

      try {
        // Add timeout for fetch to prevent hanging on native
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(fetchUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            performance: perf,
            level: level,
            time_available: timeAvailable
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response. Check your API URL.');
          }
          const result = await response.json();
          console.log('[DEBUG] Successfully fetched goals from API');
          setData(result);
          setDataSource('api');
          setLoading(false);
          return;
        } else {
          console.warn(`[DEBUG] API failed with status ${response.status}. Falling back locally.`);
        }
      } catch (fetchErr) {
        console.warn('[DEBUG] API Fetch Error. Falling back locally.', fetchErr instanceof Error ? fetchErr.message : fetchErr);
      }

      // Local Engine Fallback (BULLETPROOF MODE)
      console.log('[DEBUG] Generating goals using local engine based on real performance...');
      const localResult = generateDailyGoals(
        perf,
        level as any,
        timeAvailable
      );
      setData(localResult);
      setDataSource('local');

    } catch (err) {
      console.error('[DEBUG] Fatal error in fetchGoals:', err);
      setError(err instanceof Error ? err.message : 'Could not load goals.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <CustomLoader message="Generating your adaptive goals..." />
      </View>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Daily Goals</Text>
          <TouchableOpacity onPress={() => setShowApiSettings(true)}>
             <MaterialCommunityIcons name="cog-outline" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.apiUrlInfo}>Attempting to connect to: {apiUrl || '(Relative Path)'}</Text>
          
          <View style={{ width: '100%', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity style={styles.retryBtn} onPress={() => fetchGoals()}>
              <Text style={styles.retryBtnText}>Retry Connection</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingsBtn} 
              onPress={() => setShowApiSettings(true)}
            >
              <Text style={styles.settingsBtnText}>Open Connection Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showApiSettings && (
          <View style={styles.apiSettingsContainer}>
            <Text style={styles.apiSettingsTitle}>Configuration</Text>
            <Text style={styles.apiSettingsSub}>
              Enter your app's public URL if goals aren't loading.
            </Text>
            <TextInput
              style={styles.apiInput}
              placeholder="https://...run.app"
              value={apiUrl}
              onChangeText={setApiUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.apiSettingsButtons}>
              <TouchableOpacity 
                style={[styles.apiButton, styles.cancelButton]} 
                onPress={() => setShowApiSettings(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.apiButton, styles.saveButton]} 
                onPress={() => saveApiUrl(apiUrl)}
              >
                <Text style={styles.saveButtonText}>Apply URL</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Daily Goals</Text>
          <View style={styles.placeholder} />
        </View>

        {/* STATS SECTION */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="fire" size={24} color={streak > 0 ? "#F97316" : colors.subtext} />
            <View style={styles.statInfo}>
              <Text style={styles.dailyStatValue}>{streak}</Text>
              <Text style={styles.dailyStatLabel}>Day Streak</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#2563EB" />
            <View style={styles.statInfo}>
              <Text style={styles.dailyStatValue}>{totalStudyTime}m</Text>
              <Text style={styles.dailyStatLabel}>Total Study</Text>
            </View>
          </View>
        </View>

        {/* PREFERENCES SECTION */}
        <View style={styles.prefsCard}>
          <Text style={styles.prefsTitle}>Personalize Your Daily Plan</Text>
          
          <Text style={styles.label}>Time Available Today</Text>
          <View style={styles.chipContainer}>
            {[10, 15, 20, 30].map((t) => (
              <TouchableOpacity 
                key={t} 
                style={[styles.chip, timeAvailable === t && styles.activeChip]}
                onPress={() => setTimeAvailable(t)}
              >
                <Text style={[styles.chipText, timeAvailable === t && styles.activeChipText]}>{t}m</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Target Level</Text>
          <View style={styles.chipContainer}>
            {['beginner', 'intermediate', 'advanced'].map((l) => (
              <TouchableOpacity 
                key={l} 
                style={[styles.chip, level === l && styles.activeChip]}
                onPress={() => setLevel(l as any)}
              >
                <Text style={[styles.chipText, level === l && styles.activeChipText]}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <MotionView 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.feedbackCard}
        >
          <View style={styles.header}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="robot" size={24} color="#2563EB" />
              <Text style={styles.feedbackTitle}>AI Adaptive Engine</Text>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreValue}>{data.readiness_score}</Text>
              <Text style={styles.scoreLabel}>Readiness</Text>
            </View>
            <View style={[styles.sourceBadge, dataSource === 'local' ? styles.sourceLocal : styles.sourceApi, { marginLeft: 12 }]}>
              <Text style={styles.sourceText}>
                {dataSource === 'local' ? 'Local' : 'Cloud'}
              </Text>
            </View>
          </View>
          <Text style={styles.feedbackText}>{data.micro_feedback}</Text>
          <View style={styles.adjustmentBadge}>
            <Text style={styles.adjustmentText}>{data.adaptive_adjustments}</Text>
          </View>
        </MotionView>

        {/* PERFORMANCE ANALYSIS SECTION */}
        {userPerformance && (
          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>Current PTE Performance Profile</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Fluency</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${userPerformance.fluency}%` }]} />
                </View>
                <Text style={styles.statValue}>{userPerformance.fluency}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Recall</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${userPerformance.listening_recall}%` }]} />
                </View>
                <Text style={styles.statValue}>{userPerformance.listening_recall}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Grammar</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${userPerformance.grammar}%` }]} />
                </View>
                <Text style={styles.statValue}>{userPerformance.grammar}</Text>
              </View>
            </View>
            <Text style={styles.analysisHelper}>
              The engine automatically prioritizes weak areas to maximize your total score.
            </Text>
          </View>
        )}

        <View style={styles.explainerCard}>
          <MaterialCommunityIcons name="information" size={24} color="#3B82F6" style={{marginBottom: 8}}/>
          <Text style={styles.explainerTitle}>How Daily Goals Work</Text>
          <Text style={styles.explainerText}>
            Our adaptive engine analyzes your weakest areas and selects the highest-impact PTE tasks to improve your overall score. You don't need to memorize answers; instead, the randomizer provides varied questions to train your core skills (like fluency, grammar, and recall).
          </Text>
          <Text style={[styles.explainerText, {marginTop: 8, fontWeight: 'bold'}]}>
            Tap "Start Task" on any of the focus areas below to begin your personalized daily training.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Today's Focus Tasks</Text>
        {data.daily_goals.map((task, index) => (
          <MotionView
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={styles.taskCard}
          >
            <View style={styles.taskIconContainer}>
              <MaterialCommunityIcons 
                name={getIconForSkill(task.skill_trained)} 
                size={24} 
                color="#2563EB" 
              />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>{task.task_name}</Text>
              <Text style={styles.taskSkill}>{task.skill_trained}</Text>
              <Text style={styles.taskWhy}>{task.why_it_matters_for_pte}</Text>
              <View style={styles.taskFooter}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#64748B" />
                <Text style={styles.taskTime}>{task.estimated_time_minutes} mins</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.startBtn}
              onPress={() => router.push({ pathname: `/module/${task.module_id || 'mock-exam'}` as any, params: { startIndex: 'random' } })}
            >
              <MaterialCommunityIcons name="play" size={20} color="#fff" />
            </TouchableOpacity>
          </MotionView>
        ))}

        <View style={styles.signalsCard}>
          <Text style={styles.signalsTitle}>Progress Signals to Track</Text>
          {data.progress_signals.map((signal, index) => (
            <View key={index} style={styles.signalItem}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={18} color="#10B981" />
              <Text style={styles.signalText}>{signal}</Text>
            </View>
          ))}
        </View>

        <View style={styles.weeklyCard}>
          <View style={styles.weeklyHeader}>
            <MaterialCommunityIcons name="calendar-check" size={20} color="#7C3AED" />
            <Text style={styles.weeklyTitle}>Weekly Link</Text>
          </View>
          <Text style={styles.weeklyText}>{data.weekly_link}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getIconForSkill(skill: string) {
  switch (skill.toLowerCase()) {
    case 'speaking fluency': return 'microphone';
    case 'pronunciation consistency': return 'account-voice';
    case 'listening recall': return 'ear-hearing';
    case 'reading speed & scanning': return 'book-open-variant';
    case 'writing accuracy': return 'pencil';
    case 'vocabulary range': return 'format-list-bulleted-type';
    case 'grammar control': return 'script-text-outline';
    default: return 'target';
  }
}