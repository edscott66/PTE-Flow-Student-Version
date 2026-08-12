import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- FIX 1: Updated Type Definition ---
// Added 'color' and made 'mockContent' optional (?)
export type ModuleType = {
  id: string;
  title: string;
  category: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap; 
  description: string;
  instructions: string;
  tips: string;
  mockContent?: string; // Added '?' to make it optional (Mock Exam doesn't need it)
  color?: string;       // Added this line so the Mock Exam purple color is valid
};

export const MODULES: ModuleType[] = [
  // ============================================================
  // PART 1: SPEAKING & WRITING
  // ============================================================
    {
    id: 'personal-intro',
    title: '1. Personal Introduction',
    category: 'Part 1: Speaking & Writing',
    icon: 'account-tie-voice',
    description: 'A short, non‑scored recording to introduce yourself.',
    instructions: 'Speak for up to 30 seconds to introduce yourself.',
    tips: 'Speak clearly, stay calm, and give a confident 30‑second snapshot of who you are.',
    mockContent: 'Audio...',
  },
  {
    id: 'read-aloud',
    title: '2. Read Aloud',
    category: 'Part 1: Speaking & Writing',
    icon: 'microphone-variant',
    description: 'Read a passage aloud. Scored on pronunciation, fluency, and intonation.',
    instructions: 'Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible.',
    tips: 'Speak at a moderate pace. Do not stop if you make a mistake; keep going to maintain fluency.',
    mockContent: 'Content loading...',
  },
  {
    id: 'repeat-sentence',
    title: '3. Repeat Sentence',
    category: 'Part 1: Speaking & Writing',
    icon: 'replay',
    description: 'Repeat the sentence exactly as you hear it.',
    instructions: 'You will hear a sentence. Please repeat the sentence exactly as you heard it.',
    tips: 'Focus on the meaning of the sentence to help remember the words. Mimic the intonation.',
    mockContent: 'Audio...', 
  },
  {
    id: 'describe-image',
    title: '4. Describe Image',
    category: 'Part 1: Speaking & Writing',
    icon: 'chart-bar',
    description: 'Describe the image specifically.',
    instructions: 'Describe the image in detail. You have 40 seconds.',
    tips: 'Start with an overview, then mention 2-3 key details, and conclude with a summary.',
    mockContent: 'Image...', 
  },
  {
    id: 'retell-lecture',
    title: '5. Re-tell Lecture',
    category: 'Part 1: Speaking & Writing',
    icon: 'microphone',
    description: 'Listen to a lecture and retell it in your own words.',
    instructions: 'You will hear a lecture. After listening, you will have 40 seconds to retell what you just heard.',
    tips: 'Take notes on keywords and main ideas. Do not try to write down everything.',
    mockContent: 'Audio...', 
  },
  {
    id: 'answer-short-question',
    title: '6. Answer Short Questions',
    category: 'Part 1: Speaking & Writing',
    icon: 'comment-question-outline',
    description: 'Answer a simple question with a single word or a few words.',
    instructions: 'Listen to the question and provide a short answer. You have 3 seconds to record.',
    tips: 'Be quick and clear. The answer is usually just one or two words.',
    mockContent: 'Audio...', 
  },
  {
    id: 'summarize-written',
    title: '7. Summarize Written Text',
    category: 'Part 1: Speaking & Writing',
    icon: 'text-box-check-outline',
    description: 'Read a passage and summarize it in one sentence.',
    instructions: 'Read the passage and summarize it using one sentence between 5 and 75 words.',
    tips: 'Use complex sentences and connecting words like "however" and "although". Only use one full stop.',
    mockContent: 'Text...', 
  },
  {
    id: 'essay',
    title: '8. Essay',
    category: 'Part 1: Speaking & Writing',
    icon: 'file-document-edit-outline',
    description: 'Write a 200-300 word essay on a given topic.',
    instructions: 'You will have 20 minutes to plan, write and revise an essay about the topic below.',
    tips: 'Ensure you have a clear introduction, body paragraphs, and conclusion. Check spelling. Plan your essay for 2 minutes. Write for 15. Check for 3.',
    mockContent: 'Prompt...', 
  },

  // ============================================================
  // PART 2: READING
  // ============================================================
  {
    id: 'fill-blanks-rw',
    title: '8. R&W: Fill in the Blanks',
    category: 'Part 2: Reading',
    icon: 'form-dropdown',
    description: 'Select the best word for each blank from a dropdown list.',
    instructions: 'There are several gaps in the text. Select the correct word for each gap from the list.',
    tips: 'Consider grammar and collocation (words that naturally go together).',
    mockContent: 'Text...', 
  },
  {
    id: 'multiple-choice',
    title: '9. Multiple Choice (Multiple)',
    category: 'Part 2: Reading',
    icon: 'checkbox-multiple-marked-outline',
    description: 'Choose more than one correct response.',
    instructions: 'Read the text and answer the question by selecting all the correct responses.',
    tips: 'Be careful! Incorrect choices have negative marking (-1). If unsure, do not select extra options.',
    mockContent: 'Text...', 
  },
  {
    id: 're-order-paragraphs',
    title: '10. Re-order Paragraphs',
    category: 'Part 2: Reading',
    icon: 'sort',
    description: 'Reorder the text boxes to create a logical paragraph.',
    instructions: 'Drag and drop the text boxes to restore the original order.',
    tips: 'Look for connecting words (However, Therefore) and chronological markers.',
    mockContent: 'Text...', 
  },
  {
    id: 'fill-blanks',
    title: '11. Reading: Fill in the Blanks',
    category: 'Part 2: Reading',
    icon: 'drag-variant',
    description: 'Drag words from the box to fill in the blanks.',
    instructions: 'Drag and drop the words to complete the text.',
    tips: 'Read before and after the blank to understand the context.',
    mockContent: 'Text...', 
  },
  {
    id: 'multiple-choice-r-single',
    title: '12. Multiple Choice (Single)',
    category: 'Part 2: Reading',
    icon: 'radiobox-marked',
    description: 'Choose the single best answer.',
    instructions: 'Read the text and select the one correct response.',
    tips: 'Eliminate obviously wrong answers first.',
    mockContent: 'Text...', 
  },

  // ============================================================
  // PART 3: LISTENING
  // ============================================================
  {
    id: 'summarize-spoken',
    title: '13. Summarize Spoken Text',
    category: 'Part 3: Listening',
    icon: 'notebook-edit-outline',
    description: 'Summarize the spoken audio clip.',
    instructions: 'Listen to the audio and write a summary (50-70 words).',
    tips: 'Take notes of key points while listening. Ensure good grammar.',
    mockContent: 'Audio...', 
  },
  {
    id: 'multiple-choice-l-multi',
    title: '14. Multiple Choice (Multiple)',
    category: 'Part 3: Listening',
    icon: 'playlist-check',
    description: 'Select more than one correct response based on the audio.',
    instructions: 'Listen to the recording and answer the question by selecting all correct responses. You have 7 seconds to prepare.',
    tips: 'Negative marking applies (+1 / -1). Only select options you are sure about.',
    mockContent: 'Audio...', 
  },
  {
    id: 'fill-blanks-listening',
    title: '15. Listening: Fill in the Blanks',
    category: 'Part 3: Listening',
    icon: 'text-box-outline',
    description: 'Type the missing words based on the audio.',
    instructions: 'Listen to the recording and type the missing words in each gap.',
    tips: 'Use the tab key to move to the next blank quickly while typing.',
    mockContent: 'Audio...', 
  },
  {
    id: 'highlight-correct-summary',
    title: '16. Highlight Correct Summary',
    category: 'Part 3: Listening',
    icon: 'text-search',
    description: 'Select the paragraph that best summarizes the audio.',
    instructions: 'Listen to the recording and select the summary that best matches.',
    tips: 'Ignore summaries that contain incorrect details, even if they sound similar.',
    mockContent: 'Audio...', 
  },
  {
    id: 'multiple-choice-l-single',
    title: '17. Multiple Choice (Single)',
    category: 'Part 3: Listening',
    icon: 'radiobox-marked',
    description: 'Choose the single best answer based on the audio.',
    instructions: 'Listen to the recording and select the one correct response.',
    tips: 'Read the question before the audio starts to know what to listen for.',
    mockContent: 'Audio...', 
  },
  {
    id: 'select-missing-word',
    title: '18. Select Missing Word',
    category: 'Part 3: Listening',
    icon: 'dots-horizontal-circle-outline',
    description: 'Listen and select the missing word that completes the audio.',
    instructions: 'You will hear a recording. At the end, the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.',
    tips: 'Focus on the context of the sentence. Grammar and topic vocabulary are key clues.',
    mockContent: 'Audio...', 
  },
  {
    id: 'highlight-incorrect',
    title: '19. Highlight Incorrect Words',
    category: 'Part 3: Listening',
    icon: 'format-color-highlight',
    description: 'Identify the words that are different from the audio.',
    instructions: 'Click on the words that are different from what you hear.',
    tips: 'Read along with the audio and be quick to click. Do not fall behind.',
    mockContent: 'Audio...', 
  },
  {
    id: 'write-dictation',
    title: '20. Write From Dictation',
    category: 'Part 3: Listening',
    icon: 'pencil',
    description: 'Type the sentence exactly as you hear it.',
    instructions: 'Listen to the sentence and type it out.',
    tips: 'Write as much as you can. Spelling counts!',
    mockContent: 'Audio...', 
  },
  {
    id: 'summarize-group-discussion',
    title: '21. Summarize Group Discussion',
    category: 'Part 2: Speaking',
    icon: 'account-group-outline',
    description: 'Listen to 3 people discussing a topic and summarize their points.',
    instructions: 'You will hear a discussion. You have 10 seconds to prepare, then 2 minutes to summarize the main points, the different viewpoints, and the conclusion.',
    tips: 'Note down who says what. Identify the problem, the suggested solutions, and the final decision.',
    mockContent: 'Audio...',
  },
  {
    id: 'respond-to-situation',
    title: '22. Respond to a Situation',
    category: 'Part 2: Speaking',
    icon: 'chat-question-outline',
    description: 'Listen to a scenario and provide a spoken response.',
    instructions: 'You will hear a description of a situation. You will have 10 seconds to prepare, then 40 seconds to speak your response as if you are in that situation.',
    tips: 'Listen for the "Goal" (what you need to achieve) and the "Tone" (formal vs informal). Start speaking immediately after the beep.',
    mockContent: 'Audio...',
  },
  {
    id: 'mock-exam',
    title: '★ Full Mock Exam',
    category: 'Full Assessment',
    icon: 'certificate-outline',
    description: 'Simulate a real PTE Academic test with 76+ random questions.',
    instructions: 'This exam takes approximately 2 hours. Ensure you are in a quiet place. You will be scored on Speaking, Writing, Reading, and Listening.',
    tips: 'Manage your time carefully. Do not spend too long on one question.',
    color: '#7C3AED', 
    // mockContent removed because it is now optional in the type definition
  }
];