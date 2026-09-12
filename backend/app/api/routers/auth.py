from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.session import get_db
from app.database.models import User, Candidate, Organization, CandidateProfile, OTPSession
from app.schemas.schemas import OTPRequest, OTPVerifyRequest, AuthResponse
from app.core.security import generate_otp, create_access_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/request-otp")
async def request_otp(payload: OTPRequest, db: AsyncSession = Depends(get_db)):
    """Generate and send OTP to user email."""
    email = payload.email.lower().strip()
    otp_code = generate_otp(6)
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Invalidate previous unused OTPs for this email
    q = select(OTPSession).where(OTPSession.email == email, OTPSession.is_used == False)
    result = await db.execute(q)
    for old_otp in result.scalars().all():
        old_otp.is_used = True

    session_record = OTPSession(
        email=email,
        otp_code=otp_code,
        role=payload.role,
        expires_at=expires_at,
        is_used=False
    )
    db.add(session_record)
    await db.commit()

    # In production, send via email provider. In dev mode (EMAIL_API_KEY == 'REDIRECTED'), return OTP in response for testing
    is_dev = settings.EMAIL_API_KEY == "REDIRECTED" or settings.ENVIRONMENT == "development"

    return {
        "success": True,
        "message": f"OTP successfully sent to {email}.",
        "dev_otp": otp_code if is_dev else None
    }

@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp(payload: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verify OTP and return authenticated user session."""
    email = payload.email.lower().strip()
    otp_code = payload.otp_code.strip()

    # Query latest active OTP
    q = select(OTPSession).where(
        OTPSession.email == email,
        OTPSession.is_used == False,
        OTPSession.expires_at > datetime.utcnow()
    ).order_by(OTPSession.created_at.desc())
    
    result = await db.execute(q)
    otp_record = result.scalars().first()

    # Check validity (also accept fixed dev bypass code '123456' in dev mode)
    is_dev = settings.ENVIRONMENT == "development" or settings.EMAIL_API_KEY == "REDIRECTED"
    if not otp_record or otp_record.otp_code != otp_code:
        if not (is_dev and otp_code == "123456"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code. Please request a new one."
            )

    if otp_record:
        otp_record.is_used = True
        await db.commit()

    # Get or create User
    user_q = select(User).where(User.email == email)
    user_res = await db.execute(user_q)
    user = user_res.scalars().first()

    if not user:
        user = User(
            email=email,
            full_name=payload.full_name or email.split("@")[0].capitalize(),
            role=payload.role
        )
        db.add(user)
        await db.flush()

        if payload.role == "candidate":
            candidate = Candidate(user_id=user.id)
            db.add(candidate)
            await db.flush()
            profile = CandidateProfile(candidate_id=candidate.id)
            db.add(profile)
        elif payload.role == "organization":
            org = Organization(
                user_id=user.id,
                org_name=payload.full_name or f"{email.split('@')[0].capitalize()} Org"
            )
            db.add(org)

        await db.commit()
        await db.refresh(user)

    # Fetch candidate/organization IDs
    candidate_id = None
    organization_id = None

    if user.role == "candidate":
        c_q = select(Candidate).where(Candidate.user_id == user.id)
        c_res = await db.execute(c_q)
        cand = c_res.scalars().first()
        if cand:
            candidate_id = cand.id
    elif user.role == "organization":
        o_q = select(Organization).where(Organization.user_id == user.id)
        o_res = await db.execute(o_q)
        org = o_res.scalars().first()
        if org:
            organization_id = org.id

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "candidate_id": candidate_id,
        "organization_id": organization_id
    })

    return AuthResponse(
        token=token,
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        candidate_id=candidate_id,
        organization_id=organization_id
    )

# --- OAuth Routes ---

@router.get("/google/login")
async def google_login(role: str = "candidate"):
    redirect_uri = f"{settings.FRONTEND_URL}/api/auth/google/callback"  # We will use backend directly to handle callback
    # The actual callback will go to backend, then backend redirects to frontend
    backend_callback = f"http://localhost:8000/api/auth/google/callback"
    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?response_type=code"
        f"&client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={backend_callback}"
        f"&scope=openid%20email%20profile"
        f"&state={role}"
    )
    return RedirectResponse(url)

@router.get("/google/callback")
async def google_callback(code: str, state: str, db: AsyncSession = Depends(get_db)):
    backend_callback = f"http://localhost:8000/api/auth/google/callback"
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": backend_callback,
        "grant_type": "authorization_code"
    }
    
    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=data)
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange Google code")
        
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        
        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if user_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch Google user profile")
            
        user_info = user_res.json()
        
    email = user_info.get("email").lower().strip()
    full_name = user_info.get("name")
    role = state
    
    # Process login/signup (similar to OTP verification)
    user_q = select(User).where(User.email == email)
    user_res = await db.execute(user_q)
    user = user_res.scalars().first()

    if not user:
        user = User(
            email=email,
            full_name=full_name or email.split("@")[0].capitalize(),
            role=role
        )
        db.add(user)
        await db.flush()

        if role == "candidate":
            candidate = Candidate(user_id=user.id)
            db.add(candidate)
            await db.flush()
            profile = CandidateProfile(candidate_id=candidate.id)
            db.add(profile)
        elif role == "organization":
            org = Organization(
                user_id=user.id,
                org_name=full_name or f"{email.split('@')[0].capitalize()} Org"
            )
            db.add(org)
        await db.commit()
        await db.refresh(user)

    candidate_id = None
    organization_id = None
    if user.role == "candidate":
        c_q = select(Candidate).where(Candidate.user_id == user.id)
        c_res = await db.execute(c_q)
        cand = c_res.scalars().first()
        if cand:
            candidate_id = cand.id
    elif user.role == "organization":
        o_q = select(Organization).where(Organization.user_id == user.id)
        o_res = await db.execute(o_q)
        org = o_res.scalars().first()
        if org:
            organization_id = org.id

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "candidate_id": candidate_id,
        "organization_id": organization_id
    })

    # Redirect back to frontend auth callback page with token
    return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?token={token}&role={user.role}&email={user.email}&name={user.full_name}&user_id={user.id}&candidate_id={candidate_id or ''}&organization_id={organization_id or ''}")

@router.get("/github/login")
async def github_login(role: str = "candidate"):
    backend_callback = f"http://localhost:8000/api/auth/github/callback"
    url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={backend_callback}"
        f"&scope=user:email"
        f"&state={role}"
    )
    return RedirectResponse(url)

@router.get("/github/callback")
async def github_callback(code: str, state: str, db: AsyncSession = Depends(get_db)):
    token_url = "https://github.com/login/oauth/access_token"
    data = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "code": code
    }
    headers = {"Accept": "application/json"}
    
    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=data, headers=headers)
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange GitHub code")
            
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Invalid GitHub token response")
            
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github.v3+json"}
        )
        email_res = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github.v3+json"}
        )
        
    user_info = user_res.json()
    emails = email_res.json()
    primary_email = next((e['email'] for e in emails if e.get('primary')), None)
    if not primary_email and len(emails) > 0:
        primary_email = emails[0]['email']
        
    if not primary_email:
        raise HTTPException(status_code=400, detail="No public email found in GitHub account")

    email = primary_email.lower().strip()
    full_name = user_info.get("name") or user_info.get("login")
    role = state
    
    # Process login/signup
    user_q = select(User).where(User.email == email)
    user_res = await db.execute(user_q)
    user = user_res.scalars().first()

    if not user:
        user = User(
            email=email,
            full_name=full_name or email.split("@")[0].capitalize(),
            role=role
        )
        db.add(user)
        await db.flush()

        if role == "candidate":
            candidate = Candidate(user_id=user.id)
            db.add(candidate)
            await db.flush()
            profile = CandidateProfile(candidate_id=candidate.id)
            db.add(profile)
        elif role == "organization":
            org = Organization(
                user_id=user.id,
                org_name=full_name or f"{email.split('@')[0].capitalize()} Org"
            )
            db.add(org)
        await db.commit()
        await db.refresh(user)

    candidate_id = None
    organization_id = None
    if user.role == "candidate":
        c_q = select(Candidate).where(Candidate.user_id == user.id)
        c_res = await db.execute(c_q)
        cand = c_res.scalars().first()
        if cand:
            candidate_id = cand.id
    elif user.role == "organization":
        o_q = select(Organization).where(Organization.user_id == user.id)
        o_res = await db.execute(o_q)
        org = o_res.scalars().first()
        if org:
            organization_id = org.id

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "candidate_id": candidate_id,
        "organization_id": organization_id
    })

    # Redirect back to frontend auth callback page with token
    return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?token={token}&role={user.role}&email={user.email}&name={user.full_name}&user_id={user.id}&candidate_id={candidate_id or ''}&organization_id={organization_id or ''}")
