import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PTE AI Service
 * 
 * This service uses Gemini 1.5 Flash as the primary engine for both 
 * Speech and Writing analysis, providing high-quality PTE-standard 
 * coaching and scoring.
 */

// Initialize Gemini lazily to avoid crashing on startup if the key is missing
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MISSING_API_KEY") {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

/**
 * Analyze speech for PTE tasks.
 * Uses Gemini as the primary engine for high-quality coaching and scoring.
 */
export const analyzeSpeech = async (audioUri: string, questionText: string, questionType: string, imageUri?: string) => {
  try {
    if (!audioUri) throw new Error("No audio URI provided");

    const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64', 
    });

    let base64Image = null;
    if (imageUri) {
      try {
        if (imageUri.startsWith('http')) {
          // Remote URL - download first to a temporary file
          const tempFile = `${FileSystem.cacheDirectory}temp_image_${Date.now()}.png`;
          await FileSystem.downloadAsync(imageUri, tempFile);
          base64Image = await FileSystem.readAsStringAsync(tempFile, {
            encoding: 'base64',
          });
          // Clean up the temporary file
          await FileSystem.deleteAsync(tempFile, { idempotent: true });
        } else {
          // Local URI
          base64Image = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
          });
        }
      } catch (e) {
        console.error("Error reading image for analysis:", e);
      }
    }

    const prompt = `
      Act as a strict professional PTE Academic examiner and coach. 
      Task Type: ${questionType}
      Target Sentence/Text/Topic: "${questionText}"
      ${imageUri ? "An image is provided that the user is describing." : ""}
      
      Analyze the provided audio for PTE Academic standards (0-90 scoring).
      
      CRITICAL RULE:
      If the audio is silent, contains only background noise, or no recognizable speech is present, you MUST:
      - Set overall, pronunciation, fluency, and content scores to 0.
      - Set userTranscript to "[No speech detected]".
      - Provide feedback explaining that no speech was heard.
      
      Your Task:
      1. Transcribe what the user said as accurately as possible.
      2. Provide a score (0-90) for:
         - Content (Accuracy against target text or image content)
         - Oral Fluency (Smoothness, rhythm, phrasing)
         - Pronunciation (Clarity, word stress, vowel/consonant accuracy)
      3. Provide an Overall Score (0-90).
      4. Provide "Plain English" Feedback with PTE References:
         - Summary Feedback (3-4 sentences): A warm, professional overview. Explicitly mention how the performance aligns with PTE expectations for a high score (79+).
         - Section Feedback: Detailed coaching for Pronunciation, Fluency, and Content. 
           * IMPORTANT: Each section MUST explicitly refer to the PTE Academic scoring criteria.
           * Explain exactly WHAT the user needs to do to achieve a high score (e.g., "To get a 90 in Oral Fluency, you must maintain a consistent pace without self-corrections or hesitations, as per PTE standards").
           * Use simple, actionable language for the "How to fix" part (e.g., "You stressed the second syllable of 'Photograph', try PHO-to-graph").
      9. Word-Level Analysis (The Heatmap):
         - Provide an array called "wordAnalysis" mapping EVERY word from the Target Text to how the user pronounced it. 
         - For each word, provide:
           * "word": The CORRECT dictionary spelling of the target word from the text. NEVER use phonetic or misspelled versions (e.g., write "species", never "spakies"). If the user added an extra word not in the text, spell it correctly in standard English.
           * "health": "good" (pronounced correctly), "bad" (mispronounced, garbled, or skipped).
           * "label": optional explanation if bad (e.g., "Omitted", "Mispronounced as 'spakies'").
      
      Return the result as a JSON object with:
      - userTranscript (string)
      - pronunciation (number)
      - fluency (number)
      - content (number)
      - overall (number)
      - feedback (string, summary)
      - sectionFeedback (object with keys: pronunciation, fluency, content. Each value is a detailed coaching string)
      - breakdown (object with keys: pronunciation, fluency, content)
      - wordAnalysis (array of objects with keys: word, health ('good'|'bad'), label (optional))
    `;

    const ai = getAI();
    const contents: any[] = [
      { text: prompt },
      { inlineData: { mimeType: "audio/mp3", data: base64Audio } }
    ];

    if (base64Image) {
      contents.push({ inlineData: { mimeType: "image/jpeg", data: base64Image } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: { 
        responseMimeType: "application/json",
        maxOutputTokens: 4000,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            userTranscript: { type: Type.STRING },
            pronunciation: { type: Type.NUMBER },
            fluency: { type: Type.NUMBER },
            content: { type: Type.NUMBER },
            overall: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            sectionFeedback: {
              type: Type.OBJECT,
              properties: {
                pronunciation: { type: Type.STRING },
                fluency: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["pronunciation", "fluency", "content"]
            },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                pronunciation: { type: Type.NUMBER },
                fluency: { type: Type.NUMBER },
                content: { type: Type.NUMBER }
              },
              required: ["pronunciation", "fluency", "content"]
            },
            wordAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  health: { type: Type.STRING },
                  label: { type: Type.STRING }
                },
                required: ["word", "health"]
              }
            }
          },
          required: ["userTranscript", "pronunciation", "fluency", "content", "overall", "feedback", "sectionFeedback", "breakdown", "wordAnalysis"]
        }
      }
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const res = JSON.parse(rawText);
    return {
      ...res,
      sectionFeedback: res.sectionFeedback || null,
      breakdown: res.breakdown || {
        pronunciation: res.pronunciation || 0,
        fluency: res.fluency || 0,
        content: res.content || 0
      },
      wordAnalysis: res.wordAnalysis || []
    };
  } catch (error) {
    console.error("AI Speech Analysis Error:", error);
    throw error;
  }
};

/**
 * Analyze writing for PTE tasks.
 * Uses Gemini 1.5 Flash as the primary engine for high-quality coaching and scoring.
 */
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function pcmBase64ToWavDataUri(pcmB64: string, sampleRate = 24000): string {
    const binaryStr = atob(pcmB64);
    const pcmLength = binaryStr.length;
    
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcmLength, true);
    
    const headerBytes = new Uint8Array(buffer);
    let wavHeaderBinary = '';
    for (let i = 0; i < headerBytes.length; i++) {
        wavHeaderBinary += String.fromCharCode(headerBytes[i]);
    }
    
    return 'data:audio/wav;base64,' + btoa(wavHeaderBinary + binaryStr);
}

export const synthesizeSpeech = async (text: string): Promise<string | null> => {
    try {
        const ai = getAI();
        const storedVoice = await AsyncStorage.getItem('pte_coach_voice');
        const voiceName = storedVoice || 'Aoede';

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName } 
                    }
                }
            }
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return pcmBase64ToWavDataUri(base64Audio, 24000);
        }
        return null;
    } catch (e) {
        console.error("TTS Error:", e);
        return null;
    }
};

export const analyzeWriting = async (userSummary: string, originalTranscript: string, taskType: string) => {
  try {
    const prompt = `
      Act as a strict professional PTE Academic examiner and expert coach. 
      Task Type: ${taskType}
      Source Text/Prompt: "${originalTranscript}"
      Student Response: "${userSummary}"
      
      Your Task:
      Analyze the student's response based on the official PTE Academic scoring rubric (0-90 scale).
      
      Scoring Criteria (Strictly Adhere to PTE Standards):
      1. Content (0-90): Does the response cover all key points of the source text?
      2. Form (0-90): Does it meet word count requirements? (Summarize Written: 5-75 words, exactly 1 sentence. Essay: 200-300 words).
      3. Grammar (0-90): Correctness of sentence structure, tenses, and punctuation.
      4. Vocabulary (0-90): Range and precision of academic language used.
      5. Spelling (0-90): Consistency and accuracy.
      6. Structure (0-90): Logical flow and coherence.
      7. Linguistic Range (0-90): Complexity and variety of sentence structures.
      
      Feedback Requirements:
      - Summary Feedback (3-4 sentences): A professional overview. Explicitly state how this response compares to a PTE "High Score" (79+) target.
      - Section Feedback (Plain English Coaching):
        * For each category (Content, Structure, Form, Grammar, Vocabulary, Spelling, Linguistic), provide 2-3 sentences of coaching.
        * Use simple, actionable language.
        * ALWAYS refer back to specific PTE requirements.
        * Explain exactly WHAT to do to improve (e.g., "To improve your Vocabulary score, replace common words like 'good' with academic synonyms like 'beneficial' or 'advantageous'").
      
      Return the result as a JSON object with:
      - overall (number, 0-90)
      - feedback (string, summary)
      - sectionFeedback (object with keys: content, grammar, vocabulary, spelling, structure, form, linguisticRange. Each value is a detailed coaching string)
      - breakdown (object with keys: grammar, vocabulary, spelling, content, structure, form, linguistic)
      - modelAnswer (string): Write a top-scoring (90/90) model response for this prompt.
    `;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        maxOutputTokens: 8000,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            modelAnswer: { type: Type.STRING },
            sectionFeedback: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                grammar: { type: Type.STRING },
                vocabulary: { type: Type.STRING },
                spelling: { type: Type.STRING },
                structure: { type: Type.STRING },
                form: { type: Type.STRING },
                linguisticRange: { type: Type.STRING }
              },
              required: ["content", "grammar", "vocabulary", "spelling", "structure", "form", "linguisticRange"]
            },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                grammar: { type: Type.NUMBER },
                vocabulary: { type: Type.NUMBER },
                spelling: { type: Type.NUMBER },
                content: { type: Type.NUMBER },
                structure: { type: Type.NUMBER },
                form: { type: Type.NUMBER },
                linguistic: { type: Type.NUMBER }
              },
              required: ["grammar", "vocabulary", "spelling", "content", "structure", "form", "linguistic"]
            }
          },
          required: ["overall", "feedback", "sectionFeedback", "breakdown", "modelAnswer"]
        }
      }
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const res = JSON.parse(rawText);
    return {
      overall: res.overall || 0,
      feedback: res.feedback || "Analysis complete.",
      modelAnswer: res.modelAnswer || "",
      sectionFeedback: res.sectionFeedback,
      breakdown: res.breakdown
    };
  } catch (error) {
    console.error("AI Writing Analysis Error:", error);
    throw error;
  }
};

/**
 * Get personalized chat response for PTE-related queries.
 */
export const getPTEChatResponse = async (messages: { role: 'user' | 'model', content: string }[]) => {
  try {
    const ai = getAI();
    
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: `You are an expert PTE (Pearson Test of English) Academic Coach. 
        Your sole purpose is to help students prepare for the PTE exam. 
        You can answer questions about:
        - Exam structure and scoring
        - Tips and strategies for all modules (Speaking, Writing, Reading, Listening)
        - Practice exercises and sample questions
        - Study plans and time management
        - Test center information and booking (general info)
        
        CRITICAL RULES:
        1. If a user asks something unrelated to PTE (e.g., "What's the weather?" or "How to bake a cake?"), politely decline and redirect them back to PTE preparation.
        2. Keep your answers professional, encouraging, and focused on helping the student achieve their target score.
        3. Use clear, concise explanations.
        4. If the user asks about scoring, use the 10-90 scale standard for PTE Academic.
        5. Do not answer questions about other exams like IELTS, TOEFL, etc., except to briefly explain differences if asked specifically about PTE vs others.`
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    throw error;
  }
};
