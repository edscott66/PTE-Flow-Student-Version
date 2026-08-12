import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// --- DATA CONTENT ---
const QUESTION_TYPES = [
  {
    part: "PART 1 — SPEAKING & WRITING",
    duration: "54–67 minutes",
    items: [
      { id: '1', title: "Read Aloud", desc: "You read a short text aloud. Tests pronunciation, fluency, and reading." },
      { id: '2', title: "Repeat Sentence", desc: "You hear a sentence and repeat it exactly. High‑weight task for listening + speaking." },
      { id: '3', title: "Describe Image", desc: "You speak for 40 seconds describing an image (graph, map, process, etc.)." },
      { id: '4', title: "Re‑tell Lecture", desc: "You listen to a lecture (with/without image) and summarise it in 40 seconds." },
      { id: '5', title: "Answer Short Question", desc: "You hear a simple question and respond with one or a few words." },
      { id: '6', title: "Summarize Written Text", desc: "You read a passage and write a one‑sentence summary (5–75 words)." },
      { id: '7', title: "Essay", desc: "Write a 200–300‑word academic essay in 20 minutes." },
    ]
  },
  {
    part: "PART 2 — READING",
    duration: "29–30 minutes",
    items: [
      { id: '8', title: "Reading & Writing: Fill in the Blanks", desc: "Drag‑and‑drop words into blanks. Tests grammar + collocation." },
      { id: '9', title: "Multiple‑choice, Multiple Answer", desc: "Choose more than one correct option. Negative marking applies." },
      { id: '10', title: "Re‑order Paragraphs", desc: "Arrange text boxes into a logical order." },
      { id: '11', title: "Reading: Fill in the Blanks", desc: "Select the correct word for each blank from dropdown options." },
      { id: '12', title: "Multiple‑choice, Single Answer", desc: "Choose one correct answer." },
    ]
  },
  {
    part: "PART 3 — LISTENING",
    duration: "30–43 minutes",
    items: [
      { id: '13', title: "Summarize Spoken Text", desc: "Write a 50–70‑word summary of a short lecture." },
      { id: '14', title: "Multiple‑choice, Multiple Answer", desc: "Select all correct answers after listening to an audio." },
      { id: '15', title: "Listening: Fill in the Blanks", desc: "Type missing words from a transcript while listening." },
      { id: '16', title: "Highlight Correct Summary", desc: "Choose the summary that best matches the audio." },
      { id: '17', title: "Multiple‑choice, Single Answer", desc: "Choose one correct answer based on the audio." },
      { id: '18', title: "Select Missing Word", desc: "Choose the word/phrase that completes the audio." },
      { id: '19', title: "Highlight Incorrect Words", desc: "Identify words in the transcript that differ from the audio." },
      { id: '20', title: "Write From Dictation", desc: "Type the exact sentence you hear. Highest‑weight task in Listening." },
    ]
  }
];

const SCORING_DATA = [
  { task: "Repeat Sentence", weight: "56", skills: "S, L" },
  { task: "Read Aloud", weight: "51.5", skills: "S, R" },
  { task: "Describe Image", weight: "15", skills: "S" },
  { task: "Re‑tell Lecture", weight: "15", skills: "S, L" },
  { task: "Answer Short Question", weight: "5", skills: "S, L" },
  { task: "Summarize Written Text", weight: "15", skills: "W, R" },
  { task: "Essay", weight: "10", skills: "W" },
];

const TIPS_TRICKS_DATA = [
  { id: '1', title: "Read Aloud", tips: [
    "Read in natural phrases, not word by word.",
    "Keep a steady pace and clear pronunciation.",
    "If you make a mistake, keep going.",
    "Pause naturally at commas and full stops."
  ]},
  { id: '2', title: "Repeat Sentence", tips: [
    "Copy the rhythm and tone of the speaker.",
    "Aim for 70–80% accuracy.",
    "Repeat immediately with confidence.",
    "If you forget, say what you remember in the same structure."
  ]},
  { id: '3', title: "Describe Image", tips: [
    "Use a simple structure: 'This image shows… The main features are… Overall…'",
    "Mention 3–4 key points only.",
    "Speak for 25–30 seconds.",
    "Fluency matters more than detail."
  ]},
  { id: '4', title: "Re‑tell Lecture", tips: [
    "Capture the main idea + 2–3 key points.",
    "Use linking words: firstly, next, finally.",
    "Paraphrase instead of memorising.",
    "Speak smoothly for 30–35 seconds."
  ]},
  { id: '5', title: "Answer Short Question", tips: [
    "Give 1–2 word answers.",
    "Do not explain.",
    "Speak clearly and confidently.",
    "Guess logically if unsure."
  ]},
  { id: '6', title: "Summarize Written Text", tips: [
    "Write ONE sentence (20–30 words).",
    "Use connectors like which, that, because.",
    "Focus on the main idea only.",
    "Check punctuation before submitting."
  ]},
  { id: '7', title: "Essay", tips: [
    "Use 4 paragraphs: intro, reason 1, reason 2, conclusion.",
    "Write 200–240 words.",
    "Use clear, simple sentences.",
    "Add linking words like in addition, for example."
  ]},
  { id: '8', title: "Reading & Writing: Fill in the Blanks", tips: [
    "Use grammar clues (article → noun, to → verb).",
    "Use collocations.",
    "Read the whole sentence for meaning."
  ]},
  { id: '9', title: "Multiple‑choice, Multiple Answer (Reading)", tips: [
    "Negative marking — choose carefully.",
    "Match keywords and supporting ideas.",
    "Avoid overly specific or unrelated options."
  ]},
  { id: '10', title: "Re‑order Paragraphs", tips: [
    "Find the topic sentence first.",
    "Look for pronouns and time markers.",
    "Build pairs (A → B) before full order.",
    "Follow logical flow."
  ]},
  { id: '11', title: "Reading: Fill in the Blanks", tips: [
    "Use grammar + collocations + meaning.",
    "Read before and after the blank.",
    "Choose the word that fits the whole sentence."
  ]},
  { id: '12', title: "Multiple‑choice, Single Answer (Reading)", tips: [
    "Read the question first.",
    "Focus on the main idea.",
    "Remove extreme or unrelated options."
  ]},
  { id: '13', title: "Summarize Spoken Text", tips: [
    "Note the topic + 3–4 key points.",
    "Write 50–70 words.",
    "Use simple connectors.",
    "Check grammar before submitting."
  ]},
  { id: '14', title: "Multiple‑choice, Multiple Answer (Listening)", tips: [
    "Negative marking — choose only if sure.",
    "Listen for opinions and contrasts.",
    "If unsure, choose one answer only."
  ]},
  { id: '15', title: "Listening: Fill in the Blanks", tips: [
    "Listen for grammar and meaning.",
    "Spell words correctly.",
    "Most answers are nouns, verbs, adjectives."
  ]},
  { id: '16', title: "Highlight Correct Summary", tips: [
    "Match the main idea, not small details.",
    "Remove summaries with extra or wrong information.",
    "Choose the option that matches the speaker’s purpose."
  ]},
  { id: '17', title: "Multiple‑choice, Single Answer (Listening)", tips: [
    "Focus on the main idea and attitude.",
    "Ignore extra details.",
    "Choose the most general, accurate option."
  ]},
  { id: '18', title: "Select Missing Word", tips: [
    "Listen for the topic and tone.",
    "The missing word completes the idea.",
    "Options often relate to increase, decrease, problem, solution."
  ]},
  { id: '19', title: "Highlight Incorrect Words", tips: [
    "Follow the text closely.",
    "Click only words that differ from the audio.",
    "Don’t guess — wrong clicks reduce marks."
  ]},
  { id: '20', title: "Write From Dictation", tips: [
    "Every word matters.",
    "Write immediately after listening.",
    "Check spelling, capitals, plurals."
  ]},
];

const COMMON_MISTAKES_DATA = [
  {
    id: '1',
    title: "Speaking: Fluency Problems",
    tips: [
      "Speaking too fast or too slow reduces fluency.",
      "Long pauses, hesitations, and fillers (um, uh) lower your score.",
      "Restarting sentences breaks fluency.",
      "Overthinking grammar causes unnatural speech.",
      "Solution: Speak smoothly, confidently, and continuously."
    ]
  },
  {
    id: '2',
    title: "Speaking: Pronunciation Issues",
    tips: [
      "Mumbling or speaking too softly makes words unclear.",
      "Incorrect word stress affects pronunciation.",
      "Speaking in a monotone reduces natural rhythm.",
      "Solution: Speak clearly, with natural stress and intonation."
    ]
  },
  {
    id: '3',
    title: "Speaking: Not Following Task Format",
    tips: [
      "Describing every detail in Describe Image wastes time.",
      "Giving long answers in Short Answer reduces clarity.",
      "Ignoring the main idea in Retell Lecture lowers content score.",
      "Solution: Use simple structures and focus on key points."
    ]
  },
  {
    id: '4',
    title: "Writing: Grammar & Spelling Errors",
    tips: [
      "Incorrect verb forms and missing articles reduce grammar score.",
      "Spelling mistakes lower writing and listening scores.",
      "Writing overly complex sentences increases errors.",
      "Solution: Use clear, simple, correct English."
    ]
  },
  {
    id: '5',
    title: "Writing: Not Following Instructions",
    tips: [
      "Writing more than one sentence in Summarize Written Text loses marks.",
      "Writing too few words in the essay reduces content score.",
      "Ignoring the essay question leads to low task completion.",
      "Solution: Follow the instructions exactly."
    ]
  },
  {
    id: '6',
    title: "Reading: Guessing Too Much",
    tips: [
      "Choosing too many answers in MCMA causes negative marking.",
      "Not reading the full sentence leads to wrong FIB choices.",
      "Ignoring collocations results in unnatural word choices.",
      "Solution: Choose carefully and use grammar + meaning clues."
    ]
  },
  {
    id: '7',
    title: "Reading: Poor Time Management",
    tips: [
      "Spending too long on Re‑order Paragraphs reduces time for other tasks.",
      "Overthinking MCQ questions wastes time.",
      "Solution: Move on if stuck — don’t get trapped."
    ]
  },
  {
    id: '8',
    title: "Listening: Spelling Mistakes",
    tips: [
      "One wrong letter in Write From Dictation reduces the entire score.",
      "Incorrect plural forms lose marks.",
      "Typing too fast causes errors.",
      "Solution: Listen carefully and check spelling before submitting."
    ]
  },
  {
    id: '9',
    title: "Listening: Losing Focus",
    tips: [
      "Missing one word in Listening FIB affects the whole sentence.",
      "Not following the transcript in Highlight Incorrect Words causes mistakes.",
      "Solution: Stay focused and follow the audio closely."
    ]
  },
  {
    id: '10',
    title: "Listening: Over‑Selecting Answers",
    tips: [
      "Choosing too many options in MCMA leads to negative marking.",
      "Guessing multiple answers reduces accuracy.",
      "Solution: Select only answers you are confident about."
    ]
  },
  {
    id: '11',
    title: "General: Not Practicing High‑Weight Tasks",
    tips: [
      "Ignoring Repeat Sentence and Write From Dictation lowers overall score.",
      "Not practicing Read Aloud affects both speaking and reading.",
      "Solution: Focus on high‑impact tasks first."
    ]
  },
  {
    id: '12',
    title: "General: Poor Test Strategy",
    tips: [
      "Panicking after one mistake affects the next tasks.",
      "Not using templates for speaking/writing reduces structure.",
      "Not reviewing answers in listening reduces accuracy.",
      "Solution: Stay calm, follow strategy, and keep moving forward."
    ]
  },
  {
    id: '13',
    title: "General: Technical Issues",
    tips: [
      "Speaking too close or too far from the mic affects clarity.",
      "Background noise lowers speaking scores.",
      "Slow typing reduces performance in listening tasks.",
      "Solution: Test your mic, type steadily, and practice in a quiet place."
    ]
  }
];

const HIGH_WEIGHT_TASKS_DATA = [
  {
    id: '1',
    title: "Repeat Sentence (Highest Impact)",
    tips: [
      "This task has the strongest influence on Speaking and Listening scores.",
      "Aim for 70–80% accuracy — you don’t need every word.",
      "Copy the rhythm, tone, and stress of the speaker.",
      "Speak immediately and confidently.",
      "Even partial accuracy gives strong partial credit.",
      "Practice daily — this task alone can raise your score dramatically."
    ]
  },
  {
    id: '2',
    title: "Read Aloud (Major Score Booster)",
    tips: [
      "Affects both Speaking and Reading scores.",
      "Fluency and pronunciation matter more than perfect reading.",
      "Read in natural phrases, not word by word.",
      "Keep a steady pace and avoid hesitations.",
      "Clear pronunciation boosts both speaking and reading performance."
    ]
  },
  {
    id: '3',
    title: "Write From Dictation (Top Listening Task)",
    tips: [
      "This is the highest‑weight task in Listening.",
      "Every word must be spelled correctly — accuracy is everything.",
      "Plural forms, articles, and small words matter.",
      "Write immediately after listening to avoid forgetting.",
      "Practice improves memory, spelling, and listening accuracy."
    ]
  },
  {
    id: '4',
    title: "Reading & Writing: Fill in the Blanks",
    tips: [
      "This task heavily affects both Reading and Writing scores.",
      "Use grammar clues (article → noun, to → verb).",
      "Use collocations — common word pairs score highest.",
      "Read the whole sentence for meaning.",
      "This is the most important task in the Reading section."
    ]
  },
  {
    id: '5',
    title: "Listening: Fill in the Blanks",
    tips: [
      "Strong influence on Listening and Writing scores.",
      "Focus on spelling, grammar, and word forms.",
      "Most answers are nouns, verbs, and adjectives.",
      "Use the transcript to guide your listening.",
      "Missing one blank can affect multiple skills."
    ]
  },
  {
    id: '6',
    title: "Describe Image (Moderate but Reliable Booster)",
    tips: [
      "Improves fluency and pronunciation scores.",
      "Use a simple structure to stay fluent.",
      "Mention 3–4 key points only.",
      "Fluency matters more than content.",
      "Consistent performance here strengthens your speaking profile."
    ]
  },
  {
    id: '7',
    title: "Re‑tell Lecture (Moderate but Influential)",
    tips: [
      "Affects Speaking and Listening scores.",
      "Focus on main idea + 2–3 key points.",
      "Use linking words to stay fluent.",
      "Paraphrase instead of memorising.",
      "Strong fluency here boosts your speaking score significantly."
    ]
  },
  {
    id: '8',
    title: "Summarize Written Text",
    tips: [
      "Affects both Writing and Reading scores.",
      "Write one clear sentence (20–30 words).",
      "Use connectors like which, that, because.",
      "Focus on the main idea only.",
      "Grammar and punctuation strongly influence your score."
    ]
  },
  {
    id: '9',
    title: "Essay",
    tips: [
      "Affects Writing score moderately.",
      "Use a simple 4‑paragraph structure.",
      "Clear grammar and coherence matter more than advanced vocabulary.",
      "Stay within 200–240 words.",
      "Consistent structure improves scoring reliability."
    ]
  },
  {
    id: '10',
    title: "Highlight Incorrect Words",
    tips: [
      "Affects Listening and Reading scores.",
      "Follow the text closely with your eyes.",
      "Click only words that differ from the audio.",
      "Accuracy is more important than speed.",
      "Each correct click gives partial credit."
    ]
  }
];

const AI_SCORING_GUIDE_DATA = [
  {
    id: '1',
    title: "How AI Scores Your Speaking",
    tips: [
      "The AI listens to your recording and measures fluency, pronunciation, and content.",
      "Fluency is the biggest factor: smooth, continuous speech scores higher than perfect grammar.",
      "Pronunciation is judged by clarity, stress, rhythm, and how close your sounds are to standard English.",
      "The AI does not care about your accent — only clarity and consistency.",
      "Content is checked by comparing your words to the expected answer.",
      "Hesitations, long pauses, fillers, and restarts reduce your score.",
      "Speaking too fast or too slow also reduces fluency.",
      "Background noise can affect scoring — clean audio helps the AI understand you better."
    ]
  },
  {
    id: '2',
    title: "How AI Scores Your Writing",
    tips: [
      "The AI checks grammar, spelling, vocabulary, sentence structure, and task completion.",
      "It looks for clear, simple, correct English — not complicated vocabulary.",
      "Grammar accuracy matters more than using advanced words.",
      "Spelling mistakes reduce your score immediately.",
      "The AI checks if you followed the instructions (e.g., one sentence only).",
      "Repetition of the same words lowers your vocabulary score.",
      "Using connectors improves coherence.",
      "The AI rewards clear paragraph structure in essays."
    ]
  },
  {
    id: '3',
    title: "How AI Scores Your Listening",
    tips: [
      "The AI compares your typed answers to the exact words spoken in the audio.",
      "Accuracy is everything — one missing letter can reduce your score.",
      "For multiple‑choice tasks, the AI checks if your choices match the correct options.",
      "For Fill in the Blanks, the AI checks spelling, word form, and correctness.",
      "The AI does not judge your grammar in listening tasks — only accuracy.",
      "Typing speed does not matter, but correctness does.",
      "The AI ignores capitalisation unless required."
    ]
  },
  {
    id: '4',
    title: "How AI Scores Your Reading",
    tips: [
      "The AI checks if your selected answers match the correct ones.",
      "For Fill in the Blanks, the AI checks grammar, collocation, and meaning.",
      "For Re‑order Paragraphs, the AI checks the correct sequence and partial credit.",
      "Negative marking applies in some tasks, so accuracy is more important than guessing.",
      "The AI does not judge your writing style — only correctness."
    ]
  },
  {
    id: '5',
    title: "What AI Looks for in Fluency",
    tips: [
      "Smooth, natural speech without long pauses.",
      "Consistent pace — not too fast, not too slow.",
      "No fillers like 'um', 'uh', 'like'.",
      "No restarting sentences.",
      "Clear linking between words.",
      "Strong fluency can boost your score even with simple content."
    ]
  },
  {
    id: '6',
    title: "What AI Looks for in Pronunciation",
    tips: [
      "Clear vowel and consonant sounds.",
      "Correct word stress.",
      "Natural rhythm and intonation.",
      "No mumbling or whispering.",
      "Accents are not penalised — unclear sounds are.",
      "Speaking loudly and clearly improves recognition."
    ]
  },
  {
    id: '7',
    title: "What AI Looks for in Content",
    tips: [
      "How closely your answer matches the expected response.",
      "In Repeat Sentence, the AI checks word‑by‑word accuracy.",
      "In Describe Image and Retell Lecture, the AI checks if you mention key ideas.",
      "In writing tasks, the AI checks if you answered the question correctly.",
      "Content matters, but fluency often has a bigger impact."
    ]
  },
  {
    id: '8',
    title: "How AI Detects Grammar & Vocabulary",
    tips: [
      "The AI checks if your sentences follow correct grammar rules.",
      "It looks for correct verb forms, articles, prepositions, and structure.",
      "It rewards varied vocabulary but penalises incorrect usage.",
      "Repetitive or unnatural vocabulary lowers your score.",
      "Simple, correct English scores higher than complicated but incorrect English."
    ]
  },
  {
    id: '9',
    title: "How AI Handles Spelling & Capitalisation",
    tips: [
      "Spelling must be 100% correct — no partial credit.",
      "Plural forms must be correct.",
      "Capital letters matter for names and sentence beginnings.",
      "In Write From Dictation, one spelling mistake can reduce the entire score.",
      "The AI accepts valid alternative spellings (e.g., colour/color)."
    ]
  },
  {
    id: '10',
    title: "How AI Gives Partial Credit",
    tips: [
      "Many tasks give partial credit.",
      "You can still score even if you miss some answers.",
      "In Repeat Sentence, even 50% accuracy gives points.",
      "In Highlight Incorrect Words, each correct click gives points.",
      "Partial credit helps you build your score even when unsure."
    ]
  },
  {
    id: '11',
    title: "How AI Ensures Fairness",
    tips: [
      "AI scoring is consistent — it does not get tired or biased.",
      "It treats every user equally, regardless of accent or background.",
      "It uses the same scoring rules for every attempt.",
      "It checks your audio and text objectively.",
      "It does not judge your ideas — only language performance."
    ]
  },
  {
    id: '12',
    title: "How PTE Flow’s AI Differs from the Real PTE",
    tips: [
      "PTE Flow simulates scoring but is not identical to Pearson’s official scoring.",
      "Your score in the app is an estimate, not an official PTE score.",
      "The AI helps you identify strengths and weaknesses quickly.",
      "It is designed for learning, not certification.",
      "Use the scores as guidance, not as a guarantee."
    ]
  },
  {
    id: '13',
    title: "How to Get the Most Accurate AI Score",
    tips: [
      "Record in a quiet place with minimal noise.",
      "Speak clearly and confidently.",
      "Avoid whispering or speaking too softly.",
      "Type carefully and check spelling before submitting.",
      "Follow task instructions exactly.",
      "Use natural English — avoid robotic responses.",
      "Practice regularly to help the AI learn your voice patterns."
    ]
  }
];

const TEST_DAY_STRATEGY_DATA = [
  {
    id: '1',
    title: "The Night Before the Exam",
    tips: [
      "Do not study heavy material — keep your mind fresh.",
      "Review light notes only (templates, key strategies).",
      "Prepare your ID and check your test centre location.",
      "Sleep early — a rested brain performs better.",
      "Avoid caffeine late at night to ensure good sleep.",
      "Set multiple alarms to avoid rushing in the morning."
    ]
  },
  {
    id: '2',
    title: "Morning of the Exam",
    tips: [
      "Eat a light, healthy meal — avoid heavy or sugary foods.",
      "Drink enough water but not too much.",
      "Warm up your voice with simple speaking exercises.",
      "Do 3–5 light practice questions (not a full test).",
      "Arrive early to avoid stress and settle your nerves."
    ]
  },
  {
    id: '3',
    title: "At the Test Centre",
    tips: [
      "Stay calm and breathe slowly — nerves reduce fluency.",
      "Use the restroom before entering the exam room.",
      "Follow staff instructions carefully.",
      "Use the microphone test to find the right distance (2–3 fingers away).",
      "Sit comfortably and adjust your chair before starting."
    ]
  },
  {
    id: '4',
    title: "Speaking Section Strategy",
    tips: [
      "Start strong — the first tasks (Read Aloud, Repeat Sentence) have high weight.",
      "Speak clearly, confidently, and continuously.",
      "Ignore background noise — everyone is speaking.",
      "Do not whisper or speak too softly.",
      "If you make a mistake, keep going — fluency matters more."
    ]
  },
  {
    id: '5',
    title: "Writing Section Strategy",
    tips: [
      "Follow instructions exactly (e.g., one sentence for SWT).",
      "Use simple, correct English — avoid complicated structures.",
      "Check spelling and punctuation before submitting.",
      "Use templates to stay organised and calm.",
      "Manage time: do not spend too long on one task."
    ]
  },
  {
    id: '6',
    title: "Reading Section Strategy",
    tips: [
      "Do not get stuck — move on if unsure.",
      "Be careful with MCMA (negative marking).",
      "Use grammar and collocation clues for FIB.",
      "Build pairs first in Re‑order Paragraphs.",
      "Stay focused — this section is short but important."
    ]
  },
  {
    id: '7',
    title: "Listening Section Strategy",
    tips: [
      "Stay alert — listening requires full concentration.",
      "Check spelling carefully in WFD and FIB.",
      "Do not over‑select answers in MCMA.",
      "Use the notepad for key words in Summarize Spoken Text.",
      "Save energy for the final tasks — WFD is extremely high‑weight."
    ]
  },
  {
    id: '8',
    title: "Managing Stress During the Exam",
    tips: [
      "If you panic, take one deep breath and continue.",
      "Do not think about previous mistakes — move forward.",
      "Focus on one task at a time.",
      "Trust your preparation and stay confident.",
      "Remember: partial credit still gives points."
    ]
  },
  {
    id: '9',
    title: "After the Exam",
    tips: [
      "Do not overthink your performance — the exam moves fast.",
      "Take a break and relax.",
      "Review your preparation strategy for next time if needed.",
      "Remember: PTE scores are based on overall performance, not perfection."
    ]
  }
];

const TIME_MANAGEMENT_DATA = [
  {
    id: '1',
    title: "General Time Management Principles",
    tips: [
      "Do not spend too long on any single question.",
      "Move on quickly if you are stuck — PTE rewards overall performance.",
      "Use partial credit to your advantage — even incomplete answers score.",
      "Stay calm and keep a steady pace throughout the exam.",
      "Remember: some tasks are high‑weight, so prioritise accuracy there."
    ]
  },
  {
    id: '2',
    title: "Speaking Section Timing",
    tips: [
      "Start speaking immediately when the microphone opens.",
      "Do not wait or hesitate — silence reduces fluency score.",
      "Keep answers within the recommended time (e.g., 25–35 seconds for long tasks).",
      "Do not try to fill the entire time if you have nothing more to say.",
      "Focus on fluency — smooth speech saves time and boosts score."
    ]
  },
  {
    id: '3',
    title: "Writing Section Timing",
    tips: [
      "Summarize Written Text: spend 1–2 minutes planning, 3–5 minutes writing, 1 minute checking.",
      "Essay: spend 3 minutes planning, 12–14 minutes writing, 2–3 minutes checking.",
      "Do not over‑edit — aim for clear, simple English.",
      "Use templates to save time and reduce stress.",
      "Always leave time to check spelling and punctuation."
    ]
  },
  {
    id: '4',
    title: "Reading Section Timing",
    tips: [
      "This section is short — do not get stuck on difficult questions.",
      "Spend more time on high‑weight tasks like FIB (Reading & Writing).",
      "Limit MCQ questions to 60–90 seconds each.",
      "Re‑order Paragraphs: build pairs quickly and move on.",
      "If unsure, choose the most logical answer and continue."
    ]
  },
  {
    id: '5',
    title: "Listening Section Timing",
    tips: [
      "Manage your energy — this section comes at the end of the exam.",
      "Do not waste time on MCMA — choose carefully and move on.",
      "Use the countdown timer wisely in Summarize Spoken Text.",
      "In FIB and WFD, accuracy matters more than speed.",
      "Save mental focus for the final tasks — they carry the highest weight."
    ]
  },
  {
    id: '6',
    title: "High‑Weight Task Prioritisation",
    tips: [
      "Repeat Sentence, Read Aloud, and Write From Dictation deserve extra focus.",
      "Do not rush through these tasks — they influence multiple skills.",
      "If you must choose where to spend more time, choose high‑weight tasks.",
      "Even small improvements in these tasks can raise your overall score significantly."
    ]
  },
  {
    id: '7',
    title: "Avoiding Time Traps",
    tips: [
      "Do not overthink MCQ questions — they have low weight.",
      "Do not try to perfect every sentence in writing tasks.",
      "Do not re‑listen mentally to audio — move forward.",
      "Do not panic if you miss a word — continue with the next one.",
      "Do not waste time trying to remember exact wording in speaking tasks."
    ]
  },
  {
    id: '8',
    title: "Using the Notepad Efficiently",
    tips: [
      "Write only key words — not full sentences.",
      "Use shorthand symbols to save time.",
      "Do not over‑write during listening tasks.",
      "Use notes mainly for Retell Lecture and Summarize Spoken Text.",
      "Avoid writing during speaking tasks — it breaks fluency."
    ]
  },
  {
    id: '9',
    title: "Staying Calm Under Time Pressure",
    tips: [
      "If you feel rushed, take one deep breath and continue.",
      "Focus on the current task — not the previous one.",
      "Trust your preparation and avoid second‑guessing.",
      "Remember: PTE is designed to be fast — this is normal.",
      "Keep moving forward — momentum is your best friend."
    ]
  }
];

const WHY_TAKE_PTE_DATA = [
  {
    id: '1',
    title: "Why Should I Take the PTE Exam?",
    tips: [
      "PTE is one of the fastest, fairest, and most reliable English tests available.",
      "It uses AI scoring, so there is no human bias — everyone is judged equally.",
      "Results are delivered quickly, often within 24–48 hours.",
      "The test is fully computer‑based, making it ideal for people who prefer technology over paper tests.",
      "PTE is accepted for study, work, and migration in many countries, including Australia, New Zealand, the UK, and Canada (for some programs).",
      "The exam is designed to test real‑life English skills, not memorisation.",
      "It is often considered easier to prepare for compared to other tests because of its predictable structure."
    ]
  },
  {
    id: '2',
    title: "What Skills Does the PTE Exam Cover?",
    tips: [
      "PTE tests all four core English skills: Speaking, Writing, Reading, and Listening.",
      "Many tasks are integrated — for example, speaking tasks also test listening, and writing tasks also test reading.",
      "The exam measures real‑world communication skills, such as summarising, describing, and understanding academic content.",
      "It evaluates pronunciation, fluency, grammar, vocabulary, spelling, and comprehension.",
      "The test focuses on practical English you will use in university, work, and daily life."
    ]
  },
  {
    id: '3',
    title: "Is the PTE Recognised by Universities?",
    tips: [
      "Yes — PTE Academic is accepted by thousands of universities worldwide.",
      "It is recognised by top institutions in the UK, Australia, New Zealand, Ireland, the USA, Canada, and Europe.",
      "All Australian and New Zealand universities accept PTE for academic admission.",
      "Many UK universities, including members of the Russell Group, accept PTE.",
      "PTE is also accepted for UK student visas (UKVI).",
      "More universities are adding PTE every year due to its reliability and fast results."
    ]
  },
  {
    id: '4',
    title: "How Long Is the PTE Certificate Valid For?",
    tips: [
      "For university applications, PTE Academic scores are valid for **2 years**.",
      "For Australian immigration, PTE scores are valid for **3 years**.",
      "Always check the specific requirements of the institution or immigration department you are applying to.",
      "Your score report is available online through your Pearson account at any time."
    ]
  },
  {
    id: '5',
    title: "PTE vs IELTS — A Clear Comparison",
    tips: [
      "PTE is fully computer‑based; IELTS has both computer and paper options.",
      "PTE speaking is recorded by a computer; IELTS speaking is a face‑to‑face interview.",
      "PTE results are usually available in 1–2 days; IELTS results take 3–13 days.",
      "PTE uses AI scoring for fairness; IELTS uses human examiners.",
      "PTE tasks are shorter and faster; IELTS tasks can feel longer and more traditional.",
      "PTE is often preferred by people who are comfortable with technology.",
      "IELTS may be preferred by people who want a human speaking interview.",
      "Both tests are widely accepted, but PTE is growing rapidly in recognition."
    ]
  }
];

const HOW_WHERE_PTE_DATA = [
  {
    id: '1',
    title: "How Can I Take the PTE Exam?",
    tips: [
      "You must book the exam through the official Pearson PTE website.",
      "Create a Pearson account using your email and personal details.",
      "Choose your preferred test type: PTE Academic, PTE Academic UKVI, or PTE Home.",
      "Select your test centre, date, and time from the available options.",
      "Pay the exam fee online using a debit/credit card.",
      "You will receive a confirmation email with your test details and instructions.",
      "Arrive early on test day with your valid ID (usually a passport)."
    ]
  },
  {
    id: '2',
    title: "Where Can I Take the PTE Exam?",
    tips: [
      "PTE is available in over 400+ test centres across 120+ countries.",
      "You can choose any test centre that is convenient for you — location does not affect your score.",
      "Test centres are usually located in major cities, universities, and authorised training centres.",
      "Each centre provides a secure testing environment with computers, headsets, and microphones.",
      "You can search for the nearest test centre on the official Pearson PTE website."
    ]
  },
  {
    id: '3',
    title: "Can I Take the PTE Exam Online?",
    tips: [
      "Yes — Pearson offers PTE Academic Online for students who prefer to take the test from home.",
      "You must have a quiet room, a reliable computer, a webcam, and a stable internet connection.",
      "Online PTE is accepted by many universities, but NOT for visas or immigration.",
      "Always check whether your institution accepts PTE Academic Online before booking.",
      "Online PTE uses AI monitoring and strict security checks."
    ]
  },
  {
    id: '4',
    title: "What Do I Need to Take the PTE Exam?",
    tips: [
      "A valid passport (most countries require this as the main ID).",
      "A Pearson account to book the exam.",
      "A test centre booking confirmation.",
      "For online PTE: a quiet room, working webcam, microphone, and stable internet.",
      "Arrive early — late arrivals may not be allowed to take the test."
    ]
  },
  {
    id: '5',
    title: "How Much Does the PTE Exam Cost?",
    tips: [
      "The price varies by country, usually between USD $180–$250.",
      "Some countries charge additional taxes or service fees.",
      "Rescheduling or cancelling may include extra charges.",
      "You can check the exact price during the booking process on the Pearson website."
    ]
  },
  {
    id: '6',
    title: "How Long Does It Take to Get Results?",
    tips: [
      "Most PTE results are available within 24–48 hours.",
      "You will receive an email when your score report is ready.",
      "You can access your results through your Pearson account.",
      "You can send your score directly to universities from your dashboard."
    ]
  },
  {
    id: '7',
    title: "Is PTE Available in My Country?",
    tips: [
      "PTE test centres operate in over 120 countries worldwide.",
      "It is widely available across Asia, Europe, the Middle East, Africa, Australia, and the Americas.",
      "If your city does not have a test centre, you can choose the nearest available location.",
      "You can also take PTE Academic Online if your institution accepts it.",
      "Use the official Pearson website to check availability in your region."
    ]
  }
];

// --- COMPONENT ---
export default function ExamInfoScreen() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { fontSize: 24, fontWeight: 'bold', color: colors.text, padding: 20, paddingBottom: 10 },
    scroll: { padding: 20 },
    
    // Card Styles
    card: { backgroundColor: colors.surface, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    cardContent: { padding: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  
    // Question Types Styles
    partContainer: { marginTop: 20 },
    partHeader: { color: colors.primary, fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
    duration: { color: colors.subtext, fontSize: 13, fontStyle: 'italic', marginBottom: 10 },
    itemRow: { marginBottom: 12 },
    itemTitle: { fontWeight: '700', color: colors.text, fontSize: 15 },
    itemDesc: { color: colors.subtext, fontSize: 14, lineHeight: 20 },
  
    // Table Styles
    tableIntro: { color: colors.subtext, fontSize: 13, textAlign: 'center', marginTop: 15, marginBottom: 10 },
    legendBox: { backgroundColor: colors.primary + '15', padding: 10, borderRadius: 8, marginBottom: 15 },
    legendText: { fontSize: 12, color: colors.primary, textAlign: 'center' },
    
    tableHeader: { flexDirection: 'row', backgroundColor: isDark ? colors.border : '#F1F5F9', padding: 10, borderRadius: 8, marginBottom: 4 },
    tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    rowEven: { backgroundColor: isDark ? colors.background : '#FAFAFA' },
    th: { fontWeight: 'bold', color: colors.subtext, fontSize: 13 },
    bold: { fontWeight: 'bold', color: colors.primary },
    
    // Columns
    col1: { flex: 3, fontSize: 14, color: colors.text },
    col2: { flex: 1, textAlign: 'center', fontSize: 14, color: colors.text },
    col3: { flex: 1, textAlign: 'center', fontSize: 14, color: colors.subtext },
  
    // Disclaimer Styles
    disclaimerTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
    disclaimerSubtitle: { fontSize: 15, fontWeight: 'bold', color: colors.subtext, marginTop: 15, marginBottom: 6 },
    disclaimerText: { fontSize: 13, color: colors.subtext, lineHeight: 20, marginBottom: 10 }
  });

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Exam Guide</Text>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* --- SECTION: WHY SHOULD I TAKE THE PTE EXAM --- */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('whyTakePTE')}>
            <View style={styles.headerLeft}>
              <Ionicons name="help-circle" size={24} color="#3B82F6" />
              <Text style={[styles.cardTitle, { flexShrink: 1, width: '80%' }]}>
                Why Should I Take the PTE Exam?</Text>
            </View>
            <Ionicons name={expandedSection === 'whyTakePTE' ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
          </TouchableOpacity>

          {expandedSection === 'whyTakePTE' && (
            <View style={styles.cardContent}>
              {WHY_TAKE_PTE_DATA.map((item) => (
                <View key={item.id} style={{ marginBottom: 20 }}>
                  <Text style={styles.itemTitle}>{item.id}) {item.title}</Text>
                  {item.tips.map((tip, index) => (
                    <Text key={index} style={styles.itemDesc}>• {tip}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* --- SECTION: HOW & WHERE CAN I TAKE THE PTE EXAM --- */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('howWherePTE')}>
            <View style={styles.headerLeft}>
              <Ionicons name="location" size={24} color="#0EA5E9" />
              <Text style={[styles.cardTitle, { flexShrink: 1, width: '80%' }]}>
                How & Where Can I Take the PTE Exam?</Text>
            </View>
            <Ionicons name={expandedSection === 'howWherePTE' ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
          </TouchableOpacity>

          {expandedSection === 'howWherePTE' && (
            <View style={styles.cardContent}>
              {HOW_WHERE_PTE_DATA.map((item) => (
                <View key={item.id} style={{ marginBottom: 20 }}>
                  <Text style={styles.itemTitle}>{item.id}) {item.title}</Text>
                  {item.tips.map((tip, index) => (
                    <Text key={index} style={styles.itemDesc}>• {tip}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* --- SECTION 1: QUESTION TYPES --- */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('types')}>
            <View style={styles.headerLeft}>
              <Ionicons name="list" size={24} color="#2563EB" />
              <Text style={styles.cardTitle}>Question Types</Text>
            </View>
            <Ionicons name={expandedSection === 'types' ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
          </TouchableOpacity>

          {expandedSection === 'types' && (
            <View style={styles.cardContent}>
              {QUESTION_TYPES.map((part, index) => (
                <View key={index} style={styles.partContainer}>
                  <Text style={styles.partHeader}>{part.part}</Text>
                  <Text style={styles.duration}>Duration: {part.duration}</Text>
                  
                  {part.items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.itemTitle}>{item.id}) {item.title}</Text>
                      <Text style={styles.itemDesc}>{item.desc}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* --- SECTION 2: SCORING TABLE --- */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('scoring')}>
            <View style={styles.headerLeft}>
              <Ionicons name="stats-chart" size={24} color="#F97316" />
              <Text style={styles.cardTitle}>Scoring Weight Table</Text>
            </View>
            <Ionicons name={expandedSection === 'scoring' ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
          </TouchableOpacity>

          {expandedSection === 'scoring' && (
            <View style={styles.cardContent}>
              <Text style={styles.tableIntro}>Higher numbers = greater impact on overall score</Text>
              
              <View style={styles.legendBox}>
                <Text style={styles.legendText}><Text style={{fontWeight:'bold'}}>Legend:</Text> S=Speaking, W=Writing, R=Reading, L=Listening</Text>
              </View>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.col1, styles.th]}>Task</Text>
                <Text style={[styles.col2, styles.th]}>Weight</Text>
                <Text style={[styles.col3, styles.th]}>Skills</Text>
              </View>

              {/* Table Body */}
              {SCORING_DATA.map((row, index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.rowEven]}>
                  <Text style={styles.col1}>{row.task}</Text>
                  <Text style={[styles.col2, styles.bold]}>{row.weight}</Text>
                  <Text style={styles.col3}>{row.skills}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {/* --- SECTION: TIPS & TRICKS --- */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('tips')}>
            <View style={styles.headerLeft}>
              <Ionicons name="bulb" size={24} color="#10B981" />
              <Text style={styles.cardTitle}>Tips & Tricks to Success</Text>
            </View>
            <Ionicons name={expandedSection === 'tips' ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
          </TouchableOpacity>

          {expandedSection === 'tips' && (
            <View style={styles.cardContent}>
              {TIPS_TRICKS_DATA.map((item) => (
                <View key={item.id} style={{ marginBottom: 20 }}>
                  <Text style={styles.itemTitle}>{item.id}) {item.title}</Text>
                  {item.tips.map((tip, index) => (
                    <Text key={index} style={styles.itemDesc}>• {tip}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* --- SECTION: COMMON MISTAKES & HOW TO AVOID THEM --- */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('commonMistakes')}>
            <View style={styles.headerLeft}>
              <Ionicons name="alert-circle" size={24} color="#DC2626" />
              <Text style={[styles.cardTitle, { flexShrink: 1, width: '80%' }]}>
                Common Mistakes & How to Avoid Them</Text>
            </View>
            <Ionicons name={expandedSection === 'commonMistakes' ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
          </TouchableOpacity>

          {expandedSection === 'commonMistakes' && (
            <View style={styles.cardContent}>
              {COMMON_MISTAKES_DATA.map((item) => (
                <View key={item.id} style={{ marginBottom: 20 }}>
                  <Text style={styles.itemTitle}>{item.id}) {item.title}</Text>
                  {item.tips.map((tip, index) => (
                    <Text key={index} style={styles.itemDesc}>• {tip}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* --- SECTION: HIGH-WEIGHT TASKS (SCORE BOOSTERS) --- */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('highWeight')}>
            <View style={styles.headerLeft}>
              <Ionicons name="trending-up" size={24} color="#16A34A" />
              <Text style={styles.cardTitle}>Score Boosters</Text>
            </View>
            <Ionicons name={expandedSection === 'highWeight' ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
          </TouchableOpacity>

          {expandedSection === 'highWeight' && (
            <View style={styles.cardContent}>
              {HIGH_WEIGHT_TASKS_DATA.map((item) => (
                <View key={item.id} style={{ marginBottom: 20 }}>
                  <Text style={styles.itemTitle}>{item.id}) {item.title}</Text>
                  {item.tips.map((tip, index) => (
                    <Text key={index} style={styles.itemDesc}>• {tip}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* --- SECTION: AI SCORING GUIDE --- */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('aiScoring')}>
            <View style={styles.headerLeft}>
              <Ionicons name="analytics" size={24} color="#0EA5E9" />
              <Text style={[styles.cardTitle, { flexShrink: 1, width: '80%' }]}>
                AI Scoring Guide (How PTE Flow Evaluates You)</Text>
            </View>
            <Ionicons name={expandedSection === 'aiScoring' ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
          </TouchableOpacity>

          {expandedSection === 'aiScoring' && (
            <View style={styles.cardContent}>
              {AI_SCORING_GUIDE_DATA.map((item) => (
                <View key={item.id} style={{ marginBottom: 20 }}>
                  <Text style={styles.itemTitle}>{item.id}) {item.title}</Text>
                  {item.tips.map((tip, index) => (
                    <Text key={index} style={styles.itemDesc}>• {tip}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* --- SECTION: TIME MANAGEMENT GUIDE --- */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('timeManagement')}>
            <View style={styles.headerLeft}>
              <Ionicons name="timer" size={24} color="#F59E0B" />
              <Text style={styles.cardTitle}>Time Management Guide</Text>
            </View>
            <Ionicons name={expandedSection === 'timeManagement' ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
          </TouchableOpacity>

          {expandedSection === 'timeManagement' && (
            <View style={styles.cardContent}>
              {TIME_MANAGEMENT_DATA.map((item) => (
                <View key={item.id} style={{ marginBottom: 20 }}>
                  <Text style={styles.itemTitle}>{item.id}) {item.title}</Text>
                  {item.tips.map((tip, index) => (
                    <Text key={index} style={styles.itemDesc}>• {tip}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>


        {/* --- SECTION: TEST DAY STRATEGY --- */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('testDay')}>
            <View style={styles.headerLeft}>
              <Ionicons name="calendar" size={24} color="#2563EB" />
              <Text style={styles.cardTitle}>Test Day Strategy</Text>
            </View>
            <Ionicons name={expandedSection === 'testDay' ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
          </TouchableOpacity>

          {expandedSection === 'testDay' && (
            <View style={styles.cardContent}>
              {TEST_DAY_STRATEGY_DATA.map((item) => (
                <View key={item.id} style={{ marginBottom: 20 }}>
                  <Text style={styles.itemTitle}>{item.id}) {item.title}</Text>
                  {item.tips.map((tip, index) => (
                    <Text key={index} style={styles.itemDesc}>• {tip}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* --- SECTION 3: DISCLAIMER --- */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('disclaimer')}>
            <View style={styles.headerLeft}>
              <Ionicons name="information-circle" size={24} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Disclaimer</Text>
            </View>
            <Ionicons name={expandedSection === 'disclaimer' ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
          </TouchableOpacity>

          {expandedSection === 'disclaimer' && (
            <View style={styles.cardContent}>
              <Text style={styles.disclaimerTitle}>PTE Flow – Disclaimer</Text>
              <Text style={styles.disclaimerText}>
                PTE Flow is an independent practice and learning tool designed to help users prepare for the Pearson Test of English (PTE). It is not affiliated with, endorsed by, or sponsored by Pearson PLC or any of its subsidiaries.
              </Text>
              
              <Text style={styles.disclaimerText}>
                All practice items, sample questions, scoring simulations, and feedback provided in the app are created for educational purposes only. They do not represent official PTE exam content, scoring algorithms, or outcomes.
              </Text>
              
              <Text style={styles.disclaimerText}>
                Scores, band estimates, and AI‑generated feedback are approximations intended to support learning and self‑assessment. They should not be interpreted as official PTE results or guarantees of performance in the actual exam.
              </Text>
              
              <Text style={styles.disclaimerText}>
                While we aim for accuracy and reliability, PTE Flow cannot guarantee error‑free content or uninterrupted service. Users are responsible for verifying information and using the app as a supplementary study resource.
              </Text>
              
              <Text style={styles.disclaimerText}>
                By using PTE Flow, you agree that the developers are not liable for exam outcomes, academic decisions, or any losses arising from reliance on the app’s content or features.
              </Text>

              <Text style={styles.disclaimerSubtitle}>AI‑Generated Scoring & Feedback</Text>
              <Text style={styles.disclaimerText}>
                PTE Flow uses automated scoring and AI‑powered feedback to support learning. These outputs may not always reflect human‑marker judgement and should be used as guidance rather than definitive evaluation.
              </Text>

              <Text style={styles.disclaimerSubtitle}>Data & Audio Processing</Text>
              <Text style={styles.disclaimerText}>
                All audio recordings and user data are processed securely and used only for practice, scoring, and app functionality. No data is shared with third parties without user consent.
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Replaced by dynamic styles
