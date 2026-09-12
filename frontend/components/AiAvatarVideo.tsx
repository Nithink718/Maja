'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Mic, Sparkles, Volume2 } from 'lucide-react';

interface AiAvatarVideoProps {
  isSpeaking?: boolean;
  statusText?: string;
  className?: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

export default function AiAvatarVideo({
  isSpeaking = false,
  statusText = 'AI Interviewer Ready',
  className = '',
  videoRef,
}: AiAvatarVideoProps) {
  const [pulseLevel, setPulseLevel] = useState(0);

  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setPulseLevel((prev) => (prev + 1) % 4);
      }, 250);
      return () => clearInterval(interval);
    }
  }, [isSpeaking]);

  return (
    <div className={`relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col items-center justify-center p-6 ${className}`}>
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"></div>

      {/* Real Avatar Video Stream */}
      <video
        ref={videoRef as any}
        id="anam-video"
        autoPlay
        playsInline
        muted={false}
        className="absolute inset-0 w-full h-full object-cover z-10"
        style={{ display: videoRef ? 'block' : 'none' }}
      />

      {/* Fallback Mockup UI (hidden if videoRef is used, or used as loading state) */}
      {!videoRef && (
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            {isSpeaking && (
              <>
                <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-lg pulse-ring"></div>
                <div className="absolute -inset-8 rounded-full bg-indigo-500/10 blur-xl pulse-ring"></div>
              </>
            )}

            {/* AI Avatar Core Face Representation */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-1 shadow-2xl shadow-blue-500/30 flex items-center justify-center relative">
              <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="relative flex flex-col items-center justify-center">
                  <Bot className={`w-12 h-12 sm:w-16 sm:h-16 text-cyan-300 transition-transform duration-300 ${isSpeaking ? 'scale-110' : 'scale-100'}`} />
                  <div className="flex gap-4 mt-1">
                    <div className={`w-2 h-2 rounded-full bg-cyan-400 ${isSpeaking ? 'animate-ping' : 'opacity-80'}`}></div>
                    <div className={`w-2 h-2 rounded-full bg-cyan-400 ${isSpeaking ? 'animate-ping' : 'opacity-80'}`}></div>
                  </div>
                </div>

                {isSpeaking && (
                  <div className="absolute bottom-2 flex items-center gap-1">
                    <div className="w-1 bg-cyan-400 rounded-full animate-wave-1"></div>
                    <div className="w-1 bg-blue-400 rounded-full animate-wave-2"></div>
                    <div className="w-1 bg-indigo-400 rounded-full animate-wave-3"></div>
                    <div className="w-1 bg-cyan-400 rounded-full animate-wave-4"></div>
                    <div className="w-1 bg-blue-400 rounded-full animate-wave-5"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status / Visualizer Overlays (always visible on top of video) */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex flex-col items-center pointer-events-none">
        <div className="px-3 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] font-semibold text-cyan-300 shadow-md flex items-center gap-1.5 whitespace-nowrap mb-3 backdrop-blur-sm">
          <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`}></span>
          {isSpeaking ? 'Speaking Question...' : 'Listening Active'}
        </div>

        <div className="flex items-center gap-1.5 h-8 mb-2">
          {isSpeaking ? (
            <>
              <div className="w-1.5 h-full bg-blue-500 rounded-full animate-wave-1"></div>
              <div className="w-1.5 h-full bg-cyan-400 rounded-full animate-wave-2"></div>
              <div className="w-1.5 h-full bg-indigo-400 rounded-full animate-wave-3"></div>
              <div className="w-1.5 h-full bg-blue-400 rounded-full animate-wave-4"></div>
              <div className="w-1.5 h-full bg-cyan-500 rounded-full animate-wave-5"></div>
              <div className="w-1.5 h-full bg-indigo-500 rounded-full animate-wave-2"></div>
              <div className="w-1.5 h-full bg-blue-500 rounded-full animate-wave-1"></div>
            </>
          ) : (
            <div className="flex items-center gap-1 text-slate-300 text-xs bg-slate-900/60 px-3 py-1 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Semantic VAD Ready</span>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-white max-w-xs font-medium bg-slate-900/60 px-3 py-1 rounded-lg backdrop-blur-sm">
          {statusText}
        </div>
      </div>
    </div>
  );
}
