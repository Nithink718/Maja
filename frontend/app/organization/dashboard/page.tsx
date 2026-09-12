'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Users,
  Award,
  Upload,
  Filter,
  ArrowUpDown,
  Search,
  ChevronRight,
  Sparkles,
  Loader2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { api } from '@/lib/api';

export default function OrganizationDashboardPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('overall_score');
  const [order, setOrder] = useState('desc');
  const [roleFilter, setRoleFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRankings();
  }, [sortBy, order, roleFilter, domainFilter]);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const params: any = { sort_by: sortBy, order };
      if (roleFilter !== 'All') params.role = roleFilter;
      if (domainFilter !== 'All') params.domain = domainFilter;

      const res = await api.getRankings(params);
      setCandidates(res.data);
    } catch (err) {
      console.error('Failed to fetch rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.candidate_name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* Top Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Organization Talent Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Leaderboard & Rankings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-agent evaluated candidate rankings sorted by independent 4-dimension performance.
          </p>
        </div>

        {/* Upload Pattern CTA */}
        <Link
          href="/organization/pattern"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 text-xs shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Recruitment Rubric (PDF)</span>
        </Link>
      </div>

      {/* Sorting & Filter Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, role, or domain..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none"
            >
              <option value="overall_score">Overall Score</option>
              <option value="technical_score">Technical Score</option>
              <option value="behavioural_score">Behavioural Score</option>
              <option value="product_score">Product Manager Score</option>
              <option value="hiring_manager_score">Hiring Manager Score</option>
              <option value="interview_date">Interview Date</option>
            </select>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Product Manager">Product Manager</option>
          </select>
        </div>

      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Loading Candidate Rankings...</p>
          </div>
        ) : filteredCandidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-center">Rank</th>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Target Role & Domain</th>
                  <th className="px-6 py-4 text-center">Technical</th>
                  <th className="px-6 py-4 text-center">Behavioural</th>
                  <th className="px-6 py-4 text-center">Product</th>
                  <th className="px-6 py-4 text-center">Hiring Mgr</th>
                  <th className="px-6 py-4 text-center font-bold text-blue-600">Overall</th>
                  <th className="px-6 py-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((c, idx) => (
                  <tr key={c.interview_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 text-center font-bold text-slate-400">
                      {idx === 0 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center mx-auto text-[11px]">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-extrabold flex items-center justify-center mx-auto text-[11px]">
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-extrabold flex items-center justify-center mx-auto text-[11px]">
                          3
                        </span>
                      ) : (
                        <span>#{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center overflow-hidden shrink-0 text-xs">
                          {c.photo_url ? (
                            <img src={c.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{c.candidate_name?.charAt(0) || 'C'}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{c.candidate_name}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.interview_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 block">{c.role}</span>
                      <span className="text-[11px] text-slate-500">{c.domain}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800">{c.technical_score}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800">{c.behavioural_score}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800">{c.product_score}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-800">{c.hiring_manager_score}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200">
                        {c.overall_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/organization/candidate/${c.interview_id}`}
                        className="inline-flex items-center gap-1 text-blue-600 font-bold hover:text-blue-700 hover:underline"
                      >
                        <span>View Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs">
            No completed candidate interviews found. Candidates who complete mock interviews will automatically be ranked here.
          </div>
        )}
      </div>

    </div>
  );
}
