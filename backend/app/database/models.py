import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="candidate", index=True)  # candidate | organization | admin
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate = relationship("Candidate", back_populates="user", uselist=False, cascade="all, delete-orphan")
    organization = relationship("Organization", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    profile_photo_url = Column(String(500), nullable=True)
    education = Column(String(500), nullable=True)
    certifications = Column(Text, nullable=True)
    github_url = Column(String(500), nullable=True)
    resume_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="candidate")
    profile = relationship("CandidateProfile", back_populates="candidate", uselist=False, cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="candidate", cascade="all, delete-orphan")

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    org_name = Column(String(255), nullable=True)
    industry = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="organization")
    patterns = relationship("OrganizationPattern", back_populates="organization", cascade="all, delete-orphan")

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), unique=True, index=True)
    summary = Column(Text, nullable=True)
    skills = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    education_details = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    achievements = Column(JSON, default=list)
    github_analysis = Column(JSON, default=dict)
    raw_resume_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="profile")

class OrganizationPattern(Base):
    __tablename__ = "organization_patterns"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    title = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=True)
    structured_pattern = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="patterns")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), index=True)
    company = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False)
    domain = Column(String(100), nullable=False)
    status = Column(String(50), default="CREATED", index=True)  # CREATED, READY, IN_PROGRESS, COMPLETED, FAILED, CANCELLED
    number_of_questions = Column(Integer, default=4)
    difficulty = Column(String(50), default="Medium")
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    integrity_signals = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    candidate = relationship("Candidate", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan")
    transcripts = relationship("Transcript", back_populates="interview", cascade="all, delete-orphan")
    evaluation = relationship("EvaluationScore", back_populates="interview", uselist=False, cascade="all, delete-orphan")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    interview_id = Column(String(36), ForeignKey("interviews.id", ondelete="CASCADE"), index=True)
    question_order = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    category = Column(String(50), default="technical")  # technical, behavioural, product, hiring_manager, resume, opening
    difficulty = Column(String(50), default="Medium")
    expected_topics = Column(JSON, default=list)
    rationale = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    interview = relationship("Interview", back_populates="questions")
    answers = relationship("InterviewAnswer", back_populates="question", cascade="all, delete-orphan")

class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    question_id = Column(String(36), ForeignKey("interview_questions.id", ondelete="CASCADE"), index=True)
    interview_id = Column(String(36), ForeignKey("interviews.id", ondelete="CASCADE"), index=True)
    answer_text = Column(Text, nullable=False)
    audio_url = Column(String(500), nullable=True)
    duration_seconds = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("InterviewQuestion", back_populates="answers")

class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    interview_id = Column(String(36), ForeignKey("interviews.id", ondelete="CASCADE"), index=True)
    speaker = Column(String(20), nullable=False)  # "ai" | "candidate"
    message = Column(Text, nullable=False)
    sequence_number = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)

    interview = relationship("Interview", back_populates="transcripts")

class EvaluationScore(Base):
    __tablename__ = "evaluation_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    interview_id = Column(String(36), ForeignKey("interviews.id", ondelete="CASCADE"), unique=True, index=True)
    technical_score = Column(Float, nullable=False, default=0.0)
    behavioural_score = Column(Float, nullable=False, default=0.0)
    product_manager_score = Column(Float, nullable=False, default=0.0)
    hiring_manager_score = Column(Float, nullable=False, default=0.0)
    overall_score = Column(Float, nullable=False, default=0.0, index=True)
    summary = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    technical_feedback = Column(JSON, default=dict)
    behavioural_feedback = Column(JSON, default=dict)
    product_feedback = Column(JSON, default=dict)
    hiring_feedback = Column(JSON, default=dict)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    question_feedback = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    interview = relationship("Interview", back_populates="evaluation")

class OTPSession(Base):
    __tablename__ = "otp_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    email = Column(String(255), index=True, nullable=False)
    otp_code = Column(String(10), nullable=False)
    role = Column(String(50), default="candidate")
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class MediaRecord(Base):
    __tablename__ = "media_records"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    candidate_id = Column(String(36), nullable=True, index=True)
    interview_id = Column(String(36), nullable=True, index=True)
    media_type = Column(String(50), nullable=False)  # "verification", "interview_video", "photo", "resume", "org_pattern"
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, default=0)
    mime_type = Column(String(100), nullable=True)
    status = Column(String(50), default="uploaded")
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
