from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.database.models import (
    Candidate, CandidateProfile, Interview, InterviewQuestion,
    InterviewAnswer, Transcript, EvaluationScore
)
from app.schemas.schemas import (
    InterviewCreate, InterviewQuestionResponse, AnswerSubmit,
    EvaluationReportResponse, IntegritySignal
)
from app.services.gemini_service import gemini_service
from app.services.gradium_service import gradium_service
from app.services.pdf_service import pdf_service

router = APIRouter(prefix="/interviews", tags=["interviews"])

@router.post("/create/{candidate_id}")
async def create_interview(
    candidate_id: str,
    payload: InterviewCreate,
    db: AsyncSession = Depends(get_db)
):
    """Initialize a new mock interview session."""
    q = select(Candidate).where(Candidate.id == candidate_id)
    res = await db.execute(q)
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    interview = Interview(
        candidate_id=cand.id,
        company=payload.company,
        role=payload.role,
        domain=payload.domain,
        number_of_questions=payload.number_of_questions or 4,
        difficulty=payload.difficulty or "Medium",
        status="CREATED"
    )
    db.add(interview)
    await db.commit()
    await db.refresh(interview)

    return {
        "success": True,
        "interview_id": interview.id,
        "company": interview.company,
        "role": interview.role,
        "domain": interview.domain,
        "number_of_questions": interview.number_of_questions
    }

@router.post("/start/{interview_id}")
async def start_interview(interview_id: str, db: AsyncSession = Depends(get_db)):
    """Start interview clock and set status to IN_PROGRESS."""
    q = select(Interview).where(Interview.id == interview_id)
    res = await db.execute(q)
    interview = res.scalars().first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    interview.status = "IN_PROGRESS"
    interview.start_time = datetime.utcnow()
    await db.commit()

    return {"success": True, "status": interview.status, "start_time": interview.start_time}

@router.get("/{interview_id}/next-question")
async def get_next_question(interview_id: str, db: AsyncSession = Depends(get_db)):
    """Generate or retrieve next adaptive question using Gemini + Gradium voice."""
    q = select(Interview).options(
        selectinload(Interview.questions).selectinload(InterviewQuestion.answers),
        selectinload(Interview.candidate).selectinload(Candidate.profile)
    ).where(Interview.id == interview_id)

    res = await db.execute(q)
    interview = res.scalars().first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    existing_questions = sorted(interview.questions, key=lambda x: x.question_order)
    current_count = len(existing_questions)

    # Check if we already have an unanswered question
    if current_count > 0:
        latest = existing_questions[-1]
        if not latest.answers:
            tts_res = await gradium_service.text_to_speech(latest.question_text)
            return {
                "question": {
                    "id": latest.id,
                    "question_order": latest.question_order,
                    "question_text": latest.question_text,
                    "category": latest.category,
                    "difficulty": latest.difficulty,
                    "total_questions": interview.number_of_questions
                },
                "tts": tts_res,
                "is_last_question": latest.question_order >= interview.number_of_questions
            }

    # Check if interview question limit reached
    if current_count >= interview.number_of_questions:
        return {"completed": True, "message": "All interview questions have been answered."}

    # Prepare context for Gemini
    next_order = current_count + 1
    cand_profile = {}
    github_analysis = {}
    if interview.candidate and interview.candidate.profile:
        prof = interview.candidate.profile
        cand_profile = {
            "skills": prof.skills or [],
            "experience": prof.experience or [],
            "education": prof.education_details or []
        }
        github_analysis = prof.github_analysis or {}

    previous_qa = []
    for q_item in existing_questions:
        ans_text = q_item.answers[0].answer_text if q_item.answers else ""
        previous_qa.append({
            "order": q_item.question_order,
            "question": q_item.question_text,
            "answer": ans_text
        })

    # Generate question with Gemini
    q_data = await gemini_service.generate_interview_question(
        company=interview.company,
        role=interview.role,
        domain=interview.domain,
        question_order=next_order,
        total_questions=interview.number_of_questions,
        candidate_profile=cand_profile,
        github_analysis=github_analysis,
        previous_qa=previous_qa
    )

    # Save question to DB
    new_q = InterviewQuestion(
        interview_id=interview.id,
        question_order=next_order,
        question_text=q_data.get("question", "Could you please explain your approach?"),
        category=q_data.get("category", "technical"),
        difficulty=q_data.get("difficulty", "Medium"),
        expected_topics=q_data.get("expected_topics", []),
        rationale=q_data.get("rationale", "")
    )
    db.add(new_q)

    # Add AI speech transcript entry
    transcript_item = Transcript(
        interview_id=interview.id,
        speaker="ai",
        message=new_q.question_text,
        sequence_number=len(interview.questions) * 2 + 1,
        timestamp=datetime.utcnow()
    )
    db.add(transcript_item)
    await db.commit()
    await db.refresh(new_q)

    # Synthesize audio with Gradium
    tts_res = await gradium_service.text_to_speech(new_q.question_text)

    return {
        "question": {
            "id": new_q.id,
            "question_order": new_q.question_order,
            "question_text": new_q.question_text,
            "category": new_q.category,
            "difficulty": new_q.difficulty,
            "total_questions": interview.number_of_questions
        },
        "tts": tts_res,
        "is_last_question": new_q.question_order >= interview.number_of_questions
    }

@router.post("/{interview_id}/answer")
async def submit_answer(
    interview_id: str,
    payload: AnswerSubmit,
    db: AsyncSession = Depends(get_db)
):
    """Submit candidate answer text and record live transcript."""
    q = select(InterviewQuestion).where(InterviewQuestion.id == payload.question_id)
    res = await db.execute(q)
    question = res.scalars().first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    answer = InterviewAnswer(
        question_id=question.id,
        interview_id=interview_id,
        answer_text=payload.answer_text.strip(),
        audio_url=payload.audio_url,
        duration_seconds=payload.duration_seconds or 0.0
    )
    db.add(answer)

    # Add Candidate transcript entry
    cand_transcript = Transcript(
        interview_id=interview_id,
        speaker="candidate",
        message=payload.answer_text.strip(),
        sequence_number=question.question_order * 2,
        timestamp=datetime.utcnow()
    )
    db.add(cand_transcript)
    await db.commit()

    return {"success": True, "message": "Answer recorded successfully"}

@router.post("/{interview_id}/interruption")
async def handle_barge_in(interview_id: str, timestamp_offset: float = 0.0):
    """Handle candidate speech interruption / barge-in event."""
    res = await gradium_service.handle_interruption_event(interview_id, timestamp_offset)
    return res

@router.post("/{interview_id}/integrity")
async def log_integrity_signal(
    interview_id: str,
    signal: IntegritySignal,
    db: AsyncSession = Depends(get_db)
):
    """Log browser integrity signals (e.g., screen share dropped, tab hidden)."""
    q = select(Interview).where(Interview.id == interview_id)
    res = await db.execute(q)
    interview = res.scalars().first()
    if interview:
        signals = interview.integrity_signals or {}
        sig_list = signals.get("events", [])
        sig_list.append({
            "type": signal.signal_type,
            "details": signal.details or {},
            "timestamp": datetime.utcnow().isoformat()
        })
        interview.integrity_signals = {"events": sig_list}
        await db.commit()

    return {"success": True}

@router.get("/{interview_id}/transcripts")
async def get_transcripts(interview_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch real-time conversation transcripts for the interview."""
    q = select(Transcript).where(Transcript.interview_id == interview_id).order_by(Transcript.sequence_number.asc(), Transcript.timestamp.asc())
    res = await db.execute(q)
    transcripts = res.scalars().all()

    return {
        "transcripts": [
            {
                "id": t.id,
                "speaker": t.speaker,
                "message": t.message,
                "timestamp": t.timestamp.strftime("%H:%M:%S") if t.timestamp else "",
                "sequence_number": t.sequence_number
            }
            for t in transcripts
        ]
    }

@router.post("/{interview_id}/complete")
async def complete_and_evaluate_interview(interview_id: str, db: AsyncSession = Depends(get_db)):
    """
    Complete interview, run Gemini 4-dimension evaluation,
    compute overall average score, persist scores & evidence.
    """
    q = select(Interview).options(
        selectinload(Interview.questions).selectinload(InterviewQuestion.answers),
        selectinload(Interview.candidate).selectinload(Candidate.user),
        selectinload(Interview.candidate).selectinload(Candidate.profile),
        selectinload(Interview.transcripts)
    ).where(Interview.id == interview_id)

    res = await db.execute(q)
    interview = res.scalars().first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    qa_pairs = []
    for q_item in sorted(interview.questions, key=lambda x: x.question_order):
        ans_text = q_item.answers[0].answer_text if q_item.answers else "Candidate completed answer."
        qa_pairs.append({
            "question_order": q_item.question_order,
            "question": q_item.question_text,
            "category": q_item.category,
            "answer": ans_text
        })

    cand_profile = {}
    if interview.candidate and interview.candidate.profile:
        p = interview.candidate.profile
        cand_profile = {
            "summary": p.summary,
            "skills": p.skills or [],
            "experience": p.experience or [],
            "github_analysis": p.github_analysis or {}
        }

    # Run multi-agent 4-dimension evaluation with Gemini
    eval_res = await gemini_service.evaluate_interview(
        company=interview.company,
        role=interview.role,
        domain=interview.domain,
        qa_pairs=qa_pairs,
        candidate_profile=cand_profile
    )

    # Save Evaluation to DB
    tech_data = eval_res.get("technical", {})
    behav_data = eval_res.get("behavioural", {})
    pm_data = eval_res.get("product_manager", {})
    hm_data = eval_res.get("hiring_manager", {})
    overall = float(eval_res.get("overall", 80.0))

    evaluation = EvaluationScore(
        interview_id=interview.id,
        technical_score=float(tech_data.get("score", 75.0)),
        behavioural_score=float(behav_data.get("score", 75.0)),
        product_manager_score=float(pm_data.get("score", 75.0)),
        hiring_manager_score=float(hm_data.get("score", 75.0)),
        overall_score=overall,
        summary=eval_res.get("summary", ""),
        recommendation=eval_res.get("recommendation", "Hire"),
        technical_feedback=tech_data,
        behavioural_feedback=behav_data,
        product_feedback=pm_data,
        hiring_feedback=hm_data,
        strengths=eval_res.get("strengths", []),
        weaknesses=eval_res.get("weaknesses", []),
        question_feedback=eval_res.get("question_feedback", [])
    )
    db.add(evaluation)

    interview.status = "COMPLETED"
    interview.end_time = datetime.utcnow()
    await db.commit()

    return {"success": True, "message": "Interview completed and evaluated successfully", "overall_score": overall}

@router.get("/{interview_id}/report", response_model=EvaluationReportResponse)
async def get_interview_report(interview_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch complete persisted interview evaluation report."""
    q = select(Interview).options(
        selectinload(Interview.candidate).selectinload(Candidate.user),
        selectinload(Interview.evaluation),
        selectinload(Interview.transcripts)
    ).where(Interview.id == interview_id)

    res = await db.execute(q)
    interview = res.scalars().first()
    if not interview or not interview.evaluation:
        raise HTTPException(status_code=404, detail="Evaluation report not ready or interview not found")

    ev = interview.evaluation
    cand = interview.candidate
    cand_name = cand.user.full_name if cand and cand.user else "Candidate"
    cand_photo = cand.profile_photo_url if cand else None

    transcripts_list = [
        {"speaker": t.speaker, "message": t.message, "timestamp": t.timestamp.strftime("%H:%M:%S") if t.timestamp else ""}
        for t in sorted(interview.transcripts, key=lambda x: x.sequence_number)
    ]

    return EvaluationReportResponse(
        interview_id=interview.id,
        candidate_name=cand_name,
        candidate_photo=cand_photo,
        company=interview.company,
        role=interview.role,
        domain=interview.domain,
        date=interview.created_at,
        overall_score=ev.overall_score,
        technical=ev.technical_feedback,
        behavioural=ev.behavioural_feedback,
        product_manager=ev.product_feedback,
        hiring_manager=ev.hiring_feedback,
        summary=ev.summary or "",
        recommendation=ev.recommendation or "Hire",
        strengths=ev.strengths or [],
        weaknesses=ev.weaknesses or [],
        question_feedback=ev.question_feedback or [],
        transcripts=transcripts_list
    )

@router.get("/{interview_id}/download-pdf")
async def download_interview_pdf(interview_id: str, db: AsyncSession = Depends(get_db)):
    """Generate and stream professional portfolio PDF."""
    q = select(Interview).options(
        selectinload(Interview.candidate).selectinload(Candidate.user),
        selectinload(Interview.evaluation)
    ).where(Interview.id == interview_id)

    res = await db.execute(q)
    interview = res.scalars().first()
    if not interview or not interview.evaluation:
        raise HTTPException(status_code=404, detail="Interview evaluation not available")

    ev = interview.evaluation
    cand = interview.candidate
    cand_name = cand.user.full_name if cand and cand.user else "Candidate"

    report_payload = {
        "candidate_name": cand_name,
        "company": interview.company,
        "role": interview.role,
        "domain": interview.domain,
        "overall_score": ev.overall_score,
        "technical": ev.technical_feedback,
        "behavioural": ev.behavioural_feedback,
        "product_manager": ev.product_feedback,
        "hiring_manager": ev.hiring_feedback,
        "summary": ev.summary,
        "recommendation": ev.recommendation,
        "strengths": ev.strengths,
        "weaknesses": ev.weaknesses
    }

    pdf_buffer = pdf_service.generate_interview_report_pdf(report_payload)
    filename = f"EcoSphere_Evaluation_{cand_name.replace(' ', '_')}_{interview.company}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
