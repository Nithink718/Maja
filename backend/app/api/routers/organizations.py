import os
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from pypdf import PdfReader

from app.database.session import get_db
from app.database.models import Organization, OrganizationPattern, Candidate, Interview, EvaluationScore, User
from app.schemas.schemas import OrgCandidateRankItem
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/organizations", tags=["organizations"])

UPLOAD_DIR = "uploads/patterns"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/rankings", response_model=List[OrgCandidateRankItem])
async def get_candidate_rankings(
    sort_by: Optional[str] = "overall_score",
    order: Optional[str] = "desc",
    role: Optional[str] = None,
    domain: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve ranked list of candidates with scores, sorting and filtering options."""
    q = select(Interview).options(
        selectinload(Interview.candidate).selectinload(Candidate.user),
        selectinload(Interview.evaluation)
    ).where(Interview.status == "COMPLETED")

    if role and role != "All":
        q = q.where(Interview.role == role)
    if domain and domain != "All":
        q = q.where(Interview.domain == domain)

    res = await db.execute(q)
    interviews = res.scalars().all()

    items = []
    for i in interviews:
        if not i.evaluation:
            continue
        cand = i.candidate
        user = cand.user if cand else None
        cand_name = user.full_name if user and user.full_name else (user.email.split("@")[0].capitalize() if user else "Candidate")
        photo = cand.profile_photo_url if cand else None

        items.append(OrgCandidateRankItem(
            candidate_id=cand.id if cand else "",
            user_id=user.id if user else "",
            candidate_name=cand_name,
            photo_url=photo,
            role=i.role,
            domain=i.domain,
            technical_score=i.evaluation.technical_score,
            behavioural_score=i.evaluation.behavioural_score,
            product_score=i.evaluation.product_manager_score,
            hiring_manager_score=i.evaluation.hiring_manager_score,
            overall_score=i.evaluation.overall_score,
            interview_date=i.created_at,
            interview_id=i.id,
            status=i.status
        ))

    # Sort
    reverse = (order.lower() == "desc")
    if sort_by == "technical_score":
        items.sort(key=lambda x: x.technical_score, reverse=reverse)
    elif sort_by == "behavioural_score":
        items.sort(key=lambda x: x.behavioural_score, reverse=reverse)
    elif sort_by == "product_score":
        items.sort(key=lambda x: x.product_score, reverse=reverse)
    elif sort_by == "hiring_manager_score":
        items.sort(key=lambda x: x.hiring_manager_score, reverse=reverse)
    elif sort_by == "interview_date":
        items.sort(key=lambda x: x.interview_date, reverse=reverse)
    else:
        items.sort(key=lambda x: x.overall_score, reverse=reverse)

    return items

@router.post("/upload-pattern/{organization_id}")
async def upload_organization_pattern(
    organization_id: str,
    title: str = Form("Standard Hiring Rubric"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload organization recruitment rubric PDF and extract hiring criteria with Gemini."""
    q = select(Organization).where(Organization.id == organization_id)
    res = await db.execute(q)
    org = res.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    content = await file.read()
    filename = f"pattern_{organization_id}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    # Extract text
    raw_text = ""
    try:
        reader = PdfReader(io.BytesIO(content))
        for page in reader.pages:
            raw_text += page.extract_text() or ""
    except Exception:
        raw_text = content.decode("utf-8", errors="ignore")

    # Parse with Gemini
    structured_pattern = await gemini_service.parse_organization_pattern(raw_text)

    pattern_record = OrganizationPattern(
        organization_id=organization_id,
        title=title,
        file_url=f"/api/media/files/{filepath.replace(os.sep, '/')}",
        raw_text=raw_text[:4000],
        structured_pattern=structured_pattern
    )
    db.add(pattern_record)
    await db.commit()

    return {
        "success": True,
        "message": "Organization pattern parsed and registered successfully",
        "pattern": structured_pattern
    }

@router.get("/patterns/{organization_id}")
async def get_organization_patterns(organization_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch all custom evaluation patterns uploaded by this organization."""
    q = select(OrganizationPattern).where(OrganizationPattern.organization_id == organization_id)
    res = await db.execute(q)
    patterns = res.scalars().all()

    return {
        "patterns": [
            {
                "id": p.id,
                "title": p.title,
                "created_at": p.created_at.strftime("%Y-%m-%d"),
                "structured_pattern": p.structured_pattern
            }
            for p in patterns
        ]
    }
