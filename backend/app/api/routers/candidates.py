import os
import shutil
import io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from pypdf import PdfReader

from app.database.session import get_db
from app.database.models import User, Candidate, CandidateProfile, Interview, EvaluationScore, MediaRecord
from app.schemas.schemas import CandidatePersonalUpdate, CandidateProfileResponse
from app.services.gemini_service import gemini_service
from app.services.github_service import github_service

router = APIRouter(prefix="/candidates", tags=["candidates"])

UPLOAD_DIR = "uploads"
os.makedirs(f"{UPLOAD_DIR}/photos", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/resumes", exist_ok=True)

@router.get("/profile/{candidate_id}", response_model=CandidateProfileResponse)
async def get_candidate_profile(candidate_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch candidate profile, parsed resume info, and dashboard statistics."""
    q = select(Candidate).options(
        selectinload(Candidate.user),
        selectinload(Candidate.profile),
        selectinload(Candidate.interviews).selectinload(Interview.evaluation)
    ).where(Candidate.id == candidate_id)

    result = await db.execute(q)
    candidate = result.scalars().first()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    profile = candidate.profile or CandidateProfile(candidate_id=candidate.id)
    interviews = candidate.interviews or []
    completed = [i for i in interviews if i.status == "COMPLETED" and i.evaluation]

    # Calculate real dynamic stats
    scores = [i.evaluation.overall_score for i in completed]
    tech_scores = [i.evaluation.technical_score for i in completed]
    behav_scores = [i.evaluation.behavioural_score for i in completed]
    pm_scores = [i.evaluation.product_manager_score for i in completed]
    hm_scores = [i.evaluation.hiring_manager_score for i in completed]

    avg_overall = round(sum(scores) / len(scores), 1) if scores else 0.0
    avg_tech = round(sum(tech_scores) / len(tech_scores), 1) if tech_scores else 0.0
    avg_behav = round(sum(behav_scores) / len(behav_scores), 1) if behav_scores else 0.0
    avg_pm = round(sum(pm_scores) / len(pm_scores), 1) if pm_scores else 0.0
    avg_hm = round(sum(hm_scores) / len(hm_scores), 1) if hm_scores else 0.0

    history = []
    for i in completed:
        history.append({
            "interview_id": i.id,
            "company": i.company,
            "role": i.role,
            "domain": i.domain,
            "date": i.created_at.strftime("%Y-%m-%d"),
            "overall_score": i.evaluation.overall_score,
            "technical_score": i.evaluation.technical_score,
            "behavioural_score": i.evaluation.behavioural_score,
            "product_manager_score": i.evaluation.product_manager_score,
            "hiring_manager_score": i.evaluation.hiring_manager_score,
        })

    stats = {
        "interviews_attended": len(completed),
        "avg_overall_score": avg_overall,
        "avg_technical_score": avg_tech,
        "avg_behavioural_score": avg_behav,
        "avg_pm_score": avg_pm,
        "avg_hm_score": avg_hm,
        "interview_history": history
    }

    return CandidateProfileResponse(
        candidate_id=candidate.id,
        user_id=candidate.user_id,
        email=candidate.user.email if candidate.user else "",
        full_name=candidate.user.full_name if candidate.user else "Candidate",
        profile_photo_url=candidate.profile_photo_url,
        education=candidate.education,
        certifications=candidate.certifications,
        github_url=candidate.github_url,
        resume_url=candidate.resume_url,
        summary=profile.summary,
        skills=profile.skills or [],
        experience=profile.experience or [],
        projects=profile.projects or [],
        github_analysis=profile.github_analysis or {},
        stats=stats
    )

@router.post("/update-personal/{candidate_id}")
async def update_personal_info(
    candidate_id: str,
    payload: CandidatePersonalUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update candidate personal details: education, certs, github url, name."""
    q = select(Candidate).options(selectinload(Candidate.user)).where(Candidate.id == candidate_id)
    res = await db.execute(q)
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if payload.education:
        cand.education = payload.education
    if payload.certifications:
        cand.certifications = payload.certifications
    if payload.github_url:
        cand.github_url = payload.github_url
    if payload.full_name and cand.user:
        cand.user.full_name = payload.full_name

    await db.commit()
    return {"success": True, "message": "Personal information updated successfully"}

@router.post("/upload-photo/{candidate_id}")
async def upload_candidate_photo(
    candidate_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload and set candidate profile photo."""
    q = select(Candidate).where(Candidate.id == candidate_id)
    res = await db.execute(q)
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"photo_{candidate_id}_{int(os.path.getmtime('.'))}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, "photos", filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    cand.profile_photo_url = f"/api/media/files/{filepath.replace(os.sep, '/')}"
    await db.commit()

    return {"success": True, "photo_url": cand.profile_photo_url}

@router.post("/upload-resume/{candidate_id}")
async def upload_and_parse_resume(
    candidate_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload resume (PDF), extract text, parse with Gemini into structured schema."""
    q = select(Candidate).options(selectinload(Candidate.profile)).where(Candidate.id == candidate_id)
    res = await db.execute(q)
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    content = await file.read()
    filename = f"resume_{candidate_id}.pdf"
    filepath = os.path.join(UPLOAD_DIR, "resumes", filename)

    with open(filepath, "wb") as f:
        f.write(content)

    # Extract text from PDF
    resume_text = ""
    try:
        reader = PdfReader(io.BytesIO(content))
        for page in reader.pages:
            resume_text += page.extract_text() or ""
    except Exception as e:
        resume_text = content.decode("utf-8", errors="ignore")

    # Parse with Gemini
    parsed_info = await gemini_service.parse_resume(resume_text)

    # Save to database
    cand.resume_url = f"/api/media/files/{filepath.replace(os.sep, '/')}"
    profile = cand.profile or CandidateProfile(candidate_id=cand.id)
    profile.summary = parsed_info.get("summary", "")
    profile.skills = parsed_info.get("skills", [])
    profile.experience = parsed_info.get("experience", [])
    profile.projects = parsed_info.get("projects", [])
    profile.education_details = parsed_info.get("education", [])
    profile.achievements = parsed_info.get("achievements", [])
    profile.raw_resume_text = resume_text[:5000]

    db.add(profile)
    await db.commit()

    return {
        "success": True,
        "resume_url": cand.resume_url,
        "parsed_data": parsed_info
    }

@router.post("/analyze-github/{candidate_id}")
async def analyze_candidate_github(
    candidate_id: str,
    github_url: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """Fetch GitHub repo details and run Gemini technical depth analysis."""
    q = select(Candidate).options(selectinload(Candidate.profile)).where(Candidate.id == candidate_id)
    res = await db.execute(q)
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    cand.github_url = github_url

    # Fetch from GitHub
    repo_info = await github_service.fetch_repository_info(github_url)
    # Analyze with Gemini
    analysis = await gemini_service.analyze_github_repo(repo_info, repo_info.get("readme", ""))

    profile = cand.profile or CandidateProfile(candidate_id=cand.id)
    profile.github_analysis = analysis
    db.add(profile)
    await db.commit()

    return {
        "success": True,
        "github_url": github_url,
        "analysis": analysis
    }
