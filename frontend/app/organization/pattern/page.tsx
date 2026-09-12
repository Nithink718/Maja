'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, Building2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function OrganizationPatternPage() {
  const router = useRouter();
  const [title, setTitle] = useState('Standard Engineering Rubric 2026');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<any>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF document containing your hiring criteria.');
      return;
    }

    setLoading(true);
    setError(null);

    const orgId = (typeof window !== 'undefined' ? localStorage.getItem('ecosphere_org_id') : null) || 'org-default';
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      const res = await api.uploadOrgPattern(orgId, formData);
      setParsedResult(res.data.pattern);
    } catch (err: any) {
      setError('Failed to upload and parse recruitment pattern PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          href="/organization/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leaderboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Custom Recruitment Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload Organization Hiring Pattern
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your recruitment rubric PDF. Gemini extracts focus areas, skill weights, and custom interview evaluation criteria.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Rubric / Pattern Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Backend Engineer Rubric"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Upload PDF Document
          </label>
          <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
            <UploadCloud className="w-10 h-10 text-indigo-600 mb-2" />
            <span className="text-sm font-bold text-slate-800">
              {file ? file.name : 'Click to Upload Hiring Rubric PDF'}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">Supports PDF documents up to 10MB</span>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gemini Parsing Pattern...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Parse & Register Pattern</span>
            </>
          )}
        </button>
      </form>

      {/* Structured Result Display */}
      {parsedResult && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Pattern Successfully Extracted & Grounded in AI</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Focus Areas:</span>
              <div className="flex flex-wrap gap-1.5">
                {(parsedResult.focus_areas || ['System Architecture', 'Clean Code']).map((a: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-800 font-semibold rounded-lg">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Special Evaluation Instructions:</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {parsedResult.special_instructions || 'Focus on candidate system design depth and architectural ownership.'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
