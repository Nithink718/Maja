'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Building, Briefcase, Layers, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

const PREDEFINED_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Apple',
  'Netflix',
  'TCS',
  'Infosys',
  'Wipro',
  'Accenture',
  'Deloitte',
  'Uber',
  'Stripe',
  'Airbnb',
];

const PREDEFINED_ROLES = [
  'Software Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Product Manager',
  'Data Analyst',
];

const PREDEFINED_DOMAINS = [
  'Software Development',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Web Development',
  'Backend Engineering',
  'Cloud Computing',
  'Cybersecurity',
  'Product Management',
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const [candidateId, setCandidateId] = useState<string | null>(null);

  const [company, setCompany] = useState(PREDEFINED_COMPANIES[0]);
  const [role, setRole] = useState(PREDEFINED_ROLES[0]);
  const [domain, setDomain] = useState(PREDEFINED_DOMAINS[0]);
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(4);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cid = localStorage.getItem('ecosphere_candidate_id');
      if (!cid) {
        router.push('/candidate/auth');
        return;
      }
      setCandidateId(cid);
    }
  }, []);

  const handleProceed = async () => {
    if (!candidateId) return;

    setLoading(true);
    try {
      // Create Interview Session in Backend
      const res = await api.createInterview(candidateId, {
        company,
        role,
        domain,
        number_of_questions: numQuestions,
        difficulty,
      });

      const interviewId = res.data.interview_id;
      localStorage.setItem('ecosphere_current_interview_id', interviewId);
      localStorage.setItem('ecosphere_company', company);
      localStorage.setItem('ecosphere_role_target', role);
      localStorage.setItem('ecosphere_domain', domain);

      router.push('/candidate/terms');
    } catch (err) {
      console.error('Failed to create interview:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 2 of 6: Interview Calibration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Interview Setup</h1>
        <p className="text-sm text-slate-500 mt-1">
          Select target company, role, and domain. AI personas calibrate questions and evaluation rubrics accordingly.
        </p>
      </div>

      {/* Selectable Dropdowns Grid */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Company Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Target Company</span>
          </label>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
          >
            {PREDEFINED_COMPANIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Target Role</span>
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
          >
            {PREDEFINED_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Domain Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Target Engineering Domain</span>
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
          >
            {PREDEFINED_DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 sm:p-8 rounded-3xl border border-blue-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>Interview Configuration Summary</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Company</span>
            <span className="text-base font-extrabold text-slate-900">{company}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Role</span>
            <span className="text-base font-extrabold text-slate-900">{role}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Domain</span>
            <span className="text-base font-extrabold text-slate-900">{domain}</span>
          </div>
        </div>
      </div>

      {/* Go to Interview Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleProceed}
          disabled={loading}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <span>Go to Interview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
