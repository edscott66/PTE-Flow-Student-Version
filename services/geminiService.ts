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
export const analyzeSpeech = async (audioUri: string, questionText: string, questionType: string, imageUri?: string, isReadAloudTask = false) => {
  // The Read Aloud-specific scoring path will use this flag in the next step.
  void isReadAloudTask;

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

    const isDescribeImageTask = /describe\s*image/i.test(questionType);
    const isAnswerShortQuestionTask = /answer\s*short\s*question|\bASQ\b/i.test(questionType);

const prompt = isDescribeImageTask
  ? `
      Act as a strict professional PTE Academic examiner and coach.

      Task Type: Describe Image

      The student has been given an image to describe.
      Evaluate the student's spoken description against the ACTUAL IMAGE provided.
      The image title or topic is only a reference. It is NOT a script that the student
      is expected to repeat.

      Analyze the audio using PTE Academic Speaking standards (0-90 scoring).

      CRITICAL RULE:
      If the audio is silent, contains only background noise, or no recognizable
      speech is present, set all scores to 0 and userTranscript to
      "[No speech detected]". Explain that no speech was heard.

      EVALUATION:

      1. Transcribe the student's actual spoken words accurately.
      2. Content (0-90):
         - Evaluate whether the student identifies and describes the important
           information visible in the image.
         - Consider relevant features, trends, comparisons, proportions,
           relationships, and key details where applicable.
         - Reward accurate, relevant observations and clear overall coverage.
         - Do not penalize the student for using different vocabulary from the
           image title or for describing the information in their own words.
         - Do not invent information that is not visible in the image.
      3. Oral Fluency (0-90):
         - Evaluate pace, rhythm, continuity, hesitations, pauses and self-corrections.
      4. Pronunciation (0-90):
         - Evaluate clarity, intelligibility, word stress, and vowel and consonant
           accuracy.
      5. Overall Score (0-90):
         - Provide a fair overall assessment based on the three scoring areas.

      FEEDBACK:

      - Summary feedback: 3-4 sentences in clear, professional English.
      - Explain how the performance compares with the PTE high-score target (79+).
      - Provide detailed section feedback for pronunciation, fluency and content.
      - Give specific, practical advice based on what the student actually said.
      - Do not claim the student omitted or mispronounced words from the image title.
      - Do not invent errors or details that cannot be established from the audio
        and image.

      WORD-LEVEL ANALYSIS:

      Describe Image has no fixed target script. The student is free to use their
      own words and sentence structure.
      Therefore, do NOT compare the transcript with the image title or create a
      word-by-word target-text heatmap.
      Return an empty wordAnalysis array.

      Return a JSON object with:
      - userTranscript (string)
      - pronunciation (number)
      - fluency (number)
      - content (number)
      - overall (number)
      - feedback (string)
      - sectionFeedback (object with pronunciation, fluency, content)
      - breakdown (object with pronunciation, fluency, content)
      - wordAnalysis (empty array)
    `
  : isAnswerShortQuestionTask
    ? `
      Act as a fair and accurate PTE Academic Answer Short Question (ASQ) examiner.

      TASK:
      The student hears one short factual question and gives a brief spoken answer.
      Question and expected model answer:
      "${questionText}"

      IMPORTANT ASQ MARKING PRINCIPLES:

      1. Judge the meaning and factual correctness of the student's spoken answer,
         not whether it exactly matches the expected model answer.
      2. The expected answer is a recommended model answer, not the only acceptable
         wording. Award full content credit when the student's answer gives the
         correct fact or meaning, even if it uses different words or a reasonable
         alternative expression.
      3. Accept concise, natural spoken alternatives, synonyms, equivalent names,
         and other answers that are factually correct in the context of the question.
      4. Do not require the student to repeat the model answer word for word.
      5. Do not penalize spelling, capitalization, punctuation, grammar, or minor
         speech-recognition transcription errors when the intended correct answer
         is clear from the audio.
      6. Do not treat a plausible but factually incorrect answer as correct.
         Do not award content credit for an unrelated answer, a contradiction,
         or an answer that does not answer the question.
      7. If the response contains the correct answer together with unnecessary
         extra words, do not penalize it unless the extra words change or contradict
         the meaning.
      8. If only part of the answer is correct, award partial content credit only
         when the question genuinely allows a partially correct response.
      9. If the audio is silent, contains only background noise, or has no
         recognizable spoken answer, set all scores to 0 and set userTranscript
         to "[No speech detected]".

      SCORING (0-90):
      - Content: Score the factual correctness of the answer. A clearly correct
        answer or an accepted equivalent receives full content credit (90).
        An incorrect, unrelated, or missing answer receives 0. Use partial marks
        only where a response is genuinely partly correct.
      - Pronunciation: Assess whether the spoken answer is intelligible. Do not
        confuse a transcription error with a pronunciation error.
      - Oral Fluency: Assess the delivery fairly, taking into account that ASQ
        expects a short answer and does not require a long sentence.
      - Overall: Provide a fair assessment. Content correctness is the primary
        purpose of this task; do not reduce content marks because of accent,
        minor pronunciation differences, or a different but correct wording.

      FEEDBACK:
      - Use clear, brief, encouraging English.
      - State whether the answer is correct, partly correct, or incorrect.
      - If correct, acknowledge the meaning even when the wording differs from
        the model answer.
      - If incorrect, briefly explain the correct fact.
      - Never claim that an answer is wrong solely because it differs from the
        expected model answer.
      - Do not invent details that are not supported by the question or audio.

      WORD-LEVEL ANALYSIS:
      ASQ is assessed by the meaning and correctness of a short answer, not by
      matching every word in a target sentence. Return an empty wordAnalysis array.

      Return a JSON object with:
      - userTranscript (string)
      - pronunciation (number, 0-90)
      - fluency (number, 0-90)
      - content (number, 0-90)
      - overall (number, 0-90)
      - feedback (string)
      - sectionFeedback (object with pronunciation, fluency, content strings)
      - breakdown (object with pronunciation, fluency, content numbers)
      - wordAnalysis (empty array)
    `
  : `
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
           * Explain exactly WHAT the user needs to do to achieve a high score.
           * Use simple, actionable language for the "How to fix" part.
      9. Word-Level Analysis (The Heatmap):
         - Provide an array called "wordAnalysis" mapping EVERY word from the Target Text to how the user pronounced it.
         - For each word, provide:
           * "word": The CORRECT dictionary spelling of the target word from the text.
           * "health": "good" (pronounced correctly), "bad" (mispronounced, garbled, or skipped).
           * "label": optional explanation if bad.

      Return the result as a JSON object with:
      - userTranscript (string)
      - pronunciation (number)
      - fluency (number)
      - overall (number)
      - feedback (string, summary)
      - sectionFeedback (object with keys: pronunciation, fluency, content)
      - breakdown (object with keys: pronunciation, fluency, content)
      - wordAnalysis (array of objects with keys: word, health, label)
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


/**
 * Analyze a PTE Academic essay using writing-only assessment criteria.
 * This function is deliberately separate from analyzeWriting and analyzeSpeech.
 */
export const analyzeEssay = async (
  essay: string,
  essayTopic: string,
  level: 'A1' | 'A2' | 'B1' | 'B1+' | 'C1' | 'C2'
) => {
  try {
    const isBeginnerLevel = level === 'A1' || level === 'A2';
    const levelGuidance = isBeginnerLevel
      ? `
      LEARNER LEVEL: ${level}
      Assess this as a beginner English learner, not as a PTE Academic candidate.
      Use kind, encouraging and simple English. Focus on whether the student communicates
      the main meaning at their current level. Accept short, simple sentences and basic
      vocabulary as appropriate. Do not expect a formal essay structure, advanced vocabulary,
      complex grammar or a long response. Do not compare the student with PTE high-score
      standards. Do not penalise the student for not writing 200-300 words.
      Give practical feedback with only a few clear improvements the student can try next.
      The 0-90 scores are learning-progress indicators for this app, not official PTE scores.
      Create a short, clear model answer using language suitable for ${level}.
      `
      : `
      LEARNER LEVEL: ${level}
      Assess the response using the existing PTE Academic-style writing standards.
      Keep the assessment fair for this level while retaining the PTE-style criteria and
      0-90 scoring. Give clear, practical feedback in plain English. Do not claim that the
      score is an official Pearson result. Aim for a 200-300 word model essay.
      `;

    const prompt = `
      ${isBeginnerLevel
        ? 'Act as a kind, supportive English writing teacher for a beginner learner.'
        : 'Act as a strict, fair and professional PTE Academic Writing examiner and coach.'}

      TASK TYPE: WRITE ESSAY
      ${levelGuidance}

      ESSAY QUESTION:
      "${essayTopic}"

      STUDENT'S ESSAY:
      "${essay}"

      Evaluate ONLY the student's written essay. This is a writing task, not a speaking task.
      Do not assess or mention pronunciation, oral fluency, speaking pace, audio, voice,
      accent, hesitation or spoken delivery.

      Score each assessment area from 0 to 90, using expectations appropriate to ${level}:

      1. CONTENT:
         - Does the response answer the question and communicate relevant ideas?
         - For A1/A2, reward clear basic meaning and relevant simple details.
         - For B1 and above, assess development, explanation and support of ideas.

      2. FORM:
         - For A1/A2, do not require a formal essay format or a 200-300 word response.
         - For B1 and above, assess task fulfilment and use the 200-300 word target,
           applying a proportionate penalty only for substantially short or long responses.

      3. GRAMMAR:
         - Assess accuracy at the learner's level.
         - For A1/A2, focus on basic sentence construction and errors that affect meaning.
         - For B1 and above, assess a wider range of grammar and sentence control.

      4. VOCABULARY:
         - Assess appropriate vocabulary for the learner's level.
         - Do not expect advanced or sophisticated vocabulary from A1/A2 learners.
         - Reward accurate, natural word choice rather than unnecessary complexity.

      5. SPELLING:
         - Assess spelling fairly for the learner's level. Do not invent errors.

      6. STRUCTURE:
         - For A1/A2, accept a simple sequence of understandable sentences; do not require
           a formal introduction, body paragraphs and conclusion.
         - For B1 and above, assess paragraphing, progression, cohesion and conclusion.

      7. LINGUISTIC RANGE:
         - Assess the range and flexibility expected at ${level}.
         - For A1/A2, basic vocabulary and simple sentence patterns can receive good marks
           when they are used accurately and communicate the message.
         - For B1 and above, assess variation and control of sentence structures.

      OVERALL SCORE:
      - Give a fair overall score from 0 to 90 based on the complete written response.
      - Apply expectations appropriate to ${level}; do not use one standard for every level.
      - Do not allow sophisticated vocabulary to hide irrelevant content or weak organisation.
      - Do not allow a few minor errors to outweigh an otherwise effective response.
      - Scores in each breakdown category must also be from 0 to 90.

      FEEDBACK:
      - Provide clear and encouraging feedback in plain English.
      - Explain the main strengths and the most important areas to improve.
      - Give specific advice suitable for ${level}.
      - For A1/A2, keep the summary and section feedback short, simple and supportive.
      - Each sectionFeedback item must discuss only its corresponding writing criterion.
      - Never include speaking-related feedback.

      MODEL ANSWER:
      - Provide a correct sample answer to the exact question, suitable for ${level}.
      - For A1/A2, use short sentences and common vocabulary. Keep it concise and achievable.
      - For B1 and above, provide a developed essay of approximately 200-300 words.
      - Do not claim that the sample is the only acceptable answer.

      Return ONLY a valid JSON object with this exact structure:
      {
        "overall": number,
        "feedback": string,
        "modelAnswer": string,
        "sectionFeedback": {
          "content": string,
          "grammar": string,
          "vocabulary": string,
          "spelling": string,
          "structure": string,
          "form": string,
          "linguisticRange": string
        },
        "breakdown": {
          "grammar": number,
          "vocabulary": number,
          "spelling": number,
          "content": number,
          "structure": number,
          "form": number,
          "linguistic": number
        }
      }
    `;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
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
      feedback: res.feedback || "Essay analysis complete.",
      modelAnswer: res.modelAnswer || "",
      sectionFeedback: res.sectionFeedback || null,
      breakdown: res.breakdown || null
    };
  } catch (error) {
    console.error("AI Essay Analysis Error:", error);
    throw error;
  }
};

/**
 * Independently assess a Summarize Written Text response.
 * This evaluator uses CEFR-appropriate English-learning criteria and does not
 * use the shared PTE writing prompt used by Summarize Spoken Text.
 */
export const analyzeSummarizeWritten = async (
  userSummary: string,
  sourceText: string,
  exampleAnswer: string,
  level: 'A1' | 'A2' | 'B1' | 'B1+' | 'C1' | 'C2'
) => {
  try {
    const isBeginnerLevel = level === 'A1' || level === 'A2';

    const levelGuidance = isBeginnerLevel
      ? `
      LEARNER LEVEL: ${level}
      Assess this as a beginner English learner.
      Reward a clear understanding of the main message, even when the response
      uses simple vocabulary and basic sentence structures.
      Do not expect advanced vocabulary, complex grammar or sophisticated
      sentence patterns. Give kind, supportive feedback in simple English.
      `
      : `
      LEARNER LEVEL: ${level}
      Assess the response at the expected ${level} level.
      Consider precision, effective paraphrasing, grammar control, vocabulary
      range and the ability to express connected ideas concisely.
      Keep feedback clear, fair and practical.
      `;

    const prompt = `
      Act as a fair, experienced English writing teacher specialising in
      one-sentence summaries.

      TASK: SUMMARIZE WRITTEN TEXT

      ${levelGuidance}

      SOURCE PASSAGE:
      "${sourceText}"

      APPROVED EXAMPLE ANSWER (REFERENCE ONLY):
      "${exampleAnswer}"

      STUDENT'S RESPONSE:
      "${userSummary}"

      IMPORTANT CONTENT-MARKING PRINCIPLES:
      - Assess whether the student has understood and communicated the central
        message and the most important supporting information in the passage.
      - Use the approved example answer to understand the intended key meaning.
        It is a guide, not a required wording or a fixed answer.
      - Accept accurate paraphrases, synonyms and alternative sentence structures.
      - Never require the student to copy the example answer.
      - Do not penalise a response simply because it includes a different but
        accurate selection or arrangement of key information.
      - Do not award full content marks for a response that changes the main
        meaning, includes important factual errors, or focuses on minor details
        while missing the central message.
      - Do not invent information that is not in the source passage.

      FORM REQUIREMENTS:
      - The response must contain 5 to 75 words.
      - The response must be exactly one sentence.
      - Assess these requirements fairly and reflect any failure in the Form score.
      - Do not assess it as an essay or ask for paragraphs.

      SCORING CRITERIA:
      Score each category from 0 to 90, using expectations appropriate to ${level}.

      1. CONTENT:
         Accuracy and coverage of the passage's central message and important ideas.

      2. FORM:
         Compliance with the 5-75 word requirement and exactly one sentence.

      3. GRAMMAR:
         Sentence construction, tense, agreement, word order and punctuation.
         Assess accuracy appropriate to the learner's level.

      4. VOCABULARY:
         Appropriate, accurate word choice and effective paraphrasing.
         Do not demand unnecessarily advanced vocabulary.

      5. SPELLING:
         Correct spelling and appropriate written word forms.
         Do not invent spelling errors.

      6. STRUCTURE:
         Clear organisation of the ideas within one coherent sentence.
         Assess logical connections and readability, not paragraph structure.

      7. LINGUISTIC RANGE:
         The range and flexibility of vocabulary and sentence construction
         appropriate to ${level}. A simple but accurate sentence can score well
         at A1/A2.

      OVERALL SCORE:
      - Give a balanced overall learning-progress score from 0 to 90.
      - Content and form are especially important for this task.
      - Do not let sophisticated vocabulary hide missing or inaccurate content.
      - Do not let minor language errors outweigh a response that communicates
        the main meaning clearly.
      - These scores are learning-progress indicators for this app, not official
        examination scores.

      FEEDBACK:
      - Write a short overall summary in clear English.
      - Give specific, useful feedback for each of the seven criteria.
      - For A1/A2, use simple and encouraging language and focus on a small
        number of achievable improvements.
      - For higher levels, give more precise advice appropriate to the level.
      - Each sectionFeedback item must discuss only its own criterion.
      - Do not mention PTE, Pearson, official examination scores or a high-score
        target.

      MODEL ANSWER:
      - Return the approved example answer exactly as supplied.
      - Do not rewrite it or create a different model answer.

      Return ONLY a valid JSON object with this structure:
      {
        "overall": number,
        "feedback": string,
        "sectionFeedback": {
          "content": string,
          "grammar": string,
          "vocabulary": string,
          "spelling": string,
          "structure": string,
          "form": string,
          "linguisticRange": string
        },
        "breakdown": {
          "grammar": number,
          "vocabulary": number,
          "spelling": number,
          "content": number,
          "structure": number,
          "form": number,
          "linguistic": number
        }
      }
    `;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8000,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
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
              required: [
                "content",
                "grammar",
                "vocabulary",
                "spelling",
                "structure",
                "form",
                "linguisticRange"
              ]
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
              required: [
                "grammar",
                "vocabulary",
                "spelling",
                "content",
                "structure",
                "form",
                "linguistic"
              ]
            }
          },
          required: ["overall", "feedback", "sectionFeedback", "breakdown"]
        }
      }
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const res = JSON.parse(rawText);

    return {
      overall: res.overall || 0,
      feedback: res.feedback || "Summary assessment complete.",
      modelAnswer: exampleAnswer,
      sectionFeedback: res.sectionFeedback || null,
      breakdown: res.breakdown || null
    };
  } catch (error) {
    console.error("AI Summarize Written Analysis Error:", error);
    throw error;
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
      model: "gemini-3.8-flash",
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
