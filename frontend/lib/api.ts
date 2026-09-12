import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ecosphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  // Auth
  requestOTP: (email: string, role: string = 'candidate') =>
    apiClient.post('/auth/request-otp', { email, role }),
  verifyOTP: (email: string, otp_code: string, role: string = 'candidate', full_name?: string) =>
    apiClient.post('/auth/verify-otp', { email, otp_code, role, full_name }),

  // Candidates
  getCandidateProfile: (candidateId: string) =>
    apiClient.get(`/candidates/profile/${candidateId}`),
  updatePersonalInfo: (candidateId: string, data: any) =>
    apiClient.post(`/candidates/update-personal/${candidateId}`, data),
  uploadPhoto: (candidateId: string, formData: FormData) =>
    apiClient.post(`/candidates/upload-photo/${candidateId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadResume: (candidateId: string, formData: FormData) =>
    apiClient.post(`/candidates/upload-resume/${candidateId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeGitHub: (candidateId: string, formData: FormData) =>
    apiClient.post(`/candidates/analyze-github/${candidateId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Interviews
  createInterview: (candidateId: string, data: any) =>
    apiClient.post(`/interviews/create/${candidateId}`, data),
  startInterview: (interviewId: string) =>
    apiClient.post(`/interviews/start/${interviewId}`),
  getNextQuestion: (interviewId: string) =>
    apiClient.get(`/interviews/${interviewId}/next-question`),
  submitAnswer: (interviewId: string, data: any) =>
    apiClient.post(`/interviews/${interviewId}/answer`, data),
  getTranscripts: (interviewId: string) =>
    apiClient.get(`/interviews/${interviewId}/transcripts`),
  completeInterview: (interviewId: string) =>
    apiClient.post(`/interviews/${interviewId}/complete`),
  getReport: (interviewId: string) =>
    apiClient.get(`/interviews/${interviewId}/report`),
  downloadPdfUrl: (interviewId: string) =>
    `${API_BASE_URL}/interviews/${interviewId}/download-pdf`,

  // Media & Verification
  verificationCheck: (formData: FormData) =>
    apiClient.post('/media/verification-check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Organization
  getRankings: (params?: any) =>
    apiClient.get('/organizations/rankings', { params }),
  uploadOrgPattern: (orgId: string, formData: FormData) =>
    apiClient.post(`/organizations/upload-pattern/${orgId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
