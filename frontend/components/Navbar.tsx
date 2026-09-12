'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, LogOut, User, Building, Home, FileText, BarChart3 } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('ecosphere_email');
      const role = localStorage.getItem('ecosphere_role');
      setUserEmail(email);
      setUserRole(role);
    }
  }, [pathname]);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      router.push('/');
    }
  };

  const isInterviewPage = pathname.includes('/candidate/interview');

  if (isInterviewPage) {
    return (
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">EcoSphere</span>
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full animate-pulse">
              ● Live Interview
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            AI Multi-Agent Evaluation Active
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">EcoSphere</span>
            <span className="text-[10px] block font-semibold text-blue-600 -mt-1 tracking-wider uppercase">Interview Intelligence</span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {userEmail ? (
            <>
              {userRole === 'candidate' ? (
                <Link
                  href="/candidate/dashboard"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith('/candidate/dashboard')
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/organization/dashboard"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith('/organization/dashboard')
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  Leaderboard
                </Link>
              )}

              <div className="h-4 w-px bg-slate-200 mx-1"></div>

              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="truncate max-w-[140px]">{userEmail}</span>
              </div>

              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/candidate/auth"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Candidate Sign In
              </Link>
              <Link
                href="/organization/auth"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all"
              >
                Organization Portal
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
