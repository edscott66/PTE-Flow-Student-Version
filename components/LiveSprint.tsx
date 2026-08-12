import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth, ensureAuth } from '../services/firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, where, orderBy, deleteDoc, getDocs } from 'firebase/firestore';
import { networkService } from '../services/networkService';
import { useTheme } from '../context/ThemeContext';
import { REPEAT_SENTENCE_QUESTIONS } from '../constants/repeatSentenceData';
import { FILL_BLANKS_QUESTIONS } from '../constants/fillBlanksData';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import CustomLoader from './CustomLoader';

interface SprintQuestion {
  type: string;
  id: string;
  text?: string;
  audioUrl?: string;
  correctAnswers?: string[];
  segments?: string[];
  options?: string[];
}

interface Sprint {
  id: string;
  hostId: string;
  hostName: string;
  questions?: SprintQuestion[];
  currentRound?: number;
  participantCount?: number;
  status: 'lobby' | 'armed' | 'running' | 'finished';
  startAt?: number;
  roundStartAt?: number;
  createdAt?: number;
  duration?: number;
  ssid: string;
  sessionType?: 'group' | 'individual';
}

interface ParticipantResult {
  userId: string;
  userName: string;
  score: number;
  timeTaken: number;
  completedRounds?: number;
  submittedAt?: number;
}

export const LiveSprint = () => {
  const { colors, isDark } = useTheme();
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [joinedSprintId, setJoinedSprintId] = useState<string | null>(null);
  const [networkGroupSprint, setNetworkGroupSprint] = useState<Sprint | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [ssid, setSsid] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [showHostOptions, setShowHostOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [sprintParticipants, setSprintParticipants] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [preStartCountdown, setPreStartCountdown] = useState(0);
  const [submittedRound, setSubmittedRound] = useState(-1);
  const [myTotalScore, setMyTotalScore] = useState(0);
  const [myTotalTime, setMyTotalTime] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<SprintQuestion | null>(null);
  const [selectedSprintAnswers, setSelectedSprintAnswers] = useState<string[]>([]);
  const currentSound = useRef<Audio.Sound | null>(null);
  
  const [clockOffset, setClockOffset] = useState(0);
  const getNow = () => Date.now() + clockOffset;
  
  const [shuffleTick, setShuffleTick] = useState(0);

  // Sync with API/Server time on mount to eliminate local clock drift
  useEffect(() => {
    let active = true;
    const syncTime = async () => {
      try {
        const t0 = Date.now();
        const res = await fetch('/api/health');
        if (!res.ok) return;
        const data = await res.json();
        const t1 = Date.now();
        if (data && typeof data.epoch === 'number' && active) {
          const latency = (t1 - t0) / 2;
          const offset = (data.epoch + latency) - t1;
          setClockOffset(offset);
          console.log(`[SYNC_TIME] Offset: ${offset}ms calculated.`);
        }
      } catch (err) {
        console.warn("[SYNC_TIME] Failed to sync server clock:", err);
      }
    };
    syncTime();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setShuffleTick(0);
    let interval: NodeJS.Timeout;
    if (activeSprint?.status === 'running' && currentQuestion?.type === 'repeat-sentence') {
      interval = setInterval(() => {
        setShuffleTick(t => t + 1);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSprint?.status, currentQuestion?.type, currentQuestion?.id]);

  const repeatSentenceOptions = useMemo(() => {
    // Shuffles every 3 seconds based on shuffleTick
    if (!currentQuestion?.text) return [];
    const text = currentQuestion.text;
    return [
       text,
       text + ' and more.',
       'Small variation of ' + text,
       'The speaker mentioned nothing.'
    ].sort(() => Math.random() - 0.5);
  }, [currentQuestion?.id, currentQuestion?.text, shuffleTick]);

  const stopAllAudio = async () => {
    try {
      if (currentSound.current) {
        await currentSound.current.stopAsync();
        await currentSound.current.unloadAsync();
        currentSound.current = null;
      }
      Speech.stop();
    } catch (e) {
      console.warn("[LiveSprint] Error stopping audio:", e);
    }
  };

  useEffect(() => {
    if (showGame && currentQuestion && activeSprint?.status === 'running' && preStartCountdown <= 0) {
      const playAudio = async () => {
        try {
          await stopAllAudio();
          if (currentQuestion.audioUrl) {
            const { sound } = await Audio.Sound.createAsync({ uri: currentQuestion.audioUrl });
            currentSound.current = sound;
            await sound.playAsync();
          } else if (currentQuestion.text) {
            Speech.speak(currentQuestion.text, { language: 'en-GB', pitch: 1.0, rate: 0.9 });
          }
        } catch (e) {
            console.error("Failed to autoplay audio", e);
        }
      };
      const timer = setTimeout(playAudio, 300);
      return () => {
        clearTimeout(timer);
        stopAllAudio();
      };
    } else {
      stopAllAudio();
    }
  }, [showGame, currentQuestion?.id, activeSprint?.status, preStartCountdown]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSprintId = useRef<string | null>(null);
  const [currentUid, setCurrentUid] = useState<string | null>(auth.currentUser?.uid || null);

  useEffect(() => {
     const unsubscribeAuth = auth.onAuthStateChanged((user: any) => {
         setCurrentUid(user?.uid || null);
     });
     return () => unsubscribeAuth();
  }, []);

  const currentRound = activeSprint?.currentRound || 0;
  const hasSubmitted = submittedRound === currentRound;
  const isJoined = sprintParticipants.some(p => p.userId === currentUid) || activeSprint?.hostId === currentUid;

  useEffect(() => {
     if (activeSprint?.id !== lastSprintId.current) {
        setMyTotalScore(0);
        setMyTotalTime(0);
        setSubmittedRound(-1);
        lastSprintId.current = activeSprint?.id || null;
     }
  }, [activeSprint?.id]);

  useEffect(() => {
      if (activeSprint?.status === 'running' && isJoined) {
          if (!showGame) setShowGame(true);
      }
  }, [activeSprint?.status, isJoined]);

  // Set current question immediately from full payload (Fixes A2 white rectangle)
  useEffect(() => {
    if (activeSprint?.questions && activeSprint.questions.length > 0) {
        const qData = activeSprint.questions[activeSprint.currentRound || 0];
        if (qData) {
           setCurrentQuestion(qData);
        } else {
           setCurrentQuestion(null);
        }
    } else {
        setCurrentQuestion(null);
    }
  }, [activeSprint?.questions, activeSprint?.currentRound]);

  useEffect(() => {
      setSelectedSprintAnswers([]);
  }, [activeSprint?.currentRound]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const currentSsid = await networkService.getCurrentSSID();
    setSsid(currentSsid);

    const localGroupId = await import('../services/scoreService').then(m => m.scoreService.getGroupId());
    setGroupId(localGroupId);
    
    const localName = await import('../services/scoreService').then(m => m.scoreService.getUserName());
    setUserName(auth.currentUser?.displayName || localName || 'Student');

    try {
      const storedId = await AsyncStorage.getItem('pte_flow_active_sprint_id');
      if (storedId) {
        setJoinedSprintId(storedId);
      }
    } catch (e) {
      console.warn("Could not read stored sprint ID:", e);
    }
  };

  // Real-time Group and SSID-based lobby subscription
  useEffect(() => {
    let unsubGroup: (() => void) | null = null;
    let unsubSsid: (() => void) | null = null;

    const setupListeners = async () => {
      const localGroupId = await import('../services/scoreService').then(m => m.scoreService.getGroupId());
      setGroupId(localGroupId);

      // 1. Group-based lobby subscription
      if (localGroupId) {
        const sprintDocId = `sprint_group_${localGroupId}`;
        unsubGroup = onSnapshot(doc(db, 'sprints', sprintDocId), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as Sprint;
            if (['lobby', 'armed', 'running', 'finished'].includes(data.status)) {
              // Ignore stale sessions over 30 minutes old
              const isStale = data.createdAt && (getNow() - data.createdAt > 30 * 60 * 1000);
              if (!isStale) {
                setNetworkGroupSprint({ ...data, id: docSnap.id });
                return; // Group lobby is active, prefer it
              }
            }
          }
          // If group lobby is not active/exists, we fallback or set null
          setNetworkGroupSprint(null);
        });
      }

      // 2. Hardware/SSID fallback lobby subscription
      if (ssid) {
        const safeSsidId = ssid.replace(/[^a-zA-Z0-9]/g, '_');
        const sprintDocId = `sprint_${safeSsidId}`;
        unsubSsid = onSnapshot(doc(db, 'sprints', sprintDocId), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as Sprint;
            if (['lobby', 'armed', 'running', 'finished'].includes(data.status)) {
              const isStale = data.createdAt && (getNow() - data.createdAt > 30 * 60 * 1000);
              if (!isStale) {
                // Set only if group lobby hasn't set an active one, or if they match
                setNetworkGroupSprint(prev => {
                  if (prev && prev.id.startsWith('sprint_group_')) {
                    return prev; // keep the group one
                  }
                  return { ...data, id: docSnap.id };
                });
                return;
              }
            }
          }
          // If SSID lobby doesn't exist/empty, clear it if we weren't using group lobby
          setNetworkGroupSprint(prev => {
            if (prev && prev.id.startsWith('sprint_group_')) {
              return prev;
            }
            return null;
          });
        });
      }
    };

    setupListeners();

    return () => {
      if (unsubGroup) unsubGroup();
      if (unsubSsid) unsubSsid();
    };
  }, [ssid, clockOffset]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupSprintSubscription = async () => {
      if (joinedSprintId) {
        try {
          await AsyncStorage.setItem('pte_flow_active_sprint_id', joinedSprintId);
        } catch (e) {
          console.error(e);
        }
        
        unsubscribe = onSnapshot(doc(db, 'sprints', joinedSprintId), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as Sprint;
            if (['lobby', 'armed', 'running', 'finished'].includes(data.status)) {
                setActiveSprint({ ...data, id: docSnap.id });
                
                if (data.status === 'running' && data.roundStartAt) {
                    const now = getNow();
                    const globalElapsed = (now - data.roundStartAt) / 1000;
                    
                    if (globalElapsed < 0) {
                        setPreStartCountdown(Math.min(3, Math.ceil(Math.abs(globalElapsed))));
                        setTimeLeft(0);
                    } else {
                        setPreStartCountdown(0);
                        const remaining = Math.max(0, (data.duration || 30) - globalElapsed);
                        setTimeLeft(Math.floor(remaining));
                    }
                } else {
                    setPreStartCountdown(0);
                    setTimeLeft(0);
                }
            } else {
                setActiveSprint(null);
                setJoinedSprintId(null);
                setShowGame(false);
            }
          } else {
            setActiveSprint(null);
            setJoinedSprintId(null);
            setShowGame(false);
          }
        });
      } else {
        try {
          await AsyncStorage.removeItem('pte_flow_active_sprint_id');
        } catch (e) {
          console.error(e);
        }
        setActiveSprint(null);
        setShowGame(false);
      }
    };
    
    setupSprintSubscription();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [joinedSprintId, clockOffset]);

  useEffect(() => {
    if (activeSprint?.id && (activeSprint.status === 'lobby' || activeSprint.status === 'armed')) {
       const q = query(collection(db, `sprints/${activeSprint.id}/participants`));
       const unsubscribe = onSnapshot(q, snap => {
           setSprintParticipants(snap.docs.map(d => d.data()));
       });
       return () => unsubscribe();
    }
  }, [activeSprint?.id, activeSprint?.status]);

  useEffect(() => {
    if (activeSprint?.id) {
      const q = query(collection(db, `sprints/${activeSprint.id}/results`), orderBy('score', 'desc'), orderBy('timeTaken', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const res = snapshot.docs.map(d => d.data() as ParticipantResult);
        setResults(res);
      });
      return () => unsubscribe();
    } else {
      setResults([]);
    }
  }, [activeSprint?.id]);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;
    if (activeSprint?.status === 'running' && showGame) {
      checkInterval = setInterval(() => {
        const now = getNow();
        const roundStart = activeSprint.roundStartAt || now;
        const globalElapsed = (now - roundStart) / 1000;

        if (globalElapsed < 0) {
            setPreStartCountdown(Math.min(3, Math.ceil(Math.abs(globalElapsed))));
            setTimeLeft(0);
        } else {
            setPreStartCountdown(0);
            const remaining = Math.floor(Math.max(0, (activeSprint.duration || 30) - globalElapsed));
            setTimeLeft(remaining);
            
            if (remaining <= 0 && !hasSubmitted) {
                handleAutoSubmit();
            }
        }
        
        // Host transition logic check
        const isHostOrAdmin = activeSprint?.hostId === currentUid || auth.currentUser?.email === 'projectgazzy@gmail.com';
        if (isHostOrAdmin) {
            const isIndividual = activeSprint?.sessionType === 'individual';
            const isTimeUp = globalElapsed >= (activeSprint.duration || 30);
            let allAnswered = false;
            
            if (isIndividual) {
                if (hasSubmitted) {
                    allAnswered = true;
                }
            } else {
                const expectedParticipants = activeSprint.participantCount || 1;
                if (expectedParticipants > 0) {
                   const validResults = results.filter(r => (r.submittedAt || 0) > (activeSprint.createdAt || 0));
                   const answeredCount = validResults.filter(r => (r.completedRounds || 0) > (activeSprint.currentRound || 0)).length;
                   if (answeredCount >= expectedParticipants) {
                       allAnswered = true;
                   }
                }
            }

            const shouldTransition = isIndividual ? (isTimeUp || allAnswered) : allAnswered;

            if (globalElapsed >= 0 && shouldTransition) {
                const nextRound = (activeSprint.currentRound || 0) + 1;
                const numTotalQuestions = activeSprint.questions?.length || 1;
                if (nextRound >= numTotalQuestions) {
                    setDoc(doc(db, 'sprints', activeSprint.id), { status: 'finished' }, { merge: true });
                } else {
                    const updates: any = { 
                      currentRound: nextRound, 
                      roundStartAt: getNow() + 4000
                    };
                    setDoc(doc(db, 'sprints', activeSprint.id), updates, { merge: true });
                }
            }
        }
        
      }, 1000);
    }
    return () => { if (checkInterval) clearInterval(checkInterval); };
  }, [activeSprint, showGame, currentUid, results, hasSubmitted, clockOffset]);

  const handleAutoSubmit = () => {
    if (!hasSubmitted && activeSprint) {
        if (activeSprint?.questions?.[currentRound]?.type === 'fill-blanks' && currentQuestion) {
            let correctCount = 0;
            selectedSprintAnswers.forEach((ans, idx) => {
                if (ans === currentQuestion.correctAnswers?.[idx]) correctCount++;
            });
            const totalBlanks = currentQuestion.correctAnswers?.length || 1;
            const finalScore = Math.round((correctCount / totalBlanks) * 100);
            submitResult(finalScore, 30, currentRound);
        } else {
            submitResult(0, 30, currentRound);
        }
    }
  };

  const startSprint = async (type: 'group' | 'individual') => {
    setShowHostOptions(false);
    if (!ssid && type === 'group') {
      Alert.alert("Network Error", "You must be connected to Wi-Fi to host a live group session.");
      return;
    }
    setLoading(true);
    setSubmittedRound(-1);
    setMyTotalScore(0);
    setMyTotalTime(0);
    setSelectedSprintAnswers([]);
    
    try {
      await ensureAuth();
      const selectedQuestions: SprintQuestion[] = [];
      for(let i = 0; i < 5; i++) {
         const isRS = Math.random() > 0.5;
         const pool = isRS ? REPEAT_SENTENCE_QUESTIONS : FILL_BLANKS_QUESTIONS;
         const question = pool[Math.floor(Math.random() * pool.length)] as any;
         
         const qData: any = { 
           type: isRS ? 'repeat-sentence' : 'fill-blanks', 
           id: String(question.id)
         };
         if (question.text !== undefined) qData.text = question.text;
         if (question.audioUrl !== undefined) qData.audioUrl = question.audioUrl;
         if (question.correctAnswers !== undefined) qData.correctAnswers = question.correctAnswers;
         if (question.segments !== undefined) qData.segments = question.segments;
         if (question.options !== undefined) qData.options = question.options;
         
         selectedQuestions.push(qData);
      }
      
      let safeSsidId = ssid ? ssid.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown';
      if (type === 'individual') {
         safeSsidId = `ind_${auth.currentUser?.uid || 'anon'}_${Date.now()}`;
      } else if (type === 'group') {
         const myGroupId = await import('../services/scoreService').then(m => m.scoreService.getGroupId());
         if (myGroupId) {
            safeSsidId = `group_${myGroupId}`;
         }
      }
      const sprintId = `sprint_${safeSsidId}`;
      
      const pQ = query(collection(db, `sprints/${sprintId}/participants`));
      const pSnap = await getDocs(pQ);
      await Promise.all(pSnap.docs.map(d => deleteDoc(d.ref)));

      const rQ = query(collection(db, `sprints/${sprintId}/results`));
      const rSnap = await getDocs(rQ);
      await Promise.all(rSnap.docs.map(d => deleteDoc(d.ref)));

      const isIndividual = type === 'individual';
      
      if (type === 'group') {
        const myGroupId = await import('../services/scoreService').then(m => m.scoreService.getGroupId());
        if (!myGroupId) {
          setLoading(false);
          Alert.alert("Leaderboard Sprint", "There needs to be at least 2 members in the Global Leaderboard to start this Sprint.");
          return;
        }
        const q = query(collection(db, 'leaderboard'), where('groupId', '==', myGroupId));
        const snap = await getDocs(q);
        if (snap.size < 2) {
          setLoading(false);
          Alert.alert("Leaderboard Sprint", "There needs to be at least 2 members in the Global Leaderboard to start this Sprint.");
          return;
        }
      }

      const sprintData: any = {
        hostId: auth.currentUser?.uid || 'anonymous',
        hostName: userName || 'Sprint',
        questions: selectedQuestions,
        currentRound: 0,
        participantCount: isIndividual ? 1 : 0,
        status: isIndividual ? 'running' : 'lobby',
        createdAt: getNow(),
        duration: 30,
        ssid: ssid || 'Unknown',
        sessionType: type
      };
      if (isIndividual) {
        sprintData.roundStartAt = getNow() + 4000;
      }

      await setDoc(doc(db, 'sprints', sprintId), sprintData);
      setLoading(false);
      setJoinedSprintId(sprintId);
      if (isIndividual) {
         setShowGame(true);
      }
    } catch (e: any) {
      console.error("Sprint Creation Error:", e);
      Alert.alert("Execution Error", e?.message || "Could not start sprint. Check logs.");
      setLoading(false);
    }
  };

  const joinSprint = async () => {
    if (!networkGroupSprint || networkGroupSprint.status !== 'lobby') {
       Alert.alert("Locked", "Sprint is locked or has already started.");
       return;
    }
    try {
        await setDoc(doc(db, `sprints/${networkGroupSprint.id}/participants`, currentUid || `anon_${getNow()}`), {
            userId: currentUid || 'anon',
            userName: userName || 'Student',
            isReady: true,
            joinedAt: getNow()
        });
        setJoinedSprintId(networkGroupSprint.id);
    } catch (e) {
        console.error(e);
        Alert.alert("Error", "Could not join group.");
    }
  };

  const leaveSprint = async () => {
    if (!activeSprint) return;
    const isHost = activeSprint.hostId === currentUid;
    if (isHost) {
      clearSprint();
    } else {
      try {
        await deleteDoc(doc(db, `sprints/${activeSprint.id}/participants`, currentUid || 'anon'));
      } catch (e) {
        console.error(e);
      }
      setJoinedSprintId(null);
      setActiveSprint(null);
      setShowGame(false);
    }
  };

  const submitResult = async (roundScore: number, roundTimeSpent: number, forRound: number) => {
    if (!activeSprint || submittedRound === forRound) return;
    setSubmittedRound(forRound);
    
    const newScore = myTotalScore + roundScore;
    const newTime = myTotalTime + roundTimeSpent;
    setMyTotalScore(newScore);
    setMyTotalTime(newTime);
    
    try {
      await setDoc(doc(db, `sprints/${activeSprint.id}/results`, auth.currentUser?.uid || 'anon'), {
        userId: auth.currentUser?.uid || 'anon',
        userName: userName || 'Student',
        score: newScore,
        timeTaken: newTime,
        completedRounds: currentRound + 1,
        submittedAt: getNow()
      }, { merge: true });
    } catch (e) {
      console.log(e);
    }
  };

  const clearSprint = async () => {
      if (!activeSprint) return;
      const isHostOrAdmin = activeSprint.hostId === currentUid || auth.currentUser?.email === 'projectgazzy@gmail.com';
      if (!isHostOrAdmin) {
          setActiveSprint(null);
          setJoinedSprintId(null);
          return;
      }
      
      Alert.alert("Clear Table", "Are you sure you want to clear the board and delete this sprint session?", [
          { text: "Cancel", style: "cancel" },
          { text: "Clear", style: "destructive", onPress: async () => {
              try {
                  const q = query(collection(db, `sprints/${activeSprint.id}/results`));
                  const snapshot = await getDocs(q);
                  await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
                  await deleteDoc(doc(db, 'sprints', activeSprint.id));
                  setActiveSprint(null);
                  setJoinedSprintId(null);
                  setShowGame(false);
              } catch (e) {
                  console.error(e);
                  setActiveSprint(null);
                  setJoinedSprintId(null);
                  setShowGame(false);
              }
          }}
      ]);
  };

  const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: isDark ? colors.border + '20' : '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginVertical: 10 },
    title: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    desc: { fontSize: 14, color: colors.subtext, marginBottom: 16 },
    hostBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, padding: 12, borderRadius: 12, gap: 8 },
    hostBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    activeSprintBox: { backgroundColor: colors.primary + '10', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.primary + '30' },
    hostLabel: { fontSize: 12, color: colors.primary, fontWeight: 'bold', marginBottom: 4 },
    hostName: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    gameCard: { width: '95%', maxHeight: '90%', backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20 },
    timerBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: preStartCountdown > 0 ? '#F59E0B' : colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    timerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    questionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 12 },
    questionDesc: { fontSize: 16, color: colors.subtext, textAlign: 'center', marginBottom: 30 },
    optionBtn: { width: '100%', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12, backgroundColor: colors.background },
    optionText: { fontSize: 16, color: colors.text, textAlign: 'center' },
    leaderboardOverlay: { width: '100%', marginTop: 20 },
    lbRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
    lbName: { color: colors.text, fontWeight: '600' },
    lbScore: { color: colors.primary, fontWeight: 'bold' }
  });

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <MaterialCommunityIcons name="lightning-bolt" size={24} color="#F59E0B" />
        <Text style={styles.title}>Live Classroom Sprint</Text>
      </View>
      
      {!joinedSprintId ? (
        <View style={{ gap: 16 }}>
           <Text style={styles.desc}>Complete a high-speed live or practice sprint competition.</Text>
           
           {/* Active Live Group Sprint Matchmaker Notification */}
           {networkGroupSprint && networkGroupSprint.status === 'lobby' && networkGroupSprint.hostId !== currentUid && (
             <View style={{
               backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
               borderWidth: 2,
               borderColor: '#F59E0B',
               borderRadius: 16,
               padding: 16,
               gap: 12,
               shadowColor: '#F59E0B',
               shadowOffset: { width: 0, height: 4 },
               shadowOpacity: 0.15,
               shadowRadius: 8,
               elevation: 4
             }}>
               <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                   <MaterialCommunityIcons name="lightning-bolt" size={24} color="#F59E0B" />
                   <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>Active Group Sprint Found!</Text>
                 </View>
                 <View style={{ backgroundColor: '#F59E0B20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                   <Text style={{ fontSize: 11, color: '#F59E0B', fontWeight: 'bold' }}>JOIN NOW</Text>
                 </View>
               </View>

               <Text style={{ fontSize: 13, color: colors.subtext }}>
                 Host <Text style={{ fontWeight: 'bold', color: colors.text }}>{networkGroupSprint.hostName}</Text> has started a Group Sprint. Join the lobby to compete!
               </Text>

               <TouchableOpacity 
                 style={[styles.hostBtn, { backgroundColor: '#F59E0B', height: 46 }]} 
                 onPress={joinSprint} 
                 disabled={loading}
               >
                 <MaterialCommunityIcons name="login-variant" size={20} color="#fff" />
                 <Text style={styles.hostBtnText}>Join Group Sprint</Text>
               </TouchableOpacity>
             </View>
           )}
           
           {/* Mode 1: Group Sprint */}
<View style={{
  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 16,
  gap: 12
}}>
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <MaterialCommunityIcons name="account-group" size={24} color="#059669" />
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>Group Sprint</Text>
    </View>
    <View style={{ backgroundColor: '#05966920', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
      <Text style={{ fontSize: 11, color: '#059669', fontWeight: 'bold' }}>Multiplayer</Text>
    </View>
  </View>

  <Text style={{ fontSize: 13, color: colors.subtext }}>
    Host a live group sprint for your classroom or training session.
  </Text>

  <TouchableOpacity 
    style={[styles.hostBtn, { backgroundColor: '#059669', height: 46 }]} 
    onPress={() => startSprint('group')} 
    disabled={loading}
  >
    <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
    <Text style={styles.hostBtnText}>Host Group Sprint</Text>
  </TouchableOpacity>
</View>


           {/* Mode 2: Individual Sprint */}
           <View style={{
             backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
             borderRadius: 16,
             borderWidth: 1,
             borderColor: colors.border,
             padding: 16,
             gap: 12
           }}>
             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                 <MaterialCommunityIcons name="account" size={24} color="#3B82F6" />
                 <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>Individual Sprint</Text>
               </View>
               <View style={{ backgroundColor: '#3B82F620', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                 <Text style={{ fontSize: 11, color: '#3B82F6', fontWeight: 'bold' }}>Solo</Text>
               </View>
             </View>
             
             <Text style={{ fontSize: 13, color: colors.subtext }}>
               Practice at your own pace. Start a personal, high-speed practice round.
             </Text>

             <TouchableOpacity 
               style={[styles.hostBtn, { backgroundColor: '#3B82F6', height: 46 }]} 
               onPress={() => startSprint('individual')} 
               disabled={loading}
             >
               <MaterialCommunityIcons name="play-circle" size={20} color="#fff" />
               <Text style={styles.hostBtnText}>Start Individual Sprint</Text>
             </TouchableOpacity>
           </View>
        </View>
      ) : activeSprint && (
        <View style={styles.activeSprintBox}>
          <Text style={[styles.hostLabel, (activeSprint.status === 'finished') && { color: '#EF4444' }]}>
            {activeSprint.status === 'finished' ? 'SPRINT FINISHED' : 'SESSION ACTIVE'}
          </Text>
          <Text style={styles.hostName}>{activeSprint.hostName}'s Sprint</Text>
          <Text style={{ fontSize: 12, color: colors.subtext, marginTop: 4 }}>
              Round {currentRound + 1} of {activeSprint?.questions?.length || 5}
          </Text>
          
          {(activeSprint.hostId === currentUid || auth.currentUser?.email === 'projectgazzy@gmail.com') ? (
              <View style={{ gap: 8, marginTop: 12 }}>
                {activeSprint.status === 'lobby' && (
                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ color: colors.text, fontWeight: 'bold' }}>Participants Ready: {sprintParticipants.length}</Text>
                      <TouchableOpacity style={[styles.hostBtn, { backgroundColor: '#F59E0B', marginTop: 10 }]} onPress={() => {
                          setDoc(doc(db, 'sprints', activeSprint.id), { status: 'armed' }, { merge: true });
                      }}>
                          <Text style={styles.hostBtnText}>Arm Quiz (Lock Group)</Text>
                      </TouchableOpacity>
                    </View>
                )}
                {activeSprint.status === 'armed' && (
                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ color: colors.text, fontWeight: 'bold' }}>Group Locked. {sprintParticipants.length} Connected.</Text>
                      <TouchableOpacity style={[styles.hostBtn, { backgroundColor: '#059669', marginTop: 10 }]} onPress={() => {
                          setDoc(doc(db, 'sprints', activeSprint.id), { 
                              status: 'running', 
                              roundStartAt: getNow() + 4000,
                              currentRound: 0,
                              participantCount: sprintParticipants.length + 1 // including host
                          }, { merge: true });
                          setShowGame(true);
                      }}>
                          <Text style={styles.hostBtnText}>Start Quiz Now</Text>
                      </TouchableOpacity>
                    </View>
                )}
                {activeSprint.status !== 'finished' && (
                    <TouchableOpacity style={[styles.hostBtn, { backgroundColor: '#EF4444' }]} onPress={leaveSprint}>
                        <Text style={styles.hostBtnText}>Cancel Session</Text>
                    </TouchableOpacity>
                )}
                {(activeSprint.status === 'running') && !showGame && (
                    <TouchableOpacity style={[styles.hostBtn, { backgroundColor: colors.primary }]} onPress={() => setShowGame(true)}>
                        <Text style={styles.hostBtnText}>Return to Game</Text>
                    </TouchableOpacity>
                )}
              </View>
          ) : (
              <View style={{ gap: 8, marginTop: 12 }}>
                {activeSprint.status === 'lobby' && isJoined && (
                    <View style={{ padding: 12, alignItems: 'center' }}>
                        <Text style={{fontWeight: 'bold', color: '#059669'}}>You are Ready! Waiting for host...</Text>
                    </View>
                )}
                {activeSprint.status === 'armed' && isJoined && (
                    <View style={{ padding: 12, alignItems: 'center' }}>
                        <Text style={{fontWeight: 'bold', color: '#F59E0B', textAlign: 'center'}}>Group Locked. Get ready to start!</Text>
                    </View>
                )}
                {activeSprint.status === 'armed' && !isJoined && (
                    <View style={{ padding: 12, alignItems: 'center' }}>
                        <Text style={{fontWeight: 'bold', color: '#EF4444', textAlign: 'center'}}>Sprint Locked. You missed this round.</Text>
                    </View>
                )}
                {activeSprint.status === 'running' && isJoined && !showGame && (
                  <TouchableOpacity style={[styles.hostBtn, { backgroundColor: '#059669' }]} onPress={() => setShowGame(true)}>
                      <Text style={styles.hostBtnText}>{hasSubmitted ? 'View Standings' : 'Rejoin Quiz'}</Text>
                  </TouchableOpacity>
                )}
                {activeSprint.status !== 'finished' && (
                  <TouchableOpacity style={[styles.hostBtn, { backgroundColor: '#64748B' }]} onPress={leaveSprint}>
                      <Text style={styles.hostBtnText}>Leave Session</Text>
                  </TouchableOpacity>
                )}
              </View>
          )}
          
          {results.length > 0 && (
             <View style={styles.leaderboardOverlay}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.subtext, marginBottom: 8 }}>LIVE STANDINGS</Text>
                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled={true}>
                    {results.map((res, i) => (
                        <View key={i} style={styles.lbRow}>
                            <Text style={styles.lbName}>{i+1}. {res.userName}</Text>
                            <Text style={styles.lbScore}>{res.timeTaken}s</Text>
                        </View>
                    ))}
                </ScrollView>
             </View>
          )}

          {activeSprint?.status === 'finished' && (
              <TouchableOpacity style={{ marginTop: 15, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' }} onPress={clearSprint}>
                  <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Dismiss / Clear Table</Text>
              </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={showHostOptions} transparent animationType="slide">
        <View style={styles.modalBg}>
           <View style={[styles.gameCard, { padding: 30 }]}>
              <Text style={styles.questionTitle}>Select Sprint Type</Text>
              
              <TouchableOpacity style={[styles.hostBtn, { width: '100%', marginBottom: 15, backgroundColor: '#059669' }]} onPress={() => startSprint('group')}>
                 <MaterialCommunityIcons name="group" size={24} color="#fff" />
                 <Text style={styles.hostBtnText}>Host a Group Session</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.hostBtn, { width: '100%', marginBottom: 15, backgroundColor: '#3B82F6' }]} onPress={() => startSprint('individual')}>
                 <MaterialCommunityIcons name="account" size={24} color="#fff" />
                 <Text style={styles.hostBtnText}>Host an Individual Session</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.hostBtn, { width: '100%', backgroundColor: colors.border }]} onPress={() => setShowHostOptions(false)}>
                 <Text style={[styles.hostBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
           </View>
        </View>
      </Modal>

      <Modal visible={showGame && !!activeSprint && isJoined} transparent animationType="slide">
          <View style={styles.modalBg}>
              <View style={styles.gameCard}>
                  <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }} showsVerticalScrollIndicator={true}>
                  
                  <View style={styles.timerBox}>
                      <Text style={styles.timerText}>{preStartCountdown > 0 ? preStartCountdown : timeLeft}</Text>
                  </View>
                  
                  {preStartCountdown > 0 ? (
                      <View style={{ padding: 40, alignItems: 'center' }}>
                         <Text style={[styles.questionTitle, { color: '#F59E0B' }]}>Get Ready!</Text>
                         <Text style={styles.questionDesc}>Starting automatically across all devices...</Text>
                      </View>
                  ) : !currentQuestion && !hasSubmitted ? (
                      <View style={{ padding: 40, alignItems: 'center' }}>
                         <CustomLoader size={40} message="Loading Shared Content..." />
                      </View>
                  ) : hasSubmitted ? (
                      <View style={{ width: '100%', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="check-circle" size={60} color="#10B981" />
                        <Text style={[styles.questionTitle, { color: '#10B981', marginTop: 10 }]}>Answer Submitted!</Text>
                        {activeSprint?.status === 'running' ? (
                            <Text style={styles.questionDesc}>Waiting for others... The next round will begin automatically.</Text>
                        ) : (
                            <Text style={styles.questionDesc}>Sprint finished! See final standings below.</Text>
                        )}
                        <View style={{ width: '100%', maxHeight: 200 }}>
                             <ScrollView nestedScrollEnabled={true}>
                                {results.map((res, i) => (
                                    <View key={i} style={styles.lbRow}>
                                        <Text style={styles.lbName}>{i+1}. {res.userName}</Text>
                                        <Text style={styles.lbScore}>{res.score} pts</Text>
                                    </View>
                                ))}
                             </ScrollView>
                        </View>
                        {activeSprint?.status === 'finished' && (
                            <TouchableOpacity style={[styles.hostBtn, { marginTop: 20, width: '100%' }]} onPress={() => setShowGame(false)}>
                                <Text style={styles.hostBtnText}>View Board</Text>
                            </TouchableOpacity>
                        )}
                      </View>
                  ) : (
                      <View style={{ width: '100%', alignItems: 'center' }}>
                        <Text style={styles.questionTitle}>
                            {`Round ${currentRound + 1} of ${activeSprint?.questions?.length || 5}:\n`}
                            {currentQuestion?.type === 'repeat-sentence' ? 'Repeat the Sentence' : 'Fill in the Blank'}
                        </Text>
                        
                        {currentQuestion?.type === 'fill-blanks' && (
                             <View style={{ marginBottom: 20, width: '100%' }}>
                                <Text style={[styles.questionDesc, { fontSize: 17, color: colors.text, textAlign: 'left', lineHeight: 26 }]}>
                                    {currentQuestion?.segments?.map((seg: string, i: number) => (
                                        <React.Fragment key={i}>
                                            <Text>{seg}</Text>
                                            {i < currentQuestion.segments!.length - 1 && (
                                                <Text style={{
                                                    backgroundColor: i === selectedSprintAnswers.length ? colors.primary + '20' : colors.border + '40',
                                                    color: selectedSprintAnswers[i] ? colors.primary : colors.subtext,
                                                    fontWeight: 'bold',
                                                    fontSize: 16
                                                }}>
                                                    {selectedSprintAnswers[i] ? ` ${selectedSprintAnswers[i]} ` : ` [ ${i + 1} ] `}
                                                </Text>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </Text>
                             </View>
                        )}
                        
                        {currentQuestion?.type === 'repeat-sentence' && (
                            <View style={{ marginBottom: 20, alignItems: 'center' }}>
                                <TouchableOpacity 
                                    style={{ padding: 15, backgroundColor: colors.primary + '20', borderRadius: 50 }}
                                    onPress={async () => {
                                        if (currentQuestion?.audioUrl) {
                                            const { sound } = await Audio.Sound.createAsync({ uri: currentQuestion.audioUrl });
                                            await sound.playAsync();
                                        } else if (currentQuestion?.text) {
                                            Speech.speak(currentQuestion.text, { language: 'en-GB', pitch: 1.0, rate: 0.9 });
                                        }
                                    }}
                                >
                                    <MaterialCommunityIcons name="play" size={32} color={colors.primary} />
                                </TouchableOpacity>
                                <Text style={{ fontSize: 12, color: colors.subtext, marginTop: 8 }}>Tap to Play Audio</Text>
                            </View>
                        )}

                        <Text style={[styles.questionDesc, { marginBottom: 15, textAlign: 'center' }]}>
                            {currentQuestion?.type === 'fill-blanks' ? `Select word for blank ${selectedSprintAnswers.length + 1}:` : 'Identify the correct version/word:'}
                        </Text>
                        
                        {currentQuestion?.type === 'fill-blanks' ? (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                                {(currentQuestion?.options || []).map((opt: string, idx: number) => {
                                    const isUsed = selectedSprintAnswers.includes(opt);
                                    return (
                                        <TouchableOpacity 
                                            key={idx} 
                                            style={[styles.optionBtn, { width: '45%', marginBottom: 0 }, isUsed && { opacity: 0.5, backgroundColor: colors.border }]} 
                                            disabled={isUsed}
                                            onPress={() => {
                                                const newAnswers = [...selectedSprintAnswers, opt];
                                                setSelectedSprintAnswers(newAnswers);
                                                
                                                if (currentQuestion.correctAnswers && newAnswers.length >= currentQuestion.correctAnswers.length) {
                                                    let correctCount = 0;
                                                    newAnswers.forEach((ans, i) => {
                                                        if (ans === currentQuestion.correctAnswers![i]) correctCount++;
                                                    });
                                                    const finalScore = Math.round((correctCount / currentQuestion.correctAnswers.length) * 100);
                                                    submitResult(finalScore, 30 - timeLeft, currentRound);
                                                }
                                            }}
                                        >
                                            <Text style={[styles.optionText, isUsed && { color: colors.subtext }]}>{opt}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            repeatSentenceOptions.map((opt, idx) => (
                                <TouchableOpacity 
                                    key={idx} 
                                    style={styles.optionBtn} 
                                    onPress={() => {
                                        const isCorrect = opt === currentQuestion?.text;
                                        submitResult(isCorrect ? 100 : 0, 30 - timeLeft, currentRound);
                                    }}
                                >
                                    <Text style={styles.optionText}>{opt}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                      </View>
                  )}
                  </ScrollView>
              </View>
          </View>
      </Modal>
    </View>
  );
};
