'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Award,
  Code2,
  Users2,
  Layers,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

export default function OrganizationCandidateDossierPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params?.id as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (interviewId) {
      fetchCandidateDossier(interviewId);
    }
  }, [interviewId]);

  const fetchCandidateDossier = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.getReport(id);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load candidate dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!interviewId) return;
    const url = api.downloadPdfUrl(interviewId);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading Candidate Evaluation Dossier...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Candidate Dossier Not Found</h2>
          <Link href="/organization/dashboard" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold">
            Back to Leaderboard
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
      
      {/* Back button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <Link
          href="/organization/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Leaderboard</span>
        </Link>

        <button
          onClick={handleDownloadPdf}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Candidate Dossier PDF</span>
        </button>
      </div>

      {/* Candidate Profile Summary */}
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
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200 uppercase tracking-wider">
              Organization Review Dossier
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

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md text-center shrink-0 w-full md:w-44">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100 block">Overall Score</span>
          <div className="text-4xl font-black mt-1 tracking-tight">
            {report.overall_score}<span className="text-lg font-bold text-blue-200">/100</span>
          </div>
          <span className="text-[10px] font-semibold text-blue-100 block mt-1">
            {report.recommendation}
          </span>
        </div>
      </div>

      {/* 4 Dimension Score Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Technical</span>
            <Code2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{technical.score || 0}</div>
          <p className="text-[11px] text-slate-500">System architecture & problem solving</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Behavioural</span>
            <Users2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{behavioural.score || 0}</div>
          <p className="text-[11px] text-slate-500">Communication & conflict resolution</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Product (PM)</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{pm.score || 0}</div>
          <p className="text-[11px] text-slate-500">Product thinking & metric clarity</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Hiring Mgr</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{hm.score || 0}</div>
          <p className="text-[11px] text-slate-500">Culture alignment & trajectory</p>
        </div>
      </div>

      {/* Why candidate received score (Evidence) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Why Candidate Received This Score (Direct Evidence)
        </h2>
        
        <div className="space-y-3 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <b>Technical Evidence:</b> {technical.evidence?.join(' ') || 'Sound engineering justification.'}
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <b>Behavioural Evidence:</b> {behavioural.evidence?.join(' ') || 'Effective communication.'}
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <b>Product Manager Evidence:</b> {pm.evidence?.join(' ') || 'User experience focus.'}
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <b>Hiring Manager Evidence:</b> {hm.evidence?.join(' ') || 'High ownership.'}
          </div>
        </div>
      </div>

      {/* Full Transcript Review for Org */}
      {report.transcripts && report.transcripts.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Full Interview Conversation Transcript
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {report.transcripts.map((t: any, idx: number) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                  t.speaker === 'ai'
                    ? 'bg-blue-50/70 border border-blue-100 text-slate-800'
                    : 'bg-slate-100 border border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[10px] tracking-wider uppercase">
                  <span className={t.speaker === 'ai' ? 'text-blue-700' : 'text-slate-700'}>
                    {t.speaker === 'ai' ? 'AI Interviewer' : report.candidate_name}
                  </span>
                  <span className="text-slate-400 font-normal">{t.timestamp}</span>
                </div>
                <p className="leading-relaxed">{t.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
