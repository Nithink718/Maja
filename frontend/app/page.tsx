'use client';

import React from 'react';
import Link from 'next/link';
import { UserCheck, Building2, Sparkles, ArrowRight, ShieldCheck, Cpu, Mic, FileBarChart, CheckCircle2 } from 'lucide-react';
import AiAvatarVideo from '@/components/AiAvatarVideo';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-100/60 blur-[100px] -z-10 rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold w-fit shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Generation AI Interview Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                AI-powered interview intelligence for <span className="text-blue-600">candidates</span> & <span className="text-blue-600">organizations</span>.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
                Experience real-time AI mock interviews with natural voice interaction, live semantic barge-in, and granular evidence-backed scoring across Technical, Behavioural, PM, and Hiring Manager dimensions.
              </p>

              {/* Role Selection Cards */}
              <div className="pt-4">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500"></div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 tracking-tight">
                    Are you a?
                  </h2>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-500"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Candidate Option */}
                  <Link
                    href="/candidate/auth"
                    className="group relative bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">Candidate</span>
                    </div>
                    <div className="mt-5">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Practice AI Interview
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Get personalized questions, resume & GitHub analysis, and an in-depth 4-dimension portfolio evaluation report.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center text-xl font-bold text-blue-600 gap-2 group-hover:translate-x-2 transition-transform">
                      <span>Start Candidate Flow</span>
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </Link>

                  {/* Organization Option */}
                  <Link
                    href="/organization/auth"
                    className="group relative bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md">Organization</span>
                    </div>
                    <div className="mt-5">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Rank & Assess Talent
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        View ranked candidates, upload custom organization recruitment rubrics, and review full evidence transcripts.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center text-xl font-bold text-blue-600 gap-2 group-hover:translate-x-2 transition-transform">
                      <span>Access Organization Portal</span>
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Key Platform Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>No Agora Agents</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Gradium Real-Time Voice</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Gemini Multi-Agent</span>
                </div>
              </div>
            </div>

            {/* Right Interactive AI Interview Visual Column */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-md bg-white p-4 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 relative">
                <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-slate-600 ml-2">EcoSphere Live Interview Session</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">AI Agent</span>
                </div>

                {/* Looping AI Avatar Visual */}
                <AiAvatarVideo
                  isSpeaking={true}
                  statusText="AI Interviewer assessing technical architecture and problem solving..."
                  className="w-full h-80"
                />

                {/* Simulated Conversation Bubble */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700 mb-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>AI Interviewer</span>
                  </div>
                  <p className="text-slate-700 italic">
                    &ldquo;Can you walk me through how you handled caching and latency optimizations in your distributed project?&rdquo;
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Project Explanation Section */}
      <section className="bg-slate-900 text-white py-24 border-t border-slate-800 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side: Interactive AI Avatar */}
            <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
              <div className="w-full max-w-lg bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-sm relative group hover:border-blue-500/50 transition-colors duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-purple-600/10 rounded-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="flex items-center justify-between px-2 pb-4 mb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-semibold text-slate-300 ml-3">EcoSphere AI Core</span>
                  </div>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                </div>

                {/* CSS Animated AI Avatar */}
                <div className="relative w-full h-[350px] flex items-center justify-center overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-700/50">
                  {/* Rotating rings */}
                  <div className="absolute w-[280px] h-[280px] border border-blue-500/20 rounded-full animate-[spin_8s_linear_infinite]"></div>
                  <div className="absolute w-[240px] h-[240px] border border-dashed border-purple-500/30 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
                  <div className="absolute w-[200px] h-[200px] border border-blue-400/10 rounded-full animate-[spin_6s_linear_infinite]"></div>
                  
                  {/* Glowing core */}
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                    <div className="absolute inset-2 bg-gradient-to-tr from-blue-600 to-purple-500 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.6)] animate-[bounce_3s_ease-in-out_infinite]"></div>
                    {/* Inner eye / core */}
                    <div className="absolute inset-1/4 bg-white/90 rounded-full shadow-inner flex items-center justify-center z-10">
                      <div className="w-6 h-6 bg-blue-900 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute w-4 h-4 bg-blue-950 rounded-full"></div>
                    </div>
                  </div>

                  {/* Soundwaves */}
                  <div className="absolute bottom-8 flex items-center gap-1.5 h-12">
                    {[...Array(9)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-blue-400 rounded-full opacity-80"
                        style={{
                          height: `${Math.max(20, Math.random() * 100)}%`,
                          animation: `pulse ${0.5 + Math.random()}s ease-in-out infinite alternate`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                   <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                     <Sparkles className="w-4 h-4" />
                     <span>Live Insight System</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 rounded-full w-3/4 animate-pulse"></div>
                   </div>
                   <p className="text-xs text-slate-400 mt-2 text-center">Processing behavioral cues...</p>
                </div>
              </div>
            </div>

            {/* Right Side: Text & Features */}
            <div className="order-1 lg:order-2 flex flex-col space-y-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
                  What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">EcoSphere</span>?
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                  EcoSphere is a state-of-the-art AI interview platform designed to bridge the gap between talented candidates and top organizations. By utilizing next-generation AI models, we deliver realistic, dynamic mock interviews and provide actionable, granular insights.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Natural Voice</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Seamless, low-latency conversational interviews with semantic barge-in capabilities.
                  </p>
                </div>
                
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Multi-Dimension</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Comprehensive feedback across Technical, Behavioural, PM, and Hiring dimensions.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
