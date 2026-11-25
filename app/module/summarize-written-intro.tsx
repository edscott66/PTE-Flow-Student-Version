import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const SUMMARIZE_WRITTEN_LEVELS = [
  { level: 'A1', name: 'Beginner', range: 'Questions 1–25', startIndex: 0 },
  { level: 'A2', name: 'Elementary', range: 'Questions 26–50', startIndex: 25 },
  { level: 'B1', name: 'Intermediate', range: 'Questions 51–90', startIndex: 50 },
  { level: 'B1+', name: 'Upper Intermediate', range: 'Questions 91–130', startIndex: 90 },
  { level: 'C1', name: 'Advanced', range: 'Questions 131–140', startIndex: 130 },
  { level: 'C2', name: 'Proficient', range: 'Questions 141–150', startIndex: 140 },
];

export default function SummarizeWrittenIntroScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 14,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 42,
      height: 42,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    headerTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
      marginRight: 42,
    },
    content: { padding: 20, paddingBottom: 30 },
    hero: {
      alignItems: 'center',
      paddingVertical: 22,
      paddingHorizontal: 18,
      marginBottom: 22,
      borderRadius: 20,
      backgroundColor: colors.primary + '12',
    },
    heroIcon: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '20',
      marginBottom: 14,
    },
    title: {
      color: colors.text,
      fontSize: 25,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      color: colors.subtext,
      fontSize: 15,
      lineHeight: 23,
      textAlign: 'center',
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
    },
    levelCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 13,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 9,
    },
    levelBadge: {
      width: 48,
      height: 42,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '15',
      marginRight: 13,
    },
    levelCode: { color: colors.primary, fontSize: 14, fontWeight: '800' },
    levelName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 3,
    },
    levelRange: { color: colors.subtext, fontSize: 12 },
    infoCard: {
      backgroundColor: isDark ? colors.surface : colors.primary + '08',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 15,
      marginTop: 10,
      marginBottom: 20,
    },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 13 },
    infoText: {
      flex: 1,
      color: colors.subtext,
      fontSize: 13,
      lineHeight: 20,
      marginLeft: 10,
    },
    startButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    startButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      marginRight: 9,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Summarize Written Text</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons
              name="file-document-edit-outline"
              size={34}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>Develop Your Summarising Skills</Text>
          <Text style={styles.subtitle}>
            Build your ability to understand a passage, identify its main ideas, and express them
            clearly in one sentence through 150 exercises across six levels.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Your Six Difficulty Levels</Text>

        {SUMMARIZE_WRITTEN_LEVELS.map((item) => (
          <TouchableOpacity
            key={item.level}
            style={styles.levelCard}
            onPress={() =>
              router.push(`/module/summarize-written?startIndex=${item.startIndex}` as any)
            }
            accessibilityRole="button"
            accessibilityLabel={`Start ${item.level} ${item.name}, ${item.range}`}
          >
            <View style={styles.levelBadge}>
              <Text style={styles.levelCode}>{item.level}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.levelName}>{item.name}</Text>
              <Text style={styles.levelRange}>{item.range}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.subtext} />
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="trending-up" size={21} color={colors.primary} />
            <Text style={styles.infoText}>
              Start with shorter, simpler passages and gradually progress to longer and more
              demanding academic texts.
            </Text>
          </View>
          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <MaterialCommunityIcons
              name="comment-check-outline"
              size={21}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              Each response is assessed with feedback and a model answer appropriate to your
              learning level.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/module/summarize-written' as any)}
          accessibilityRole="button"
          accessibilityLabel="Start Summarize Written Text exercises"
        >
          <Text style={styles.startButtonText}>Start Summarize Written Text Exercises</Text>
          <MaterialCommunityIcons name="arrow-right" size={21} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
