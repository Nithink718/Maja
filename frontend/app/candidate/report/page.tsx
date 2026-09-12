'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Download,
  ArrowLeft,
  Award,
  Code2,
  Users2,
  Layers,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Calendar,
  Building,
  ArrowRight,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const interviewId = searchParams.get('id') || (typeof window !== 'undefined' ? localStorage.getItem('ecosphere_current_interview_id') : null);
    if (interviewId) {
      fetchReportData(interviewId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchReportData = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.getReport(id);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report?.interview_id) return;
    setDownloading(true);
    try {
      const url = api.downloadPdfUrl(report.interview_id);
      window.open(url, '_blank');
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Generating Multi-Agent Evaluation Dossier...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Evaluation Dossier Not Found</h2>
          <p className="text-xs text-slate-500">Please take or select a completed interview from your dashboard.</p>
          <Link href="/candidate/dashboard" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const technical = report.technical || {};
  const behavioural = report.behavioural || {};
  const pm = report.product_manager || {};
  const hm = report.hiring_manager || {};

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
      
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <Link
          href="/candidate/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download Portfolio PDF</span>
          </button>
        </div>
      </div>

      {/* Candidate Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md overflow-hidden shrink-0 border-2 border-white">
            {report.candidate_photo ? (
              <img src={report.candidate_photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{report.candidate_name?.charAt(0) || 'C'}</span>
            )}
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 uppercase tracking-wider">
              Verified AI Evaluation Report
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {report.candidate_name}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-slate-700">{report.company}</span>
              <span>•</span>
              <span>{report.role}</span>
              <span>•</span>
              <span>{report.domain}</span>
            </p>
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md text-center shrink-0 w-full md:w-44">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100 block">Overall Score</span>
          <div className="text-4xl font-black mt-1 tracking-tight">
            {report.overall_score}<span className="text-lg font-bold text-blue-200">/100</span>
          </div>
          <span className="text-[10px] font-semibold text-blue-100 block mt-1">
            Recommendation: {report.recommendation}
          </span>
        </div>
      </div>

      {/* 4 Dimension Score Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Technical */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Technical</span>
            <Code2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{technical.score || 0}</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${technical.score || 0}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            System design, DSA, architectural trade-offs, and technical depth.
          </p>
        </div>

        {/* 2. Behavioural */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Behavioural</span>
            <Users2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{behavioural.score || 0}</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${behavioural.score || 0}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            STAR framework, conflict resolution, ownership, and team communication.
          </p>
        </div>

        {/* 3. Product Manager */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Product Manager</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{pm.score || 0}</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pm.score || 0}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            User empathy, problem framing, KPI metrics, and business trade-offs.
          </p>
        </div>

        {/* 4. Hiring Manager */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Hiring Manager</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{hm.score || 0}</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: `${hm.score || 0}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Learning agility, cultural alignment, career maturity, and leadership.
          </p>
        </div>

      </div>

      {/* Executive Summary & Recommendation */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Executive Evaluation Summary
          </h2>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
            Recommendation: {report.recommendation}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {report.summary}
        </p>
      </div>

      {/* Evidence-Backed Dimension Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Evidence-Backed Observations Across 4 Dimensions
        </h2>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">1. Technical Dimension ({technical.score}/100)</span>
              <span className="text-blue-600 font-semibold">Architecture & Engineering</span>
            </div>
            <div className="text-slate-600 italic">
              <b>Evidence:</b> {technical.evidence?.join(' ') || 'Candidate answered technical inquiries with clear system architecture.'}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">2. Behavioural Dimension ({behavioural.score}/100)</span>
              <span className="text-indigo-600 font-semibold">Communication & Collaboration</span>
            </div>
            <div className="text-slate-600 italic">
              <b>Evidence:</b> {behavioural.evidence?.join(' ') || 'Demonstrated mature conflict resolution and team ownership.'}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">3. Product Manager Dimension ({pm.score}/100)</span>
              <span className="text-emerald-600 font-semibold">Product & User Empathy</span>
            </div>
            <div className="text-slate-600 italic">
              <b>Evidence:</b> {pm.evidence?.join(' ') || 'Addressed latency impact on user conversion and experience.'}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">4. Hiring Manager Dimension ({hm.score}/100)</span>
              <span className="text-purple-600 font-semibold">Culture & Trajectory</span>
            </div>
            <div className="text-slate-600 italic">
              <b>Evidence:</b> {hm.evidence?.join(' ') || 'High ownership, accountability, and strong cultural alignment.'}
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Key Strengths Identified
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4">
            {(report.strengths || ['Technical proficiency', 'Clear articulation']).map((s: string, idx: number) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Areas for Continuous Growth
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4">
            {(report.weaknesses || ['Provide more quantitative KPI metrics']).map((w: string, idx: number) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question by Question Dossier */}
      {report.question_feedback && report.question_feedback.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            Question-by-Question Deep Dive & Evaluation
          </h2>

          <div className="space-y-4">
            {report.question_feedback.map((q: any, idx: number) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-700 uppercase tracking-wider text-[11px]">
                    Question {q.question_order || idx + 1}
                  </span>
                  <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                    Score Impact: {q.score_impact || '+4'}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-900 block text-xs mb-0.5">Prompt:</span>
                  <p className="text-slate-800 italic">{q.question}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-900 block text-xs mb-0.5">Candidate Spoken Response:</span>
                  <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-100">{q.answer}</p>
                </div>

                <div className="text-[11px] text-slate-600">
                  <b>Evaluator Assessment:</b> {q.technical_observation || q.evidence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <Link
          href="/candidate/dashboard"
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 text-xs"
        >
          <Download className="w-4 h-4" />
          <span>Download Portfolio PDF</span>
        </button>
      </div>

    </div>
  );
}

export default function InterviewReportPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
