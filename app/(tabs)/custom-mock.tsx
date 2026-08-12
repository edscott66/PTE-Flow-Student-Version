import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const AVAILABLE_SECTIONS = [
  { id: 'readAloud', name: 'Read Aloud', category: 'Speaking' },
  { id: 'repeatSentence', name: 'Repeat Sentence', category: 'Speaking' },
  { id: 'describeImage', name: 'Describe Image', category: 'Speaking' },
  { id: 'summarizeWritten', name: 'Summarize Written Text', category: 'Writing' },
  { id: 'fillBlanksRW', name: 'Fill Blanks (R&W)', category: 'Reading' },
  { id: 'reorderParagraphs', name: 'Re-order Paragraphs', category: 'Reading' },
  { id: 'fillBlanksListening', name: 'Fill Blanks (Listening)', category: 'Listening' },
  { id: 'writeDictation', name: 'Write From Dictation', category: 'Listening' },
];

export default function CustomMockPlanner() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>(
    AVAILABLE_SECTIONS.reduce((acc, sec) => ({ ...acc, [sec.id]: true }), {})
  );
  
  const [questionCounts, setQuestionCounts] = useState<Record<string, string>>(
    AVAILABLE_SECTIONS.reduce((acc, sec) => ({ ...acc, [sec.id]: '2' }), {})
  );

  const toggleSection = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const startCustomMock = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // We pass the configuration as a JSON string to the mock exam engine route
    // The engine isn't heavily modified yet, but we will pass the params
    const config = Object.keys(selectedSections)
      .filter(id => selectedSections[id])
      .map(id => ({
        id,
        count: parseInt(questionCounts[id] || '2', 10)
      }));

    if (config.length === 0) {
      alert("Please select at least one module to test.");
      return;
    }

    // Pass custom mock setup
    router.push({
      pathname: '/module/[id]',
      params: { 
        id: 'mock-exam', 
        isMock: 'true',
        customConfig: JSON.stringify(config)
      }
    });
  };

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8, paddingHorizontal: 20 },
    subtitle: { fontSize: 14, color: colors.subtext, marginBottom: 20, paddingHorizontal: 20 },
    
    card: { backgroundColor: colors.surface, padding: 16, marginHorizontal: 20, marginBottom: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    cardLeft: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
    cardCategory: { fontSize: 12, color: colors.primary, fontWeight: '700', textTransform: 'uppercase' },
    
    controlsPart: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    inputBadge: { backgroundColor: isDark ? colors.border : '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
    input: { color: colors.text, fontWeight: '800', fontSize: 16, minWidth: 20, textAlign: 'center' },
    inputLabel: { fontSize: 12, color: colors.subtext, marginLeft: 4, fontWeight: '600' },
    
    startButton: { backgroundColor: colors.primary, marginHorizontal: 20, marginTop: 10, marginBottom: 40, padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    startText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <Text style={dynamicStyles.header}>Custom Mock Exam</Text>
      <Text style={dynamicStyles.subtitle}>Design your own practice test. Select the modules and how many questions you want to face.</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {AVAILABLE_SECTIONS.map((section) => (
          <TouchableOpacity 
            key={section.id} 
            style={[dynamicStyles.card, { opacity: selectedSections[section.id] ? 1 : 0.5 }]} 
            activeOpacity={0.8}
            onPress={() => toggleSection(section.id)}
          >
            <View style={dynamicStyles.cardLeft}>
              <Text style={dynamicStyles.cardTitle}>{section.name}</Text>
              <Text style={dynamicStyles.cardCategory}>{section.category}</Text>
            </View>
            
            <View style={dynamicStyles.controlsPart}>
              {selectedSections[section.id] && (
                <View style={dynamicStyles.inputBadge}>
                  <TextInput 
                    style={dynamicStyles.input}
                    value={questionCounts[section.id]}
                    onChangeText={(v) => {
                      if (/^\d*$/.test(v)) setQuestionCounts(prev => ({...prev, [section.id]: v}));
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    onPressIn={(e) => e.stopPropagation()}
                  />
                  <Text style={dynamicStyles.inputLabel}>Qs</Text>
                </View>
              )}
              <Switch 
                value={selectedSections[section.id]} 
                onValueChange={() => toggleSection(section.id)}
                trackColor={{ false: isDark ? '#334155' : '#E2E8F0', true: colors.primary }}
                thumbColor={'#fff'}
              />
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={dynamicStyles.startButton} onPress={startCustomMock} activeOpacity={0.9}>
          <Text style={dynamicStyles.startText}>START CUSTOM MOCK</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
