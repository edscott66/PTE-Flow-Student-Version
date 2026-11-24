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

const ESSAY_LEVELS = [
  { level: 'A1', name: 'Beginner', range: 'Questions 1–25', startIndex: 0 },
  { level: 'A2', name: 'Elementary', range: 'Questions 26–50', startIndex: 25 },
  { level: 'B1', name: 'Intermediate', range: 'Questions 51–90', startIndex: 50 },
  { level: 'B1+', name: 'Upper Intermediate', range: 'Questions 91–130', startIndex: 90 },
  { level: 'C1', name: 'Advanced', range: 'Questions 131–140', startIndex: 130 },
  { level: 'C2', name: 'Proficient', range: 'Questions 141–150', startIndex: 140 },
];

export default function EssayIntroScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
    content: {
      padding: 20,
      paddingBottom: 30,
    },
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
      marginRight: 12,
    },
    levelCode: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '800',
    },
    levelName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    levelRange: {
      color: colors.subtext,
      fontSize: 12,
      marginTop: 3,
    },
    infoCard: {
      backgroundColor: isDark ? colors.surface : '#F8FAFC',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginTop: 12,
      marginBottom: 22,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    infoText: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      lineHeight: 21,
      marginLeft: 10,
    },
    startButton: {
      minHeight: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: 20,
    },
    startButtonText: {
      color: '#FFFFFF',
      fontSize: 17,
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
        <Text style={styles.headerTitle}>Essay Writing</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="file-document-edit-outline" size={34} color={colors.primary} />
          </View>
          <Text style={styles.title}>Develop Your Writing Skills</Text>
          <Text style={styles.subtitle}>
            Develop your English writing skills through 150 essay exercises, organised across six levels.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Your Six Difficulty Levels</Text>

        {ESSAY_LEVELS.map((item) => (
          <TouchableOpacity
            key={item.level}
            style={styles.levelCard}
            onPress={() => router.push(`/module/essay?startIndex=${item.startIndex}` as any)}
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
              Start with simple writing exercises and gradually progress towards more advanced essay writing.
            </Text>
          </View>
          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <MaterialCommunityIcons name="comment-check-outline" size={21} color={colors.primary} />
            <Text style={styles.infoText}>
              Your work will be assessed with feedback and a model answer appropriate to your level.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/module/essay' as any)}
          accessibilityRole="button"
          accessibilityLabel="Start essay exercises"
        >
          <Text style={styles.startButtonText}>Start Essay Exercises</Text>
          <MaterialCommunityIcons name="arrow-right" size={21} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
