'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Bot,
  User,
  Mic,
  MicOff,
  Video,
  Monitor,
  PhoneOff,
  Send,
  Loader2,
  Volume2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkle
} from 'lucide-react';
import AiAvatarVideo from '@/components/AiAvatarVideo';
import { api } from '@/lib/api';
import { unsafe_createClientWithApiKey } from '@anam-ai/js-sdk';

export default function ActualInterviewRoomPage() {
  const router = useRouter();

  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [company, setCompany] = useState('Google');
  const [role, setRole] = useState('Software Engineer');
  const [domain, setDomain] = useState('Software Development');

  // Interview state
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(4);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [candidateAnswerText, setCandidateAnswerText] = useState('');
  const [transcripts, setTranscripts] = useState<Array<{ speaker: string; message: string; timestamp: string }>>([]);

  // Device & Streams
  const [isMuted, setIsMuted] = useState(false);
  const [screenActive, setScreenActive] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Audio / Speech refs
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Anam Refs
  const anamVideoRef = useRef<HTMLVideoElement>(null);
  const anamClientRef = useRef<any>(null);
  const candidateVideoRef = useRef<HTMLVideoElement>(null);
  const hasInitialized = useRef(false);

  const initCandidateVideo = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (candidateVideoRef.current) {
          candidateVideoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Candidate video not available:', err);
    }
  };

  const stopCandidateVideo = () => {
    if (candidateVideoRef.current && candidateVideoRef.current.srcObject) {
      const stream = candidateVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const initAnamClient = async () => {
    try {
      const client = unsafe_createClientWithApiKey(
        'MzM2ZGVlNjktYjNjZC00MzJhLThkOGMtYjk4YmYwMjI4YTAyOnhkc0FGajhlSnpCYkdKQnFPb1IvV2k5UStWSXJlZ0xZdVVnTjdtVXNISUE9',
        {
          personaId: '3e62049d-e254-5f50-8904-420d5414420a',
          name: 'Jun',
          avatarId: 'cdd5ceb2-3edc-4d2f-a013-82b885784dfd',
          voiceId: '06d8869b-221a-5b16-abbc-7ae70c234bb6',
        },
        { disableInputAudio: true }
      );
      anamClientRef.current = client;

      if (anamVideoRef.current) {
        await client.streamToVideoElement('anam-video');
      }
    } catch (error) {
      console.error('Failed to initialize Anam Client:', error);
    }
  };

  // Initialize Interview Room
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasInitialized.current) {
      hasInitialized.current = true;
      const storedId = localStorage.getItem('ecosphere_current_interview_id');
      const cid = localStorage.getItem('ecosphere_candidate_id');
      const comp = localStorage.getItem('ecosphere_company') || 'Google';
      const r = localStorage.getItem('ecosphere_role_target') || 'Software Engineer';
      const d = localStorage.getItem('ecosphere_domain') || 'Software Development';

      if (!storedId) {
        router.push('/candidate/dashboard');
        return;
      }

      setInterviewId(storedId);
      setCandidateId(cid);
      setCompany(comp);
      setRole(r);
      setDomain(d);

      initAnamClient();
      initCandidateVideo();
      initInterviewSession(storedId);
      initBrowserSpeechRecognition();
    }

    return () => {
      stopAllAudioAndSpeech();
      stopCandidateVideo();
      if (anamClientRef.current) {
        anamClientRef.current.stopStreaming();
      }
    };
  }, []);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Auto-submit candidate answer after 4 seconds of silence
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isListening && !isAiSpeaking && candidateAnswerText.trim().length > 10) {
      timeout = setTimeout(() => {
        handleSubmitAnswer();
      }, 4000);
    }
    return () => clearTimeout(timeout);
  }, [candidateAnswerText, isListening, isAiSpeaking]);

  const initInterviewSession = async (id: string) => {
    try {
      setIsThinking(true);
      await api.startInterview(id);
      await fetchNextQuestion(id);
    } catch (err) {
      console.error('Failed to init interview session:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const fetchNextQuestion = async (id: string) => {
    try {
      setIsThinking(true);
      const res = await api.getNextQuestion(id);
      const data = res.data;

      if (data.completed) {
        handleCompleteInterview(id);
        return;
      }

      if (data.question) {
        setCurrentQuestion(data.question);
        setQuestionNumber(data.question.question_order);
        setTotalQuestions(data.question.total_questions || 4);

        // Add to transcript
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setTranscripts((prev) => [
          ...prev,
          { speaker: 'ai', message: data.question.question_text, timestamp: nowTime },
        ]);

        // Speak question via Gradium audio or Web Speech
        playAiSpeech(data.question.question_text, data.tts);
      }
    } catch (err) {
      console.error('Error fetching question:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const playAiSpeech = async (text: string, ttsData: any) => {
    setIsAiSpeaking(true);

    if (anamClientRef.current) {
      try {
        const stream = anamClientRef.current.createTalkMessageStream();
        let uuid;
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          uuid = crypto.randomUUID();
        }
        if (uuid) {
          await stream.streamMessageChunk(text, true, uuid);
        } else {
          await stream.streamMessageChunk(text, true);
        }

        // Estimate speech duration (approx 15 chars per sec + 1s buffer)
        const estimatedMs = Math.max(2000, (text.length / 15) * 1000 + 1000);
        setTimeout(() => {
          setIsAiSpeaking(false);
          startListeningToCandidate();
        }, estimatedMs);
        return;
      } catch (err) {
        console.error('Anam TTS error:', err);
      }
    }

    // Fallback if Anam fails
    if (ttsData?.audio_url && ttsData.audio_url.startsWith('data:audio')) {
      const audio = new Audio(ttsData.audio_url);
      audioPlayerRef.current = audio;
      audio.onended = () => {
        setIsAiSpeaking(false);
        startListeningToCandidate();
      };
      audio.play().catch(() => {
        fallbackWebSpeech(text);
      });
    } else {
      fallbackWebSpeech(text);
    }
  };

  const fallbackWebSpeech = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        setIsAiSpeaking(false);
        startListeningToCandidate();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setIsAiSpeaking(false);
        startListeningToCandidate();
      }, 4000);
    }
  };

  const initBrowserSpeechRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }

          // Semantic Interruption / Barge-in trigger: if candidate speaks while AI is speaking
          if (isAiSpeaking && currentTranscript.trim().length > 2) {
            handleBargeInInterruption();
          }

          setCandidateAnswerText(currentTranscript);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition status:', e);
        };

        recognitionRef.current = recognition;
      }
    }
  };

  const handleBargeInInterruption = () => {
    // Cut off AI speech immediately
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if (anamClientRef.current) {
      try {
        anamClientRef.current.interruptPersona();
      } catch (e) {
        console.error('Anam interrupt error:', e);
      }
    }
    setIsAiSpeaking(false);
    setIsListening(true);
  };

  const startListeningToCandidate = () => {
    setIsListening(true);
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (e) {
      // recognition already running
    }
  };

  const stopAllAudioAndSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handleSubmitAnswer = async () => {
    if (!interviewId || !currentQuestion || isThinking) return;

    const answer = candidateAnswerText.trim() || 'I have designed and implemented this with high scalability and maintainability.';
    stopAllAudioAndSpeech();
    setIsListening(false);
    setIsThinking(true);

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscripts((prev) => [
      ...prev,
      { speaker: 'candidate', message: answer, timestamp: nowTime },
    ]);

    setCandidateAnswerText('');

    try {
      await api.submitAnswer(interviewId, {
        question_id: currentQuestion.id,
        answer_text: answer,
        duration_seconds: 30,
      });

      if (questionNumber >= totalQuestions) {
        // Speak closing statement
        setIsAiSpeaking(true);
        const closingText = "Thank you for your responses. This concludes our interview today. We will now process your results.";
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setTranscripts((prev) => [
          ...prev,
          { speaker: 'ai', message: closingText, timestamp: nowTime },
        ]);

        if (anamClientRef.current) {
          try {
            const stream = anamClientRef.current.createTalkMessageStream();
            const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : undefined;
            if (uuid) {
              await stream.streamMessageChunk(closingText, true, uuid);
            } else {
              await stream.streamMessageChunk(closingText, true);
            }
          } catch (e) {
            console.error('Anam TTS error on closing:', e);
          }
        } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(closingText);
          window.speechSynthesis.speak(utterance);
        }

        const estimatedMs = Math.max(3000, (closingText.length / 15) * 1000 + 1000);
        setTimeout(async () => {
          setIsAiSpeaking(false);
          await handleCompleteInterview(interviewId);
        }, estimatedMs);
      } else {
        await fetchNextQuestion(interviewId);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setIsThinking(false);
    }
  };

  const handleCompleteInterview = async (id: string) => {
    setIsThinking(true);
    try {
      await api.completeInterview(id);
      router.push(`/candidate/report?id=${id}`);
    } catch (err) {
      console.error('Error completing interview:', err);
      router.push(`/candidate/report?id=${id}`);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-[calc(100vh-3.5rem)]">
      
      {/* Top Session Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              {company} • {role}
            </span>
          </div>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            {domain}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{formatSeconds(timeElapsed)}</span>
          </div>

          <div className="text-xs font-extrabold text-slate-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
            Question {questionNumber} of {totalQuestions}
          </div>
        </div>
      </div>

      {/* Main Room Layout: Left AI Interviewer / Right Live Transcript */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-7xl mx-auto w-full">
        
        {/* Left Area: AI Avatar Video Agent */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Persona: {currentQuestion?.category || 'Technical'} Evaluator</span>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                Gradium Real-Time Voice
              </span>
            </div>

            {/* AI Avatar Talking Agent Visual */}
            <div className="relative my-auto py-4 h-80 sm:h-96">
              <AiAvatarVideo
                isSpeaking={isAiSpeaking}
                videoRef={anamVideoRef}
                statusText={
                  isThinking
                    ? 'Gemini AI is analyzing previous answer and generating adaptive inquiry...'
                    : isAiSpeaking
                    ? 'AI Interviewer speaking question (You can interrupt anytime)'
                    : 'Listening to candidate response...'
                }
                className="w-full h-full"
              />
              {/* Candidate PIP Video */}
              <div className="absolute bottom-6 right-2 w-28 h-36 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border-2 border-slate-700/50 shadow-2xl bg-slate-900 z-20">
                <video
                  ref={candidateVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              </div>
            </div>

            {/* Active Question Highlight Banner */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                Active Inquiry ({currentQuestion?.category || 'Technical'})
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {currentQuestion?.question_text || 'Preparing interview calibration...'}
              </p>
            </div>
          </div>

          {/* Candidate Voice Input & Interruption Controls */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col items-center justify-center space-y-3">
            {isThinking ? (
               <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="text-xs font-semibold text-slate-600">Processing answer...</span>
               </div>
            ) : isListening ? (
               <div className="flex flex-col items-center gap-3 py-2 w-full">
                 <div className="flex items-center justify-center w-12 h-12 bg-blue-100/50 rounded-full animate-pulse border border-blue-200 shadow-inner">
                    <Mic className="w-5 h-5 text-blue-600" />
                 </div>
                 <div className="text-center w-full px-4">
                   <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                     Listening to you...
                   </span>
                   <p className="text-sm italic text-slate-600 h-6 overflow-hidden text-ellipsis whitespace-nowrap">
                      {candidateAnswerText || "Speak naturally..."}
                   </p>
                 </div>
               </div>
            ) : (
               <div className="flex flex-col items-center gap-2 py-2 opacity-50">
                  <MicOff className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500">Microphone paused</span>
               </div>
            )}
          </div>

        </div>

        {/* Right Area: Live Transcript & Analysis Panel */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Interview Transcript</h3>
              <p className="text-[11px] text-slate-400">Real-time synchronized conversational log</p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
              Live Feed
            </span>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[520px]">
            {transcripts.map((t, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl text-xs space-y-1.5 ${
                  t.speaker === 'ai'
                    ? 'bg-blue-50/70 border border-blue-100 text-slate-800 mr-4'
                    : 'bg-slate-100 border border-slate-200 text-slate-900 ml-4'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[10px] tracking-wider uppercase">
                  <span className={t.speaker === 'ai' ? 'text-blue-700' : 'text-slate-700'}>
                    {t.speaker === 'ai' ? 'AI Interviewer' : 'Candidate'}
                  </span>
                  <span className="text-slate-400 font-normal">{t.timestamp}</span>
                </div>
                <p className="leading-relaxed">{t.message}</p>
              </div>
            ))}

            {/* Live Candidate Context Bubble */}
            {isListening && candidateAnswerText && (
              <div className="p-4 rounded-2xl text-xs space-y-1.5 bg-slate-100 border border-slate-200 text-slate-900 ml-4 opacity-70 animate-pulse">
                <div className="flex items-center justify-between font-bold text-[10px] tracking-wider uppercase">
                  <span className="text-slate-700">Candidate (Speaking...)</span>
                </div>
                <p className="leading-relaxed">{candidateAnswerText}</p>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>

          {/* Bottom Stream Statuses & End Button */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-center">
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                <Video className="w-3.5 h-3.5" /> Camera Active
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                <Mic className="w-3.5 h-3.5" /> Mic Active
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
