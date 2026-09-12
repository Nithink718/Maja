from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Auth Schemas
class OTPRequest(BaseModel):
    email: EmailStr
    role: str = "candidate"  # "candidate" or "organization"

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str
    role: str = "candidate"
    full_name: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user_id: str
    email: str
    role: str
    full_name: Optional[str] = None
    candidate_id: Optional[str] = None
    organization_id: Optional[str] = None

# Candidate Profile Schemas
class CandidatePersonalUpdate(BaseModel):
    full_name: Optional[str] = None
    education: Optional[str] = None
    certifications: Optional[str] = None
    github_url: Optional[str] = None

class CandidateProfileResponse(BaseModel):
    candidate_id: str
    user_id: str
    email: str
    full_name: Optional[str] = None
    profile_photo_url: Optional[str] = None
    education: Optional[str] = None
    certifications: Optional[str] = None
    github_url: Optional[str] = None
    resume_url: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    github_analysis: Dict[str, Any] = {}
    stats: Dict[str, Any] = {}

# Interview Schemas
class InterviewCreate(BaseModel):
    company: str
    role: str
    domain: str
    number_of_questions: Optional[int] = 4
    difficulty: Optional[str] = "Medium"

class InterviewQuestionResponse(BaseModel):
    id: str
    question_order: int
    question_text: str
    category: str
    difficulty: str
    expected_topics: List[str] = []
    rationale: Optional[str] = None

class AnswerSubmit(BaseModel):
    question_id: str
    answer_text: str
    audio_url: Optional[str] = None
    duration_seconds: Optional[float] = 0.0

class SpeechAnswerRequest(BaseModel):
    question_id: str
    audio_base64: Optional[str] = None
    audio_url: Optional[str] = None

class IntegritySignal(BaseModel):
    signal_type: str  # "screen_share_lost", "camera_lost", "tab_blur", etc.
    details: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None

# Evaluation Schemas
class EvaluationDimension(BaseModel):
    score: float
    strengths: List[str] = []
    weaknesses: List[str] = []
    evidence: List[str] = []

class EvaluationReportResponse(BaseModel):
    interview_id: str
    candidate_name: Optional[str] = None
    candidate_photo: Optional[str] = None
    company: str
    role: str
    domain: str
    date: datetime
    overall_score: float
    technical: EvaluationDimension
    behavioural: EvaluationDimension
    product_manager: EvaluationDimension
    hiring_manager: EvaluationDimension
    summary: str
    recommendation: str
    strengths: List[str] = []
    weaknesses: List[str] = []
    question_feedback: List[Dict[str, Any]] = []
    transcripts: List[Dict[str, Any]] = []

# Organization Schemas
class OrgCandidateRankItem(BaseModel):
    candidate_id: str
    user_id: str
    candidate_name: str
    photo_url: Optional[str] = None
    role: str
    domain: str
    technical_score: float
    behavioural_score: float
    product_score: float
    hiring_manager_score: float
    overall_score: float
    interview_date: datetime
    interview_id: str
    status: str

# Verification Schemas
class VerificationCheckResult(BaseModel):
    camera_valid: bool
    camera_quality: str
    camera_notes: str
    mic_valid: bool
    mic_quality: str
    mic_notes: str
    screen_share_valid: bool
    screen_share_quality: str
    screen_share_notes: str
    overall_passed: bool
