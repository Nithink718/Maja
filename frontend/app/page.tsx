'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Mic, Headphones, BarChart2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5b36e5] rounded-xl flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-4-12v8m8-8v8M4 10v4m16-4v4" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">EchoSphere</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            AI ONLINE
          </div>
          <Link href="/dashboard" className="text-sm font-semibold hover:text-[#5b36e5] transition-colors">
            Dashboard
          </Link>
          <div className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-sm bg-white shadow-sm">
            AS
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left Column */}
        <div className="flex-1 px-8 py-16 lg:px-16 lg:py-24 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-8 bg-slate-300"></div>
            <span className="text-[#5b36e5] text-xs font-bold tracking-[0.2em] uppercase">
              Adaptive Intelligence, In Conversation
            </span>
          </div>

          <h1 className="text-6xl lg:text-[5.5rem] leading-[1.05] font-extrabold tracking-tight mb-8">
            Every answer<br />
            <span className="text-[#5b36e5]">shapes the</span><br />
            next<br />
            question.
          </h1>

          <p className="text-lg text-slate-500 max-w-xl mb-12 leading-relaxed">
            Voice-first interviews led by a coordinated AI panel. Adaptive questioning, real-time context, and evidence-backed feedback—built around how you think.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-16">
            <Link 
              href="/candidate/auth"
              className="group flex items-center justify-between gap-4 px-8 py-4 bg-[#5b36e5] text-white font-bold text-lg rounded-none shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all border-2 border-slate-900 w-full sm:w-auto"
            >
              <span>Are you a Candidate?</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/organization/auth"
              className="group flex items-center justify-between gap-4 px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-none border-2 border-slate-200 hover:border-slate-900 transition-colors w-full sm:w-auto"
            >
              <span>Are you an Organization?</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform -rotate-45" />
            </Link>
          </div>

          <div className="flex items-center gap-8 text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#5b36e5]" />
              <span>Encrypted voice & identity</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#5b36e5]" />
              <span>Adaptive in real time</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 bg-[#5b36e5] relative overflow-hidden flex flex-col justify-center p-8 lg:p-16">
          {/* Subtle concentric circles background */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] border-[0.5px] border-white/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] border-[0.5px] border-white/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] border-[0.5px] border-white/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-between text-white/70 text-xs font-bold tracking-widest uppercase mb-8">
              <span>Live Adaptive Panel</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                <span>Listening</span>
              </div>
            </div>

            {/* AI Panel Card */}
            <div className="bg-[#1a1a24] text-white border-2 border-[#1a1a24] shadow-[12px_12px_0px_0px_rgba(250,204,21,1)] p-8 relative">
              
              <div className="flex items-start gap-6 mb-12">
                <div className="w-16 h-16 rounded-full bg-[#5b36e5] flex items-center justify-center shrink-0 shadow-lg shadow-[#5b36e5]/40 border-4 border-[#1a1a24]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-white" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-4-8v4m8-4v4" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">
                    Alex • Technical Interviewer
                  </div>
                  <div className="text-2xl font-bold tracking-tight">
                    &ldquo;Let&apos;s follow that decision.&rdquo;
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <div className="text-xs font-bold tracking-wider text-yellow-400 uppercase mb-4">
                  System Design • Follow-up
                </div>
                <h3 className="text-4xl font-medium leading-tight">
                  How would your architecture change if traffic grew tenfold overnight?
                </h3>
              </div>

              {/* Panelists Bottom Row */}
              <div className="flex flex-wrap items-stretch gap-4">
                {/* Active Panelist */}
                <div className="bg-yellow-400 text-slate-900 p-4 border-2 border-yellow-400 flex flex-col gap-2 min-w-[120px]">
                  <div className="w-8 h-8 border-2 border-slate-900 flex items-center justify-center font-bold text-sm">
                    A
                  </div>
                  <div>
                    <div className="font-bold text-sm">Alex</div>
                    <div className="text-[10px] uppercase font-bold opacity-80 leading-tight">Technical<br/>Interviewer</div>
                  </div>
                </div>
                
                {/* Inactive Panelist */}
                <div className="border border-slate-700 text-white p-4 flex flex-col gap-2 min-w-[120px] opacity-75">
                  <div className="w-8 h-8 border border-white flex items-center justify-center font-bold text-sm">
                    M
                  </div>
                  <div>
                    <div className="font-bold text-sm">Maya</div>
                    <div className="text-[10px] uppercase font-bold opacity-60 leading-tight text-slate-400">Product<br/>Manager</div>
                  </div>
                </div>

                <div className="border border-slate-700 text-white p-4 flex flex-col gap-2 min-w-[120px] opacity-75">
                  <div className="w-8 h-8 border border-white flex items-center justify-center font-bold text-sm">
                    D
                  </div>
                  <div>
                    <div className="font-bold text-sm">Daniel</div>
                    <div className="text-[10px] uppercase font-bold opacity-60 leading-tight text-slate-400">Hiring<br/>Manager</div>
                  </div>
                </div>

                <div className="border border-slate-700 text-white p-4 flex flex-col gap-2 min-w-[120px] opacity-75">
                  <div className="w-8 h-8 border border-white flex items-center justify-center font-bold text-sm">
                    S
                  </div>
                  <div>
                    <div className="font-bold text-sm">Sophia</div>
                    <div className="text-[10px] uppercase font-bold opacity-60 leading-tight text-slate-400">Behavioral<br/>Interviewer</div>
                  </div>
                </div>

                <div className="border border-slate-700 text-white p-4 flex flex-col gap-2 min-w-[120px] opacity-75">
                  <div className="w-8 h-8 border border-white flex items-center justify-center font-bold text-sm">
                    J
                  </div>
                  <div>
                    <div className="font-bold text-sm">Jordan</div>
                    <div className="text-[10px] uppercase font-bold opacity-60 leading-tight text-slate-400">Customer /<br/>Role-play</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Strip */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          <div className="p-8 lg:p-12">
            <div className="flex items-center justify-between mb-8">
              <span className="text-[#5b36e5] font-bold text-sm">01</span>
              <Mic className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Adaptive voice interviews</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Questions evolve with every answer—not from a fixed script.
            </p>
          </div>

          <div className="p-8 lg:p-12">
            <div className="flex items-center justify-between mb-8">
              <span className="text-[#5b36e5] font-bold text-sm">02</span>
              <Headphones className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">A coordinated AI panel</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Distinct perspectives hand off in one continuous conversation.
            </p>
          </div>

          <div className="p-8 lg:p-12">
            <div className="flex items-center justify-between mb-8">
              <span className="text-[#5b36e5] font-bold text-sm">03</span>
              <BarChart2 className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Evidence-backed feedback</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Every score links to transcript evidence and practical next steps.
            </p>
          </div>

        </div>
      </section>

      {/* The Panel Section */}
      <section className="bg-[#1a1a24] text-white py-20 lg:py-32 border-b-8 border-[#5b36e5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="flex items-center gap-4 mb-16">
            <div className="h-px w-8 bg-slate-700"></div>
            <span className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase">
              The Panel
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-24">
            <h2 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
              Five perspectives.<br />
              <span className="text-yellow-400">One continuous interview.</span>
            </h2>
            <div className="flex items-end pb-4">
              <p className="text-slate-400 text-lg lg:text-xl leading-relaxed max-w-md">
                The right interviewer steps forward at the right moment, while shared context keeps every handoff seamless.
              </p>
            </div>
          </div>

          {/* Panelists Horizontally Spaced */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pt-8 border-t border-slate-800">
            
            <div className="flex flex-col gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-yellow-400 flex items-center justify-center text-slate-900 font-bold text-lg border border-yellow-400 transition-transform group-hover:-translate-y-1">
                A
              </div>
              <div>
                <div className="font-bold text-lg mb-1">Alex</div>
                <div className="text-sm font-semibold text-slate-500">Technical Interviewer</div>
              </div>
            </div>

            <div className="flex flex-col gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-transparent flex items-center justify-center text-white font-bold text-lg border border-slate-700 transition-transform group-hover:-translate-y-1 group-hover:border-white">
                M
              </div>
              <div>
                <div className="font-bold text-lg mb-1">Maya</div>
                <div className="text-sm font-semibold text-slate-500">Product Manager</div>
              </div>
            </div>

            <div className="flex flex-col gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-transparent flex items-center justify-center text-white font-bold text-lg border border-slate-700 transition-transform group-hover:-translate-y-1 group-hover:border-white">
                D
              </div>
              <div>
                <div className="font-bold text-lg mb-1">Daniel</div>
                <div className="text-sm font-semibold text-slate-500">Hiring Manager</div>
              </div>
            </div>

            <div className="flex flex-col gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-transparent flex items-center justify-center text-white font-bold text-lg border border-slate-700 transition-transform group-hover:-translate-y-1 group-hover:border-white">
                S
              </div>
              <div>
                <div className="font-bold text-lg mb-1">Sophia</div>
                <div className="text-sm font-semibold text-slate-500">Behavioral Interviewer</div>
              </div>
            </div>

            <div className="flex flex-col gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-transparent flex items-center justify-center text-white font-bold text-lg border border-slate-700 transition-transform group-hover:-translate-y-1 group-hover:border-white">
                J
              </div>
              <div>
                <div className="font-bold text-lg mb-1">Jordan</div>
                <div className="text-sm font-semibold text-slate-500">Customer / Role-play</div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
