import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic,
  BookOpen,
  Scale,
  CheckCircle2,
  Clock,
  Layers,
  Copy,
  Check,
  Wand2,
  ListChecks,
  BarChart3,
  Image as ImageIcon,
  MessageSquareQuote,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { ProjectStats } from '../types';

interface Props {
  stats: ProjectStats;
}

type RubricType = 'read-aloud' | 'repeat-sentence' | 'describe-image';

const GuidePanel: React.FC<Props> = ({ stats }) => {
  const [activeRubric, setActiveRubric] = useState<RubricType>('read-aloud');
  const [copiedRubric, setCopiedRubric] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when switching rubrics
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeRubric]);

  const rubrics: Record<RubricType, { title: string; icon: any; content: string; weight: number }> = {
    'read-aloud': {
      title: 'Read Aloud',
      icon: <Mic size={16} />,
      weight: 51.5,
      content: `## PTE Read Aloud Rubric (Reading & Speaking)
### Total Task Impact: 51.5 Points

#### 1. Content (Score 0-5)
- 5 Points: All words in the passage are spoken. No omissions or insertions.
- 4 Points: 1 or 2 words are replaced, omitted or inserted.
- 3 Points: Multiple omissions (3-5 words).
- 2 Points: More than 5 words omitted.
- 1 Point: Minimal content reproduced.
- 0 Points: Major omissions or incorrect text read.

#### 2. Oral Fluency (Score 0-5)
- 5 Points: Smooth, natural rhythm. Native-like phrasing. No false starts or repetitions.
- 4 Points: Generally smooth delivery with minor hesitations.
- 3 Points: Acceptable rhythm; minor stumbles that don't break communication.
- 2 Points: Uneven phrasing; multiple stumbles.
- 1 Point: Disconnected speech; many hesitations.
- 0 Points: Non-fluent.

#### 3. Pronunciation (Score 0-5)
- 5 Points: Native-like; vowels and consonants are clear.
- 4 Points: Advanced pronunciation; easily understandable.
- 3 Points: Understandable but regional accent is evident.
- 2 Points: Hard to understand some words.
- 1 Point: Very hard to understand.

### AI Grading Instruction:
"Act as a PTE Pearson examiner. Compare the audio transcript with the source passage. Deduct 1 point from Content for every 3 words missed. Fluency is the priority; if the student repeats a word, cap Fluency at 3. Focus on native-like chunking and avoidance of unnatural pauses."`
    },
    'repeat-sentence': {
      title: 'Repeat Sentence',
      icon: <MessageSquareQuote size={16} />,
      weight: 56,
      content: `## PTE Repeat Sentence Rubric (Listening & Speaking)
### Total Task Impact: 56 Points

#### 1. Listening Accuracy (70% Weight)
- Score 3: 100% of words reproduced in the correct order.
- Score 2: At least 50% of words reproduced correctly.
- Score 1: Less than 50% of words reproduced.
- Score 0: No words or incorrect meaning.

#### 2. Speaking Fluency (Score 0-5)
- Score 5: Native-like flow; no unnatural pauses.
- Score 4: One minor hesitation.
- Score 3: Minor hesitations; one false start allowed.

### AI Grading Instruction:
"Prioritize sequence accuracy (70%) over perfect pronunciation (30%). If the student skips more than 2 words, the max Listening score is 1. Focus on the verbatim match of word order."`
    },
    'describe-image': {
      title: 'Describe Image',
      icon: <ImageIcon size={16} />,
      weight: 22,
      content: `## PTE Describe Image Rubric (Speaking Only)
### Total Task Impact: 22 Points

#### 1. Content (Score 0-5)
- 5 Points: Mentions all key elements, trends, and relationships in the image.
- 4 Points: Mentions most elements; misses minor details.
- 3 Points: Mentions main parts of the image but lacks detail or conclusion.

#### 2. Oral Fluency (Score 0-5)
- 5 Points: Continuous speech without unnatural pauses.
- 3 Points: Some hesitations but flow is generally maintained.

### AI Grading Instruction:
"Analyze the user's description. Check for keywords related to the image type (e.g., 'X-axis', 'legend', 'trend'). If the description is less than 30 seconds, cap Content at 2. Focus on the use of descriptive logical templates."`
    }
  };

  const copyRubric = () => {
    navigator.clipboard.writeText(rubrics[activeRubric].content);
    setCopiedRubric(true);
    setTimeout(() => setCopiedRubric(false), 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* AI Rubric Studio Section */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Wand2 color="#60A5FA" size={24} />
                    AI Rubric Studio
                </h2>
                <p className="text-slate-500 text-sm mt-1">Specialized scoring logic for PTE task analysis.</p>
            </div>
            <button 
                onClick={copyRubric}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${copiedRubric ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
            >
                {copiedRubric ? <Check size={18} /> : <Copy size={18} />}
                {copiedRubric ? 'Copied Rubric' : `Copy ${rubrics[activeRubric].title} Rubric`}
            </button>
        </div>

        {/* Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
            {Object.entries(rubrics).map(([id, rubric]) => (
                <button
                    key={id}
                    onClick={() => setActiveRubric(id as RubricType)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeRubric === id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {rubric.icon}
                    {rubric.title}
                </button>
            ))}
        </div>

        {/* Fixed Height Scroll Area */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-inner overflow-hidden">
            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Scoring_Matrix_v1.0</span>
                <span className="text-[10px] font-black text-blue-400 uppercase">Weight: {rubrics[activeRubric].weight}</span>
            </div>

            <div 
              ref={scrollContainerRef}
              className="h-[350px] overflow-y-auto p-8 custom-scrollbar scroll-smooth bg-slate-900/50"
            >
                <pre className="whitespace-pre-wrap break-words font-mono text-xs text-blue-100/90 leading-relaxed m-0 p-0">
                    {rubrics[activeRubric].content}
                </pre>
            </div>
        </div>
      </section>

      {/* Service Health & Migration Insights */}
      {stats.legacyModelDetected && (
        <section className="bg-amber-50 p-8 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-amber-600 rounded-xl shadow-lg shadow-amber-200">
                    <ShieldCheck size={24} color="white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-amber-900">geminiService.ts Health Check</h2>
                    <p className="text-amber-700 text-sm">Action required to meet modern SDK standards.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 relative z-10">
                <div className="p-4 bg-white/80 rounded-xl border border-amber-200/50">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} color="#d97706" />
                        <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Deprecated: @google/generative-ai</p>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">Your service uses the legacy SDK. Switch to <code className="bg-amber-100 px-1 rounded">@google/genai</code> to support Gemini 3 Pro features and response schemas.</p>
                </div>

                <div className="p-4 bg-white/80 rounded-xl border border-amber-200/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={16}  color="#d97706" />
                        <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Manual JSON Cleaning</p>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">You are manually replacing Markdown backticks. Modern SDKs allow setting <code className="bg-amber-100 px-1 rounded">responseMimeType: "application/json"</code> for pure objects.</p>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-100/50 p-3 rounded-lg border border-amber-200">
                <Code2 size={16} />
                <span>Recommendation: Update geminiService.ts to use Gemini 3 Flash for faster audio scoring.</span>
            </div>
        </section>
      )}

      {/* Content Audit Stats */}
      <div className="grid md:grid-cols-3 gap-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Questions Detected</h3>
              <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-800">{stats.totalQuestions || 0}</span>
                  <span className="text-xs font-bold text-slate-400 mb-1">Items</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Verified in readAloudData.ts</p>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Framework Health</h3>
              <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stats.legacyModelDetected ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                  <span className="text-sm font-bold text-slate-700">{stats.framework || 'Expo/RN'}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Warning: expo-av deprecated (SDK 54)</p>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Task Impact Score</h3>
              <div className="flex items-center gap-2 text-blue-600">
                  <BarChart3 size={16} />
                  <span className="text-sm font-black">{rubrics[activeRubric].weight} PTS Potential</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">High focus recommended.</p>
          </section>
      </div>
    </div>
  );
};

export default GuidePanel;