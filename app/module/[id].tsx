import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, FlatList, Image, Modal, ScrollView, TextInput, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateMockExam } from '../../utils/mockExamGenerator';
import CustomLoader from '../../components/CustomLoader';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';

// Import All Data Files
import { MULTIPLE_CHOICE_READING_SINGLE_QUESTIONS } from '../../constants/multipleChoiceReadingSingleData';
import { MODULES } from '../../constants/modules';
import { READ_ALOUD_QUESTIONS } from '../../constants/readAloudData';
import { REPEAT_SENTENCE_QUESTIONS } from '../../constants/repeatSentenceData';
import { DESCRIBE_IMAGE_QUESTIONS } from '../../constants/describeImageData';
import { REORDER_PARAGRAPHS_QUESTIONS } from '../../constants/reOrderParagraphsData';
import { FILL_BLANKS_QUESTIONS } from '../../constants/fillBlanksData';
import { SUMMARIZE_SPOKEN_QUESTIONS } from '../../constants/summarizeSpokenData';
import { WRITE_DICTATION_QUESTIONS } from '../../constants/writeDictationData';
import { HIGHLIGHT_INCORRECT_QUESTIONS } from '../../constants/highlightIncorrectData';
import { MULTIPLE_CHOICE_QUESTIONS } from '../../constants/multipleChoiceData';
import { SUMMARIZE_WRITTEN_QUESTIONS } from '../../constants/summarizeWrittenData';
import { RETELL_LECTURE_QUESTIONS } from '../../constants/retellLectureData';
import { ANSWER_SHORT_QUESTION_DATA } from '../../constants/answerShortQuestionData';
import { FILL_BLANKS_RW_QUESTIONS } from '../../constants/fillBlanksRWData';
import { MULTIPLE_CHOICE_SINGLE_QUESTIONS } from '../../constants/multipleChoiceSingleData';
import { MULTIPLE_CHOICE_LISTENING_MULTI_QUESTIONS } from '../../constants/multipleChoiceListeningMultiData';
import { LISTENING_FILL_BLANKS_QUESTIONS } from '../../constants/listeningFillBlanksData';
import { SELECT_MISSING_WORD_QUESTIONS } from '../../constants/selectMissingWordData';
import { HIGHLIGHT_CORRECT_SUMMARY_QUESTIONS } from '../../constants/highlightCorrectSummaryData';
import { ESSAY_QUESTIONS } from '../../constants/essayData';
import { SUMMARIZE_GROUP_QUESTIONS } from '../../constants/summarizeGroupData'; 
import { RESPOND_SITUATION_QUESTIONS } from '../../constants/respondSituationData';
import { db, auth, ensureAuth, handleFirestoreError, OperationType } from '../../services/firebase';
import { collection, doc, setDoc, query, orderBy, limit, getDocs, where, increment, updateDoc } from 'firebase/firestore';
import { analyzeSpeech, analyzeWriting, synthesizeSpeech } from '../../services/geminiService';
import { scoreService } from '../../services/scoreService';
import { networkService } from '../../services/networkService';
import { Config } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const CATEGORIES: Record<string, { title: string, tasks: { id: string, title: string, icon: string }[] }> = {
  speaking: {
    title: 'Speaking',
    tasks: [
      { id: 'read-aloud', title: 'Read Aloud', icon: 'microphone' },
      { id: 'repeat-sentence', title: 'Repeat Sentence', icon: 'repeat' },
      { id: 'describe-image', title: 'Describe Image', icon: 'image' },
      { id: 'retell-lecture', title: 'Retell Lecture', icon: 'volume-high' },
      { id: 'summarize-group-discussion', title: 'Summarize Group Discussion', icon: 'account-group' },
      { id: 'respond-to-situation', title: 'Respond to Situation', icon: 'chat-processing' },
      { id: 'answer-short-question', title: 'Answer Short Question', icon: 'help-circle' },
      { id: 'personal-intro', title: 'Personal Introduction', icon: 'account-voice' },
    ]
  },
  writing: {
    title: 'Writing',
    tasks: [
      { id: 'summarize-written', title: 'Summarize Written Text', icon: 'file-document-edit' },
      { id: 'essay', title: 'Write Essay', icon: 'fountain-pen-tip' },
    ]
  },
  reading: {
    title: 'Reading',
    tasks: [
      { id: 'fill-blanks-rw', title: 'Reading & Writing: Fill in the Blanks', icon: 'format-list-bulleted' },
      { id: 'multiple-choice', title: 'Multiple Choice (Multiple)', icon: 'checkbox-multiple-marked' },
      { id: 're-order-paragraphs', title: 'Re-order Paragraphs', icon: 'sort' },
      { id: 'fill-blanks', title: 'Reading: Fill in the Blanks', icon: 'format-list-checks' },
      { id: 'multiple-choice-r-single', title: 'Multiple Choice (Single)', icon: 'checkbox-marked-circle' },
    ]
  },
  listening: {
    title: 'Listening',
    tasks: [
      { id: 'summarize-spoken', title: 'Summarize Spoken Text', icon: 'headphones' },
      { id: 'multiple-choice-l-multi', title: 'Multiple Choice (Multiple)', icon: 'checkbox-multiple-marked' },
      { id: 'fill-blanks-listening', title: 'Fill in the Blanks', icon: 'format-list-bulleted' },
      { id: 'highlight-correct-summary', title: 'Highlight Correct Summary', icon: 'check-decagram' },
      { id: 'multiple-choice-l-single', title: 'Multiple Choice (Single)', icon: 'checkbox-marked-circle' },
      { id: 'select-missing-word', title: 'Select Missing Word', icon: 'music-note' },
      { id: 'highlight-incorrect', title: 'Highlight Incorrect Words', icon: 'close-circle' },
      { id: 'write-dictation', title: 'Write From Dictation', icon: 'keyboard' },
    ]
  }
};

type TimerMode = 'IDLE' | 'PLAYING_AUDIO' | 'PREP' | 'PREP_RETELL' | 'PREP_LISTENING' | 'RECORDING' | 'PROCESSING' | 'RESULT' | 'WAITING_NEXT';

const MOCK_EXAM_SECTIONS_INFO = [
  {
    id: 'speaking-writing',
    title: 'Part 1: Speaking & Writing',
    description: 'This section tests your ability to speak and write in English in an academic environment.',
    questionCount: 47,
    breakdown: [
      { type: 'Personal Introduction (Unscored)', count: 1 },
      { type: 'Read Aloud', count: 7 },
      { type: 'Repeat Sentence', count: 12 },
      { type: 'Describe Image', count: 6 },
      { type: 'Retell Lecture', count: 3 },
      { type: 'Answer Short Questions', count: 12 },
      { type: 'Summarize Group Discussion', count: 1 },
      { type: 'Respond to a Situation', count: 1 },
      { type: 'Summarize Written Text', count: 3 },
      { type: 'Write Essay', count: 1 },
    ]
  },
  {
    id: 'reading',
    title: 'Part 2: Reading',
    description: 'This section tests your ability to read and understand academic English.',
    questionCount: 59,
    breakdown: [
      { type: 'Fill in the Blanks (Dropdown)', count: 25 },
      { type: 'Multiple Choice, Multiple Answers', count: 3 },
      { type: 'Re-order Paragraph', count: 4 },
      { type: 'Fill in the Blanks (Drag & Drop)', count: 24 },
      { type: 'Multiple Choice, Single Answer', count: 3 },
    ]
  },
  {
    id: 'listening',
    title: 'Part 3: Listening',
    description: 'This section tests your ability to listen to and understand academic English.',
    questionCount: 25,
    breakdown: [
      { type: 'Summarize Spoken Text', count: 2 },
      { type: 'Multiple Choice, Multiple Answers', count: 2 },
      { type: 'Fill in the Blanks', count: 3 },
      { type: 'Highlight Correct Summary', count: 2 },
      { type: 'Multiple Choice, Single Answer', count: 2 },
      { type: 'Select Missing Word', count: 2 },
      { type: 'Highlight Incorrect Words', count: 3 },
      { type: 'Write From Dictation', count: 9 },
    ]
  }
];

const LFibInput = React.memo(({ i, item, value, lFibResult, handleLFibChange, styles }: any) => {
  return (
    <TextInput 
      key={`input-${i}`}
      style={[
        styles.inlineInput, 
        { 
          minWidth: 120,
          marginHorizontal: 4, 
          height: 38,
          paddingVertical: 0,
          fontSize: 16,
          borderBottomWidth: 2,
          borderBottomColor: '#2563EB'
        },
        lFibResult ? (value?.trim().toLowerCase() === item.correctAnswers[i]?.toLowerCase() ? styles.inputCorrect : styles.inputWrong) : null
      ]} 
      placeholder="..." 
      value={value || ""} 
      onChangeText={(text) => handleLFibChange(text, i)} 
      editable={!lFibResult} 
      autoCapitalize="none" 
      autoCorrect={false}
    />
  );
});

const ListeningFillBlanksContent = React.memo(({ item, lFibAnswers, lFibResult, handleLFibChange, styles }: any) => {
  return (
    <ScrollView 
        style={{flex: 1}} 
        contentContainerStyle={{paddingBottom: 80}}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
    >
      <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', paddingHorizontal: 4}}>
        {item.segments.map((segment: string, i: number) => {
          // Keep spaces by splitting with capture group
          const words = segment.split(/(\s+)/);
          return (
            <React.Fragment key={`frag-${i}`}>
              {words.map((word: string, wIdx: number) => (
                <Text key={`word-${i}-${wIdx}`} style={styles.fibText}>
                  {word}
                </Text>
              ))}
              {i < item.segments.length - 1 && (
                <LFibInput 
                  i={i}
                  item={item}
                  value={lFibAnswers[i]}
                  lFibResult={lFibResult}
                  handleLFibChange={handleLFibChange}
                  styles={styles}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </ScrollView>
  );
},(prevProps, nextProps) => {
  // Custom equality check to prevent full re-renders unless data really changes
  return (
    prevProps.item === nextProps.item &&
    prevProps.lFibResult === nextProps.lFibResult &&
    prevProps.lFibAnswers.join(',') === nextProps.lFibAnswers.join(',')
  );
});

export default function ModuleScreen() {
  const { id, startIndex, customConfig } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const styles = React.useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingVertical: 10, 
      paddingHorizontal: 15,
      borderBottomWidth: 1, 
      borderBottomColor: colors.border, 
      backgroundColor: colors.surface,
      height: 80,
    },
    headerLeft: { width: 50, alignItems: 'flex-start' },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerRight: { width: 50 },
    backButton: { position: 'absolute', left: 20, zIndex: 10, padding: 5 },
    scoreBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginBottom: 5, borderWidth: 1, borderColor: colors.primary + '30' },
    scoreText: { color: colors.primary, fontWeight: 'bold', fontSize: 12 },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, textAlign: 'center', lineHeight: 20 },
    carouselContainer: { },
    fullScreenPage: { width: width, padding: 20 },
    card: { flex: 1, backgroundColor: colors.surface, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    questionIndex: { color: colors.subtext, marginBottom: 10, fontWeight: 'bold' },
    questionText: { fontSize: 20, lineHeight: 30, color: colors.text },
    readingText: { fontSize: 16, lineHeight: 24, color: colors.text },
    label: { fontSize: 12, color: colors.subtext, fontWeight: 'bold', marginBottom: 4 },
    textScroll: { flex: 1, width: '100%', minHeight: 100, marginBottom: 10, },
    textScrollContent: { flexGrow: 1, justifyContent: 'center' },
    audioPlaceholder: { justifyContent: 'center', alignItems: 'center', width: '100%' },
    listenBox: { alignItems: 'center', gap: 10 },
    listenText: { fontSize: 18, color: colors.subtext, fontWeight: '500' },
    imageContainer: { alignItems: 'center', justifyContent: 'flex-start' },
    chartImage: { width: '100%', height: 180, marginTop: 20, marginBottom: 10, backgroundColor: isDark ? colors.border : '#F1F5F9' },
    missingImage: { width: '100%', height: 180, backgroundColor: isDark ? colors.border : '#F1F5F9', alignItems:'center', justifyContent:'center', borderRadius:8, marginTop: 20 },
    imageTitle: { marginTop: 10, fontSize: 16, fontWeight:'600', color: colors.text, textAlign:'center'},
    zoomIcon: { position: 'absolute', right: 10, bottom: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 5 },
    controls: { padding: 10, paddingBottom: 20, backgroundColor: colors.background, borderTopWidth: 1,  borderTopColor: colors.border }, 
    timerBox: { alignItems: 'center', marginBottom: 20 },
    timerText: { fontSize: 16, color: colors.subtext, marginBottom: 5, fontWeight: '600' },
    timerCount: { fontSize: 48, fontWeight: 'bold', color: colors.text },
    textRed: { color: '#EF4444' },
    textGreen: { color: '#10B981' }, 
    resultBox: { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', padding: 10, borderRadius: 16, marginBottom: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, alignItems: 'center', elevation: 3, width: '100%' },
    resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#10B981', marginBottom: 5 },
    resultSub: { fontSize: 16, color: '#10B981', marginBottom: 15 },
    idleControls: { flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' },
    btnPrimary: { backgroundColor: colors.primary, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', width: '100%' },
    modelBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: isDark ? '#78350F' : '#FEF3C7', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B', shadowColor: '#F59E0B', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
    btnSecondary: { backgroundColor: isDark ? colors.border : '#E2E8F0', padding: 18, borderRadius: 50, alignItems: 'center', width: '100%' },
    btnDanger: { backgroundColor: '#EF4444', padding: 18, borderRadius: 50, alignItems: 'center', width: '100%' },
    nextBtn: { backgroundColor: '#10B981', height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', width: '100%' },
    btnPrimarySmall: { backgroundColor: colors.primary, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', width: '100%' },
    nextBtnSmall: { backgroundColor: '#10B981', height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', width: '100%' },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    btnTextSmall: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    btnTextDark: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    modelText: { fontSize: 16, lineHeight: 24, color: colors.text },
    closeBtn: { marginTop: 20, backgroundColor: colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
    closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    reOrderTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 5 },
    targetArea: { flex: 1, minHeight: 150, backgroundColor: colors.primary + '15', borderRadius: 12, padding: 10, marginBottom: 10, borderStyle: 'dashed', borderWidth: 2, borderColor: colors.primary + '30' },
    sourceArea: { flex: 1, minHeight: 150, backgroundColor: isDark ? colors.border : '#F8FAFC', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.border },
    areaLabel: { fontSize: 12, fontWeight: 'bold', color: colors.subtext, marginBottom: 8, textTransform: 'uppercase' },
    placeholderText: { color: colors.subtext, textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
    draggableItem: { backgroundColor: colors.primary, padding: 12, borderRadius: 8, marginBottom: 8 },
    sourceItem: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
    textWhite: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
    textDark: { color: colors.text, fontSize: 14, fontWeight: '500' },
    fibContainer: { flexGrow: 1 },
    fibTextWrapper: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
    fibText: { fontSize: 18, lineHeight: 50, color: colors.text, marginBottom: 0, },
    blankBox: { color: colors.primary, fontWeight: 'bold', backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: colors.primary, marginHorizontal: 2 },
    blankFilled: { backgroundColor: colors.primary, color: '#fff' },
    blankCorrect: { backgroundColor: '#10B981', borderColor: '#10B981', color: '#fff' },
    blankWrong: { backgroundColor: '#EF4444', borderColor: '#EF4444', color: '#fff' },
    modalOverlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
    modalContentBottom: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    wordChip: { backgroundColor: isDark ? colors.border : '#F1F5F9', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
    wordChipText: { fontSize: 16, color: colors.text, fontWeight: '500' },
    audioControlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15, padding: 10, backgroundColor: isDark ? colors.border : '#F1F5F9', borderRadius: 12 },
    miniPlayBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    miniPlayText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
    summaryInput: { flex: 1, backgroundColor: isDark ? colors.border : '#F8FAFC', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 15, fontSize: 16, lineHeight: 24, textAlignVertical: 'top', minHeight: 150, color: colors.text },
    wordCountRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
    wordCountText: { fontSize: 13, fontWeight: 'bold', color: colors.text },
    speedControlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    speedBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 8, backgroundColor: colors.primary + '15', borderRadius: 12 },
    speedText: { color: colors.primary, fontWeight: 'bold' },
    highlightContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    wordBubble: { borderRadius: 4, paddingHorizontal: 2, paddingVertical: 1, marginVertical: 2 },
    wordText: { fontSize: 18, lineHeight: 28, color: colors.text }, 
    mcOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12, backgroundColor: isDark ? colors.surface : '#F8FAFC' },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
    mcText: { fontSize: 16, color: colors.text, flex: 1 },
    sourceTextBox: { backgroundColor: isDark ? colors.border : '#F1F5F9', padding: 10, borderRadius: 8 },
    speakNowOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 9999 },
    speakNowBox: { backgroundColor: colors.surface, paddingVertical: 25, paddingHorizontal: 40, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
    speakNowText: { fontSize: 32, fontWeight: 'bold', color: '#10B981' },
    zoomOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    zoomCloseArea: { position: 'absolute', top: 50, right: 20, zIndex: 99, padding: 20 },
    fullScreenImage: { width: width, height: '80%' },
    wordBankContainer: { marginBottom: 15, padding: 10, backgroundColor: isDark ? colors.border : '#F1F5F9', borderRadius: 12 },
    wordBankGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
    wordBankItem: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
    inlineInput: { 
      minWidth: 120, borderBottomWidth: 2, borderBottomColor: colors.primary, paddingHorizontal: 12, marginHorizontal: 4, height: 40, 
      backgroundColor: colors.primary + '15', borderRadius: 8, marginTop: 4, fontSize: 16, color: colors.text, textAlign: 'center',
      justifyContent: 'center', alignItems: 'center', textAlignVertical: 'center'
    },
    inputCorrect: { backgroundColor: '#D1FAE5', borderBottomColor: '#10B981', color: '#065F46' },
    inputWrong: { backgroundColor: '#FEE2E2', borderBottomColor: '#EF4444', color: '#B91C1C' },
    jumpToContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, backgroundColor: colors.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
    jumpToLabel: { fontSize: 10, fontWeight: '900', color: colors.subtext, marginRight: 10, letterSpacing: 0.5 },
    jumpToScroll: { alignItems: 'center', gap: 10, paddingRight: 20 },
    jumpCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
    jumpCircleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    jumpCircleText: { fontSize: 14, color: colors.subtext, fontWeight: '700' },
    jumpCircleTextActive: { color: '#fff' },
    processingOverlay: { padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)', borderRadius: 12, marginTop: 20 },
    processingText: { fontSize: 16, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
    processingSubText: { marginTop: 5, fontSize: 13, color: colors.subtext, textAlign: 'center' },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 5 },
    boldLabel: { fontWeight: 'bold', color: colors.text },
    boldValue: { fontWeight: 'bold', color: colors.primary },
    reOrderResultItem: { marginBottom: 8, padding: 10, backgroundColor: isDark ? colors.border : '#F0F9FF', borderRadius: 8, borderWidth: 1, borderColor: colors.primary + '30' },
    feedbackOverlay: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 100 },
    feedbackPopup: { width: '90%', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5, gap: 10 },
    feedbackText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    dropdownModalContent: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, width: '90%', maxWidth: 400, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
    dropdownTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16, textAlign: 'center' },
    dropdownItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
    dropdownItemText: { fontSize: 16, color: colors.text, textAlign: 'center' },
    dropdownCloseBtn: { marginTop: 20, backgroundColor: isDark ? colors.border : '#F1F5F9', padding: 14, borderRadius: 12, alignItems: 'center' },
    dropdownCloseText: { color: colors.text, fontWeight: 'bold', fontSize: 16 },
  }), [colors, isDark]);

  const FeedbackRow = ({label, text, isIncorrect}: {label: string, text: string, isIncorrect?: boolean}) => (
    <View style={{marginBottom: 8, width: '100%', borderBottomWidth: 1, borderBottomColor: isIncorrect ? '#FECACA' : colors.border, paddingBottom: 4}}>
       <Text style={{fontWeight: 'bold', color: isIncorrect ? '#991B1B' : colors.text, fontSize: 14}}>{label}</Text>
       <Text style={{color: isIncorrect ? '#7F1D1D' : colors.subtext, fontSize: 13}}>{text}</Text>
    </View>
  );

  // 1. STATE DEFINITIONS
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(startIndex ? parseInt(startIndex as string, 10) : 0);
  const [bestScores, setBestScores] = useState<{[key: number]: number}>({});
  const [scoreFeedback, setScoreFeedback] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  // Mock Exam States
  const [mockExamSections, setMockExamSections] = useState<any[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [mockExamFlow, setMockExamFlow] = useState<'MAIN_INTRO' | 'SECTION_INTRO' | 'SECTION_POPUP' | 'IN_PROGRESS' | 'FINAL_RESULTS'>('MAIN_INTRO');
  const [sectionScores, setSectionScores] = useState<Record<string, number[]>>({});

  const showFeedback = (message: string, type: 'success' | 'info' | 'error') => {
    setScoreFeedback({ message, type });
    setTimeout(() => setScoreFeedback(null), 3000);
  };

  const awardPointIfFirstAttempt = async (isCorrect: boolean) => {
    // 1. Maintain engagement streak regardless of correctness
    await scoreService.updateStreak();

    const q = questions[currentIndex];
    if (!q) return;

    // Generate a consistent ID for tracking progress and mistakes
    const currentActiveType = q.type || q.moduleType || id;
    const questionId = (id === 'mistakes') ? q.id : (q.id ? `${currentActiveType}_${q.id}` : `${currentActiveType}_${currentIndex}_${(q.text || q.topic || q.displayText || '').substring(0, 10)}`);

    // 2. Immediate Haptic & State Feedback (and mistake tracking)
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (questionId) {
        await scoreService.removeMistake(questionId);
        if (id === 'mistakes') {
          showFeedback("Mastered! Removed from Mistake Bank.", "success");
        }
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (id !== 'mistakes') {
        await scoreService.saveMistake({
          ...q,
          id: questionId,
          moduleType: id,
          originalIndex: currentIndex
        });
      }
    }

    // 3. Boundary Control for Scoring & Leaderboard
    if (id === 'mock-exam' || id === 'mistakes') {
      console.log(`[Score] ${id === 'mock-exam' ? 'Mock exam' : 'Mistakes bank review'} attempt.`);
      if (!isCorrect) showFeedback("Incorrect. Save to mistakes bank.", "error");
      return;
    }

    // 4. Point Awarding Logic (First Attempt Only)
    const isFirst = await scoreService.isFirstAttempt(questionId);
    
    if (isFirst) {
      await scoreService.markAsAttempted(questionId);

      if (isCorrect) {
        // Progress Report: Correct First Attempt +1
        const newCfa = await scoreService.addCorrectFirstAttempt();
        console.log(`[Score] Progress Report updated: Correct Qs = ${newCfa}`);
        showFeedback("+1 on Progress! Well done.", "success");

        // Global Leaderboard logic: update score in leaderboard for everyone
        const firebaseUid = auth.currentUser?.uid;
        
        if (firebaseUid) {
          let groupId = await scoreService.getGroupId();
          let groupIsActive = false;
          
          if (groupId) {
              const q = query(collection(db, 'leaderboard'), where('groupId', '==', groupId));
              const snap = await getDocs(q);
              if (snap.size >= 2) {
                  groupIsActive = true;
              }
          }

          // Practice Module point goes to local backup regardless of leaderboard state
          await scoreService.addPoint();
          
          if (groupIsActive) {
            const canEdit = await networkService.canEditTable();
            if (canEdit) {
              const name = await scoreService.getUserName();
              if (name) {
                try {
                  await ensureAuth();
                  const userDocRef = doc(db, 'leaderboard', firebaseUid);
                  const localBackup = await scoreService.getAllLocalData();
                  const updateData: any = {
                    score: increment(1), // Authoritative cloud increment
                    localBackup,
                    lastUpdate: new Date().toISOString(),
                    groupId: groupId
                  };
                  await updateDoc(userDocRef, updateData);
                  console.log("[Score] Global sync successful. Incremented cloud score.");
                } catch (e) {
                  console.error("Firebase updateDoc failed (may not exist). Trying setDoc fallback:", e);
                  try {
                      // If the document doesn't exist yet, increment fails. Fallback to setDoc with score: 1
                      const userDocRef = doc(db, 'leaderboard', firebaseUid);
                      const localBackup = await scoreService.getAllLocalData();
                      const deviceId = await scoreService.getDeviceId();
                      await setDoc(userDocRef, {
                          userId: firebaseUid,
                          deviceId: deviceId,
                          name: name,
                          score: 1,
                          groupId: groupId,
                          localBackup,
                          lastUpdate: new Date().toISOString()
                      }, { merge: true });
                  } catch (e2) {
                      console.error("Fallback setDoc failed:", e2);
                  }
                }
              }
            }
          } else {
             // Just backup the local data, DONT touch cloud `score`
             try {
                await ensureAuth();
                const userDocRef = doc(db, 'leaderboard', firebaseUid);
                const localBackup = await scoreService.getAllLocalData();
                const deviceId = await scoreService.getDeviceId();
                const name = await scoreService.getUserName();
                await setDoc(userDocRef, { 
                  userId: firebaseUid,
                  deviceId,
                  name,
                  localBackup, 
                  lastUpdate: new Date().toISOString() 
                }, { merge: true });
                console.log("[Score] Leaderboard inactive (<2 members). Points remain at zero on cloud.");
             } catch (e) { console.error(e) }
          }
        } else {
          console.log(`[Score] Unauthenticated. Global score unchanged.`);
        }
      } else {
        // Incorrect on first attempt
        const newFfa = await scoreService.addFailedFirstAttempt();
        console.log(`[Score] Progress Report updated: Incorrect Qs = ${newFfa}`);
        showFeedback("Incorrect on first try. Recorded in Progress.", "error");
      }
    } else {
      console.log("[Score] Re-attempt: No Progress Report impact.");
      if (isCorrect) {
        showFeedback("Correct!", "success");
      } else {
        showFeedback("Incorrect. Keep practicing!", "error");
      }
    }
  };

  const moduleInfo = MODULES.find(m => m.id === id);

  // 2. ACTIVE TYPE DEFINITION (Fixes activeType error - ensures mistakes bank and mock exam items render correctly)
  const currentItem = questions[currentIndex] || {};
  const activeType = (id === 'essay') ? 'essay' : (currentItem.type || currentItem.moduleType || id);
  
  // --- IDENTIFY MODULES (Must use activeType, NOT id) ---
  const isReadAloud = activeType === 'read-aloud';
  const isRepeatSentence = activeType === 'repeat-sentence';
  const isDescribeImage = activeType === 'describe-image';
  const isReOrder = activeType === 're-order-paragraphs';
  const isFillBlanks = activeType === 'fill-blanks'; 
  const isSummarizeSpoken = activeType === 'summarize-spoken';
  const isWriteDictation = activeType === 'write-dictation';
  const isHighlightIncorrect = activeType === 'highlight-incorrect';
  const isMultipleChoice = activeType === 'multiple-choice';
  const isSelectMissingWord = activeType === 'select-missing-word';
  const isHighlightCorrectSummary = activeType === 'highlight-correct-summary'; 
  const isEssay = activeType === 'essay'; 
  const isSummarizeGroup = activeType === 'summarize-group-discussion'; 
  const isRespondSituation = activeType === 'respond-to-situation'; 
  
  // Grouping Logic
  const isMCSingle = activeType === 'multiple-choice-r-single' || activeType === 'multiple-choice-l-single' || activeType === 'highlight-correct-summary' || activeType === 'select-missing-word';
  const isMCListeningMulti = activeType === 'multiple-choice-l-multi'; 
  const isAnyMC = isMultipleChoice || isMCSingle || isMCListeningMulti;
  const isSummarizeWritten = activeType === 'summarize-written';
  const isRetellLecture = activeType === 'retell-lecture';
  const isASQ = activeType === 'answer-short-question';
  const isFillBlanksRW = activeType === 'fill-blanks-rw'; 
  const isFillBlanksListening = activeType === 'fill-blanks-listening'; 
  const isPersonalIntro = activeType === 'personal-intro';

  // --- DATA LOADING ---
  useEffect(() => {
    let loaded: any[] =[]; 

    if (id === 'mock-exam') {
        try {
            const configStr = typeof customConfig === 'string' ? customConfig : undefined;
            const sections = generateMockExam(configStr); 
            setMockExamSections(sections);
            setMockExamFlow('MAIN_INTRO');
            setQuestions([]); 
        } catch (e) {
            console.log("Mock Exam Error:", e);
        }
    } else if (id === 'mistakes') {
        const loadMistakes = async () => {
          const mistakes = await scoreService.getMistakes();
          if (mistakes.length === 0) {
            Alert.alert("Empty Bank", "You don't have any mistakes to review yet. Good job!");
            router.back();
            return;
          }
          setQuestions(mistakes);
          setLoading(false);
        };
        loadMistakes();
        return; // Skip standard loading
    } else {
        // Standard Module Loading
        if (id === 'read-aloud') loaded = READ_ALOUD_QUESTIONS;
        else if (id === 'repeat-sentence') loaded = REPEAT_SENTENCE_QUESTIONS;
        else if (id === 'describe-image') loaded = DESCRIBE_IMAGE_QUESTIONS;
        else if (id === 're-order-paragraphs') loaded = REORDER_PARAGRAPHS_QUESTIONS;
        else if (id === 'fill-blanks') loaded = FILL_BLANKS_QUESTIONS;
        else if (id === 'summarize-spoken') loaded = SUMMARIZE_SPOKEN_QUESTIONS;
        else if (id === 'write-dictation') loaded = WRITE_DICTATION_QUESTIONS;
        else if (id === 'highlight-incorrect') loaded = HIGHLIGHT_INCORRECT_QUESTIONS;
        
        // --- UPDATED LINES ---
        else if (id === 'multiple-choice') loaded = MULTIPLE_CHOICE_QUESTIONS;
        else if (id === 'multiple-choice-r-single') loaded = MULTIPLE_CHOICE_READING_SINGLE_QUESTIONS;
        // ---------------------
        
        else if (id === 'summarize-written') loaded = SUMMARIZE_WRITTEN_QUESTIONS;
        else if (id === 'retell-lecture') loaded = RETELL_LECTURE_QUESTIONS;
        else if (id === 'answer-short-question') loaded = ANSWER_SHORT_QUESTION_DATA;
        else if (id === 'fill-blanks-rw') loaded = FILL_BLANKS_RW_QUESTIONS;
        else if (id === 'highlight-correct-summary') loaded = HIGHLIGHT_CORRECT_SUMMARY_QUESTIONS;
        else if (id === 'select-missing-word') loaded = SELECT_MISSING_WORD_QUESTIONS;
        else if (id === 'essay') loaded = ESSAY_QUESTIONS;
        else if (id === 'summarize-group-discussion') loaded = SUMMARIZE_GROUP_QUESTIONS;
        else if (id === 'respond-to-situation') loaded = RESPOND_SITUATION_QUESTIONS;
        else if (id === 'multiple-choice-l-single') loaded = MULTIPLE_CHOICE_SINGLE_QUESTIONS;
        else if (id === 'multiple-choice-l-multi') loaded = MULTIPLE_CHOICE_LISTENING_MULTI_QUESTIONS;
        else if (id === 'fill-blanks-listening') loaded = LISTENING_FILL_BLANKS_QUESTIONS;
        else if (id === 'personal-intro') {
            loaded = [{ id: 'pi1', type: 'personal-intro', prompt: 'Please introduce yourself. This is not scored but will be sent to institutions.' }];
        }
    }

    if (startIndex === 'random' && loaded.length > 0) {
        setCurrentIndex(Math.floor(Math.random() * loaded.length));
    }
    
    setQuestions(loaded ||[]); 
    setLoading(false);
  }, [id, startIndex]);

  // --- GLOBAL STATE ---
  const [mode, setMode] = useState<TimerMode>('IDLE');
  const [timeLeft, setTimeLeft] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [result, setResult] = useState<any>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [lastRecordingUri, setLastRecordingUri] = useState<string | null>(null); 

  // --- MODULE SPECIFIC STATE ---
  const [jumbledList, setJumbledList] = useState<string[]>([]);
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [reOrderScore, setReOrderScore] = useState<{score: number, max: number} | null>(null);
  
  const [blankAnswers, setBlankAnswers] = useState<string[]>([]);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number | null>(null); 
  const [activeRwBlankIndex, setActiveRwBlankIndex] = useState<number | null>(null);
  const [fillBlankScore, setFillBlankScore] = useState<{score: number, max: number} | null>(null);
  
  const [userSummary, setUserSummary] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isSummarizePlaying, setIsSummarizePlaying] = useState(false);
  const [dictationPlayed, setDictationPlayed] = useState(false);
  const [dictationResult, setDictationResult] = useState<any>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedWarning, setShowSpeedWarning] = useState(false);
  const [highlightResult, setHighlightResult] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [mcResult, setMcResult] = useState<any>(null);
  const [lecturePlayed, setLecturePlayed] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showSpeakNow, setShowSpeakNow] = useState(false);
  const [showIntroPopup, setShowIntroPopup] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [hideInstruction, setHideInstruction] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const TASK_INSTRUCTIONS: Record<string, string> = {
    'read-aloud': 'Speak the text smoothly at a natural pace with clear pronunciation, correct stress, and steady rhythm while matching the punctuation and meaning of the passage.',
    'repeat-sentence': 'Repeat the sentence you hear by copying the words, the sound, and the rhythm as closely as you can.',
    'describe-image': 'Describe the picture by talking about the main things you see, what they are doing, and any clear patterns or trends.',
    're-order-paragraphs': 'Drag the sentences into the correct logical order by finding the one that starts the idea, then linking the others by meaning, time order, or logical connection.',
    'fill-blanks': 'Drag the words into the correct blanks that best completes the sentence by matching the meaning, grammar, and overall flow of the text.',
    'summarize-spoken': 'Listen to the audio and summarize it in 50-70 words.',
    'write-dictation': 'Type the sentence exactly as you hear it, matching every word and spelling correctly.',
    'highlight-incorrect': 'Click the words in the transcript that are different from what you hear in the audio.',
    'multiple-choice': 'Choose the option that best matches the meaning of the passage by checking which answer fits the ideas in the text. ',
    'multiple-choice-r-single': 'Choose the one answer that best matches the meaning of the passage by checking which option fits the ideas in the text.',
    'summarize-written': 'Summarize the text in one sentence (5-75 words).',
    'retell-lecture': 'Explain the lecture in your own words by telling the main idea and the most important points you remember.',
    'answer-short-question': 'Give a short, clear answer to the question using only one or two words .',
    'fill-blanks-rw': 'Choose the word that best completes the sentence by matching the meaning, grammar, and logic of the whole passage.',
    'highlight-correct-summary': 'Choose the summary that best matches the main idea of the audio by checking which option fits the overall meaning most accurately.',
    'select-missing-word': 'Pick the word that best completes the sentence by matching the meaning and the grammar of the audio.',
    'essay': 'Write a 200-300 word well‑organised essay on the given topic, give reasons and examples, and stay focused on one main position.',
    'summarize-group-discussion': 'Summarize the viewpoints in the discussion.',
    'respond-to-situation': 'Speak one or two clear sentences that directly answer the situation by giving a natural, appropriate response.',
    'multiple-choice-l-single': 'Choose the one answer that best matches the meaning of the passage by checking which option fits the ideas most accurately.',
    'multiple-choice-l-multi': 'Choose all the answers that match the meaning of the audio by selecting every option that is correct.',
    'fill-blanks-listening': 'Type in the word you hear in the audio that correctly completes the sentence so the meaning and grammar are accurate.',
    'personal-intro': 'Speak for about 30 seconds to introduce yourself by giving simple information about who you are, what you do, and something about your interests or background.',
    'mock-exam': 'Complete the full PTE mock exam. This includes all sections and is timed.'
  };
  const [asqResultPopup, setAsqResultPopup] = useState(false);

  const PlaybackSpeedToggle = () => (
    <View style={{flexDirection:'row', backgroundColor:'#E2E8F0', borderRadius:16, padding:2}}>
        <TouchableOpacity onPress={()=>setPlaybackSpeed(1.0)} style={{paddingVertical:6, paddingHorizontal:10, backgroundColor:playbackSpeed===1.0?'#fff':'transparent', borderRadius:14}}>
            <Text style={{fontSize:12, fontWeight:'bold', color:playbackSpeed===1.0?'#2563EB':'#64748B'}}>1.0x</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setPlaybackSpeed(0.75)} style={{paddingVertical:6, paddingHorizontal:10, backgroundColor:playbackSpeed===0.75?'#fff':'transparent', borderRadius:14}}>
            <Text style={{fontSize:12, fontWeight:'bold', color:playbackSpeed===0.75?'#2563EB':'#64748B'}}>0.75x</Text>
        </TouchableOpacity>
    </View>
  );

  const AudioControlBar = ({ onPlay, isPlaying, label = "Play Audio", disabled = false }: { onPlay: () => void, isPlaying: boolean, label?: string, disabled?: boolean }) => (
    <View style={{
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backgroundColor: '#F1F5F9', 
        padding: 12, 
        paddingHorizontal: 16,
        borderRadius: 12, 
        marginBottom: 15,
        width: '100%',
        gap: 20
    }}>
        <TouchableOpacity 
            style={{flexDirection: 'row', alignItems: 'center', gap: 8}} 
            onPress={onPlay}
            disabled={disabled}
        >
            <MaterialCommunityIcons 
                name={isPlaying ? "stop-circle" : "play-circle"} 
                size={42} 
                color={isPlaying ? "#EF4444" : "#2563EB"} 
            />
            <Text style={{fontWeight: 'bold', color: '#1E293B', fontSize: 16}}>
                {isPlaying ? "Stop" : label}
            </Text>
        </TouchableOpacity>
        {PlaybackSpeedToggle()}
    </View>
  );
  
  const [rwAnswers, setRwAnswers] = useState<string[]>([]);
  const [rwResult, setRwResult] = useState<{score: number, max: number} | null>(null);
  const [lFibAnswers, setLFibAnswers] = useState<string[]>([]);
  const [lFibResult, setLFibResult] = useState<{score: number, max: number} | null>(null);
  const [showLFibPopup, setShowLFibPopup] = useState(false);

  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [currentZoomImage, setCurrentZoomImage] = useState<any>(null);

  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [isVoiceReady, setIsVoiceReady] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);

  const [scoredQuestions, setScoredQuestions] = useState<Record<number, number>>({});
  const currentSessionScore = Object.values(scoredQuestions).reduce((sum, val) => sum + val, 0);

  useEffect(() => {
    if (id && id !== 'mock-exam' && moduleInfo && questions.length > 0) {
      // If the user has scored/answered the current question, we set resumeIndex to next question (safely capped)
      const hasAnsweredCurrent = scoredQuestions[currentIndex] !== undefined || mode === 'RESULT';
      const resumeIndex = hasAnsweredCurrent 
        ? Math.min(currentIndex + 1, questions.length - 1) 
        : currentIndex;

      scoreService.setRecentActivity({
        moduleId: id as string,
        moduleTitle: moduleInfo.title,
        questionIndex: resumeIndex,
        timestamp: new Date().toISOString()
      });
    }
  }, [id, currentIndex, scoredQuestions, mode, questions.length, moduleInfo]);

  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeLeftRef = useRef<number>(0);
  const totalTimeRef = useRef<number>(0);
  const autoNextTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingAudio = mode === 'PLAYING_AUDIO';
  

  // --- INIT ---
  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    })();

    const getVoices = async (retries = 3) => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        
        // OS TTS engines (especially Android) can be "cold" and return an empty list 
        // on the very first time they are called. We wait and retry to let the OS wake up.
        if (voices.length === 0 && retries > 0) {
            setTimeout(() => getVoices(retries - 1), 800);
            return;
        }

        // 1. Target iOS explicit male voices first (Daniel, Arthur)
        let bestVoice = voices.find(v => v.identifier.includes("Daniel") || v.identifier.includes("Arthur")); 
        
        // 2. Target Android explicit OFFLINE male voices (rjs-local, gbd-local).
        if (!bestVoice) bestVoice = voices.find(v => v.identifier.includes('en-gb') && (v.identifier.includes('rjs-local') || v.identifier.includes('gbd-local')));
        
        // 3. Fallback: Any offline en-GB voice
        if (!bestVoice) bestVoice = voices.find(v => v.identifier.includes('en-gb') && v.identifier.includes('local'));
        
        // 4. Ultimate fallback: Any British voice
        if (!bestVoice) bestVoice = voices.find(v => v.language.includes('en-GB'));
        
        if (bestVoice) setVoiceId(bestVoice.identifier);
      } catch (e) {
        console.log("Error loading voices");
      }
      setIsVoiceReady(true);
    };
    getVoices();

    const keyboardShow = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardHide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));

    return () => { 
      stopTimer(); 
      Speech.stop(); 
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
      keyboardShow.remove();
      keyboardHide.remove();

      // Record study time on exit
      const endTime = Date.now();
      const elapsedMs = endTime - startTimeRef.current;
      const elapsedMins = Math.floor(elapsedMs / (1000 * 60));
      if (elapsedMins > 0) {
        // Cap at 2 hours for a single session to prevent bugs
        scoreService.addStudyTime(Math.min(elapsedMins, 120));
      }
    };
  }, []);

  // --- RESET STATE ---
  // --- STATE RESET ON QUESTION CHANGE ---
  useEffect(() => {
    if (showIntroPopup) return;

    // Stop any audio/speech when moving between questions
    stopTimer();
    Speech.stop();
    if(sound) { sound.unloadAsync(); setSound(null); }

    if (questions.length > 0 && currentItem) {
      // 1. RESET ALL GLOBAL STATES FIRST (Safer for Mock Exam)
      setMode('IDLE'); setResult(null); setTimeLeft(0); setUserSummary(""); setWordCount(0);
      setHideInstruction(false);
      setSelectedOptions([]); setSelectedIndices([]); setRwAnswers([]); setLFibAnswers([]);
      setBlankAnswers([]); setUserOrder([]); setJumbledList([]); 
      setReOrderScore(null); setFillBlankScore(null);
      setDictationResult(null); setHighlightResult(null); setMcResult(null); setRwResult(null);
      setLFibResult(null); setLecturePlayed(false); setDictationPlayed(false); setIsSummarizePlaying(false);
      setIsImageViewVisible(false); setCurrentZoomImage(null);
      setAsqResultPopup(false);
      setShowSpeakNow(false);
      
      // 2. SPECIFIC MODULE INITIALIZATION
      if (isReOrder && currentItem.sentences) {
        setJumbledList([...currentItem.sentences].sort(() => Math.random() - 0.5));
      } 
      if (isFillBlanks && currentItem.correctAnswers) {
        setBlankAnswers(new Array(currentItem.correctAnswers.length).fill(null));
      } 
      if (isFillBlanksRW && currentItem.correctAnswers) {
        setRwAnswers(new Array(currentItem.correctAnswers.length).fill(""));
      } 
      if (isFillBlanksListening && currentItem.correctAnswers) {
        setLFibAnswers(new Array(currentItem.correctAnswers.length).fill(""));
      } 
      if (isEssay) {
         setTimeout(() => startTimer(1200, () => handleEssaySubmit()), 500); 
      } 
      if (isPersonalIntro) {
         setMode('IDLE'); // <--- Keeps it waiting for you to press 'Start'
      }
    }
  }, [currentIndex, questions.length, showIntroPopup, resetKey]);
  const handleDismissIntro = () => {
    setShowIntroPopup(false);
  };

  // --- SPECIAL FLOW FOR GROUP SUMMARY & SITUATION ---
  // --- 5. AUTO PLAY AUDIO (With Safety Guards) ---
  // --- NEW: START FLOWS FOR GROUP / SITUATION ---
  const startTealFlow = (recordTime: number) => {
      const currentQ = questions[currentIndex] || {};
      const txt = currentQ.transcript || currentQ.text || currentQ.situation || "Listen carefully.";
      
      // 1. Give 10 seconds prep BEFORE audio
      setMode('PREP_LISTENING');
      startTimer(10, () => {
          // 2. Play Audio
          setMode('PLAYING_AUDIO');
          
          const onAudioFinish = () => {
              // 3. Give 10 seconds prep AFTER audio, then Record
              setMode('PREP');
              startTimer(10, () => startRecording(recordTime));
          };

          if (currentQ.audioUrl) {
              playAudioFromUrl(currentQ.audioUrl, onAudioFinish);
          } else {
              speakText(txt, onAudioFinish, 0.9);
          }
      });
  };

  // --- SPEECH HELPER ---
  const playAudioFromUrl = async (url: string, onComplete?: () => void, preserveMode: boolean = false) => {
    try {
      await Speech.stop();
      if (sound) await sound.unloadAsync();

      if (!preserveMode) {
          setMode('PLAYING_AUDIO');
      }

      // 1. Load sound but DO NOT play yet (shouldPlay: false)
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false } 
      );
      
      // 2. Set the speed (playbackSpeed comes from your state)
      // The 'true' argument corrects pitch so it doesn't sound like a deep robot
      await newSound.setRateAsync(playbackSpeed, true); 

      // 3. Now Play
      await newSound.playAsync();
      
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          if (onComplete) onComplete();
          newSound.unloadAsync(); 
          setSound(null);
          if (!preserveMode && mode === 'PLAYING_AUDIO') {
              setMode('IDLE');
          }
        }
      });
    } catch (error) {
      console.log("Error playing audio URL:", error);
      if (!preserveMode) {
          setMode('IDLE');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  // Clean up any active recording on unmount or before starting a new one
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch((e) => console.log("Silent unload catch:", e));
      }
    };
  }, [recording]);

  const speakText = (text: string, onDone?: () => void, rate: number = 0.9) => {
    if (!isVoiceReady) return; // Prevent fallback to generic voice while OS voice list loads
    Speech.stop(); // Force reset the TTS engine state
    const options: Speech.SpeechOptions = { 
      pitch: 1.0, 
      rate: rate, 
      onDone: onDone, 
      onStopped: () => { 
        if(!onDone && mode === 'PLAYING_AUDIO') setMode('IDLE'); 
      }, 
      onError: () => { 
        if(mode === 'PLAYING_AUDIO') setMode('IDLE'); 
      } 
    };
    if (voiceId) {
      options.voice = voiceId;
    } else {
      // Only set language if we completely failed to find a British voice earlier
      options.language = 'en-GB';
    }
    Speech.speak(text, options);
  };

  const playHeatmapWord = (text: string) => {
      // Clean the word and allow hyphens/apostrophes (e.g., "don't").
      if (!text || typeof text !== 'string') return;
      const cleanWord = text.replace(/[^a-zA-Z'-]/g, '').trim();
      if (!cleanWord) return;
      
      // Providing the word explicitly without extra grammar or casing that might trigger NLP errors
      speakText(cleanWord, undefined, 0.9);
  };

  const playFullAITranscript = async (text: string) => {
      if (isGeneratingTTS) return;
      setIsGeneratingTTS(true);
      try {
          const audioUri = await synthesizeSpeech(text);
          if (audioUri) {
              await playAudioFromUrl(audioUri, () => setIsGeneratingTTS(false), true);
          } else {
              speakText(text, () => setIsGeneratingTTS(false), 0.9);
          }
      } catch (e) {
          speakText(text, () => setIsGeneratingTTS(false), 0.9);
      }
  };

  function stopTimer() { 
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startTimer(initialTime: number, onComplete: () => void) {
    stopTimer();
    timeLeftRef.current = initialTime;
    totalTimeRef.current = initialTime;
    setTimeLeft(initialTime);
    
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      const current = timeLeftRef.current;
      
      setTimeLeft(current);
      
      if (current <= 0) {
        stopTimer();
        onComplete();
      }
    }, 1000);
  }

  const scrollToQuestion = (index: number) => {
    if (id === 'mock-exam' && index < currentIndex) {
      // Generally don't allow going back in mock exam as it's one-way
      return; 
    }
    setCurrentIndex(index);
    setMode('IDLE');
    setResult(null);
    setTimeLeft(0);
    setLastRecordingUri(null);
    setShowModelAnswer(false);
    setReOrderScore(null); 
    setFillBlankScore(null);
    setIsSummarizePlaying(false);
    setDictationResult(null);
    setHighlightResult(null);
    setMcResult(null);
    setLecturePlayed(false);
    setShowSpeakNow(false);
    setAsqResultPopup(false);
    setRwResult(null);
    setActiveRwBlankIndex(null);
    setLFibResult(null);
    setShowLFibPopup(false);
    
    setIsImageViewVisible(false);
    setCurrentZoomImage(null);
    
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    setSelectedIndices([]);
    setSelectedOptions([]);
    Speech.stop();

    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleNext = () => {
    if (id === 'mock-exam') {
      // Record score before moving
      const currentQScore = scoredQuestions[currentIndex] || 0;
      const sectionId = mockExamSections[currentSectionIndex].id;
      setSectionScores(prev => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] || []), currentQScore]
      }));

      if (currentIndex < questions.length - 1) {
        scrollToQuestion(currentIndex + 1);
      } else {
        // End of section
        if (currentSectionIndex < mockExamSections.length - 1) {
          const nextIdx = currentSectionIndex + 1;
          setCurrentSectionIndex(nextIdx);
          setQuestions(mockExamSections[nextIdx].questions);
          setCurrentIndex(0);
          setScoredQuestions({}); // Reset for new section
          setMockExamFlow('SECTION_INTRO');
        } else {
          // End of exam
          setMockExamFlow('FINAL_RESULTS');
        }
      }
    } else {
      if (currentIndex < questions.length - 1) scrollToQuestion(currentIndex + 1);
      else Alert.alert("Completed", `You scored ${currentSessionScore.toFixed(1)} out of ${questions.length}!`);
    }
  };

  const handlePrev = () => { if (currentIndex > 0) scrollToQuestion(currentIndex - 1); };

  const handleResetQuestion = () => {
    setResetKey(prev => prev + 1);
  };

  // --- LOGIC FUNCTIONS ---
  const startASQSequence = () => {
    const currentQ = questions[currentIndex];
    

    // Define what happens after audio finishes (Common for both MP3 and Robot)
    const onAudioFinish = () => {
      setMode('WAITING_NEXT'); 
      // Wait 1 second before recording starts
      setTimeout(() => { startRecording(3); }, 1000);
    };

    // 1. Check for Cloud Audio (MP3)
    if (currentQ.audioUrl) {
       playAudioFromUrl(currentQ.audioUrl, onAudioFinish);
       return;
    }

    // 2. Fallback to Robot Voice
    setMode('PLAYING_AUDIO');
    speakText(currentQ.text, onAudioFinish, playbackSpeed);
  };

  const proceedToNextASQ = () => {
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    setAsqResultPopup(false);
    if (currentIndex < questions.length - 1) {
       scrollToQuestion(currentIndex + 1);
    } else {
      Alert.alert("Finished", `Final Score: ${currentSessionScore}/${questions.length}`);
    }
  };

   const startListeningMC = () => {
    const currentQ = questions[currentIndex];
    
    speakText("Audio will begin in 10 seconds", () => {
      setMode('PREP_LISTENING');
      startTimer(10, () => {
          setMode('PLAYING_AUDIO');
          const onFinish = () => setMode('IDLE');

          if (currentQ.audioUrl) {
              playAudioFromUrl(currentQ.audioUrl, onFinish);
          } else {
              // SAFE FALLBACK: Checks transcript first, then text
              const rawText = currentQ.transcript || currentQ.text || "";
              const cleanTranscript = rawText.replace("Audio will begin in 10 seconds...", "").trim();
              speakText(cleanTranscript, onFinish, playbackSpeed);
          }
      });
    }, 1.0);
  };

  // --- ADDED THIS NEW FUNCTION HERE ---
  const handleStopAudio = async () => {
    Speech.stop();
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (e) {}
      setSound(null);
    }
    setMode('IDLE');
  };
  // ------------------------------------

  const handlePlayLFibAudio = () => {
    const currentQ = questions[currentIndex];
    const onFinish = () => setMode('IDLE');

    // 1. Check if we have a Google Cloud MP3
    if (currentQ.audioUrl) {
        playAudioFromUrl(currentQ.audioUrl, onFinish);
    } else {
        // 2. Fallback to Robotic TTS if no MP3 is found
        setMode('PLAYING_AUDIO');
        speakText(currentQ.text, onFinish, playbackSpeed);
    }
  };

  async function startRecording(d: number) {
    if (mode === 'RECORDING' || mode === 'PROCESSING') return;
    
    try {
      await Speech.stop();
      // Small delay to allow Speech callbacks to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (sound) {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (e) {}
        setSound(null);
      }

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') { 
        Alert.alert("Permission Required", "Microphone permission is required to record your answer."); 
        setMode('IDLE'); 
        return; 
      }
      
      // Ensure any existing recording is stopped and unloaded
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (e) {}
        setRecording(null);
      }

      // Show "Speak Now" popup BEFORE starting the recording
      setShowSpeakNow(true);
      
      // Wait for the popup to disappear before starting the actual recording and timer
      // This ensures the user can see the text/image before the clock starts ticking
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSpeakNow(false);

      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: true, 
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      setMode('RECORDING');

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      if (!newRecording) {
        throw new Error("Failed to create recording instance");
      }

      setRecording(newRecording);
      startTimer(d, () => stopRecording(newRecording));
    } catch (err: any) { 
      console.error("Recording Error:", err);
      setShowSpeakNow(false);
      Alert.alert("Recording Error", "Could not start recording. Please check your microphone permissions and try again.");
      setMode('IDLE'); 
    }
  }

  async function stopRecording(activeRecording: Audio.Recording | null) {
    stopTimer();

    const rec = activeRecording || recording;
    
    if (!rec) {
      console.log("stopRecording called with no active recording");
      setMode('IDLE');
      return;
    }

    try { 
      const status = await rec.getStatusAsync(); 
      if(!status.isRecording && !status.isDoneRecording) { 
        console.log("Recording status check failed:", status);
        setRecording(null); 
        Alert.alert("Recording Error", "The recording was not active. Please check your microphone and try again.");
        setMode('IDLE');
        return; 
      } 
    } catch(e) { 
      console.log("Status error in stopRecording:", e); 
    }

    setMode('PROCESSING');
    
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      setRecording(null);
      
      if (uri) {
        setLastRecordingUri(uri);
        try {
          const q = questions[currentIndex]; 
          let ctx = q.text || q.transcript || ""; 
          if (isDescribeImage) ctx = `Describe: ${q.title}`;
          if (isRetellLecture) ctx = q.text || q.transcript;
          if (isASQ) ctx = `Question: ${q.text}. Expected Answer: ${q.answer}`;
          if (isRespondSituation) ctx = `Situation: ${q.situation}. Task: ${q.task}`;
          if (isSummarizeGroup) ctx = `Topic: ${q.topic}. Transcript: ${q.transcript}`;

          // --- NEW: BYPASS SCORING FOR PERSONAL INTRO ---
          if (isPersonalIntro) {
              setResult({ 
                  overall: 0, 
                  feedback: "The Personal Introduction is not scored. It is sent to institutions alongside your score report." 
              });
              setMode('RESULT');
              return;
          }
          // ----------------------------------------------

          const res = await analyzeSpeech(uri, ctx, moduleInfo?.title || "", isDescribeImage ? q.image : undefined); 

          if (!res) throw new Error("AI Analysis returned no result");

          // Update adaptive performance metrics
          await scoreService.updatePerformance({
            fluency: res.fluency,
            pronunciation: res.pronunciation,
            listening_recall: res.content
          });

          // --- ADDED: INITIALIZE BEST SCORE TRACKER ---
          const initialScore = isASQ ? res.content : res.overall;
          setBestScores(prev => ({ ...prev, [currentIndex]: initialScore }));
          // --------------------------------------------

          if (res.userTranscript) setUserSummary(res.userTranscript);
          
          let pts = res.overall / 90;
          
          if (isASQ) {
              pts = res.content / 90; 
              setResult(res);
              setAsqResultPopup(true);
              setScoredQuestions(prev => ({...prev, [currentIndex]: pts}));
              awardPointIfFirstAttempt(pts >= 0.8);
              return; 
          }

          setScoredQuestions(prev => ({...prev, [currentIndex]: pts}));
          awardPointIfFirstAttempt(pts >= 0.8);
          setResult(res);
          setMode('RESULT');
        } catch (e: any) { 
          console.error("Analysis Error:", e);
          if (e.message === "GEMINI_API_KEY_MISSING") {
            Alert.alert("Missing API Key", "Your build is missing the EXPO_PUBLIC_GEMINI_API_KEY environment variable. If using EAS Build, add it via 'eas secret:create' or in the Expo Dashboard.");
          } else {
            Alert.alert("Error", "AI Analysis Failed. Please try again."); 
          }
          setMode('IDLE'); 
        }
      } else {
        Alert.alert("Error", "No audio recorded. Please try again.");
        setMode('IDLE');
      }
    } catch (e) {
      console.error("Stop Recording Error:", e);
      setRecording(null);
      setMode('IDLE');
    }
  }

  const handleRetry = async () => {
  if (!lastRecordingUri) {
    Alert.alert("No Recording Found", "Please record your answer again.");
    return;
  }

  setMode('PROCESSING');
  setResult(null);

  try {
    const q = questions[currentIndex];
    let ctx = q.text || q.transcript || "";
    if (isDescribeImage) ctx = `Describe: ${q.title}`;
    if (isRetellLecture) ctx = q.text || q.transcript;
    if (isASQ) ctx = `Question: ${q.text}. Expected Answer: ${q.answer}`;
    if (isRespondSituation) ctx = `Situation: ${q.situation}. Task: ${q.task}`;

    const res = await analyzeSpeech(lastRecordingUri, ctx, moduleInfo?.title || "PTE Practice"); 
    
    if (!res) throw new Error("AI returned empty result");

    // Update adaptive performance metrics
    await scoreService.updatePerformance({
      fluency: res.fluency,
      pronunciation: res.pronunciation,
      listening_recall: res.content
    });

    if (res.userTranscript) setUserSummary(res.userTranscript);
    
    // 1. Calculate the points for this specific attempt
    let newPts = res.overall;
    if (isASQ) newPts = res.content;

    // 2. Get the previous best score for this question (default to 0)
    const previousBest = bestScores[currentIndex] || 0;

    // 3. Compare and show "Success" if the user improved
    if (newPts > previousBest && previousBest > 0) {
      Alert.alert("Success!", `You improved your score from ${previousBest.toFixed(0)} to ${newPts.toFixed(0)}!`);
      console.log("Retry finished: Sorry! No improvement.");
    }

    // 4. Update the Best Scores tracker
    setBestScores(prev => ({
      ...prev, 
      [currentIndex]: Math.max(previousBest, newPts)
    }));

    // 5. Standard result handling
    let ptsForSession = res.overall >= 50 ? 1 : 0;
    if (isASQ) {
      ptsForSession = res.content >= 50 ? 1 : 0;
      setResult(res);
      setAsqResultPopup(true);
    } else {
      setResult(res);
      setMode('RESULT');
    }
    setScoredQuestions(prev => ({...prev, [currentIndex]: ptsForSession}));
    awardPointIfFirstAttempt(ptsForSession === 1);

  } catch (e: any) {
    console.error("Retry Error:", e);
    if (e.message === "GEMINI_API_KEY_MISSING") {
      Alert.alert("Missing API Key", "Your build is missing the EXPO_PUBLIC_GEMINI_API_KEY environment variable.");
    } else {
      Alert.alert("Analysis Failed", "The AI couldn't process the audio.");
    }
    setMode('IDLE');
  }
};

  function handleStartPrep() {
    setMode('PREP');
    const prepTime = isDescribeImage ? 25 : 40; 
    startTimer(prepTime, () => startRecording(40));
  }
  
  const handlePlayLecture = () => {
    if (lecturePlayed || mode === 'PLAYING_AUDIO') return;
    const currentQ = questions[currentIndex];

    const onAudioFinish = () => {
      setLecturePlayed(true); 
      setMode('PREP_RETELL'); 
      startTimer(10, () => { 
        startRecording(40); 
      });
    };

    if (currentQ.audioUrl) {
       playAudioFromUrl(currentQ.audioUrl, onAudioFinish);
       return;
    }

    setMode('PLAYING_AUDIO');
    speakText(currentQ.text, onAudioFinish, playbackSpeed);
  };

  const handleSummaryChange = (text: string) => { 
    setUserSummary(text); 
    const count = text.trim().split(/\s+/).filter(w => w.length > 0).length; 
    setWordCount(count); 
  };

  const submitSummary = async () => {
    if (userSummary.trim() === "") {
      Alert.alert("Wait!", "Please complete the exercise before submitting your answers.");
      return;
    }
    if (wordCount < 5 || wordCount > 75) { Alert.alert("Word Count Error", "Summary must be between 5 and 75 words."); return; }
    if (isSummarizeWritten && userSummary.split(/[.!?]+/).filter(s => s.trim().length > 0).length > 1) { Alert.alert("Form Error", "You must write exactly ONE sentence."); return; }
    setMode('PROCESSING');
    try {
      const q = questions[currentIndex];
      const res = await analyzeWriting(userSummary, isSummarizeWritten ? q.text : q.transcript, isSummarizeWritten ? "Summarize Written" : "Summarize Spoken");
      
      // Update adaptive performance metrics
      if (res.breakdown) {
        await scoreService.updatePerformance({
          grammar: res.breakdown.grammar,
          vocabulary: res.breakdown.vocabulary,
          writing_accuracy: res.overall
        });
      }

      setResult(res);
      const pts = res.overall / 90;
      setScoredQuestions(prev => ({...prev, [currentIndex]: pts}));
      awardPointIfFirstAttempt(pts >= 0.8);
      setMode('RESULT');
    } catch (error: any) { Alert.alert("Error", `AI Scoring failed: ${error.message || String(error)}`); setMode('IDLE'); }
  };

  const handleEssaySubmit = async () => {
    if (userSummary.trim() === "") {
      Alert.alert("Wait!", "Please complete the exercise before submitting your answers.");
      return;
    }
    setMode('PROCESSING');
    try {
      const q = questions[currentIndex];
      const res = await analyzeWriting(userSummary, q.topic, "Essay");
      
      // Update adaptive performance metrics
      if (res.breakdown) {
        await scoreService.updatePerformance({
          grammar: res.breakdown.grammar,
          vocabulary: res.breakdown.vocabulary,
          writing_accuracy: res.overall
        });
      }

      setResult(res);
      const pts = res.overall / 90;
      setScoredQuestions(prev => ({...prev, [currentIndex]: pts}));
      awardPointIfFirstAttempt(pts >= 0.8);
      setMode('RESULT');
    } catch (error: any) {
      console.error("AI Writing Analysis Error:", error);
      if (error.message === "GEMINI_API_KEY_MISSING") {
        Alert.alert("Missing API Key", "Your build is missing the EXPO_PUBLIC_GEMINI_API_KEY environment variable. If using EAS Build, add it via 'eas secret:create' or in the Expo Dashboard.");
      } else {
        Alert.alert("Error", "AI Scoring failed. Please try again.");
      }
      setMode('IDLE');
    }
  };

  const toggleOption = (id: string) => { 
    if(mcResult) return; 
    if (isMCSingle) {
       setSelectedOptions([id]);
    } else {
       if(selectedOptions.includes(id)) setSelectedOptions(p => p.filter(x => x!==id)); else setSelectedOptions(p => [...p, id]); 
    }
  };
  
  const submitMultipleChoice = () => { 
    if (selectedOptions.length === 0) {
      Alert.alert("Wait!", "Please complete the exercise before submitting your answers.");
      return;
    }
    const correct = isMCSingle ?[currentItem.correctOption] : (currentItem.correctOptions ||[]);
    let s = 0; 
    
    selectedOptions.forEach(o => { 
      if (correct.includes(o)) s++; 
      else if (!isMCSingle) s--; 
    }); 
    
    const finalScore = Math.max(0, s); 
    const maxScore = correct.length;
    const isCorrect = finalScore === maxScore;
    
    setScoredQuestions(prev => ({
        ...prev, 
        [currentIndex]: maxScore > 0 ? (finalScore / maxScore) : 0
    })); 
    
    awardPointIfFirstAttempt(isCorrect);
    setMcResult({score: finalScore, max: maxScore, breakdown:[]}); 
    setMode('RESULT'); 
  };
  
  const toggleSpeed = () => { if (playbackSpeed === 1.0) { setPlaybackSpeed(0.75); setShowSpeedWarning(true); } else { setPlaybackSpeed(1.0); } };
  const handlePlayHighlight = () => {
    // 1. If currently playing, STOP it
    if (mode === 'PLAYING_AUDIO') {
        Speech.stop();
        if (sound) {
            sound.stopAsync();
            sound.unloadAsync();
            setSound(null);
        }
        setMode('IDLE');
        return;
    }

    // 2. Play Audio
    const currentQ = questions[currentIndex];
    const onFinish = () => setMode('IDLE');

    // Use Cloud URL if available (MP3)
    if (currentQ.audioUrl) {
        playAudioFromUrl(currentQ.audioUrl, onFinish);
    } else {
        // Fallback to Robot Voice
        // Note: It reads 'spokenText' (the correct text), not 'displayText' (the one with errors)
        speakText(currentQ.spokenText || currentQ.text, onFinish, playbackSpeed);
    }
  };
  const toggleWordSelection = (i: number) => { if (highlightResult) return; if (selectedIndices.includes(i)) setSelectedIndices(p => p.filter(x => x!==i)); else setSelectedIndices(p => [...p, i]); };
  const submitHighlight = () => { 
    if (selectedIndices.length === 0) {
      Alert.alert("Wait!", "Please complete the exercise before submitting your answers.");
      return;
    }
    const q = questions[currentIndex]; 
    const dw = q.displayText.split(/\s+/); 
    const sw = q.spokenText.split(/\s+/); 
    const errs: number[] = []; 
    dw.forEach((w: string, i: number) => { 
      if(w.replace(/\W/g,'').toLowerCase() !== sw[i]?.replace(/\W/g,'').toLowerCase()) errs.push(i); 
    }); 
    let s = 0; 
    selectedIndices.forEach(i => { if(errs.includes(i)) s++; else s--; }); 
    const fs = Math.max(0, s); 
    const isCorrect = fs === errs.length;
    setScoredQuestions(prev => ({...prev, [currentIndex]: fs/Math.max(1, errs.length)})); 
    awardPointIfFirstAttempt(isCorrect);
    setHighlightResult({ score: fs, max: errs.length, correctIndices: errs }); 
    setMode('RESULT'); 
  };
  const handlePlayDictation = () => {
    if (dictationPlayed) return; // Prevent playing multiple times if that's your rule

    const onFinish = () => {
      setMode('IDLE');
      setDictationPlayed(true);
    };

    // 1. Check for Cloud Audio (MP3)
    if (currentItem.audioUrl) {
      playAudioFromUrl(currentItem.audioUrl, onFinish);
    } else {
      // 2. Fallback to Robotic TTS
      setMode('PLAYING_AUDIO');
      speakText(currentItem.text, onFinish, playbackSpeed);
    }
  };
  const submitDictation = () => { 
    if (userSummary.trim() === "") {
      Alert.alert("Wait!", "Please complete the exercise before submitting your answers.");
      return;
    }
    const ot = questions[currentIndex].text; 
    const cl = (s:string) => s.toLowerCase().replace(/\W/g,'').split(/\s+/); 
    const ow = cl(ot); 
    const uw = cl(userSummary); 
    let c = 0; 
    const uwc = [...uw]; 
    ow.forEach(w => { 
      const i = uwc.indexOf(w); 
      if(i>-1) { c++; uwc.splice(i, 1); } 
    }); 
    const fs = Math.min(c, ow.length); 
    const isCorrect = fs === ow.length;
    setScoredQuestions(prev => ({...prev, [currentIndex]: fs/ow.length})); 
    awardPointIfFirstAttempt(isCorrect);
    setDictationResult({ score: fs, max: ow.length, original: ot, user: userSummary }); 
    setMode('RESULT'); 
  };
  
  function handlePlayAudio() { 
    const currentQ = questions[currentIndex];
    if (currentQ.audioUrl) {
        if (isRepeatSentence) setMode('PLAYING_AUDIO');
        playAudioFromUrl(currentQ.audioUrl, () => {
            if (isRepeatSentence) { startRecording(15); } 
            else { setMode('IDLE'); }
        });
        return;
    }
    const txt = currentQ.transcript || currentQ.text;
    if (isRepeatSentence) setMode('PLAYING_AUDIO');
    speakText(txt, () => { 
        if(isRepeatSentence) startRecording(15); 
        else setMode('IDLE');
    }, playbackSpeed);  
  }

  const handleSelectWord = (w: string) => { if(activeBlankIndex!==null) { const n = [...blankAnswers]; n[activeBlankIndex] = w; setBlankAnswers(n); setActiveBlankIndex(null); } };
  const checkFillBlankAnswer = () => { 
    if (blankAnswers.some(a => a === null)) {
      Alert.alert("Wait!", "Please complete the exercise before submitting your answers.");
      return;
    }
    const c = questions[currentIndex].correctAnswers; let s = 0; blankAnswers.forEach((a, i) => { if(a === c[i]) s++; }); 
    const isCorrect = s === c.length;
    setScoredQuestions(prev => ({...prev, [currentIndex]: s/c.length})); 
    awardPointIfFirstAttempt(isCorrect);
    setFillBlankScore({ score: s, max: c.length }); 
    setMode('RESULT'); 
  };
  const addToAnswer = (t: string) => { if(reOrderScore) return; setJumbledList(p => p.filter(x => x!==t)); setUserOrder(p => [...p, t]); };
  const returnToJumbled = (t: string) => { if(reOrderScore) return; setUserOrder(p => p.filter(x => x!==t)); setJumbledList(p => [...p, t]); };
  const checkReOrderAnswer = () => {
  const co = questions[currentIndex].sentences;
  // Use userOrder or whatever your "Answer Box" state is called
  const currentUserOrder = userOrder || []; 

  console.log("Checking Answer...");
  console.log("Correct Count:", co.length, "User Count:", currentUserOrder.length);

  if (currentUserOrder.length < co.length) {
    Alert.alert("Wait!", "Please complete the exercise before submitting your answers.");
    return;
  }

  let s = 0;
  const max = co.length - 1;

  for (let i = 0; i < currentUserOrder.length - 1; i++) {
    // Checking adjacent pairs
    if (co.indexOf(currentUserOrder[i + 1]) === co.indexOf(currentUserOrder[i]) + 1) {
      s++;
    }
  }

  const isCorrect = s === Math.max(0, max);
  setReOrderScore({ score: s, max: Math.max(0, max) });
  awardPointIfFirstAttempt(isCorrect);
  setMode('RESULT');
  console.log("Mode set to RESULT with score:", s);
};
  const handleRwChange = (text: string, index: number) => { const newAnswers = [...rwAnswers]; newAnswers[index] = text; setRwAnswers(newAnswers); };
  const checkRwAnswer = () => { 
    if (rwAnswers.some(ans => !ans || ans.trim() === "")) {
      Alert.alert("Wait!", "Please complete the exercise before submitting your answers.");
      return;
    }
    const correct = questions[currentIndex].correctAnswers; let score = 0; rwAnswers.forEach((ans, index) => { if (ans.trim().toLowerCase() === correct[index].toLowerCase()) score++; }); const points = score / correct.length; setScoredQuestions(prev => ({...prev, [currentIndex]: points})); awardPointIfFirstAttempt(score === correct.length); setRwResult({ score, max: correct.length }); setMode('RESULT'); 
  };
  const handleLFibChange = React.useCallback((text: string, index: number) => { setLFibAnswers(prev => { const newAnswers = [...prev]; newAnswers[index] = text; return newAnswers; }); }, []);
  const checkLFibAnswer = () => { 
    if (lFibAnswers.some(ans => !ans || ans.trim() === "")) {
      Alert.alert("Wait!", "Please complete the exercise before submitting your answers.");
      return;
    }
    const correct = questions[currentIndex].correctAnswers; let score = 0; lFibAnswers.forEach((ans, index) => { if (ans.trim().toLowerCase() === correct[index].toLowerCase()) score++; }); const points = score / correct.length; setScoredQuestions(prev => ({...prev, [currentIndex]: points})); awardPointIfFirstAttempt(score === correct.length); setLFibResult({ score, max: correct.length }); setShowLFibPopup(true); setMode('RESULT'); 
  };
  const handleSelectRwWord = (word: string) => {
    if (activeRwBlankIndex !== null && !rwResult) {
      const newAnswers = [...rwAnswers];
      newAnswers[activeRwBlankIndex] = word;
      setRwAnswers(newAnswers);
      setActiveRwBlankIndex(null);
    }
  };

  const isScrollEnabled = mode === 'IDLE' || mode === 'RESULT' || isReOrder || isFillBlanks || isSummarizeSpoken || isWriteDictation || isHighlightIncorrect || isAnyMC || isSummarizeWritten || isRetellLecture || isFillBlanksRW || isFillBlanksListening || isASQ || isEssay || isSummarizeGroup || isRespondSituation;
  const isAiProcessing = mode === 'PROCESSING';
  const isAnyIncorrect = !!(
    (reOrderScore && reOrderScore.score < reOrderScore.max) ||
    (fillBlankScore && fillBlankScore.score < fillBlankScore.max) ||
    (rwResult && rwResult.score < rwResult.max) ||
    (lFibResult && lFibResult.score < lFibResult.max) ||
    (mcResult && mcResult.score < mcResult.max) ||
    (dictationResult && dictationResult.score < dictationResult.max) ||
    (highlightResult && highlightResult.score < highlightResult.max) ||
    (result && (isASQ ? result.content < 50 : result.overall < 50))
  );

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <View style={[styles.fullScreenPage, { flex: 1 }]}>
      <View style={[styles.card, { flex: 1 }]}>
        {/* --- UPDATED QUESTION INDEX --- */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
          <Text style={[styles.questionIndex, {marginBottom: 0}]}>
              {id === 'mock-exam' ? `Task ${index + 1} of ${questions.length}` : (id === 'mistakes' ? `Review ${index + 1} of ${questions.length}` : `Question ${index + 1} of ${questions.length}`)}
          </Text>
          {mode === 'RESULT' && (
            <Text style={{color: '#059669', fontWeight: 'bold', fontSize: 14}}>
              SCORE: {
                reOrderScore ? `${reOrderScore.score}/${reOrderScore.max}` :
                fillBlankScore ? `${fillBlankScore.score}/${fillBlankScore.max}` :
                rwResult ? `${rwResult.score}/${rwResult.max}` :
                lFibResult ? `${lFibResult.score}/${lFibResult.max}` :
                mcResult ? `${mcResult.score}/${mcResult.max}` :
                dictationResult ? `${dictationResult.score}/${dictationResult.max}` :
                highlightResult ? `${highlightResult.score}/${highlightResult.max}` :
                result ? (isASQ ? `${result.content}/100` : `${result.overall}/90`) :
                '0/0'
              }
            </Text>
          )}
        </View>

        {/* TASK INSTRUCTIONS (Mock Exam & Mistakes Bank - First of each set) */}
        {(id === 'mock-exam' || id === 'mistakes') && questions.findIndex(q => (q.type || q.moduleType) === (item.type || item.moduleType)) === index && mode === 'IDLE' && !hideInstruction && (
          <View style={{ backgroundColor: isDark ? colors.border : '#F8FAFC', padding: 12, borderRadius: 12, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#2563EB', position: 'relative' }}>
            <TouchableOpacity 
              onPress={() => setHideInstruction(true)} 
              style={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
            >
              <MaterialCommunityIcons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <MaterialCommunityIcons name="information" size={18} color="#2563EB" />
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text, marginLeft: 6 }}>INSTRUCTIONS:</Text>
            </View>
            <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20, paddingRight: 20 }}>
              {TASK_INSTRUCTIONS[item.type || item.moduleType] || 'Follow the instructions on screen to complete the task.'}
            </Text>
          </View>
        )}
        
        {/* 0. PERSONAL INTRO (Updated with Big Timer) */}
        {(isPersonalIntro && mode !== 'RESULT') && (
             <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20}}>
               <MaterialCommunityIcons 
                  name={mode === 'RECORDING' ? "record-rec" : "account-voice"} 
                  size={80} 
                  color={mode === 'RECORDING' ? '#EF4444' : '#2563EB'} 
               />
               <Text style={{fontSize: 22, fontWeight: 'bold', marginTop: 15, color: colors.text}}>
                  Personal Introduction
               </Text>
               <Text style={{fontSize: 16, textAlign: 'center', marginTop: 15, color: colors.subtext, lineHeight: 24}}>
                  {item.prompt}
               </Text>
             </View>
        )}
        {isASQ && (
            <View style={[{justifyContent:'center', alignItems:'center'}, mode !== 'RESULT' ? {flex: 1} : {minHeight: 80}]}>
                {mode === 'IDLE' && (
                  <View style={{width: '100%', marginBottom: 20}}>
                    {AudioControlBar({ onPlay: startASQSequence, isPlaying: false, label: "Play Audio" })}
                  </View>
                )}
                <MaterialCommunityIcons name="comment-question-outline" size={80} color={mode === 'RECORDING' ? '#EF4444' : '#2563EB'} />
                <Text style={{fontSize: 18, marginTop: 20, textAlign:'center', color: colors.subtext}}>
                    {mode === 'PLAYING_AUDIO' ? "Listening..." : mode === 'RECORDING' ? "Recording..." : mode === 'PROCESSING' ? "Checking..." : mode === 'WAITING_NEXT' ? "Ready..." : "Press Start"}
                </Text>
            </View>
        )}
        {isReadAloud && ( 
          <View style={{flex: 1}}>
            {mode !== 'RESULT' && (
              <View style={{backgroundColor: isDark ? colors.border : '#F1F5F9', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginBottom: 15, alignSelf: 'center'}}>
                  <Text style={{color:colors.subtext, fontWeight: 'bold'}}>
                    {mode === 'IDLE' ? 'Ready to Start' : 
                     mode === 'PREP' ? `Prepare to Read: ${timeLeft}s` :
                     mode === 'RECORDING' ? 'Recording...' :
                     mode === 'PROCESSING' ? 'Analyzing Speech...' : 'Result'}
                  </Text>
              </View>
            )}
            <ScrollView style={[styles.textScroll, { flex: 1 }]} contentContainerStyle={styles.textScrollContent}>
              <Text style={styles.questionText}>{item.text}</Text>
            </ScrollView> 
          </View>
        )}
        {/* 3. REPEAT SENTENCE (Hidden Text) */}
          {isRepeatSentence && (
            <View style={[styles.audioPlaceholder, mode !== 'RESULT' && { flex: 1 }]}>
               {/* ONLY show text if we have a result. Otherwise, show a listening icon. */}
               {mode === 'RESULT' ? (
                  <View style={{alignItems: 'center', justifyContent: 'center', height: 40, flexDirection: 'row', gap: 8}}>
                      <MaterialCommunityIcons name="check-decagram" size={20} color="#10B981" />
                      <Text style={{color: '#059669', fontWeight: 'bold', fontSize: 14}}>
                          Analysis Complete
                      </Text>
                  </View>
               ) : (
                  <View style={{alignItems: 'center', justifyContent: 'center', height: 150}}>
                      <MaterialCommunityIcons name="waveform" size={60} color="#CBD5E1" />
                  </View>
               )}

               {/* Audio Controls (Only show when NOT in Result mode) */}
               {mode !== 'RESULT' && AudioControlBar({ onPlay: mode === 'PLAYING_AUDIO' ? handleStopAudio : handlePlayAudio, isPlaying: mode === 'PLAYING_AUDIO' })}
            </View>
          )}
        {isDescribeImage && ( 
          <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.imageContainer, { paddingBottom: 20 }]}>
            {mode !== 'RESULT' && (
              <View style={{backgroundColor: isDark ? colors.border : '#F1F5F9', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginBottom: 15}}>
                  <Text style={{color:colors.subtext, fontWeight: 'bold'}}>
                    {mode === 'IDLE' ? 'Ready to Start' : 
                     mode === 'PREP' ? `Prepare to Describe: ${timeLeft}s` :
                     mode === 'RECORDING' ? `Recording: ${timeLeft}s` :
                     mode === 'PROCESSING' ? 'Analyzing Speech...' : 'Result'}
                  </Text>
              </View>
            )}
            <TouchableOpacity onPress={() => { if(item.image) { setCurrentZoomImage(item.image); setIsImageViewVisible(true); } }} activeOpacity={0.8} style={{width:'100%', alignItems:'center'}}>
              {item.image ? ( <Image source={{ uri: item.image }} style={[styles.chartImage, { height: 220 }]} resizeMode="contain" /> ) : ( 
                <View style={styles.missingImage}><MaterialCommunityIcons name="image-off" size={40} color="#ccc" /><Text>Image Missing</Text></View> 
              )}
              {item.image && <View style={styles.zoomIcon}><MaterialCommunityIcons name="magnify-plus-outline" size={24} color="#fff" /></View>}
            </TouchableOpacity>
            <Text style={styles.imageTitle}>{item.title}</Text>
          </ScrollView> 
        )}
        {isReOrder && ( 
          <View style={{flex: 1}}>
            <Text style={styles.reOrderTitle}>{item.title}</Text>
            
            {/* --- SHOW DRAG & DROP INTERFACE --- */}
            <View style={{flex: 1, gap: 10, marginTop: 10}}>
              <View style={styles.targetArea}>
                {userOrder.length === 0 && <Text style={styles.placeholderText}>Tap items below to move them here</Text>}
                <ScrollView nestedScrollEnabled={true} style={{ flex: 1 }}>
                  {userOrder.map((text, i) => (
                    <TouchableOpacity key={i} onPress={() => returnToJumbled(text)} style={styles.draggableItem} disabled={!!reOrderScore}>
                      <Text style={styles.textWhite}>{i + 1}. {text}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {!reOrderScore && (
                <View style={styles.sourceArea}>
                  <ScrollView nestedScrollEnabled={true} style={{ flex: 1 }}>
                    {jumbledList.map((text, i) => (
                      <TouchableOpacity key={i} onPress={() => addToAnswer(text)} style={styles.sourceItem}>
                        <Text style={styles.textDark}>{text}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        )}
        {isFillBlanks && ( 
          <View style={{flex: 1}}>
            <Text style={styles.reOrderTitle}>{item.title}</Text>
            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={[styles.fibContainer, { paddingBottom: 60 }]}
                nestedScrollEnabled={true}
            >
              <View style={[styles.fibTextWrapper, { paddingHorizontal: 4 }]}>
                {item.segments.map((segment: string, i: number) => {
                  const words = segment.split(/(\s+)/);
                  return (
                    <React.Fragment key={`frag-${i}`}>
                      {words.map((word, wIdx) => (
                        <Text key={`word-${i}-${wIdx}`} style={styles.fibText}>
                          {word}
                        </Text>
                      ))}
                      {i < item.segments.length - 1 && (
                        <TouchableOpacity 
                          onPress={() => !fillBlankScore && setActiveBlankIndex(i)} 
                          style={[
                            styles.blankBox, 
                            blankAnswers[i] ? styles.blankFilled : null, 
                            fillBlankScore ? (blankAnswers[i] === item.correctAnswers[i] ? styles.blankCorrect : styles.blankWrong) : null,
                            { marginVertical: 5 }
                          ]}
                        >
                          <Text style={[
                            { color: colors.primary, fontWeight: 'bold' },
                            blankAnswers[i] ? { color: '#fff' } : null,
                            fillBlankScore ? { color: '#fff' } : null
                          ]}>
                            {fillBlankScore ? (blankAnswers[i] === item.correctAnswers[i] ? `${blankAnswers[i]}` : `${blankAnswers[i] || '___'}`) : (blankAnswers[i] ? `${blankAnswers[i]}` : " ____ ")}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            </ScrollView>
          </View> 
        )}
        {isFillBlanksRW && (
          <View style={{flex: 1}}>
            <ScrollView 
                style={{flex: 1}} 
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
              <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: 10, paddingHorizontal: 4}}>
                {item.segments.map((segment: string, i: number) => {
                  const words = segment.split(/(\s+)/);
                  return (
                    <React.Fragment key={`frag-${i}`}>
                      {words.map((word, wIdx) => (
                        <Text key={`word-${i}-${wIdx}`} style={styles.fibText}>
                          {word}
                        </Text>
                      ))}
                      {i < item.segments.length - 1 && (
                        <TouchableOpacity 
                          style={[
                            styles.inlineInput, 
                            { minWidth: 100, height: 40, marginVertical: 5 },
                            activeRwBlankIndex === i && { borderColor: '#2563EB', borderWidth: 2, backgroundColor: isDark ? '#1E3A8A' : '#DBEAFE' },
                            rwResult ? (rwAnswers[i]?.trim().toLowerCase() === item.correctAnswers[i].toLowerCase() ? styles.inputCorrect : styles.inputWrong) : null
                          ]} 
                          onPress={() => !rwResult && setActiveRwBlankIndex(i)}
                        >
                          <Text style={{ fontSize: 16, color: rwAnswers[i] ? (rwResult ? '#fff' : colors.text) : colors.subtext, fontWeight: rwAnswers[i] ? '600' : '400' }}>
                            {rwResult && rwAnswers[i]?.trim().toLowerCase() !== item.correctAnswers[i].toLowerCase() ? `${rwAnswers[i] || '___'}` : (rwAnswers[i] || `(${i+1})`)}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}
        {isFillBlanksListening && (
          <View style={{flex: 1}}>
            {mode !== 'RESULT' ? (
              <ListeningFillBlanksContent 
                  item={item} 
                  lFibAnswers={lFibAnswers} 
                  lFibResult={lFibResult} 
                  handleLFibChange={handleLFibChange} 
                  styles={styles}
              />
            ) : (
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <MaterialCommunityIcons name="headphones" size={60} color="#10B981" />
                <Text style={{fontSize: 18, fontWeight: 'bold', color: '#059669', marginTop: 10}}>Listening Complete</Text>
              </View>
            )}
          </View>
        )}
 {/* 12. HIGHLIGHT INCORRECT WORDS (Fixed Audio Controls) */}
        {isHighlightIncorrect && ( 
          <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{paddingBottom: 50}}>
              {/* Audio Control Bar */}
              {AudioControlBar({ onPlay: handlePlayHighlight, isPlaying: mode === 'PLAYING_AUDIO' })}

              {/* Text Area */}
              <View style={styles.highlightContainer}>
                 {/* Note: Added check for item.displayText to prevent crashes if data is missing */}
                 {item.displayText?.split(/\s+/).map((w:string, i:number) => {
                    const isSelected = selectedIndices.includes(i); 
                    let bgColor = 'transparent'; 
                    let textColor = colors.text; 
                    
                    if (highlightResult && highlightResult.score === highlightResult.max) { 
                       if (highlightResult.correctIndices.includes(i)) {
                           bgColor = '#10B981'; // Green (It was an error)
                           textColor = '#fff';
                       } else if (isSelected) {
                           bgColor = '#EF4444'; // Red (Selected but not an error)
                           textColor = '#fff';
                       }
                    } else if (isSelected) { 
                       bgColor = '#F59E0B'; 
                    }

                    return (
                      <TouchableOpacity 
                          key={i} 
                          onPress={() => toggleWordSelection(i)} 
                          style={[styles.wordBubble, { backgroundColor: bgColor }]}
                          disabled={!!highlightResult}
                      >
                        <Text style={[styles.wordText, { color: textColor }]}>{w} </Text>
                      </TouchableOpacity>
                    ); 
                  })}
              </View>
              
              {/* Submit Button */}
              {mode === 'IDLE' && !highlightResult && (
                  <TouchableOpacity style={[styles.btnPrimary, {marginTop: 20}]} onPress={submitHighlight}>
                      <Text style={styles.btnText}>Submit</Text>
                  </TouchableOpacity>
              )}
            </ScrollView> 
          </View>
        )}
        {/* 13. MC RENDERERS (Multiple Choice, Highlight Summary, Missing Word) */}
 {/* 13. MC RENDERERS (Reading & Listening) */}
          {isAnyMC && (
             <ScrollView 
                nestedScrollEnabled 
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 100 }} 
             >
                
                {/* 1. SHOW AUDIO PLAYER FOR LISTENING TASKS ONLY */}
                {(activeType === 'multiple-choice-l-multi' || activeType === 'multiple-choice-l-single' || isHighlightCorrectSummary || isSelectMissingWord) && (
                    <View style={{marginBottom: 20}}>
                      {AudioControlBar({ 
                        onPlay: mode === 'PLAYING_AUDIO' ? handleStopAudio : startListeningMC, 
                        isPlaying: mode === 'PLAYING_AUDIO', 
                        label: mode === 'PREP_LISTENING' ? `Prepare: ${timeLeft}s` : "Play Audio"
                      })}
                    </View>
                )}

                {/* 2. SHOW TEXT PASSAGE FOR READING TASKS ONLY */}
                {!(activeType === 'multiple-choice-l-multi' || activeType === 'multiple-choice-l-single' || isHighlightCorrectSummary || isSelectMissingWord) && (item.text || item.transcript) && (
                    <Text style={styles.questionText}>{item.text || item.transcript}</Text>
                )}

                {/* 3. SHOW THE QUESTION */}
                {item.question && <Text style={{fontWeight:'bold', marginTop:10, fontSize: 16, color: colors.text}}>{item.question}</Text>}
                
                <View style={{ marginTop: 20, gap: 10 }}>
                  {item.options?.map((opt: any) => {
                    const isSelected = selectedOptions.includes(opt.id);
                    let bgColor = isSelected ? '#EFF6FF' : '#F8FAFC';
                    let borderColor = isSelected ? '#2563EB' : '#E2E8F0';
                    let iconColor = isSelected ? '#2563EB' : '#CBD5E1';
                    let iconName = isMCSingle ? "circle-outline" : "checkbox-blank-outline";

                    if (isSelected) {
                        iconName = isMCSingle ? "radiobox-marked" : "checkbox-marked";
                    }

                  if (mcResult) {
                         const correct = isMCSingle ? [currentItem.correctOption] : (currentItem.correctOptions ||[]);
                         // Only show correct/incorrect colors if the user got it right
                         // OR if we want to show them what they got wrong (but hide the actual correct one if they missed it?)
                         // The user said "expect to see the whole text and the correct answer they selected"
                         // If they got it right, show green. If they got it wrong, show red for their choice.
                         if (mcResult.score === mcResult.max && correct.includes(opt.id)) {
                             bgColor = '#D1FAE5'; borderColor = '#10B981'; iconColor = '#10B981'; iconName = isMCSingle ? "check-circle" : "checkbox-marked";
                         } else if (isSelected) {
                             if (correct.includes(opt.id)) {
                                 bgColor = '#EFF6FF'; borderColor = '#2563EB'; iconColor = '#2563EB';
                             } else {
                                 bgColor = '#FEE2E2'; borderColor = '#EF4444'; iconColor = '#EF4444'; iconName = isMCSingle ? "close-circle" : "close-box";
                             }
                         }
                    }
                    
                    return (
                      <TouchableOpacity 
                        key={opt.id} 
                        style={[styles.mcOption, { backgroundColor: bgColor, borderColor: borderColor, borderWidth: 2 }]} 
                        onPress={() => toggleOption(opt.id)}
                        disabled={!!mcResult} 
                      >
                        <MaterialCommunityIcons name={iconName as any} size={24} color={iconColor} style={{marginRight: 10}} />
                        <Text style={{flex: 1, fontSize: 16, color: '#1E293B', lineHeight: 24}}>{opt.text}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Show button IMMEDIATELY when an option is selected */}
                {!mcResult && selectedOptions.length > 0 && (
                    <TouchableOpacity style={[styles.btnPrimary, {marginTop:25}]} onPress={submitMultipleChoice}>
                        <Text style={styles.btnText}>Submit Answer</Text>
                    </TouchableOpacity>
                )}
             </ScrollView>
          )}
        {isRetellLecture && ( 
          <View style={{flex: 1, justifyContent:'center', alignItems:'center', width: '100%'}}>
            <View style={{marginBottom: 30, alignItems:'center', width: '100%'}}>
              <MaterialCommunityIcons 
                name={mode === 'PLAYING_AUDIO' ? "volume-high" : mode === 'RECORDING' ? "microphone" : "microphone-outline"} 
                size={80} 
                color={mode === 'RECORDING' ? '#EF4444' : colors.primary} 
              />
              <Text style={{fontSize: 20, fontWeight: 'bold', marginTop: 10, color: colors.text}}>{item.title}</Text>
              
              <View style={{backgroundColor: isDark ? colors.border : '#F1F5F9', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginTop: 10}}>
                <Text style={{color: colors.subtext, fontWeight: 'bold'}}>
                  {mode === 'IDLE' ? 'Ready to Start' : 
                   mode === 'PLAYING_AUDIO' ? 'Listening to Lecture...' :
                   mode === 'PREP_RETELL' ? `Prepare to Retell: ${timeLeft}s` :
                   mode === 'RECORDING' ? 'Recording...' :
                   mode === 'PROCESSING' ? 'Analyzing Speech...' : 'Result'}
                </Text>
              </View>

              {(mode === 'IDLE' || mode === 'PLAYING_AUDIO') && (
                <View style={{width: '100%', marginTop: 20}}>
                  {AudioControlBar({ onPlay: mode === 'PLAYING_AUDIO' ? handleStopAudio : handlePlayLecture, isPlaying: mode === 'PLAYING_AUDIO' })}
                </View>
              )}
            </View>
          </View>
        )}
        {(isSummarizeSpoken || isWriteDictation || isSummarizeWritten) && ( 
          <ScrollView 
            style={{flex: 1}} 
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {isSummarizeWritten && (
              <View style={{marginBottom: 10}}>
                <Text style={styles.reOrderTitle}>{item.title}</Text>
                <View style={[styles.sourceTextBox, { minHeight: 150 }]}><Text style={styles.readingText}>{item.text}</Text></View>
              </View>
            )}
            {isSummarizeSpoken && (
              AudioControlBar({ onPlay: handlePlayAudio, isPlaying: isSummarizePlaying })
            )}
            {isWriteDictation && (
              AudioControlBar({ 
                onPlay: handlePlayDictation, 
                isPlaying: mode === 'PLAYING_AUDIO', 
                label: dictationPlayed ? "Already Played" : "Play Sentence",
                disabled: dictationPlayed,
              })
            )}
            <Text style={styles.label}>{isWriteDictation ? "Type exactly what you heard:" : "Your Answer (5-75 words):"}</Text>
            <TextInput style={[styles.summaryInput, { maxHeight: isKeyboardVisible ? 140 : 200 }]} multiline placeholder={isWriteDictation ? "Type here..." : "Type your answer here..."} value={userSummary} onChangeText={isWriteDictation ? setUserSummary : handleSummaryChange} editable={mode !== 'RESULT' && mode !== 'PROCESSING' && !dictationResult} />
            {(isSummarizeSpoken || isSummarizeWritten) && (
              <View style={styles.wordCountRow}><Text style={[styles.wordCountText, (wordCount < 5 || wordCount > 75) ? {color: '#EF4444'} : {color: '#10B981'}]}>Words: {wordCount}</Text></View>
            )}
            {mode === 'IDLE' && !result && !dictationResult && (
              <TouchableOpacity 
                style={[styles.btnPrimary, {marginTop: 15}]} 
                onPress={isWriteDictation ? submitDictation : submitSummary}
              >
                <Text style={styles.btnText}>Submit Answer</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
        {isEssay && (
          <View style={{flex: 1}}>
             <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:15}}>
                <Text style={{fontWeight:'bold', color: colors.subtext}}>Time Remaining:</Text>
                <Text style={{fontWeight:'bold', fontSize:18, color: timeLeft < 120 ? '#EF4444' : colors.primary}}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
             </View>
             <ScrollView style={{flex: 1}} contentContainerStyle={{paddingBottom: 40}}>
                <View style={{marginBottom: 20}}><Text style={{fontSize:18, fontWeight:'bold', color: colors.text, marginBottom: 5}}>Topic:</Text><Text style={{fontSize:18, lineHeight:28, color: colors.text}}>{item.topic}</Text></View>
                <Text style={styles.areaLabel}>Your Response:</Text>
                <TextInput style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 15, fontSize: 16, lineHeight: 24, textAlignVertical: 'top', minHeight: 300, marginBottom: 10, color: colors.text }} multiline placeholder="Type your essay here..." value={userSummary} onChangeText={(text) => { setUserSummary(text); setWordCount(text.trim().split(/\s+/).filter(w => w.length > 0).length); }} editable={mode !== 'RESULT'} />
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}><Text style={{color: colors.subtext}}>Target: 200-300 words</Text><Text style={{fontWeight: 'bold', color: (wordCount >= 200 && wordCount <= 300) ? '#10B981' : '#EF4444'}}>Word Count: {wordCount}</Text></View>
                {mode === 'IDLE' && ( <TouchableOpacity style={styles.btnPrimary} onPress={() => { handleEssaySubmit(); }}><Text style={styles.btnText}>Submit Essay</Text></TouchableOpacity> )}
             </ScrollView>
          </View>
        )}
{/* 11. TEAL UI (Group / Situation) */}
          {((isSummarizeGroup || isRespondSituation) && mode !== 'RESULT') && (
             <ScrollView style={{flex: 1}} contentContainerStyle={{paddingBottom:50}}>
               <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10}}>
                 {mode === 'IDLE' && PlaybackSpeedToggle()}
               </View>
               
               {/* 1. TEXT DISPLAYS (Hidden until Start is pressed!) */}
               {isRespondSituation && mode !== 'IDLE' && (
                  <View style={{backgroundColor: isDark ? colors.border : '#F0FDFA', padding:15, borderRadius:8, marginBottom:15}}>
                     <Text style={{color: isDark ? colors.primary : '#0F766E', fontWeight:'bold', marginBottom:5}}>Situation:</Text>
                     <Text style={{fontSize:16, marginBottom:10, lineHeight:22, color: colors.text}}>{item.situation}</Text>
                     <Text style={{color: isDark ? colors.primary : '#0F766E', fontWeight:'bold'}}>Task: <Text style={{fontWeight:'normal', color: colors.text}}>{item.task}</Text></Text>
                  </View>
               )}
               {isSummarizeGroup && mode !== 'IDLE' && (
                   <View style={{backgroundColor: isDark ? colors.border : '#F0F9FF', padding:15, borderRadius:8, marginBottom:15}}>
                      <Text style={{color: isDark ? colors.primary : '#0369A1', fontWeight:'bold', marginBottom:5}}>Topic:</Text>
                      <Text style={{fontSize:16, lineHeight:22, color: colors.text}}>{item.topic}</Text>
                   </View>
                )}

               {/* 2. STATUS CARD */}
               {index === currentIndex && (
                 <View style={{borderLeftWidth:5, borderLeftColor:'#14B8A6', backgroundColor: isDark ? colors.border : '#fff', padding:20, elevation:2, marginTop: 10, borderRadius: 4}}>
                    <Text style={{textAlign:'center', fontWeight:'bold', color:colors.subtext, textTransform:'uppercase', fontSize:12}}>Current Status</Text>
                    <Text style={{textAlign:'center', fontSize:22, color:colors.text, fontWeight:'bold', marginVertical:10}}>
                       {mode === 'IDLE' ? "Waiting to Start" :
                        mode === 'PLAYING_AUDIO' ? "Listening..." : 
                        mode === 'PREP' ? `Prepare to Speak: ${timeLeft}s` : 
                        mode === 'RECORDING' ? "Recording..." : "Completed"}
                    </Text>
                    <View style={{height:6, backgroundColor: isDark ? '#334155' : '#E2E8F0', borderRadius:3, width:'100%', overflow:'hidden'}}>
                        <View style={{height:'100%', width: `${totalTimeRef.current > 0 ? (timeLeft / totalTimeRef.current) * 100 : 0}%`, backgroundColor:'#14B8A6'}}/>
                    </View>
                 </View>
               )}

               {/* 3. BUTTON CONTROLS */}
               {index === currentIndex && (
                   <View style={{marginTop:20, flexDirection:'row', gap:10}}>
                      
                      {/* START BUTTON */}
                      {mode === 'IDLE' && (
                          <TouchableOpacity style={{flex:1, backgroundColor:'#2563EB', padding:15, borderRadius:8, alignItems:'center'}} onPress={() => {
                              const recordTime = isSummarizeGroup ? 120 : 40;
                              
                              // Step 1: Immediately Play Audio
                              setMode('PLAYING_AUDIO');
                              
                              const onFinish = () => {
                                  // Step 2: Audio finished, start 10s Prep Timer
                                  setMode('PREP');
                                  startTimer(10, () => {
                                      // Step 3: Prep finished, start Recording
                                      startRecording(recordTime);
                                  });
                              };

                              if (item.audioUrl) {
                                  playAudioFromUrl(item.audioUrl, onFinish);
                              } else {
                                  speakText(item.transcript || item.text || item.situation || "Listen carefully.", onFinish, playbackSpeed);
                              }
                          }}>
                              <Text style={{color:'#fff', fontWeight:'bold', fontSize:16}}>Start Question</Text>
                          </TouchableOpacity>
                      )}

                      {/* SKIP PREP BUTTON (Only visible during the 10s prep phase) */}
                      {mode === 'PREP' && (
                          <TouchableOpacity style={{flex:1, backgroundColor:'#14B8A6', padding:15, borderRadius:8, alignItems:'center'}} onPress={() => {
                              const recordTime = isSummarizeGroup ? 120 : 40;
                              startRecording(recordTime);
                          }}>
                              <Text style={{color:'#fff', fontWeight:'bold', fontSize:16}}>Skip Prep</Text>
                          </TouchableOpacity>
                      )}

                      {/* SUBMIT ANSWER BUTTON (Only visible while recording) */}
                      {mode === 'RECORDING' && (
                          <TouchableOpacity style={{flex:1, backgroundColor:'#EF4444', padding:15, borderRadius:8, alignItems:'center'}} onPress={() => stopRecording(recording)}>
                              <Text style={{color:'#fff', fontWeight:'bold', fontSize:18}}>Submit Answer</Text>
                          </TouchableOpacity>
                      )}
                   </View>
               )}
             </ScrollView>
          )}
      </View>
    </View>
  );

  const startMockExam = () => {
    setMockExamFlow('SECTION_INTRO');
    setCurrentSectionIndex(0);
    setQuestions(mockExamSections[0].questions);
    setCurrentIndex(0);
  };

  const startSection = () => {
    setTimeLeft(5);
    setMockExamFlow('SECTION_POPUP');
    startTimer(5, () => {
      setMockExamFlow('IN_PROGRESS');
    });
  };

  const renderMainIntro = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#334155" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>PTE Academic Mock Test</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 10 }}>Exam Overview</Text>
        <Text style={{ fontSize: 16, color: colors.subtext, marginBottom: 20 }}>Complete all three parts of the PTE Academic exam in one sitting.</Text>
        
        {MOCK_EXAM_SECTIONS_INFO.map((section, idx) => (
          <View key={section.id} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2563EB', marginBottom: 5 }}>{section.title}</Text>
            <Text style={{ fontSize: 14, color: colors.subtext, marginBottom: 10 }}>{section.questionCount} Questions</Text>
            <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 10 }}>
              {section.breakdown.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, color: colors.subtext }}>{item.type}</Text>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={{ padding: 20, backgroundColor: colors.surface, borderTopWidth: 1, borderColor: '#E2E8F0' }}>
        <TouchableOpacity style={styles.btnPrimary} onPress={startMockExam}>
          <Text style={styles.btnText}>Start Exam</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderSectionIntro = () => {
    const sectionInfo = MOCK_EXAM_SECTIONS_INFO[currentSectionIndex];
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{sectionInfo.title}</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <MaterialCommunityIcons 
              name={currentSectionIndex === 0 ? "microphone" : currentSectionIndex === 1 ? "book-open-variant" : "headphones"} 
              size={80} 
              color="#2563EB" 
            />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginTop: 15 }}>{sectionInfo.title}</Text>
          </View>
          
          <View style={{ backgroundColor: isDark ? colors.border : '#EFF6FF', padding: 20, borderRadius: 16, marginBottom: 20 }}>
            <Text style={{ fontSize: 16, color: colors.text, lineHeight: 24 }}>{sectionInfo.description}</Text>
          </View>

          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15 }}>Question Breakdown:</Text>
          {sectionInfo.breakdown.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 15, color: colors.subtext }}>{item.type}</Text>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.text }}>{item.count}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={{ padding: 20, backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border }}>
          <TouchableOpacity style={styles.btnPrimary} onPress={startSection}>
            <Text style={styles.btnText}>Start {sectionInfo.title.split(': ')[1]}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  const renderSectionPopup = () => (
    <View style={[styles.container, { backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
      <MaterialCommunityIcons name="information-outline" size={100} color="#fff" />
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 20, textAlign: 'center' }}>Get Ready!</Text>
      <Text style={{ fontSize: 18, color: '#BFDBFE', marginTop: 10, textAlign: 'center' }}>
        The {MOCK_EXAM_SECTIONS_INFO[currentSectionIndex].title.split(': ')[1]} section is about to begin.
      </Text>
      <View style={{ marginTop: 40, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#fff' }}>{timeLeft}</Text>
      </View>
      <Text style={{ fontSize: 14, color: '#BFDBFE', marginTop: 20 }}>Starting in 5 seconds...</Text>
    </View>
  );

  const renderFinalResults = () => {
    const totalQuestions = mockExamSections.reduce((sum, s) => sum + s.questions.length, 0);
    const totalCorrect = Object.values(sectionScores).reduce((sum, scores) => sum + scores.reduce((a, b) => a + b, 0), 0);
    const percentOverall = totalQuestions > 0 ? (totalCorrect / totalQuestions) : 0;
    const overallScore = Math.round(percentOverall * 90);

    const sectionPerformances = mockExamSections.map(section => {
      const scores = sectionScores[section.id] || [];
      const correct = scores.reduce((sum, scores) => sum + scores, 0);
      const qCount = section.questions.length;
      const percent = qCount > 0 ? Math.round((correct / qCount) * 100) : 0;
      
      // Dynamic naming to be more specific (e.g. "Speaking" instead of "Speaking & Writing" if only one is present)
      let dynamicName = section.title;
      if (section.id === 'speaking-writing') {
        const hasSpeaking = section.questions.some((q: any) => ['read-aloud', 'repeat-sentence', 'describe-image', 'retell-lecture', 'answer-short-question', 'summarize-group-discussion', 'respond-to-situation'].includes(q.type));
        const hasWriting = section.questions.some((q: any) => ['summarize-written', 'essay'].includes(q.type));
        if (hasSpeaking && !hasWriting) dynamicName = 'Speaking';
        else if (hasWriting && !hasSpeaking) dynamicName = 'Writing';
      }

      return { id: section.id, name: dynamicName, correct, qCount, percent };
    });

    const sortedByScore = [...sectionPerformances].filter(s => s.qCount > 0).sort((a,b) => b.percent - a.percent);
    const bestSection = sortedByScore.length > 0 ? sortedByScore[0].name : 'your tested';
    const worstSection = sortedByScore.length > 0 ? sortedByScore[sortedByScore.length - 1].name : 'your tested';

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Exam Results</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 30, backgroundColor: colors.surface, padding: 30, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 }}>
            <Text style={{ fontSize: 18, color: colors.subtext, fontWeight: 'bold' }}>ESTIMATED SCORE</Text>
            <Text style={{ fontSize: 72, fontWeight: 'bold', color: overallScore >= 79 ? '#059669' : overallScore >= 65 ? '#2563EB' : overallScore >= 50 ? '#D97706' : '#DC2626' }}>{overallScore}</Text>
            <Text style={{ fontSize: 18, color: colors.subtext }}>out of 90</Text>
          </View>

          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 15 }}>Section Breakdown</Text>
          {sectionPerformances.map((section) => (
            <View key={section.id} style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>{section.name}</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: section.percent >= 70 ? '#059669' : section.percent >= 50 ? '#2563EB' : '#DC2626' }}>{section.percent}%</Text>
              </View>
              <View style={{ height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${section.percent}%`, backgroundColor: section.percent >= 70 ? '#059669' : section.percent >= 50 ? '#2563EB' : '#DC2626' }} />
              </View>
              <Text style={{ fontSize: 12, color: colors.subtext, marginTop: 8 }}>{section.correct.toFixed(2)} / {section.qCount} pts earned</Text>
            </View>
          ))}

          <View style={{ marginTop: 20, backgroundColor: isDark ? colors.border : '#F0F9FF', padding: 20, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#2563EB' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 10 }}>Feedback & Analysis</Text>
            <Text style={{ fontSize: 14, color: colors.subtext, lineHeight: 22 }}>
              Your performance on these {totalQuestions} questions indicates a {overallScore >= 79 ? 'Superior (C1+)' : overallScore >= 65 ? 'Proficient (B2)' : overallScore >= 50 ? 'Limited (B1)' : 'Developing (A2)'} command of the tested material according to PTE standards.
              {"\n\n"}
              {sortedByScore.length === 1 ? (
                <>
                  <Text style={{fontWeight: 'bold'}}>Single-Section Analysis:</Text> In your {sortedByScore[0].name} practice, you achieved {sortedByScore[0].percent}% accuracy. 
                  {sortedByScore[0].percent >= 75 ? " This is a strong result. Keep up the high standard!" : 
                   sortedByScore[0].percent >= 50 ? " This is a solid foundation, but targeted practice can help you reach the next band." : 
                   " This area needs significant focus to improve your readiness for the actual exam."}
                  {"\n\n"}
                  <Text style={{fontWeight: 'bold'}}>Action Plan:</Text> {sortedByScore[0].percent < 70 ? `Review the questions you missed in ${sortedByScore[0].name} and try the individual task modules for more practice.` : `Try a full Mock Exam with all sections to see how you perform under complete test conditions.`}
                </>
              ) : sortedByScore.length > 1 ? (
                <>
                  {sortedByScore[0].percent >= 60 && (
                    <>
                      <Text style={{fontWeight: 'bold'}}>Strengths:</Text> You demonstrated the highest accuracy in the {bestSection} section. This suggests your foundational skills in these task types are solid.
                      {"\n\n"}
                    </>
                  )}
                  {sortedByScore[sortedByScore.length - 1].percent < sortedByScore[0].percent - 5 && (
                    <>
                      <Text style={{fontWeight: 'bold'}}>Critical Improvement Areas:</Text> Your scores in the {worstSection} section were lower than your average, dragging down your overall estimate. Focus on these specific tasks to raise your overall score.
                      {"\n\n"}
                    </>
                  )}
                  <Text style={{fontWeight: 'bold'}}>Action Plan:</Text> We recommend targeted practice on {worstSection} modules. Aim for a {Math.min(90, Math.round(percentOverall * 100 + 10))}% accuracy target before your next attempt.
                </>
              ) : null}
            </Text>
          </View>
        </ScrollView>
        <View style={{ padding: 20 }}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace('/(tabs)/home'); }}>
            <Text style={styles.btnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  if (!moduleInfo && !CATEGORIES[id as string] && id !== 'mistakes') return <View><Text>Module not found</Text></View>;

  if (id === 'mock-exam') {
    if (mockExamFlow === 'MAIN_INTRO') return renderMainIntro();
    if (mockExamFlow === 'SECTION_INTRO') return renderSectionIntro();
    if (mockExamFlow === 'SECTION_POPUP') return renderSectionPopup();
    if (mockExamFlow === 'FINAL_RESULTS') return renderFinalResults();
  }

  if (CATEGORIES[id as string]) {
    const category = CATEGORIES[id as string];
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#334155" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category.title}</Text>
          <View style={{ width: 28 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 20 }}>Select a Task Type:</Text>
          {category.tasks.map((task) => (
            <TouchableOpacity 
              key={task.id} 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: colors.surface, 
                padding: 16, 
                borderRadius: 16, 
                marginBottom: 12,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2
              }}
              onPress={() => router.push(`/module/${task.id}`)}
            >
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: isDark ? colors.border : '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                <MaterialCommunityIcons name={task.icon as any} size={24} color="#2563EB" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{task.title}</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) return <View style={styles.centerContainer}><Text>Coming Soon</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      {/* --- UPDATED HEADER START --- */}
      <View style={styles.header}>
        {/* Left: Back Button */}
        <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
                <MaterialCommunityIcons name="arrow-left" size={28} color="#334155" />
            </TouchableOpacity>
        </View>

        {/* Center: Title & Score */}
        <View style={styles.headerCenter}>
            {id !== 'mock-exam' && (
                <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>
                        Correct: {currentSessionScore.toFixed(0)}/{questions.length}
                    </Text>
                </View>
            )}
            <Text style={styles.headerTitle} numberOfLines={1}>
                {id === 'mock-exam' ? 'Mock Exam' : (id === 'mistakes' ? 'Mistakes Bank' : (isFillBlanksListening ? '' : moduleInfo?.title))}
            </Text>
        </View>

        {/* Right: Empty View to balance the layout */}
        <View style={styles.headerRight} />
      </View>


      {/* Audio controls moved out of the task flow */}
      {isFillBlanksListening && mode !== 'RESULT' && (
        <View style={{ paddingHorizontal: 15, paddingTop: 10 }}>
            {AudioControlBar({ onPlay: mode === 'PLAYING_AUDIO' ? handleStopAudio : handlePlayLFibAudio, isPlaying: mode === 'PLAYING_AUDIO' })}
        </View>
      )}

      <View style={[styles.carouselContainer, { flex: 1 }]}>
        {/* Render only the CURRENT question. No FlatList, no memory bugs! */}
        {questions.length > 0 && renderItem({ item: questions[currentIndex], index: currentIndex })}
      </View>

      {!isKeyboardVisible && (
        <View style={styles.jumpToContainer}>
          <Text style={styles.jumpToLabel}>SECTION PROGRESS:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.jumpToScroll}>
            {questions.map((_, index) => {
              const itemScored = scoredQuestions[index] !== undefined;
              const isCurrent = currentIndex === index;
              const canJump = id !== 'mock-exam'; // One chance in Mock Exam
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.jumpCircle, 
                    isCurrent && styles.jumpCircleActive,
                    id === 'mock-exam' && itemScored && { borderColor: '#10B981', backgroundColor: '#D1FAE5' }
                  ]} 
                  onPress={() => canJump ? scrollToQuestion(index) : null}
                  disabled={!canJump}
                >
                  <Text style={[
                      styles.jumpCircleText, 
                      isCurrent && styles.jumpCircleTextActive,
                      id === 'mock-exam' && itemScored && { color: '#059669' }
                  ]}>
                    {itemScored ? '✓' : index + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

        {((!isSummarizeGroup && !isRespondSituation && !isKeyboardVisible) || mode === 'RESULT') && (
          <View style={[
            styles.controls, 
            mode === 'RESULT' && { flex: 1 },
            mode === 'RESULT' && isAnyIncorrect && { backgroundColor: '#FEF2F2' }
          ]}>
             {/* TIMER */}
             {(mode === 'RECORDING' || mode === 'PREP') && (
               <View style={[styles.timerBox, isDescribeImage && { marginBottom: 10 }]}>
                 <Text style={[styles.timerText, isDescribeImage && { fontSize: 12 }]}>{mode === 'PREP' ? 'Preparation' : 'Recording'}</Text>
                 <Text style={[styles.timerCount, isDescribeImage && { fontSize: 32 }]}>{timeLeft}</Text>
               </View>
             )}
             
             {/* MAIN RESULTS BOX (Speaking/Writing) */}
             {(mode === 'RESULT' && result && !isASQ) && (
               <View style={[styles.resultBox, { flex: 1, paddingBottom: 0, overflow: 'hidden' }, result.overall < 50 && { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1 }]}>
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 15, paddingBottom: 10 }}>
                      <Text style={[styles.resultTitle, result.overall < 50 && { color: '#DC2626' }]}>Score: {result.overall}/90</Text>
                      
                      <View style={{ backgroundColor: result.overall < 50 ? '#FEE2E2' : '#EFF6FF', padding: 10, borderRadius: 8, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: result.overall < 50 ? '#FECACA' : '#BFDBFE' }}>
                          <Text style={{ color: result.overall < 50 ? '#DC2626' : '#2563EB', fontWeight: 'bold', fontSize: 14 }}>
                             Session Progress: {currentSessionScore.toFixed(0)} / {questions.length} Correct
                          </Text>
                      </View>
                      
                      <View style={{marginBottom: 15}}>
                          {result.breakdown && Object.entries(result.breakdown).map(([k,v]:any) => {
                             if (k.toLowerCase() === 'pronunciation' && result.overall < 50) return null;
                             return <FeedbackRow key={k} label={k.toUpperCase()} text={v.toString()} isIncorrect={result.overall < 50} />;
                          })}
                      </View>
                      
                      <View style={{backgroundColor: result.overall < 50 ? '#FFF5F5' : '#F0FDF4', padding: 10, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: result.overall < 50 ? '#EF4444' : '#059669', marginBottom: 15}}>
                          <Text style={{fontWeight: 'bold', color: result.overall < 50 ? '#991B1B' : '#065F46', marginBottom: 5}}>Reason for Score:</Text>
                          <Text style={{color: result.overall < 50 ? '#7F1D1D' : '#064E3B', lineHeight: 22}}>{result.feedback}</Text>
                      </View>

                      <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                          <MaterialCommunityIcons name="chevron-double-down" size={20} color="#94A3B8" />
                          <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: 'bold' }}>SCROLL FOR MORE FEEDBACK</Text>
                      </View>

                      {result.wordAnalysis && result.wordAnalysis.length > 0 && (
                        <View style={{backgroundColor: isDark ? colors.border : '#F1F5F9', padding: 10, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: isDark ? colors.border : '#E2E8F0'}}>
                            <Text style={{fontWeight: 'bold', color: colors.text, marginBottom: 5}}>Pronunciation Heatmap (Tap word to listen):</Text>
                            <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center'}}>
                                {result.wordAnalysis.map((item: any, i: number) => {
                                    const isBad = item.health === 'bad';
                                    return (
                                        <TouchableOpacity 
                                          key={i} 
                                          onPress={() => playHeatmapWord(item.word)}
                                          style={{ margin: 2, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, backgroundColor: isBad ? '#FECACA' : 'transparent' }}
                                        >
                                          <Text style={{ 
                                            fontSize: 16, 
                                            color: isBad ? '#991B1B' : '#059669',
                                            textDecorationLine: isBad ? 'underline' : 'none'
                                          }}>
                                            {item.word}
                                          </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            
                            <TouchableOpacity 
                              onPress={() => {
                                  const targetText = currentItem.transcript || currentItem.text || currentItem.situation || currentItem.title || "";
                                  playFullAITranscript(targetText);
                              }}
                              style={{marginTop: 15, backgroundColor: isGeneratingTTS ? '#E2E8F0' : '#DBEAFE', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}
                            >
                              <MaterialCommunityIcons name="music-clef-treble" size={18} color={isGeneratingTTS ? '#64748B' : '#2563EB'} style={{marginRight: 6}} />
                              <Text style={{color: isGeneratingTTS ? '#64748B' : '#1D4ED8', fontWeight: 'bold', fontSize: 13}}>
                                {isGeneratingTTS ? 'Generating Perfect AI Audio...' : 'Play Perfect AI Pronunciation'}
                              </Text>
                            </TouchableOpacity>
                            
                        </View>
                      )}

                      {result?.wordAnalysis && result.wordAnalysis.some((w: any) => w.health === 'bad') && (
                        <View style={{backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#FECACA'}}>
                            <Text style={{fontWeight: 'bold', color: '#991B1B', marginBottom: 8}}>Missed / Mispronounced Words:</Text>
                            {result.wordAnalysis.filter((w: any) => w.health === 'bad').map((item: any, idx: number) => (
                                <TouchableOpacity key={idx} style={{flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6}} onPress={() => playHeatmapWord(item.word)}>
                                    <MaterialCommunityIcons name="close-circle-outline" size={16} color="#DC2626" style={{marginRight: 6, marginTop: 2}} />
                                    <View style={{flex: 1}}>
                                        <Text style={{color: '#7F1D1D', fontWeight: 'bold', fontSize: 15}}>{item.word}</Text>
                                        {item.label && <Text style={{color: '#991B1B', fontSize: 13, marginTop: 2}}>{item.label}</Text>}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                      )}

                      {result.sectionFeedback && Object.keys(result.sectionFeedback).length > 0 && (
                        <View style={{marginTop: 10, marginBottom: 20}}>
                            <Text style={{fontWeight: 'bold', color: colors.text, marginBottom: 10, fontSize: 16}}>Detailed Section Feedback:</Text>
                            {Object.entries(result.sectionFeedback).map(([key, value]: any) => (
                                <View key={key} style={{backgroundColor: isDark ? colors.border : '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: colors.border}}>
                                    <Text style={{fontWeight: 'bold', color: '#2563EB', textTransform: 'capitalize', marginBottom: 4}}>{key.replace(/([A-Z])/g, ' $1')}</Text>
                                    <Text style={{color: colors.subtext, fontSize: 13, lineHeight: 18}}>{value}</Text>
                                </View>
                            ))}
                        </View>
                      )}

                      {(isEssay || isDescribeImage || isSummarizeSpoken || isSummarizeWritten || isRetellLecture || isRespondSituation) && result.overall >= 50 && (
                         <TouchableOpacity style={{marginTop: 20, alignSelf: 'center'}} onPress={() => setShowModelAnswer(true)}>
                            <Text style={{color: '#2563EB', fontWeight:'bold', textDecorationLine: 'underline'}}>View Top Scoring Answer</Text>
                         </TouchableOpacity>
                      )}

                      {result.pacingFeedback && (
                         <View style={{ backgroundColor: isDark ? colors.border : '#F0F9FF', padding: 15, borderRadius: 12, marginTop: 20 }}>
                            <Text style={{ fontWeight: 'bold', color: '#0369A1', marginBottom: 5 }}>Pacing & Delivery Tips:</Text>
                            <Text style={{ color: colors.text, fontSize: 13, marginBottom: 3 }}>• <Text style={{fontWeight: 'bold'}}>Speed:</Text> {result.pacingFeedback.speed}</Text>
                            <Text style={{ color: colors.text, fontSize: 13, marginBottom: 3 }}>• <Text style={{fontWeight: 'bold'}}>Pauses:</Text> {result.pacingFeedback.pauses}</Text>
                            <Text style={{ color: colors.text, fontSize: 13 }}>• <Text style={{fontWeight: 'bold'}}>Clarity:</Text> {result.pacingFeedback.clarity}</Text>
                         </View>
                      )}
                  </ScrollView>
                  <View style={{ width: '100%', padding: 8, borderTopWidth: 1, borderColor: result.overall < 50 ? '#FECACA' : '#D1FAE5', backgroundColor: result.overall < 50 ? '#FEF2F2' : '#ECFDF5', gap: 6 }}>
                      {result.overall < 50 && id !== 'mock-exam' && (
                        <TouchableOpacity style={styles.btnPrimarySmall} onPress={handleResetQuestion}>
                           <Text style={styles.btnTextSmall}>Try Again</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={styles.nextBtnSmall} onPress={handleNext}>
                         <Text style={styles.btnTextSmall}>{(result.overall < 50 && id !== 'mock-exam') ? 'Skip to Next' : 'Next Question'}</Text>
                         <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" style={{ position: 'absolute', right: 12 }} />
                      </TouchableOpacity>
                  </View>
               </View>
             )}

             {/* MULTIPLE CHOICE RESULTS BOX (Hidden Correct Answers if Wrong) */}
             {mcResult && (
                <View style={[
                  styles.resultBox, 
                  mode === 'RESULT' && { flex: 1 },
                  mcResult.score < mcResult.max ? { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1 } : {}
                ]}>
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View style={{marginBottom: 10, alignItems: 'center'}}>
                      {mcResult.score === mcResult.max ? (
                         <View style={{flexDirection:'row', alignItems:'center', gap: 8}}>
                            <MaterialCommunityIcons name="check-circle" size={32} color="#059669" />
                            <Text style={{fontSize: 22, fontWeight:'bold', color: '#059669'}}>Correct!</Text>
                         </View>
                      ) : (
                         <View style={{flexDirection:'row', alignItems:'center', gap: 8}}>
                            <MaterialCommunityIcons name="close-circle" size={32} color="#DC2626" />
                            <Text style={{fontSize: 22, fontWeight:'bold', color: '#DC2626'}}>Incorrect</Text>
                         </View>
                      )}
                    </View>

                    <Text style={[styles.resultTitle, {fontSize: 16, color: '#334155', textAlign: 'center'}]}>
                      Score: {mcResult.score} / {mcResult.max}
                    </Text>

                    <View style={{ backgroundColor: mcResult.score < mcResult.max ? '#FEE2E2' : '#EFF6FF', padding: 8, borderRadius: 8, marginVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: mcResult.score < mcResult.max ? '#FECACA' : '#BFDBFE' }}>
                        <Text style={{ color: mcResult.score < mcResult.max ? '#DC2626' : '#2563EB', fontWeight: 'bold', fontSize: 14 }}>
                           Session Progress: {currentSessionScore.toFixed(0)} / {questions.length} Correct
                        </Text>
                    </View>
                    
                    {/* IF WRONG: Show encouragement to re-read/listen */}
                    {mcResult.score < mcResult.max && (
                       <View style={{marginTop: 10, padding: 10, backgroundColor: '#FFF5F5', borderRadius: 8}}>
                           <Text style={{color: '#B91C1C', fontStyle: 'italic', textAlign: 'center', lineHeight: 20}}>
                             Your answer is incorrect. Please try again.
                           </Text>
                       </View>
                    )}

                    {/* IF CORRECT: Show the explanation */}
                    {currentItem.explanation && mcResult.score === mcResult.max && (
                      <View style={{ marginTop: 15, padding: 12, backgroundColor: isDark ? colors.border : '#FFFFFF', borderRadius: 8, width: '100%', borderLeftWidth: 5, borderLeftColor: '#10B981' }}>
                        <Text style={{fontWeight: 'bold', color: colors.text, marginBottom: 4}}>Why is this correct?</Text>
                        <Text style={{color: colors.text, lineHeight: 22}}>{currentItem.explanation}</Text>
                      </View>
                    )}
                  </ScrollView>

                  <View style={{ marginTop: 15, gap: 8, width: '100%', padding: 12, backgroundColor: mcResult.score < mcResult.max ? '#FEF2F2' : '#ECFDF5', borderTopWidth: 1, borderColor: mcResult.score < mcResult.max ? '#FECACA' : '#D1FAE5', borderRadius: 16 }}>
                    {mcResult.score < mcResult.max && id !== 'mock-exam' && (
                      <TouchableOpacity style={styles.btnPrimarySmall} onPress={handleResetQuestion}>
                         <Text style={styles.btnTextSmall}>Try Again</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.nextBtnSmall} onPress={handleNext}>
                       <Text style={styles.btnTextSmall}>{(mcResult.score < mcResult.max && id !== 'mock-exam') ? 'Skip to Next' : 'Next Question'}</Text>
                       <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={{ position: 'absolute', right: 15 }} />
                    </TouchableOpacity>
                  </View>
                </View>
             )}

             {/* DICTATION RESULT BOX */}
             {dictationResult && (
                <View style={[styles.resultBox, dictationResult.score < dictationResult.max && { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1 }]}>
                    <Text style={[styles.resultTitle, dictationResult.score < dictationResult.max && { color: '#DC2626' }]}>Score: {dictationResult.score} / {dictationResult.max}</Text>
                    
                    <View style={{ backgroundColor: dictationResult.score < dictationResult.max ? '#FEE2E2' : '#EFF6FF', padding: 8, borderRadius: 8, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: dictationResult.score < dictationResult.max ? '#FECACA' : '#BFDBFE' }}>
                        <Text style={{ color: dictationResult.score < dictationResult.max ? '#DC2626' : '#2563EB', fontWeight: 'bold', fontSize: 14 }}>
                           Session Progress: {currentSessionScore.toFixed(0)} / {questions.length} Correct
                        </Text>
                    </View>
                    
                    {dictationResult.score === dictationResult.max && (
                      <>
                        <Text style={styles.resultSub}>Correct Answer:</Text>
                        <Text style={{color:'#065F46', fontStyle:'italic'}}>{dictationResult.original}</Text>
                      </>
                    )}

                    <View style={{ gap: 8, width: '100%', padding: 12, backgroundColor: dictationResult.score < dictationResult.max ? '#FEF2F2' : '#ECFDF5', borderTopWidth: 1, borderColor: dictationResult.score < dictationResult.max ? '#FECACA' : '#D1FAE5', borderRadius: 16 }}>
                        {dictationResult.score < dictationResult.max && id !== 'mock-exam' && (
                            <TouchableOpacity style={styles.btnPrimarySmall} onPress={handleResetQuestion}>
                                <Text style={styles.btnTextSmall}>Try Again</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.nextBtnSmall} onPress={handleNext}>
                            <Text style={styles.btnTextSmall}>{(dictationResult.score < dictationResult.max && id !== 'mock-exam') ? 'Skip to Next' : 'Next Question'}</Text>
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={{ position: 'absolute', right: 15 }} />
                        </TouchableOpacity>
                    </View>
                </View>
             )}

             {/* OTHER RESULTS (Highlight/Blanks/Reorder) */}
             {highlightResult && (
                <View style={[styles.resultBox, highlightResult.score < highlightResult.max && { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1 }]}>
                  <Text style={[styles.resultTitle, highlightResult.score < highlightResult.max && { color: '#DC2626' }]}>Score: {highlightResult.score}/{highlightResult.max}</Text>
                  
                  <View style={{ backgroundColor: highlightResult.score < highlightResult.max ? '#FEE2E2' : '#EFF6FF', padding: 8, borderRadius: 8, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: highlightResult.score < highlightResult.max ? '#FECACA' : '#BFDBFE' }}>
                      <Text style={{ color: highlightResult.score < highlightResult.max ? '#DC2626' : '#2563EB', fontWeight: 'bold', fontSize: 14 }}>
                         Session Progress: {currentSessionScore.toFixed(0)} / {questions.length} Correct
                      </Text>
                  </View>
                  
                  {highlightResult.score < highlightResult.max && (
                    <Text style={[styles.resultSub, { color: '#991B1B' }]}>Please try again</Text>
                  )}
                  <View style={{ marginTop: 15, gap: 8, width: '100%', padding: 12, backgroundColor: highlightResult.score < highlightResult.max ? '#FEF2F2' : '#ECFDF5', borderTopWidth: 1, borderColor: highlightResult.score < highlightResult.max ? '#FECACA' : '#D1FAE5', borderRadius: 16 }}>
                    {highlightResult.score < highlightResult.max && id !== 'mock-exam' && (
                        <TouchableOpacity style={styles.btnPrimarySmall} onPress={handleResetQuestion}>
                           <Text style={styles.btnTextSmall}>Try Again</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.nextBtnSmall} onPress={handleNext}>
                        <Text style={styles.btnTextSmall}>{(highlightResult.score < highlightResult.max && id !== 'mock-exam') ? 'Skip to Next' : 'Next Question'}</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={{ position: 'absolute', right: 15 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
             {(reOrderScore || fillBlankScore || rwResult || lFibResult) && (
                <View style={[
                  styles.resultBox, 
                  mode === 'RESULT' && { flex: 1 },
                  isAnyIncorrect && { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1 }
                ]}>
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View style={{marginBottom: 10, alignItems: 'center'}}>
                      {!isAnyIncorrect ? (
                         <View style={{flexDirection:'row', alignItems:'center', gap: 8}}>
                            <MaterialCommunityIcons name="check-circle" size={32} color="#059669" />
                            <Text style={{fontSize: 22, fontWeight:'bold', color: '#059669'}}>Correct!</Text>
                         </View>
                      ) : (
                         <View style={{flexDirection:'row', alignItems:'center', gap: 8}}>
                            <MaterialCommunityIcons name="close-circle" size={32} color="#DC2626" />
                            <Text style={{fontSize: 22, fontWeight:'bold', color: '#DC2626'}}>Incorrect</Text>
                         </View>
                      )}
                    </View>

                    <Text style={[styles.resultTitle, {fontSize: 16, color: '#334155', textAlign: 'center'}]}>
                      Score: {reOrderScore ? reOrderScore.score : fillBlankScore ? fillBlankScore.score : rwResult ? rwResult.score : (lFibResult?.score ?? 0)} / {reOrderScore ? reOrderScore.max : fillBlankScore ? fillBlankScore.max : rwResult ? rwResult.max : (lFibResult?.max ?? 0)}
                    </Text>
                    
                    <View style={{ backgroundColor: isAnyIncorrect ? '#FEE2E2' : '#EFF6FF', padding: 8, borderRadius: 8, marginVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: isAnyIncorrect ? '#FECACA' : '#BFDBFE' }}>
                        <Text style={{ color: isAnyIncorrect ? '#DC2626' : '#2563EB', fontWeight: 'bold', fontSize: 14 }}>
                           Session Progress: {currentSessionScore.toFixed(0)} / {questions.length} Correct
                        </Text>
                    </View>

                    {isAnyIncorrect && (
                       <View style={{marginTop: 10, padding: 10, backgroundColor: '#FFF5F5', borderRadius: 8}}>
                           <Text style={{color: '#B91C1C', fontStyle: 'italic', textAlign: 'center', lineHeight: 20}}>
                             Your answer is incorrect. Please try again.
                           </Text>
                       </View>
                    )}

                    {/* LISTENING FIB DETAILED FEEDBACK */}
                    {isFillBlanksListening && lFibResult && (
                      <View style={{ width: '100%', marginTop: 10, padding: 10, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: isAnyIncorrect ? '#FECACA' : '#D1FAE5' }}>
                        <Text style={{ fontWeight: 'bold', color: colors.text, marginBottom: 10 }}>Results & Feedback:</Text>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: 12}}>
                          {currentItem.segments.flatMap((segment: string, i: number) => {
                            const words = segment.replace(/\s+/g, ' ').trim().split(' ');
                            
                            const wordNodes = words.map((word, wIndex) => (
                              word.length > 0 ? (
                                <Text key={`res-text-${i}-${wIndex}`} style={[styles.fibText, {fontSize: 14, marginVertical: 2, marginRight: 4}]}>
                                  {word}
                                </Text>
                              ) : null
                            ));

                            const answerNode = i < currentItem.segments.length - 1 ? (
                              <View key={`res-ans-${i}`} style={{marginHorizontal: 4, marginVertical: 2, alignItems: 'center'}}>
                                <View style={[
                                  styles.inlineInput, 
                                  { width: 'auto', minWidth: 60, paddingHorizontal: 8, height: 30, justifyContent: 'center' },
                                  lFibAnswers[i]?.trim().toLowerCase() === currentItem.correctAnswers[i]?.toLowerCase() ? styles.inputCorrect : styles.inputWrong
                                ]}>
                                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: lFibAnswers[i]?.trim().toLowerCase() === currentItem.correctAnswers[i]?.toLowerCase() ? '#065F46' : '#991B1B' }}>
                                    {lFibAnswers[i] || '___'}
                                  </Text>
                                </View>
                                {lFibAnswers[i]?.trim().toLowerCase() !== currentItem.correctAnswers[i]?.toLowerCase() && (
                                  <Text style={{opacity: 0, fontSize: 12, fontWeight: 'bold', marginTop: 2}}>{currentItem.correctAnswers[i]}</Text>
                                )}
                              </View>
                            ) : null;
                            
                            return [...wordNodes, answerNode];
                          })}
                        </View>
                      </View>
                    )}

                    {/* READING FIB DETAILED FEEDBACK */}
                    {isFillBlanks && fillBlankScore && (
                      <View style={{ width: '100%', marginTop: 10, padding: 10, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: isAnyIncorrect ? '#FECACA' : '#D1FAE5' }}>
                        <Text style={{ fontWeight: 'bold', color: colors.text, marginBottom: 10 }}>Results & Feedback:</Text>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: 12}}>
                          {currentItem.segments.map((segment: string, i: number) => (
                            <View key={`seg-${i}`} style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'}}>
                              <Text style={[styles.fibText, {fontSize: 14}]}>{segment}</Text>
                              {i < currentItem.segments.length - 1 && (
                                <View style={{alignItems: 'center', marginHorizontal: 4}}>
                                  <View style={[
                                      styles.blankBox, 
                                      { paddingHorizontal: 8, height: 26, justifyContent: 'center', alignItems: 'center', marginVertical: 0 },
                                      blankAnswers[i] === currentItem.correctAnswers[i] ? styles.blankCorrect : styles.blankWrong
                                    ]}
                                  >
                                    <Text style={{ fontSize: 14, color: '#fff', fontWeight: 'bold' }}>{blankAnswers[i] || '___'}</Text>
                                  </View>
                                  {blankAnswers[i] !== currentItem.correctAnswers[i] && (
                                    <Text style={{opacity: 0, fontSize: 12, fontWeight: 'bold', marginTop: 2}}>{currentItem.correctAnswers[i]}</Text>
                                  )}
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* READING & WRITING FIB DETAILED FEEDBACK */}
                    {isFillBlanksRW && rwResult && (
                      <View style={{ width: '100%', marginTop: 10, padding: 10, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: isAnyIncorrect ? '#FECACA' : '#D1FAE5' }}>
                        <Text style={{ fontWeight: 'bold', color: colors.text, marginBottom: 10 }}>Results & Feedback:</Text>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: 12}}>
                          {currentItem.segments.map((segment: string, i: number) => (
                            <View key={`seg-${i}`} style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'}}>
                              <Text style={[styles.fibText, {fontSize: 14}]}>{segment}</Text>
                              {i < currentItem.segments.length - 1 && (
                                <View style={{alignItems: 'center', marginHorizontal: 4}}>
                                  <View style={[
                                    styles.inlineInput, 
                                    { width: 'auto', minWidth: 60, paddingHorizontal: 8, height: 30, justifyContent: 'center' },
                                    rwAnswers[i]?.trim().toLowerCase() === currentItem.correctAnswers[i].toLowerCase() ? styles.inputCorrect : styles.inputWrong
                                  ]}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: rwAnswers[i]?.trim().toLowerCase() === currentItem.correctAnswers[i].toLowerCase() ? '#065F46' : '#991B1B' }}>
                                      {rwAnswers[i] || '___'}
                                    </Text>
                                  </View>
                                  {rwAnswers[i]?.trim().toLowerCase() !== currentItem.correctAnswers[i].toLowerCase() && (
                                    <Text style={{opacity: 0, fontSize: 12, fontWeight: 'bold', marginTop: 2}}>{currentItem.correctAnswers[i]}</Text>
                                  )}
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* RE-ORDER DETAILED FEEDBACK */}
                    {isReOrder && reOrderScore && reOrderScore.score === reOrderScore.max && (
                      <View style={{ width: '100%', marginTop: 10 }}>
                          <View style={{ marginTop: 10, padding: 10, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: '#D1FAE5' }}>
                              <Text style={{ fontWeight: 'bold', color: colors.text, marginBottom: 10 }}>Correct Order:</Text>
                              {currentItem.sentences?.map((sentence: string, idx: number) => (
                                  <View key={idx} style={[styles.reOrderResultItem, { backgroundColor: '#F0FDF4', borderColor: '#D1FAE5' }]}>
                                      <Text style={{ color: '#065F46' }}>{idx + 1}. {sentence}</Text>
                                  </View>
                              ))}
                          </View>
                      </View>
                    )}
                  </ScrollView>
                  
                   <View style={{ marginTop: 15, gap: 8, width: '100%', padding: 12, backgroundColor: isAnyIncorrect ? '#FEF2F2' : '#ECFDF5', borderTopWidth: 1, borderColor: isAnyIncorrect ? '#FECACA' : '#D1FAE5', borderRadius: 16 }}>
                    {isAnyIncorrect && id !== 'mock-exam' && (
                        <TouchableOpacity style={styles.btnPrimarySmall} onPress={handleResetQuestion}>
                           <Text style={styles.btnTextSmall}>Try Again</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.nextBtnSmall} onPress={handleNext}>
                        <Text style={styles.btnTextSmall}>{(isAnyIncorrect && id !== 'mock-exam') ? 'Skip to Next' : 'Next Question'}</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={{ position: 'absolute', right: 15 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

             {/* START BUTTONS */}
             {mode === 'IDLE' && !result && !mcResult && !dictationResult && !highlightResult && !reOrderScore && !fillBlankScore && !rwResult && !lFibResult && !isSummarizeWritten && !isSummarizeSpoken && !isWriteDictation && !isEssay && !isRespondSituation && !isSummarizeGroup && (
                <View style={styles.idleControls}>
                   <TouchableOpacity style={styles.btnPrimary} onPress={() => {
                       if (isPersonalIntro) {
                           setMode('PREP'); startTimer(25, () => startRecording(30));
                       }
                       else if (isASQ) startASQSequence();
                       else if (isRetellLecture) handlePlayLecture();
                       else if (isRepeatSentence) handlePlayAudio();
                       else if (isReadAloud || isDescribeImage) handleStartPrep();
                       else if (isFillBlanks) checkFillBlankAnswer();
                       else if (isFillBlanksRW) checkRwAnswer();
                       else if (isFillBlanksListening) checkLFibAnswer();
                       else if (isReOrder) checkReOrderAnswer();
                       else if (isAnyMC) {
                           if (activeType === 'multiple-choice-l-multi' || activeType === 'multiple-choice-l-single' || isHighlightCorrectSummary || isSelectMissingWord) {
                               startListeningMC();
                           } else {
                               if (selectedOptions.length > 0) submitMultipleChoice();
                               else Alert.alert("Selection Required", "Please select at least one option.");
                           }
                       }
                       else handleNext(); // For Reading tasks in mock exam
                   }}>
                       <Text style={styles.btnText}>
                           {isPersonalIntro ? 'Start Introduction' : 
                            (isReadAloud || isDescribeImage || isRepeatSentence || isRetellLecture || isASQ) ? 'Start Question' : 
                            (isFillBlanks || isFillBlanksRW || isFillBlanksListening || isReOrder) ? 'Submit Answer' :
                            'Next Task'}
                       </Text>
                   </TouchableOpacity>
                </View>
             )}

             {/* PREP BUTTONS */}
             {mode === 'PREP' && (
                <View style={styles.idleControls}>
                   <TouchableOpacity style={styles.btnSecondary} onPress={() => startRecording(40)}>
                       <Text style={styles.btnTextDark}>Skip Prep</Text>
                   </TouchableOpacity>
                </View>
             )}

             {/* STOP BUTTON */}
             {mode === 'RECORDING' && (
                 <TouchableOpacity style={styles.btnDanger} onPress={() => stopRecording(recording)}>
                     <Text style={styles.btnText}>Stop</Text>
                 </TouchableOpacity>
             )}
             
             {/* SPINNER */}
             {(mode === 'PROCESSING' || mode === 'PLAYING_AUDIO' || mode === 'PREP_RETELL') && (
               <View style={{ alignItems: 'center', padding: 20 }}>
                 <CustomLoader message={mode === 'PROCESSING' ? "Processing results..." : undefined} />
               </View>
             )}

          </View>
        )}

      {/* MODALS AND ZOOM */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={showModelAnswer} 
        onRequestClose={() => setShowModelAnswer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Model Answer</Text>
              <TouchableOpacity onPress={() => setShowModelAnswer(false)}>
                <MaterialCommunityIcons name="close-circle" size={30} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{maxHeight: 300}}>
              <Text style={styles.modelText}>
                {questions[currentIndex]?.modelAnswer || "No model answer available."}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal visible={isImageViewVisible} transparent={true} animationType="fade" onRequestClose={() => setIsImageViewVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10 }} onPress={() => setIsImageViewVisible(false)}>
            <MaterialCommunityIcons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>
          {currentZoomImage && (
            <ScrollView 
              maximumZoomScale={5} 
              minimumZoomScale={1} 
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
              style={{ width: '100%', height: '100%' }}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <Image 
                source={typeof currentZoomImage === 'string' ? { uri: currentZoomImage } : currentZoomImage} 
                style={{ width: width, height: height * 0.8 }} 
                resizeMode="contain"
              />
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* ASQ RESULT MODAL */}
      <Modal visible={asqResultPopup} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: result?.content && result.content >= 60 ? '#F0FDF4' : '#FEF2F2' }]}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              {result?.content && result.content >= 60 ? (
                <MaterialCommunityIcons name="check-circle" size={60} color="#059669" />
              ) : (
                <MaterialCommunityIcons name="close-circle" size={60} color="#DC2626" />
              )}
              <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10, color: result?.content && result.content >= 60 ? '#059669' : '#DC2626' }}>
                {result?.content && result.content >= 60 ? 'Correct!' : 'Incorrect'}
              </Text>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: 'bold', color: colors.text, marginBottom: 5 }}>Your Answer:</Text>
              <Text style={{ color: colors.subtext, fontStyle: 'italic' }}>"{userSummary || "No speech detected"}"</Text>
            </View>

            {((result?.content ?? 0) >= 60) && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontWeight: 'bold', color: colors.text, marginBottom: 5 }}>Expected Answer:</Text>
                <Text style={{ color: '#059669', fontWeight: 'bold' }}>{questions[currentIndex]?.answer}</Text>
              </View>
            )}

            <View style={{ marginBottom: 20, padding: 10, backgroundColor: isDark ? colors.border : '#F8FAFC', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>Session Progress</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2563EB' }}>
                Total Correct: {currentSessionScore.toFixed(0)} / {questions.length}
              </Text>
            </View>

            {result?.content && result.content >= 60 ? (
              <TouchableOpacity 
                style={[styles.nextBtnSmall, { width: '100%', justifyContent: 'center' }]} 
                onPress={proceedToNextASQ}
              >
                <Text style={styles.btnTextSmall}>
                  {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Session'}
                </Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={{ position: 'absolute', right: 15 }} />
              </TouchableOpacity>
            ) : (
            <View style={{ gap: 8, width: '100%', padding: 12, backgroundColor: result?.content && result.content >= 60 ? '#F0FDF4' : '#FEF2F2', borderTopWidth: 1, borderColor: result?.content && result.content >= 60 ? '#D1FAE5' : '#FECACA', borderRadius: 16 }}>
                {id !== 'mock-exam' && (
                  <TouchableOpacity 
                    style={styles.btnPrimarySmall} 
                    onPress={handleResetQuestion}
                  >
                    <Text style={styles.btnTextSmall}>Try Again</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.nextBtnSmall} 
                  onPress={proceedToNextASQ}
                >
                  <Text style={styles.btnTextSmall}>Skip to Next</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={{ position: 'absolute', right: 15 }} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* SPEAK NOW POPUP */}
      <Modal visible={showSpeakNow} transparent={true} animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: colors.surface, padding: 40, borderRadius: 30, alignItems: 'center', elevation: 20, borderWidth: 4, borderColor: '#10B981' }}>
            <View style={{backgroundColor: '#10B981', padding: 20, borderRadius: 50, marginBottom: 20}}>
              <MaterialCommunityIcons name="microphone" size={60} color="#fff" />
            </View>
            <Text style={{ color: '#10B981', fontSize: 32, fontWeight: '900', textAlign: 'center' }}>Get Ready to Speak</Text>
          </View>
        </View>
      </Modal>

      {/* ONE-TIME INTRODUCTORY POPUP */}
      <Modal visible={showIntroPopup} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Module Instructions</Text>
              <MaterialCommunityIcons name="help-circle-outline" size={24} color="#2563EB" />
            </View>
            <View style={{ backgroundColor: isDark ? colors.border : '#F1F5F9', padding: 20, borderRadius: 16, marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 10 }}>
                {id === 'mock-exam' ? 'Mock Exam' : moduleInfo?.title}
              </Text>
              <Text style={styles.modelText}>
                {TASK_INSTRUCTIONS[id as string] || 'Follow the instructions on screen to complete the task.'}
              </Text>
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleDismissIntro}>
              <Text style={styles.btnText}>Begin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DROPDOWN MODAL FOR FILL IN THE BLANKS */}
      <Modal
        visible={activeBlankIndex !== null || activeRwBlankIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setActiveBlankIndex(null);
          setActiveRwBlankIndex(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback 
            onPress={() => {
              setActiveBlankIndex(null);
              setActiveRwBlankIndex(null);
            }}
          >
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.dropdownModalContent}>
            <Text style={styles.dropdownTitle}>Select an Answer</Text>
            <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled={true}>
              {(activeBlankIndex !== null ? questions[currentIndex]?.options : questions[currentIndex]?.options)?.map((option: string, idx: number) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.dropdownItem} 
                  onPress={() => {
                    if (activeBlankIndex !== null) handleSelectWord(option);
                    else if (activeRwBlankIndex !== null) handleSelectRwWord(option);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.dropdownCloseBtn} 
              onPress={() => {
                setActiveBlankIndex(null);
                setActiveRwBlankIndex(null);
              }}
            >
              <Text style={styles.dropdownCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Score Feedback Popup - Now at the end to ensure it's on top of other modals */}
      <Modal
        visible={!!scoreFeedback}
        transparent={true}
        animationType="fade"
        pointerEvents="none"
      >
        <View style={styles.feedbackOverlay} pointerEvents="none">
          <View style={[
            styles.feedbackPopup, 
            { backgroundColor: scoreFeedback?.type === 'success' ? '#10B981' : scoreFeedback?.type === 'error' ? '#EF4444' : '#3B82F6' }
          ]}>
            <MaterialCommunityIcons 
              name={scoreFeedback?.type === 'success' ? 'check-circle' : scoreFeedback?.type === 'error' ? 'alert-circle' : 'information'} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.feedbackText}>{scoreFeedback?.message}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
// Styles moved inside component for dynamic theme support
