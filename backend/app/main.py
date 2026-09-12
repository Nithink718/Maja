import os
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.session import init_db
from app.api.routers import auth, candidates, interviews, organizations, media, ai

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Non-blocking schema initialization as background task
    asyncio.create_task(init_db())
    os.makedirs("uploads/photos", exist_ok=True)
    os.makedirs("uploads/resumes", exist_ok=True)
    os.makedirs("uploads/patterns", exist_ok=True)
    os.makedirs("uploads/verification", exist_ok=True)
    os.makedirs("uploads/recordings", exist_ok=True)
    yield

app = FastAPI(
    title="EcoSphere AI Interview Intelligence API",
    description="Full-stack AI Mock Interview & Candidate Evaluation Platform powered by Google Gemini and Gradium.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for seamless development and cross-port communication
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(candidates.router, prefix="/api")
app.include_router(interviews.router, prefix="/api")
app.include_router(organizations.router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "app": "EcoSphere API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
