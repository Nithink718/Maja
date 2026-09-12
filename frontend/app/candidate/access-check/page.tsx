'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Video,
  Mic,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export default function SystemAccessCheckPage() {
  const router = useRouter();

  const [cameraGranted, setCameraGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [screenGranted, setScreenGranted] = useState(false);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  // Request Camera
  const requestCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      setCameraGranted(true);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setCameraGranted(false);
      setCameraError('Camera access was denied or device not found. Please enable camera in browser settings.');
    }
  };

  // Request Microphone
  const requestMicrophone = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicGranted(true);
      // Clean up standalone audio stream test
      stream.getTracks().forEach((t) => t.stop());
    } catch (err: any) {
      setMicGranted(false);
      setMicError('Microphone access was denied or device not found. Please enable microphone permissions.');
    }
  };

  // Request Screen Share
  const requestScreenShare = async () => {
    setScreenError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenGranted(true);
      setScreenStream(stream);
      if (screenRef.current) {
        screenRef.current.srcObject = stream;
      }

      // Handle user stopping screen share via browser UI
      stream.getVideoTracks()[0].onended = () => {
        setScreenGranted(false);
        setScreenStream(null);
      };
    } catch (err: any) {
      setScreenGranted(false);
      setScreenError('Screen sharing was cancelled or denied. Full display surface sharing is required.');
    }
  };

  // Auto-request initial permissions on load
  useEffect(() => {
    requestCamera();
    requestMicrophone();
  }, []);

  const allGranted = cameraGranted && micGranted && screenGranted;

  const handleContinue = () => {
    if (allGranted) {
      router.push('/candidate/verification');
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 4 of 6: Hardware Verification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Access Check</h1>
        <p className="text-sm text-slate-500 mt-1">
          Verify Camera, Microphone, and Screen Sharing permissions. All three must be active to proceed.
        </p>
      </div>

      {/* Permission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. Camera */}
        <div className={`p-6 rounded-3xl border bg-white shadow-sm flex flex-col justify-between transition-all ${
          cameraGranted ? 'border-emerald-200 ring-2 ring-emerald-500/10' : 'border-slate-200'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                cameraGranted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
              }`}>
                <Video className="w-5 h-5" />
              </div>
              {cameraGranted ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Required
                </span>
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Camera Access</h3>
              <p className="text-xs text-slate-500 mt-0.5">High-definition video feed of candidate</p>
            </div>

            {/* Video Preview */}
            <div className="w-full h-36 bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
              {cameraGranted ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <span className="text-[11px] text-slate-400">Camera preview inactive</span>
              )}
            </div>

            {cameraError && (
              <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">{cameraError}</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            {!cameraGranted ? (
              <button
                onClick={requestCamera}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Allow Camera
              </button>
            ) : (
              <button
                onClick={requestCamera}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Re-check Camera
              </button>
            )}
          </div>
        </div>

        {/* 2. Microphone */}
        <div className={`p-6 rounded-3xl border bg-white shadow-sm flex flex-col justify-between transition-all ${
          micGranted ? 'border-emerald-200 ring-2 ring-emerald-500/10' : 'border-slate-200'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                micGranted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
              }`}>
                <Mic className="w-5 h-5" />
              </div>
              {micGranted ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Required
                </span>
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Microphone Access</h3>
              <p className="text-xs text-slate-500 mt-0.5">Clear audio for Gradium STT & VAD</p>
            </div>

            <div className="w-full h-36 bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-center text-center">
              {micGranted ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full animate-wave-1"></div>
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full animate-wave-2"></div>
                    <div className="w-1.5 h-5 bg-emerald-500 rounded-full animate-wave-3"></div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700">Audio Stream Active</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">Microphone not detected</span>
              )}
            </div>

            {micError && (
              <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">{micError}</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            {!micGranted ? (
              <button
                onClick={requestMicrophone}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Allow Microphone
              </button>
            ) : (
              <button
                onClick={requestMicrophone}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Re-check Mic
              </button>
            )}
          </div>
        </div>

        {/* 3. Screen Share */}
        <div className={`p-6 rounded-3xl border bg-white shadow-sm flex flex-col justify-between transition-all ${
          screenGranted ? 'border-emerald-200 ring-2 ring-emerald-500/10' : 'border-slate-200'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                screenGranted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
              }`}>
                <Monitor className="w-5 h-5" />
              </div>
              {screenGranted ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Required
                </span>
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Screen Share</h3>
              <p className="text-xs text-slate-500 mt-0.5">Desktop stream for interview integrity</p>
            </div>

            {/* Screen Preview */}
            <div className="w-full h-36 bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
              {screenGranted ? (
                <video ref={screenRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <span className="text-[11px] text-slate-400">Screen share inactive</span>
              )}
            </div>

            {screenError && (
              <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">{screenError}</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            {!screenGranted ? (
              <button
                onClick={requestScreenShare}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Allow Screen Share
              </button>
            ) : (
              <button
                onClick={requestScreenShare}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Change Screen
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Continue Action */}
      <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck className={`w-6 h-6 ${allGranted ? 'text-emerald-600' : 'text-slate-400'}`} />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Overall Status</span>
            <span className={`text-sm font-extrabold ${allGranted ? 'text-emerald-700' : 'text-slate-700'}`}>
              {allGranted ? 'All 3 System Permissions Verified' : 'Please grant Camera, Microphone & Screen Share'}
            </span>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!allGranted}
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Continue to Verification</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
