# Walkthrough - EcoSphere AI Interview & Evaluation Platform

EcoSphere is a production-style, full-stack AI mock interview and candidate evaluation platform built with Google Gemini, Gradium voice/STT/TTS/interruption intelligence, Next.js 14 App Router (TypeScript, TailwindCSS Light Theme), FastAPI, and PostgreSQL/Supabase architecture.

---

## 1. Access & Running Services

| Service | Port / URL | Status | Description |
| :--- | :--- | :--- | :--- |
| **Main User Application (Unified Frontend)** | **[http://localhost:3000](http://localhost:3000)** | **ONLINE** | Next.js 14 Single Entry Point for all Candidate & Organization journeys |
| **FastAPI Backend Service** | **[http://127.0.0.1:8000](http://127.0.0.1:8000)** | **ONLINE** | REST APIs, Gemini reasoning engine, Gradium voice pipeline, DB |
| **Backend API Documentation** | **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** | **ONLINE** | Interactive Swagger OpenAPI UI |

---

## 2. Key Accomplishments & Architecture

### A. Zero Agora Agents Dependency
- Real-time voice interaction, interruption detection, candidate barge-in, and video interviewer visual agents are powered strictly by **Google Gemini** (reasoning & multi-agent evaluators) and **Gradium** (speech-to-text, text-to-speech, semantic VAD).

### B. Complete Candidate Journey
1. **Landing Page (`/`)**: EcoSphere branding, value proposition, "Are you a? Candidate / Organization" cards, and continuous looping AI interviewer video avatar visual.
2. **Authentication (`/candidate/auth`)**: Email sign-in / sign-up with server-side 6-digit OTP generation, expiration, rate-limiting, and development auto-fill support (`123456`).
3. **Candidate Dashboard (`/candidate/dashboard`)**: Connected to database metrics: total interviews attended, 4-dimension average scores (Technical, Behavioural, PM, Hiring Manager), Overall average, Recharts score trend chart, past interview history, and "Start Mock Interview" CTA.
4. **Personal Information Portal (`/candidate/personal-information`)**:
   - Profile photo upload (JPG/PNG/WebP).
   - Resume upload (PDF/DOCX) with real-time Gemini parsing of skills, experience, and projects.
   - GitHub project URL validation + GitHub REST API & Gemini technical depth analysis.
   - Structured education (Degree, Institution, Year) & Certifications.
5. **Interview Setup (`/candidate/interview-setup`)**: Predefined selectable choices for Company (Google, Microsoft, Amazon, Meta, etc.), Role (Software Engineer, Full Stack, PM, etc.), Domain (Software Development, AI/ML, Cloud, etc.), and Summary Card.
6. **Interview Terms (`/candidate/terms`)**: Guidelines, barge-in rules, duration, and mandatory acceptance checkbox.
7. **System Access Check (`/candidate/access-check`)**: Live browser permission checks for Camera, Microphone, and Screen share with video previews.
8. **Verification Portal (`/candidate/verification`)**: 30-second test question ("What is your favourite colour?") with browser MediaRecorder audio/video capture and volume visualizer.
9. **Verification Results (`/candidate/verification-results`)**: Stream quality checks (Camera, Mic, Screen Share) + "Start Live AI Interview" CTA.
10. **Actual AI Interview (`/candidate/interview`)**:
    - **Left Area**: Visible AI Interviewer Avatar agent with speaking waveforms, real-time TTS audio playback, and semantic VAD barge-in interruption.
    - **Right Area**: Synchronized live transcript panel (AI vs Candidate, timestamps).
    - **Bottom Controls**: Timer, question counter ("Question X of N"), media monitors, and End Interview button.
11. **Evaluation Portfolio Report (`/candidate/report`)**:
    - Overall Score (0-100) + 4 independent dimension cards (Technical, Behavioural, Product Manager, Hiring Manager).
    - Evidence-backed critique linking candidate quotes to evaluation criteria.
    - Question-by-question review with candidate answers, evaluator observations, and score impact.
    - Professional downloadable PDF report and "Go to Dashboard" button which updates dashboard analytics.

### C. Complete Organization Journey
1. **Organization Auth (`/organization/auth`)**: Organization OTP email sign-in.
2. **Organization Dashboard (`/organization/dashboard`)**: Ranked candidate leaderboard sorted by Overall Score (highest to lowest), with multi-column sorting (Technical, Behavioural, PM, Hiring Manager, Date) and role/domain filters.
3. **Candidate Deep-Dive Dossier (`/organization/candidate/[id]`)**: Full candidate report with resume credentials, GitHub project analysis, scores, evidence, and transcripts.
4. **Recruitment Rubric Upload (`/organization/pattern`)**: Upload organization interview pattern PDF with structured Gemini criteria extraction.

---

## 3. Environment Variables & `REDIRECTED` Placeholders

All secret keys in `backend/.env` and `.env.example` are configured with `REDIRECTED` placeholders as requested:

```env
# AI & Reasoning (Google Gemini)
GEMINI_API_KEY=REDIRECTED
GEMINI_MODEL=gemini-1.5-flash

# Speech & Interruption (Gradium)
GRADIUM_API_KEY=REDIRECTED
GRADIUM_API_URL=https://api.gradium.ai/v1

# GitHub REST API
GITHUB_TOKEN=REDIRECTED

# Supabase / PostgreSQL Database
SUPABASE_URL=REDIRECTED
SUPABASE_PUBLISHABLE_KEY=REDIRECTED
SUPABASE_SERVICE_ROLE_KEY=REDIRECTED
DATABASE_URL=REDIRECTED

# Email OTP Service
EMAIL_API_KEY=REDIRECTED
EMAIL_SENDER=noreply@ecosphere.ai
```

> [!NOTE]
> Every service (`GeminiService`, `GradiumService`, `GitHubService`, `EmailService`, `DatabaseSession`) includes seamless development mock adapters. When keys are set to `REDIRECTED`, the platform runs smoothly locally out of the box. When you replace `REDIRECTED` with real credentials, the application automatically switches to live third-party APIs with zero code changes required.

---

## 4. Verification & Testing Results

- **Automated E2E Suite (`test_e2e.py`)**: 13/13 tests passed covering OTP authentication, profile updates, interview creation, clock start, adaptive question generation, candidate answer submission, 4-dimension evaluation, report retrieval, and organization ranking leaderboard.
- **Frontend Build**: `next build` compiled all 17 routes with 0 TypeScript/JSX errors.
- **Backend Startup**: FastAPI server initialized with automatic schema creation on SQLite/PostgreSQL.
