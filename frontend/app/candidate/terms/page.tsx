'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Video, Mic, Monitor, HelpCircle } from 'lucide-react';

export default function InterviewTermsPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const handleContinue = () => {
    if (agreed) {
      router.push('/candidate/access-check');
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 3 of 6: Protocols & Guidelines</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Interview Information & Guidelines</h1>
        <p className="text-sm text-slate-500 mt-1">
          Please review the AI interview format, voice interaction rules, and integrity protocols.
        </p>
      </div>

      {/* Guidelines Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700">
        
        {/* Key Interview Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-slate-400 text-xs block font-bold uppercase">Questions</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">4 Adaptive</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-slate-400 text-xs block font-bold uppercase">Estimated Duration</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">15 – 20 Mins</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <span className="text-slate-400 text-xs block font-bold uppercase">Scoring Dimensions</span>
            <span className="text-xl font-extrabold text-blue-600 mt-0.5 block">4 Independent</span>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>How the AI Interview Operates</span>
          </h3>
          <ul className="space-y-2 text-xs leading-relaxed text-slate-600 list-disc pl-5">
            <li>
              <b>Real-Time Voice Pipeline:</b> The AI Interviewer uses Gradium speech-to-text and text-to-speech. Speak naturally and clearly as you would in a real interview.
            </li>
            <li>
              <b>Semantic Interruption / Barge-in:</b> You are free to speak or clarify anytime. The AI detects candidate speech and cuts off its response to listen.
            </li>
            <li>
              <b>Adaptive Reasoning:</b> Gemini AI generates follow-ups grounded directly in your resume, GitHub project, and previous answers.
            </li>
            <li>
              <b>Multi-Agent Evaluation:</b> You will receive independent scores (0-100) and evidence quotes across Technical, Behavioural, PM, and Hiring Manager perspectives.
            </li>
          </ul>
        </div>

        {/* Hardware & Integrity Requirements */}
        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Device & Privacy Protocols</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Camera active and face visible</span>
            </div>
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Clear microphone audio</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Full screen share active</span>
            </div>
          </div>
        </div>

        {/* What to Do and Not Do */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
            <span className="font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recommended Best Practices
            </span>
            <ul className="space-y-1 text-slate-600 list-disc pl-4">
              <li>Use the STAR format (Situation, Task, Action, Result) for behavioural questions.</li>
              <li>Explain architectural trade-offs and rationale clearly.</li>
              <li>Keep responses concise and structured.</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
            <span className="font-bold text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> What to Avoid
            </span>
            <ul className="space-y-1 text-slate-600 list-disc pl-4">
              <li>Do not leave or blur the interview tab during active questions.</li>
              <li>Avoid background noise or muting your microphone.</li>
              <li>Do not disconnect screen sharing during the session.</li>
            </ul>
          </div>
        </div>

        {/* Mandatory Checkbox */}
        <div className="pt-4 border-t border-slate-100">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-0.5 shrink-0 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800">
              I have read, understood, and agree to the Terms, Conditions, and AI Evaluation Protocols.
            </span>
          </label>
        </div>

      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleContinue}
          disabled={!agreed}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Continue to System Access Check</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
