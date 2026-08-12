/**
 * Daily Goals Engine for PTE training app.
 * Generates adaptive, high-impact tasks based on user performance.
 */

export interface PerformanceData {
  fluency?: number; // 0-100
  pronunciation?: number; // 0-100
  listening_recall?: number; // 0-100
  reading_speed?: number; // WPM
  grammar?: number; // 0-100
  vocabulary?: number; // 0-100
  writing_accuracy?: number; // 0-100
}

export interface DailyGoalTask {
  task_name: string;
  skill_trained: string;
  why_it_matters_for_pte: string;
  estimated_time_minutes: number;
  module_id: string;
}

export interface DailyGoalsOutput {
  daily_goals: DailyGoalTask[];
  adaptive_adjustments: string;
  micro_feedback: string;
  progress_signals: string[];
  weekly_link: string;
  readiness_score: number;
}

const ALL_TASKS: DailyGoalTask[] = [
  {
    task_name: "Read Aloud Pacing",
    skill_trained: "Speaking fluency",
    why_it_matters_for_pte: "Ensures a steady rhythm without hesitations, a key scoring factor.",
    estimated_time_minutes: 3,
    module_id: "read-aloud"
  },
  {
    task_name: "Describe Image Trends",
    skill_trained: "Speaking fluency",
    why_it_matters_for_pte: "Develops the ability to speak continuously while analyzing visual data.",
    estimated_time_minutes: 4,
    module_id: "describe-image"
  },
  {
    task_name: "Repeat Sentence Shadowing",
    skill_trained: "Listening recall",
    why_it_matters_for_pte: "Trains the brain to retain and reproduce complex sentence structures.",
    estimated_time_minutes: 2,
    module_id: "repeat-sentence"
  },
  {
    task_name: "Listening Fill in the Blanks",
    skill_trained: "Listening recall",
    why_it_matters_for_pte: "Sharpens real-time word recognition and spelling accuracy.",
    estimated_time_minutes: 3,
    module_id: "fill-blanks-listening"
  },
  {
    task_name: "Summarize Written Text",
    skill_trained: "Grammar control",
    why_it_matters_for_pte: "Tests the ability to condense information into a single, grammatically perfect sentence.",
    estimated_time_minutes: 4,
    module_id: "summarize-written"
  },
  {
    task_name: "Pronunciation Drill: Vowel Clarity",
    skill_trained: "Pronunciation consistency",
    why_it_matters_for_pte: "Ensures AI scoring engines can accurately map your speech to text.",
    estimated_time_minutes: 2,
    module_id: "read-aloud"
  },
  {
    task_name: "Speed Reading: Scanning for Keywords",
    skill_trained: "Reading speed & scanning",
    why_it_matters_for_pte: "Reduces time spent on long passages by locating key info faster.",
    estimated_time_minutes: 3,
    module_id: "re-order-paragraphs"
  },
  {
    task_name: "Vocabulary Expansion: Academic Synonyms",
    skill_trained: "Vocabulary range",
    why_it_matters_for_pte: "Increases lexical diversity scores in both writing and speaking.",
    estimated_time_minutes: 3,
    module_id: "fill-blanks-rw"
  }
];

export function generateDailyGoals(
  performance?: PerformanceData,
  level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  timeAvailable: number = 10
): DailyGoalsOutput {
  let selectedTasks: DailyGoalTask[] = [];
  let adjustments = "Default high-impact rotation applied.";
  let feedback = "Focus on maintaining a steady pace across all modules.";
  let signals = ["Fluency stability", "Pronunciation consistency", "Listening recall accuracy"];
  let link = "Consistently hitting these goals will build the stamina needed for the full mock exam.";

  if (!performance) {
    // Default rotation
    selectedTasks = ALL_TASKS.slice(0, 3);
  } else {
    const priorities: string[] = [];
    
    if ((performance.fluency || 100) < 60) {
      priorities.push("Speaking fluency");
      adjustments = "Prioritizing fluency due to recent scoring trends.";
      feedback = "Your oral fluency is currently the biggest bottleneck. Avoid self-correction at all costs.";
    }
    
    if ((performance.listening_recall || 100) < 60) {
      priorities.push("Listening recall");
      adjustments = "Increased focus on recall tasks to stabilize listening scores.";
      feedback = "Focus on the 'meaning' of the sentence rather than just the words to improve recall.";
    }
    
    if ((performance.grammar || 100) < 60) {
      priorities.push("Grammar control");
      adjustments = "Adding structured writing tasks to address grammar inconsistencies.";
      feedback = "Review your punctuation in Summarize Written Text; one error can invalidate the whole response.";
    }

    if ((performance.pronunciation || 100) < 60) {
      priorities.push("Pronunciation consistency");
      adjustments = "Focusing on phonetic clarity to improve AI recognition.";
      feedback = "Enunciate word endings clearly, especially 's' and 'ed' suffixes.";
    }

    // Select tasks based on priorities
    const prioritizedTasks = ALL_TASKS.filter(t => priorities.includes(t.skill_trained));
    const otherTasks = ALL_TASKS.filter(t => !priorities.includes(t.skill_trained));
    
    selectedTasks = [...prioritizedTasks, ...otherTasks].slice(0, Math.min(5, Math.max(3, Math.floor(timeAvailable / 3))));
    
    // Progress signals based on performance
    if (performance.reading_speed) {
      signals.push(`Reading speed (${performance.reading_speed} WPM)`);
    }
    if (performance.grammar) {
      signals.push("Grammar accuracy under time pressure");
    }
  }

  // Ensure signals has 3-5 items
  signals = Array.from(new Set(signals)).slice(0, 5);
  if (signals.length < 3) {
    signals.push("Vocabulary diversity", "Time management efficiency");
  }

  // Weekly link logic
  if (performance && (performance.listening_recall || 100) < 50) {
    link = "If listening accuracy remains low today, schedule a Listening Booster session later this week.";
  } else if (performance && (performance.fluency || 100) < 50) {
    link = "Focus on fluency today to prepare for the Speaking Intensive workshop on Friday.";
  }

  return {
    daily_goals: selectedTasks,
    adaptive_adjustments: adjustments,
    micro_feedback: feedback,
    progress_signals: signals,
    weekly_link: link,
    readiness_score: performance ? Math.round(( (performance.fluency || 0) + (performance.listening_recall || 0) + (performance.grammar || 0) + (performance.pronunciation || 0) ) / 4) : 50
  };
}
