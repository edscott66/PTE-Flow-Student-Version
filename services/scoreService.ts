import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebase';

const ATTEMPTED_QUESTIONS_KEY = 'pte_flow_attempted_questions';
const TOTAL_SCORE_KEY = 'pte_flow_leaderboard_score_v2';
const USER_NAME_KEY = 'pte_flow_user_name';
const ORIGINAL_SSID_KEY = 'pte_flow_original_ssid';
const IS_CREATOR_KEY = 'pte_flow_is_creator';
const PERFORMANCE_DATA_KEY = 'pte_flow_performance_data';
const RECENT_ACTIVITY_KEY = 'pte_flow_recent_activity';
const TARGET_SCORE_KEY = 'pte_flow_target_score';
const AVATAR_URI_KEY = 'pte_flow_avatar_uri';
const STREAK_KEY = 'pte_flow_streak';
const LAST_STUDY_DATE_KEY = 'pte_flow_last_study_date';
const TOTAL_STUDY_TIME_KEY = 'pte_flow_total_study_time';
const MISTAKES_BANK_KEY = 'pte_flow_mistakes_bank';

export interface PerformanceMetrics {
  fluency: number;
  pronunciation: number;
  listening_recall: number;
  reading_speed: number;
  grammar: number;
  vocabulary: number;
  writing_accuracy: number;
}

export interface RecentActivity {
  moduleId: string;
  moduleTitle: string;
  questionIndex: number;
  timestamp: string;
}

const DEFAULT_PERFORMANCE: PerformanceMetrics = {
  fluency: 70,
  pronunciation: 70,
  listening_recall: 70,
  reading_speed: 180,
  grammar: 75,
  vocabulary: 75,
  writing_accuracy: 75
};

const CORRECT_FIRST_ATTEMPT_KEY = 'pte_flow_cfa';
const FAILED_FIRST_ATTEMPT_KEY = 'pte_flow_ffa';
const GROUP_ID_KEY = 'pte_flow_group_id';

export const scoreService = {
  async getCorrectFirstAttempts(): Promise<number> {
    const data = await AsyncStorage.getItem(CORRECT_FIRST_ATTEMPT_KEY);
    return data ? parseInt(data, 10) : 0;
  },

  async setCorrectFirstAttempts(count: number) {
    await AsyncStorage.setItem(CORRECT_FIRST_ATTEMPT_KEY, count.toString());
  },

  async addCorrectFirstAttempt() {
    const current = await this.getCorrectFirstAttempts();
    const next = current + 1;
    await AsyncStorage.setItem(CORRECT_FIRST_ATTEMPT_KEY, next.toString());
    return next;
  },

  async getFailedFirstAttempts(): Promise<number> {
    const data = await AsyncStorage.getItem(FAILED_FIRST_ATTEMPT_KEY);
    return data ? parseInt(data, 10) : 0;
  },

  async setFailedFirstAttempts(count: number) {
    await AsyncStorage.setItem(FAILED_FIRST_ATTEMPT_KEY, count.toString());
  },

  async addFailedFirstAttempt() {
    const current = await this.getFailedFirstAttempts();
    const next = current + 1;
    await AsyncStorage.setItem(FAILED_FIRST_ATTEMPT_KEY, next.toString());
    return next;
  },

  async getGroupId(): Promise<string | null> {
    return await AsyncStorage.getItem(GROUP_ID_KEY);
  },

  async setGroupId(groupId: string) {
    await AsyncStorage.setItem(GROUP_ID_KEY, groupId);
  },

  async getPerformance(): Promise<PerformanceMetrics> {
    const data = await AsyncStorage.getItem(PERFORMANCE_DATA_KEY);
    return data ? { ...DEFAULT_PERFORMANCE, ...JSON.parse(data) } : DEFAULT_PERFORMANCE;
  },

  async updatePerformance(metrics: Partial<PerformanceMetrics>) {
    const current = await this.getPerformance();
    const updated = { ...current, ...metrics };
    await AsyncStorage.setItem(PERFORMANCE_DATA_KEY, JSON.stringify(updated));
    return updated;
  },

  async isFirstAttempt(questionId: string): Promise<boolean> {
    const attempted = await this.getAttemptedQuestions();
    return !attempted.includes(questionId);
  },

  async markAsAttempted(questionId: string) {
    const attempted = await this.getAttemptedQuestions();
    if (!attempted.includes(questionId)) {
      attempted.push(questionId);
      await AsyncStorage.setItem(ATTEMPTED_QUESTIONS_KEY, JSON.stringify(attempted));
      return true;
    }
    return false;
  },

  async getAttemptedQuestions(): Promise<string[]> {
    const data = await AsyncStorage.getItem(ATTEMPTED_QUESTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async setAttemptedQuestions(questions: string[]) {
    await AsyncStorage.setItem(ATTEMPTED_QUESTIONS_KEY, JSON.stringify(questions));
  },

  async addPoint() {
    const currentScore = await this.getScore();
    const newScore = currentScore + 1;
    await AsyncStorage.setItem(TOTAL_SCORE_KEY, newScore.toString());
    return newScore;
  },

  async getScore(): Promise<number> {
    const data = await AsyncStorage.getItem(TOTAL_SCORE_KEY);
    return data ? parseInt(data, 10) : 0;
  },

  async setScore(score: number) {
    await AsyncStorage.setItem(TOTAL_SCORE_KEY, score.toString());
  },

  async setUserName(name: string) {
    await AsyncStorage.setItem(USER_NAME_KEY, name);
  },

  async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('pte_flow_device_id');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await AsyncStorage.setItem('pte_flow_device_id', deviceId);
      }
      return deviceId;
    } catch (e) {
      return "fallback_device_id";
    }
  },

  async getUserName(): Promise<string | null> {
    return await AsyncStorage.getItem(USER_NAME_KEY);
  },

  async setOriginalSSID(ssid: string) {
    await AsyncStorage.setItem(ORIGINAL_SSID_KEY, ssid);
  },

  async getOriginalSSID(): Promise<string | null> {
    return await AsyncStorage.getItem(ORIGINAL_SSID_KEY);
  },

  async setIsCreator(isCreator: boolean) {
    await AsyncStorage.setItem(IS_CREATOR_KEY, isCreator ? 'true' : 'false');
  },

  async getIsCreator(): Promise<boolean> {
    // Hardcoded check for the owner email to ensure they are always admin
    const userEmail = auth.currentUser?.email;
    if (userEmail === 'projectgazzy@gmail.com') return true;

    const data = await AsyncStorage.getItem(IS_CREATOR_KEY);
    return data === 'true';
  },

  async setRecentActivity(activity: RecentActivity) {
    await AsyncStorage.setItem(RECENT_ACTIVITY_KEY, JSON.stringify(activity));
  },

  async getRecentActivity(): Promise<RecentActivity | null> {
    const data = await AsyncStorage.getItem(RECENT_ACTIVITY_KEY);
    return data ? JSON.parse(data) : null;
  },

  async getTargetScore(): Promise<number> {
    const data = await AsyncStorage.getItem(TARGET_SCORE_KEY);
    return data ? parseInt(data, 10) : 79;
  },

  async setTargetScore(score: number) {
    await AsyncStorage.setItem(TARGET_SCORE_KEY, score.toString());
  },

  async getStreak(): Promise<number> {
    const data = await AsyncStorage.getItem(STREAK_KEY);
    const lastDate = await AsyncStorage.getItem(LAST_STUDY_DATE_KEY);
    if (!data || !lastDate) return 0;

    const streak = parseInt(data, 10);
    const last = new Date(lastDate);
    const now = new Date();

    const diffMs = now.getTime() - last.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 48) {
      await AsyncStorage.setItem(STREAK_KEY, '0');
      return 0;
    }
    return streak;
  },

  async updateStreak() {
    const lastDateStr = await AsyncStorage.getItem(LAST_STUDY_DATE_KEY);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (!lastDateStr) {
      await AsyncStorage.setItem(STREAK_KEY, '1');
      await AsyncStorage.setItem(LAST_STUDY_DATE_KEY, now.toISOString());
      return 1;
    }

    const last = new Date(lastDateStr);
    const lastStr = last.toISOString().split('T')[0];

    if (lastStr === todayStr) {
      return parseInt(await AsyncStorage.getItem(STREAK_KEY) || '1', 10);
    }

    const diffMs = now.getTime() - last.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    let currentStreak = parseInt(await AsyncStorage.getItem(STREAK_KEY) || '0', 10);

    if (diffHours <= 48) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    await AsyncStorage.setItem(STREAK_KEY, currentStreak.toString());
    await AsyncStorage.setItem(LAST_STUDY_DATE_KEY, now.toISOString());
    return currentStreak;
  },

  async getTotalStudyTime(): Promise<number> {
    const data = await AsyncStorage.getItem(TOTAL_STUDY_TIME_KEY);
    return data ? parseInt(data, 10) : 0;
  },

  async addStudyTime(minutes: number) {
    const current = await this.getTotalStudyTime();
    const updated = current + minutes;
    await AsyncStorage.setItem(TOTAL_STUDY_TIME_KEY, updated.toString());
    return updated;
  },

  async saveMistake(question: any) {
    const data = await AsyncStorage.getItem(MISTAKES_BANK_KEY);
    let bank: any[] = data ? JSON.parse(data) : [];

    const exists = bank.find(q => q.id === question.id || q.text === question.text);
    if (!exists) {
      bank.push({
        ...question,
        savedAt: new Date().toISOString(),
        reviewCount: 0
      });
      await AsyncStorage.setItem(MISTAKES_BANK_KEY, JSON.stringify(bank));
    }
  },

  async getMistakes(): Promise<any[]> {
    const data = await AsyncStorage.getItem(MISTAKES_BANK_KEY);
    return data ? JSON.parse(data) : [];
  },

  async removeMistake(questionId: string) {
    const data = await AsyncStorage.getItem(MISTAKES_BANK_KEY);
    if (!data) return;
    let bank: any[] = JSON.parse(data);
    bank = bank.filter(q => q.id !== questionId);
    await AsyncStorage.setItem(MISTAKES_BANK_KEY, JSON.stringify(bank));
  },

  async getAvatarUri(): Promise<string | null> {
    return await AsyncStorage.getItem(AVATAR_URI_KEY);
  },

  async setAvatarUri(uri: string) {
    await AsyncStorage.setItem(AVATAR_URI_KEY, uri);
  },

  async getSubscriptionStartDate(): Promise<number | null> {
    const key = 'pte_flow_sub_start_date';
    const existing = await AsyncStorage.getItem(key);
    if (existing) {
      return parseInt(existing, 10);
    }
    return null;
  },

  async setSubscriptionStartDate(timestamp: number) {
    const key = 'pte_flow_sub_start_date';
    await AsyncStorage.setItem(key, timestamp.toString());
  },

  async getSubscriptionStatus() {
    const startDate = await this.getSubscriptionStartDate();
    const msPerDay = 1000 * 60 * 60 * 24;

    let daysRemaining = 0;
    if (startDate !== null) {
      const expiryDate = startDate + (60 * msPerDay);
      daysRemaining = Math.floor((expiryDate - Date.now()) / msPerDay);
    } else {
      daysRemaining = 0;
    }

    let text = '';
    let color = '';

    if (startDate === null) {
      text = `Not Activated`;
      color = '#EF4444';
    } else if (daysRemaining > 3) {
      text = `Active — ${daysRemaining} days remaining`;
      color = '#10B981';
    } else if (daysRemaining <= 3 && daysRemaining > 0) {
      text = `Expires in ${daysRemaining} days`;
      color = '#EF4444';
    } else {
      text = `Expired — Renew now`;
      color = '#EF4444';
    }

    return {
      daysRemaining,
      text,
      color,
      isExpired: startDate !== null && daysRemaining <= 0,
      isActivated: startDate !== null
    };
  },

  async getAllLocalData() {
    const data: any = {};
    const keys = [
      ATTEMPTED_QUESTIONS_KEY, TOTAL_SCORE_KEY, ORIGINAL_SSID_KEY,
      PERFORMANCE_DATA_KEY, RECENT_ACTIVITY_KEY, TARGET_SCORE_KEY,
      AVATAR_URI_KEY, STREAK_KEY, LAST_STUDY_DATE_KEY, TOTAL_STUDY_TIME_KEY,
      MISTAKES_BANK_KEY, CORRECT_FIRST_ATTEMPT_KEY, FAILED_FIRST_ATTEMPT_KEY
    ];
    for (const key of keys) {
      const val = await AsyncStorage.getItem(key);
      if (val) data[key] = val;
    }
    return data;
  },

  async restoreLocalData(data: any) {
    if (!data) return;
    const entries = Object.entries(data).filter(([key, val]) => val !== null && val !== undefined) as [string, string][];
    if (entries.length > 0) {
      await AsyncStorage.multiSet(entries);
    }
  },

  // ─── FIXED ──────────────────────────────────────────────────────────────────
  // CORRECT_FIRST_ATTEMPT_KEY and FAILED_FIRST_ATTEMPT_KEY are intentionally
  // NOT wiped here. Wiping them caused the home screen to show zeros after
  // logout because AsyncStorage was empty before Firebase could restore them.
  // These keys survive logout and are only cleared on a deliberate user
  // "Reset My Progress" action via clearProgressOnly() below.
  // ────────────────────────────────────────────────────────────────────────────
  async clearAllLocalData() {
    console.log("[ScoreService] Wiping all local data for logout/reset...");
    const keys = [
      ATTEMPTED_QUESTIONS_KEY,
      TOTAL_SCORE_KEY,
      ORIGINAL_SSID_KEY,
      RECENT_ACTIVITY_KEY,
      STREAK_KEY,
      LAST_STUDY_DATE_KEY,
      TOTAL_STUDY_TIME_KEY,
      'pte_flow_user_id',
      'pte_flow_has_synced_v2',
      'pte_flow_leaderboard_hidden',
      PERFORMANCE_DATA_KEY,
      MISTAKES_BANK_KEY,
      AVATAR_URI_KEY,
      TARGET_SCORE_KEY,
      GROUP_ID_KEY,
      CORRECT_FIRST_ATTEMPT_KEY,
      FAILED_FIRST_ATTEMPT_KEY,
      USER_NAME_KEY,
      IS_CREATOR_KEY
    ];
    try {
      await AsyncStorage.multiRemove(keys);
      console.log("[ScoreService] Full local data wipe complete.");
    } catch (e) {
      console.error("[ScoreService] Wipe failed:", e);
    }
  },

  // Call this when the user deliberately resets their own progress
  // (the "Reset My Progress" button in Settings).
  // AS PER REQUEST: This will reset leaderboard score to 0, reset CFA/FFA, but keep the GroupID.
  async clearProgressOnly() {
    console.log("[ScoreService] Resetting leaderboard score and progress report...");
    const keysToWipe = [
      ATTEMPTED_QUESTIONS_KEY,
      TOTAL_SCORE_KEY,
      RECENT_ACTIVITY_KEY,
      STREAK_KEY,
      LAST_STUDY_DATE_KEY,
      TOTAL_STUDY_TIME_KEY,
      PERFORMANCE_DATA_KEY,
      MISTAKES_BANK_KEY,
      CORRECT_FIRST_ATTEMPT_KEY,
      FAILED_FIRST_ATTEMPT_KEY
    ];
    try {
      await AsyncStorage.multiRemove(keysToWipe);
      // Explicitly set score to 0
      await AsyncStorage.setItem(TOTAL_SCORE_KEY, '0');
      console.log("[ScoreService] Progress reset complete. Group kept.");
    } catch (e) {
      console.error("[ScoreService] Reset failed:", e);
    }
  },

  async resetLeaderboardScore() {
    await AsyncStorage.setItem(TOTAL_SCORE_KEY, '0');
    // We do NOT remove 'pte_flow_has_synced_v2' because we want to maintain
    // the connection to the same cloud document, just with a fresh score of 0.
  }
};
