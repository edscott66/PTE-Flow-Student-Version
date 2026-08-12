import { READ_ALOUD_QUESTIONS } from '../constants/readAloudData';
import { REPEAT_SENTENCE_QUESTIONS } from '../constants/repeatSentenceData';
import { DESCRIBE_IMAGE_QUESTIONS } from '../constants/describeImageData';
import { RETELL_LECTURE_QUESTIONS } from '../constants/retellLectureData';
import { ANSWER_SHORT_QUESTION_DATA } from '../constants/answerShortQuestionData';
import { SUMMARIZE_GROUP_QUESTIONS } from '../constants/summarizeGroupData';
import { RESPOND_SITUATION_QUESTIONS } from '../constants/respondSituationData';
import { SUMMARIZE_WRITTEN_QUESTIONS } from '../constants/summarizeWrittenData';
import { ESSAY_QUESTIONS } from '../constants/essayData';

import { FILL_BLANKS_RW_QUESTIONS } from '../constants/fillBlanksRWData';
import { MULTIPLE_CHOICE_QUESTIONS } from '../constants/multipleChoiceData';
import { REORDER_PARAGRAPHS_QUESTIONS } from '../constants/reOrderParagraphsData';
import { FILL_BLANKS_QUESTIONS } from '../constants/fillBlanksData';
import { MULTIPLE_CHOICE_READING_SINGLE_QUESTIONS } from '../constants/multipleChoiceReadingSingleData';

import { SUMMARIZE_SPOKEN_QUESTIONS } from '../constants/summarizeSpokenData';
import { MULTIPLE_CHOICE_LISTENING_MULTI_QUESTIONS } from '../constants/multipleChoiceListeningMultiData';
import { LISTENING_FILL_BLANKS_QUESTIONS } from '../constants/listeningFillBlanksData';
import { HIGHLIGHT_CORRECT_SUMMARY_QUESTIONS } from '../constants/highlightCorrectSummaryData';
import { MULTIPLE_CHOICE_SINGLE_QUESTIONS } from '../constants/multipleChoiceSingleData';
import { SELECT_MISSING_WORD_QUESTIONS } from '../constants/selectMissingWordData';
import { HIGHLIGHT_INCORRECT_QUESTIONS } from '../constants/highlightIncorrectData';
import { WRITE_DICTATION_QUESTIONS } from '../constants/writeDictationData';

const getRandom = (arr: any[], count: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateMockExam = (customConfigStr?: string) => {
  let configMap: Record<string, number> | null = null;
  if (customConfigStr) {
    try {
      const parsed = JSON.parse(customConfigStr);
      configMap = {};
      parsed.forEach((item: any) => {
        configMap![item.id] = item.count;
      });
    } catch (e) {
      console.error('Failed to parse custom config', e);
    }
  }

  // Helper to resolve count based on custom config or default
  const getCount = (customId: string, defaultCount: number) => {
    if (configMap) {
      return customId in configMap ? configMap[customId] : 0;
    }
    return defaultCount;
  };

  const sections = [
    {
      id: 'speaking-writing',
      title: 'Speaking & Writing',
      questions: [
        // Only include personal intro if it's the full exam
        ...(configMap ? [] : getRandom([{ id: 'pi1', type: 'personal-intro', prompt: 'Please introduce yourself. This is not scored but will be sent to institutions.' }], 1)),
        ...getRandom(READ_ALOUD_QUESTIONS.map(q => ({ ...q, type: 'read-aloud' })), getCount('readAloud', 7)),
        ...getRandom(REPEAT_SENTENCE_QUESTIONS.map(q => ({ ...q, type: 'repeat-sentence' })), getCount('repeatSentence', 12)),
        ...getRandom(DESCRIBE_IMAGE_QUESTIONS.map(q => ({ ...q, type: 'describe-image' })), getCount('describeImage', 6)),
        ...getRandom(RETELL_LECTURE_QUESTIONS.map(q => ({ ...q, type: 'retell-lecture' })), getCount('retellLecture', 3)),
        ...getRandom(ANSWER_SHORT_QUESTION_DATA.map(q => ({ ...q, type: 'answer-short-question' })), getCount('answerShort', 12)),
        ...getRandom(SUMMARIZE_GROUP_QUESTIONS.map(q => ({ ...q, type: 'summarize-group-discussion' })), getCount('summarizeGroup', 1)),
        ...getRandom(RESPOND_SITUATION_QUESTIONS.map(q => ({ ...q, type: 'respond-to-situation' })), getCount('respondSituation', 1)),
        ...getRandom(SUMMARIZE_WRITTEN_QUESTIONS.map(q => ({ ...q, type: 'summarize-written' })), getCount('summarizeWritten', 3)),
        ...getRandom(ESSAY_QUESTIONS.map(q => ({ ...q, type: 'essay' })), getCount('essay', 1)),
      ]
    },
    {
      id: 'reading',
      title: 'Reading',
      questions: [
        ...getRandom(FILL_BLANKS_RW_QUESTIONS.map(q => ({ ...q, type: 'fill-blanks-rw' })), getCount('fillBlanksRW', 25)),
        ...getRandom(MULTIPLE_CHOICE_QUESTIONS.map(q => ({ ...q, type: 'multiple-choice' })), getCount('multipleChoice', 3)),
        ...getRandom(REORDER_PARAGRAPHS_QUESTIONS.map(q => ({ ...q, type: 're-order-paragraphs' })), getCount('reorderParagraphs', 4)),
        ...getRandom(FILL_BLANKS_QUESTIONS.map(q => ({ ...q, type: 'fill-blanks' })), getCount('fillBlanksReading', 24)),
        ...getRandom(MULTIPLE_CHOICE_READING_SINGLE_QUESTIONS.map(q => ({ ...q, type: 'multiple-choice-r-single' })), getCount('mcSingleReading', 3)),
      ]
    },
    {
      id: 'listening',
      title: 'Listening',
      questions: [
        ...getRandom(SUMMARIZE_SPOKEN_QUESTIONS.map(q => ({ ...q, type: 'summarize-spoken' })), getCount('summarizeSpoken', 2)),
        ...getRandom(MULTIPLE_CHOICE_LISTENING_MULTI_QUESTIONS.map(q => ({ ...q, type: 'multiple-choice-l-multi' })), getCount('mcListeningMulti', 2)),
        ...getRandom(LISTENING_FILL_BLANKS_QUESTIONS.map(q => ({ ...q, type: 'fill-blanks-listening' })), getCount('fillBlanksListening', 3)),
        ...getRandom(HIGHLIGHT_CORRECT_SUMMARY_QUESTIONS.map(q => ({ ...q, type: 'highlight-correct-summary' })), getCount('highlightCorrect', 2)),
        ...getRandom(MULTIPLE_CHOICE_SINGLE_QUESTIONS.map(q => ({ ...q, type: 'multiple-choice-l-single' })), getCount('mcListeningSingle', 2)),
        ...getRandom(SELECT_MISSING_WORD_QUESTIONS.map(q => ({ ...q, type: 'select-missing-word' })), getCount('selectMissing', 2)),
        ...getRandom(HIGHLIGHT_INCORRECT_QUESTIONS.map(q => ({ ...q, type: 'highlight-incorrect' })), getCount('highlightIncorrect', 3)),
        ...getRandom(WRITE_DICTATION_QUESTIONS.map(q => ({ ...q, type: 'write-dictation' })), getCount('writeDictation', 9)),
      ]
    }
  ];

  // Filter out empty sections
  return sections.filter(s => s.questions.length > 0);
};
