'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const userId = searchParams.get('user_id');
    const candidateId = searchParams.get('candidate_id');
    const organizationId = searchParams.get('organization_id');

    if (token && role && email) {
      // Save session data
      localStorage.setItem('ecosphere_token', token);
      localStorage.setItem('ecosphere_user_id', userId || '');
      localStorage.setItem('ecosphere_email', email);
      localStorage.setItem('ecosphere_role', role);
      localStorage.setItem('ecosphere_name', name || (role === 'organization' ? 'Organization' : ''));

      if (role === 'candidate') {
        localStorage.setItem('ecosphere_candidate_id', candidateId || '');
        router.push('/candidate/dashboard');
      } else if (role === 'organization') {
        localStorage.setItem('ecosphere_org_id', organizationId || '');
        localStorage.setItem('ecosphere_org_name', name || 'Organization');
        router.push('/organization/dashboard');
      }
    } else {
      // Missing vital parameters, redirect to home
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <h2 className="text-xl font-semibold text-slate-800">Authenticating...</h2>
      <p className="text-slate-500 text-sm">Please wait while we log you in.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <Suspense fallback={<Loader2 className="w-10 h-10 text-blue-600 animate-spin" />}>
        <AuthCallbackHandler />
      </Suspense>
    </div>
  );
}
