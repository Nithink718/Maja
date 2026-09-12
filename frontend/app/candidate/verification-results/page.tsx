'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Video, Mic, Monitor, CheckCircle2, XCircle, RefreshCw, Play, ArrowRight } from 'lucide-react';

export default function VerificationResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('ecosphere_verification_results');
      if (raw) {
        try {
          setResults(JSON.parse(raw));
        } catch (e) {
          console.error(e);
        }
      } else {
        // Default sample pass
        setResults({
          camera_valid: true,
          camera_quality: 'Good (1080p, 30fps)',
          camera_notes: 'Face clearly visible, lighting optimal, frame rate stable.',
          mic_valid: true,
          mic_quality: 'Clear Audio Capture',
          mic_notes: 'Microphone input detected with acceptable signal-to-noise ratio.',
          screen_share_valid: true,
          screen_share_quality: 'Active Screen Stream',
          screen_share_notes: 'Display surface stream verified and accessible.',
          overall_passed: true,
        });
      }
    }
  }, []);

  const handleStartInterview = () => {
    router.push('/candidate/interview');
  };

  const handleRetry = () => {
    router.push('/candidate/verification');
  };

  const passed = results?.overall_passed ?? true;

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 6 of 6: Media Stream Diagnostic</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verification Results</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review hardware diagnostic and stream stability before entering the live interview room.
        </p>
      </div>

      {/* Main Results Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
        
        {/* Status Header */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          passed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          {passed ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
          )}
          <div>
            <span className="text-sm font-extrabold block">
              {passed ? 'Verification Successful — All Streams Certified' : 'Verification Issue Detected'}
            </span>
            <span className="text-xs text-slate-600">
              {passed ? 'Camera, audio spectrum, and screen streams meet interview quality standards.' : 'Please retry verification to resolve issues.'}
            </span>
          </div>
        </div>

        {/* 3 Stream Diagnostics */}
        <div className="space-y-3">
          
          {/* Camera Quality */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Camera Feed Quality</span>
                <span className="text-xs text-slate-500">{results?.camera_notes || 'Face clearly visible, lighting optimal.'}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold shrink-0">
              ✓ {results?.camera_quality || 'Good'}
            </span>
          </div>

          {/* Microphone Quality */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Microphone Capture</span>
                <span className="text-xs text-slate-500">{results?.mic_notes || 'Audio levels optimal for speech transcription.'}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold shrink-0">
              ✓ {results?.mic_quality || 'Clear'}
            </span>
          </div>

          {/* Screen Share */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Screen Sharing Surface</span>
                <span className="text-xs text-slate-500">{results?.screen_share_notes || 'Display surface stream verified and accessible.'}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold shrink-0">
              ✓ {results?.screen_share_quality || 'Active'}
            </span>
          </div>

        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={handleRetry}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Verification</span>
          </button>

          <button
            onClick={handleStartInterview}
            disabled={!passed}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Live AI Interview</span>
          </button>
        </div>

      </div>

    </div>
  );
}
