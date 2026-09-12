'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileText,
  Github,
  GraduationCap,
  Award,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Code2
} from 'lucide-react';
import { api } from '@/lib/api';

export default function PersonalInformationPage() {
  const router = useRouter();
  const [candidateId, setCandidateId] = useState<string | null>(null);

  // Form States
  const [fullName, setFullName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploadedUrl, setPhotoUploadedUrl] = useState<string | null>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeParsedData, setResumeParsedData] = useState<any>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);

  const [githubUrl, setGithubUrl] = useState('');
  const [githubAnalysis, setGithubAnalysis] = useState<any>(null);
  const [isAnalyzingGithub, setIsAnalyzingGithub] = useState(false);

  const [degree, setDegree] = useState('Bachelor of Science in Computer Science');
  const [institution, setInstitution] = useState('Tech Institute of Technology');
  const [year, setYear] = useState('2024');

  const [certifications, setCertifications] = useState('AWS Certified Cloud Practitioner, Google Cloud Associate');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cid = localStorage.getItem('ecosphere_candidate_id');
      const storedName = localStorage.getItem('ecosphere_name') || '';
      if (!cid) {
        router.push('/candidate/auth');
        return;
      }
      setCandidateId(cid);
      setFullName(storedName);
      loadExistingData(cid);
    }
  }, []);

  const loadExistingData = async (cid: string) => {
    try {
      const res = await api.getCandidateProfile(cid);
      const data = res.data;
      if (data.full_name) setFullName(data.full_name);
      if (data.profile_photo_url) setPhotoUploadedUrl(data.profile_photo_url);
      if (data.education) {
        const parts = data.education.split(' | ');
        if (parts[0]) setDegree(parts[0]);
        if (parts[1]) setInstitution(parts[1]);
        if (parts[2]) setYear(parts[2]);
      }
      if (data.certifications) setCertifications(data.certifications);
      if (data.github_url) setGithubUrl(data.github_url);
      if (data.github_analysis && Object.keys(data.github_analysis).length > 0) {
        setGithubAnalysis(data.github_analysis);
      }
      if (data.skills && data.skills.length > 0) {
        setResumeParsedData({ skills: data.skills, summary: data.summary });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && candidateId) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));

      // Auto upload
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.uploadPhoto(candidateId, formData);
        setPhotoUploadedUrl(res.data.photo_url);
      } catch (err) {
        console.error('Photo upload failed:', err);
      }
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && candidateId) {
      const file = e.target.files[0];
      setResumeFile(file);
      setIsParsingResume(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await api.uploadResume(candidateId, formData);
        setResumeParsedData(res.data.parsed_data);
      } catch (err: any) {
        setError('Resume parsing failed. Please upload a valid PDF.');
      } finally {
        setIsParsingResume(false);
      }
    }
  };

  const handleAnalyzeGithub = async () => {
    if (!githubUrl.trim() || !candidateId) {
      setError('Please provide a valid GitHub repository URL.');
      return;
    }
    if (!githubUrl.includes('github.com/')) {
      setError('Must be a valid GitHub URL (e.g., https://github.com/facebook/react).');
      return;
    }

    setIsAnalyzingGithub(true);
    setError(null);

    const formData = new FormData();
    formData.append('github_url', githubUrl.trim());

    try {
      const res = await api.analyzeGitHub(candidateId, formData);
      setGithubAnalysis(res.data.analysis);
    } catch (err: any) {
      setError('Could not analyze GitHub repository. Please verify the URL.');
    } finally {
      setIsAnalyzingGithub(false);
    }
  };

  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId) return;

    // Check all 5 required fields
    if (!photoUploadedUrl && !photoFile) {
      setError('Profile photo is required before proceeding.');
      return;
    }
    if (!resumeParsedData && !resumeFile) {
      setError('Resume upload and AI parsing are required.');
      return;
    }
    if (!githubUrl.trim()) {
      setError('GitHub project URL is required.');
      return;
    }
    if (!degree.trim() || !institution.trim() || !year.trim()) {
      setError('Education details (Degree, Institution, Year) are required.');
      return;
    }
    if (!certifications.trim()) {
      setError('Certifications field is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const educationStr = `${degree} | ${institution} | ${year}`;
      await api.updatePersonalInfo(candidateId, {
        full_name: fullName,
        education: educationStr,
        certifications,
        github_url: githubUrl,
      });

      router.push('/candidate/interview-setup');
    } catch (err: any) {
      setError('Failed to save personal information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 6: Candidate Credentials</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Personal Information Portal</h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide your credentials so Gemini AI can calibrate interview intelligence to your real technical background.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveAndContinue} className="space-y-6">
        
        {/* 1. Profile Photo */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                1. Profile Photo <span className="text-red-500">*</span>
              </h2>
              <p className="text-xs text-slate-500">Will be featured on your live interview dossier & portfolio report</p>
            </div>
            {photoUploadedUrl && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
              {photoPreview || photoUploadedUrl ? (
                <img src={photoPreview || photoUploadedUrl || ''} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors">
                <UploadCloud className="w-4 h-4 text-slate-600" />
                <span>Choose Image (JPG, PNG, WebP)</span>
                <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
              </label>
              <p className="text-[11px] text-slate-400 mt-1.5">Max size: 5MB</p>
            </div>
          </div>
        </div>

        {/* 2. Resume Upload & Gemini Parsing */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                2. Resume (PDF / DOCX) <span className="text-red-500">*</span>
              </h2>
              <p className="text-xs text-slate-500">Gemini extracts your skills, experience, and projects in structured JSON</p>
            </div>
            {resumeParsedData && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Gemini Parsed
              </span>
            )}
          </div>

          <label className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
            <UploadCloud className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-bold text-slate-800">
              {resumeFile ? resumeFile.name : 'Click to Upload Resume Document'}
            </span>
            <span className="text-xs text-slate-500 mt-0.5">Supports PDF, DOC, DOCX</span>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
          </label>

          {isParsingResume && (
            <div className="flex items-center gap-2.5 p-3.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Gemini AI is parsing and extracting resume entities...</span>
            </div>
          )}

          {resumeParsedData && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Extracted Candidate Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(resumeParsedData.skills || ['Python', 'Full Stack', 'System Design']).map((s: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-md">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. GitHub Project Link & Gemini Repo Analysis */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Github className="w-5 h-5 text-blue-600" />
              3. GitHub Project Repository <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-slate-500">Provide your best GitHub project. Gemini analyzes technical depth for customized questions.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              required
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            <button
              type="button"
              onClick={handleAnalyzeGithub}
              disabled={isAnalyzingGithub || !githubUrl.trim()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isAnalyzingGithub ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Repo...</span>
                </>
              ) : (
                <>
                  <Code2 className="w-4 h-4" />
                  <span>Analyze Repo</span>
                </>
              )}
            </button>
          </div>

          {githubAnalysis && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{githubAnalysis.project_name || 'Repository Analyzed'}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                  Complexity: {githubAnalysis.complexity_score || 88}/100
                </span>
              </div>
              <p className="text-slate-600">{githubAnalysis.technical_depth_summary}</p>
            </div>
          )}
        </div>

        {/* 4. Structured Education */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              4. Education <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-slate-500">Degree, university, and graduation year</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Degree</label>
              <input
                type="text"
                required
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="B.Tech Computer Science"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Institution</label>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="University / Institute"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Year</label>
              <input
                type="text"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* 5. Certifications */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              5. Certifications <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-slate-500">List industry certifications or verified courses</p>
          </div>

          <textarea
            required
            rows={2}
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            placeholder="e.g. AWS Certified Solutions Architect, Kubernetes CKA"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        {/* Submit & Next CTA */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Credentials...</span>
              </>
            ) : (
              <>
                <span>Save & Continue to Interview Setup</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
