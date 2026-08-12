import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { scoreService, PerformanceMetrics } from '@/services/scoreService';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DonutChart = ({ percentage, color, radius = 40, strokeWidth = 8, title }: { percentage: number, color: string, radius?: number, strokeWidth?: number, title: string }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const halfCircle = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [percentage]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <Svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2} viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}>
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeOpacity={0.2}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <AnimatedCircle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', paddingBottom: 25 }]}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#1E293B', position: 'absolute', top: '35%' }}>
          {percentage}%
        </Text>
      </View>
      <Text style={{ marginTop: 10, fontSize: 13, fontWeight: '600', color: '#64748B', textAlign: 'center', maxWidth: 100 }}>
        {title}
      </Text>
    </View>
  );
};

export default function Profile() {
  const [userName, setUserName] = useState('PTE Student');
  const [score, setScore] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  
  const [targetScore, setTargetScore] = useState(79);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTarget, setNewTarget] = useState('');
  const { colors, isDark } = useTheme();

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const name = await scoreService.getUserName();
        const s = await scoreService.getScore();
        const attempted = await scoreService.getAttemptedQuestions();
        const tScore = await scoreService.getTargetScore();
        const perf = await scoreService.getPerformance();
        
        if (name) setUserName(name);
        setScore(s);
        setAttemptedCount(attempted.length);
        setTargetScore(tScore);
        setPerformance(perf);
      };
      loadData();
    }, [])
  );

  const handleTargetScoreTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNewTarget(targetScore.toString());
    setIsEditingTarget(true);
  };

  const saveTargetScore = async () => {
    const parsed = parseInt(newTarget, 10);
    if (!isNaN(parsed) && parsed >= 10 && parsed <= 90) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTargetScore(parsed);
      await scoreService.setTargetScore(parsed);
      setIsEditingTarget(false);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid Score", "Please enter a valid PTE score between 10 and 90.");
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: colors.text },
    
    profileCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 30, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.border, marginBottom: 16, overflow: 'hidden' },
    name: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    targetWrapper: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderRadius: 20 },
    target: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    statCard: { backgroundColor: colors.surface, width: '48%', padding: 20, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    statNum: { fontSize: 28, fontWeight: '900', color: colors.primary, marginBottom: 4 },
    statNumGreen: { fontSize: 28, fontWeight: '900', color: colors.success, marginBottom: 4 },
    statLabel: { fontSize: 11, fontWeight: 'bold', color: '#94A3B8', letterSpacing: 1 },
  
    sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16, color: colors.text },
    chartGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', backgroundColor: colors.surface, padding: 20, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: colors.subtext, marginBottom: 20, textAlign: 'center' },
    modalInput: { width: 120, height: 70, backgroundColor: isDark ? colors.border : '#F1F5F9', borderRadius: 16, fontSize: 36, fontWeight: '900', textAlign: 'center', color: colors.primary, marginBottom: 24 },
    modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    modalCancel: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', marginRight: 8, backgroundColor: isDark ? '#334155' : '#E2E8F0' },
    modalCancelText: { color: colors.subtext, fontWeight: 'bold', fontSize: 16 },
    modalSave: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', marginLeft: 8, backgroundColor: colors.primary },
    modalSaveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView contentContainerStyle={dynamicStyles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={dynamicStyles.header}>My Dashboard</Text>
  
        <View style={dynamicStyles.profileCard}>
          <Image source={require('../../assets/images/icon.png')} style={dynamicStyles.avatar} />
          <Text style={dynamicStyles.name}>{userName}</Text>
          <TouchableOpacity onPress={handleTargetScoreTap} style={dynamicStyles.targetWrapper} activeOpacity={0.7}>
            <Text style={dynamicStyles.target}>Target Score: {targetScore} <MaterialCommunityIcons name="pencil" size={14} color={colors.primary} /></Text>
          </TouchableOpacity>
        </View>
  
        <View style={dynamicStyles.statsRow}>
          <View style={dynamicStyles.statCard}>
            <Text style={dynamicStyles.statNum}>{attemptedCount}</Text>
            <Text style={dynamicStyles.statLabel}>EXERCISES</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Text style={dynamicStyles.statNumGreen}>{score}</Text>
            <Text style={dynamicStyles.statLabel}>TOTAL SCORE</Text>
          </View>
        </View>
  
        <Text style={dynamicStyles.sectionTitle}>Performance Analytics</Text>
        
        {performance ? (
          <View style={dynamicStyles.chartGrid}>
            <DonutChart 
              percentage={Math.round(performance.vocabulary)} 
              color={colors.primary} 
              title="Vocabulary Expansion" 
            />
            <DonutChart 
              percentage={Math.round(performance.grammar)} 
              color="#F97316" 
              title="Grammar Accuracy" 
            />
            <DonutChart 
              percentage={Math.round(performance.fluency)} 
              color={colors.success} 
              title="Fluency & Rhythm" 
            />
            <DonutChart 
              percentage={Math.round(performance.pronunciation)} 
              color="#8B5CF6" 
              title="Pronunciation Clarity" 
            />
          </View>
        ) : (
          <Text style={{color: colors.subtext}}>Complete some modules to view your analytics.</Text>
        )}
        <View style={{height: 40}} />
      </ScrollView>
  
      <Modal visible={isEditingTarget} transparent={true} animationType="fade">
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>Set Target Score</Text>
            <Text style={dynamicStyles.modalSubtitle}>What is your goal for the official PTE exam?</Text>
            
            <TextInput
              style={dynamicStyles.modalInput}
              keyboardType="number-pad"
              value={newTarget}
              onChangeText={setNewTarget}
              maxLength={2}
              autoFocus
            />
            
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity style={dynamicStyles.modalCancel} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsEditingTarget(false); }}>
                <Text style={dynamicStyles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={dynamicStyles.modalSave} onPress={saveTargetScore}>
                <Text style={dynamicStyles.modalSaveText}>Save Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  
    </SafeAreaView>
  );
}
