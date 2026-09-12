# 🚀 Maja (Ecosphere) - AI-Powered Interview Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![AI](https://img.shields.io/badge/AI-Anam%20%7C%20Gemini-orange)

Maja is a next-generation AI-powered mock interview platform that revolutionizes how candidates prepare for jobs and how organizations screen talent. By combining **Anam AI** for hyper-realistic video avatars and **Google Gemini** for adaptive, intelligent questioning, Maja provides a dynamic and stress-free interview experience.

---

## ✨ Key Features
- **Real-Time Video AI Avatars**: Powered by the `@anam-ai/js-sdk`, offering a human-like interviewer experience with synchronized lip movements and emotion.
- **Adaptive AI Inquiries**: Uses Google Gemini to analyze candidate responses and generate context-aware follow-up questions dynamically.
- **Semantic Barge-In & VAD**: Uses browser SpeechRecognition with voice activity detection, allowing candidates to interrupt the AI seamlessly.
- **Role-Based Dashboards**: Distinct interfaces for **Candidates** (to track performance and reports) and **Organizations** (to manage roles and review candidates).
- **Live Transcripts & Analysis**: Synchronized real-time interview transcripts.

---

## 🏗️ Architecture

Below is the high-level architecture diagram demonstrating how the frontend, backend, and external AI services interact.

```mermaid
graph TD
    subgraph Frontend [Next.js Client]
        UI[User Interface]
        AnamClient[Anam JS SDK]
        Speech[Web Speech API]
    end

    subgraph Backend [FastAPI Server]
        API[REST API]
        Gemini[Gemini Service]
        DB[(Database)]
    end

    subgraph External Services
        AnamAPI[Anam AI Cloud]
        GoogleAI[Google Gemini Cloud]
    end

    UI <--> |HTTP Requests| API
    UI <--> |WebRTC Video/Audio| AnamClient
    Speech --> |Transcribed Text| UI
    
    AnamClient <--> |WebRTC & TTS| AnamAPI
    API <--> |Prompts & Completions| Gemini
    Gemini <--> |API Calls| GoogleAI
    
    API <--> |Read/Write| DB
```

---

## 🔄 Interview Flow

```mermaid
sequenceDiagram
    participant C as Candidate
    participant UI as Frontend (React)
    participant A as Anam AI Avatar
    participant B as Backend (FastAPI)
    participant G as Gemini AI

    C->>UI: Start Interview
    UI->>B: Request first question
    B->>G: Generate question based on role/domain
    G-->>B: Question generated
    B-->>UI: Return Question Text
    
    UI->>A: Stream text chunk to Anam SDK
    A-->>C: Speaks question (Video + Audio)
    
    C->>UI: Candidate answers (Microphone)
    UI->>UI: Speech-to-Text conversion
    UI->>B: Submit Answer
    B->>G: Analyze answer & generate next question
    G-->>B: Analysis & New Question
    B-->>UI: Return New Question Text
    
    Note over C, G: Loop continues until interview completes
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Lucide Icons
- **Backend**: Python, FastAPI, Uvicorn
- **AI & Integrations**: 
  - [Anam AI](https://anam.ai/) (Real-time conversational avatars)
  - [Google Gemini](https://ai.google.dev/) (LLM for adaptive reasoning)
  - Web Speech API (Browser-native STT)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Anam AI API Key
- Google Gemini API Key

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# Add your environment variables in backend/.env
# GEMINI_API_KEY=your_key

uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install

# Add your environment variables in frontend/.env.local if any
npm run dev
```

The application will be available at `http://localhost:3000`.

---
*Built with ❤️ for the future of interviewing.*
