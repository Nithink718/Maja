'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  User,
  GraduationCap,
  Github,
  FileText,
  Award,
  TrendingUp,
  BarChart2,
  Calendar,
  ChevronRight,
  Code2,
  Users2,
  Briefcase,
  Layers,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '@/lib/api';

export default function CandidateDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cid = localStorage.getItem('ecosphere_candidate_id');
      const token = localStorage.getItem('ecosphere_token');
      if (!token) {
        router.push('/candidate/auth');
        return;
      }
      setCandidateId(cid);
      if (cid) {
        fetchDashboardData(cid);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchDashboardData = async (cid: string) => {
    try {
      setLoading(true);
      const res = await api.getCandidateProfile(cid);
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = profile?.stats || {
    interviews_attended: 0,
    avg_overall_score: 0.0,
    avg_technical_score: 0.0,
    avg_behavioural_score: 0.0,
    avg_pm_score: 0.0,
    avg_hm_score: 0.0,
    interview_history: [],
  };

  const history = stats.interview_history || [];

  // Prepare chart data
  const chartData = history.map((item: any, idx: number) => ({
    name: `Interview ${idx + 1}`,
    overall: item.overall_score,
    technical: item.technical_score,
    behavioural: item.behavioural_score,
    product: item.product_manager_score,
    hiring: item.hiring_manager_score,
    date: item.date,
    company: item.company,
    role: item.role,
  }));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading Candidate Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md overflow-hidden shrink-0 border-2 border-white">
            {profile?.profile_photo_url ? (
              <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{profile?.full_name?.charAt(0) || 'C'}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {profile?.full_name || 'Candidate'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                Active Candidate
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
              <span>{profile?.email}</span>
              {profile?.education && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    {profile.education}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Start Interview CTA */}
        <Link
          href="/candidate/personal-information"
          className="w-full md:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 text-sm group"
        >
          <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
          <span>Start Mock Interview</span>
        </Link>
      </div>

      {/* 4-Dimension Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Overall Score */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">Average Overall</span>
            <Award className="w-5 h-5 text-blue-200" />
          </div>
          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {stats.avg_overall_score > 0 ? stats.avg_overall_score : '—'}
            </div>
            <p className="text-[11px] text-blue-100 mt-0.5">Across {stats.interviews_attended} interview(s)</p>
          </div>
          <div className="text-[10px] text-blue-200 font-medium">Equal 4-Dimension Weighted Avg</div>
        </div>

        {/* Technical Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Technical</span>
            <Code2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.avg_technical_score > 0 ? stats.avg_technical_score : '—'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Architecture & Systems</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${stats.avg_technical_score}%` }}></div>
          </div>
        </div>

        {/* Behavioural Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Behavioural</span>
            <Users2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.avg_behavioural_score > 0 ? stats.avg_behavioural_score : '—'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Communication & STAR</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${stats.avg_behavioural_score}%` }}></div>
          </div>
        </div>

        {/* Product Manager Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Product (PM)</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.avg_pm_score > 0 ? stats.avg_pm_score : '—'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Metrics & Product Sense</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${stats.avg_pm_score}%` }}></div>
          </div>
        </div>

        {/* Hiring Manager Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Hiring Mgr</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.avg_hm_score > 0 ? stats.avg_hm_score : '—'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Culture Fit & Velocity</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: `${stats.avg_hm_score}%` }}></div>
          </div>
        </div>

      </div>

      {/* Charts & Profile Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Performance Trend Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Performance Evolution
              </h3>
              <p className="text-xs text-slate-500">Evaluation trajectory across all mock interviews</p>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="overall" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <BarChart2 className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No mock interview data recorded yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Complete your first mock interview to generate performance analytics and evidence-backed evaluation charts.
              </p>
              <Link
                href="/candidate/personal-information"
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Launch First Interview
              </Link>
            </div>
          )}
        </div>

        {/* Profile Details & Credentials Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Portfolio Dossier</span>
            <Link href="/candidate/personal-information" className="text-xs text-blue-600 hover:underline font-semibold">
              Edit
            </Link>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">Resume Status</span>
              {profile?.resume_url ? (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-medium">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Parsed & Grounded in AI</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 font-medium">
                  <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Resume Not Uploaded</span>
                </div>
              )}
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">GitHub Project</span>
              {profile?.github_url ? (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 font-mono hover:bg-slate-100 transition-colors truncate"
                >
                  <Github className="w-4 h-4 text-slate-700 shrink-0" />
                  <span className="truncate">{profile.github_url.replace('https://github.com/', '')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0" />
                </a>
              ) : (
                <span className="text-slate-400">No repository connected</span>
              )}
            </div>

            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1.5">Extracted Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.slice(0, 8).map((skill: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-md text-[11px]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Interviews History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Completed Mock Interviews</h3>
            <p className="text-xs text-slate-500">Review evaluation dossiers, evidence, and download PDF reports</p>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Company & Role</th>
                  <th className="px-6 py-3.5">Domain</th>
                  <th className="px-6 py-3.5 text-center">Technical</th>
                  <th className="px-6 py-3.5 text-center">Behavioural</th>
                  <th className="px-6 py-3.5 text-center">Product</th>
                  <th className="px-6 py-3.5 text-center">Hiring Mgr</th>
                  <th className="px-6 py-3.5 text-center font-bold text-blue-600">Overall</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item: any) => (
                  <tr key={item.interview_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div>
                        <span className="font-bold">{item.company}</span> — {item.role}
                      </div>
                      <span className="text-[11px] text-slate-400">{item.date}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.domain}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800">{item.technical_score}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800">{item.behavioural_score}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800">{item.product_manager_score}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800">{item.hiring_manager_score}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200">
                        {item.overall_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/candidate/report?id=${item.interview_id}`}
                        className="inline-flex items-center gap-1 text-blue-600 font-bold hover:text-blue-700 hover:underline"
                      >
                        <span>View Report</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            No mock interviews found in database. Click &ldquo;Start Mock Interview&rdquo; above to begin.
          </div>
        )}
      </div>

    </div>
  );
}
