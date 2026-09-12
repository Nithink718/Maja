from fastapi import APIRouter
from app.services.gemini_service import gemini_service
from app.services.gradium_service import gradium_service
from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/status")
async def get_ai_status():
    """Returns real-time operational status for Gemini & Gradium services."""
    return {
        "gemini_active": settings.is_gemini_active,
        "gradium_active": settings.is_gradium_active,
        "github_active": settings.is_github_active,
        "mode": "live" if settings.is_gemini_active else "development_mock_engine",
        "evaluators": ["Technical Evaluator", "Behavioural Evaluator", "Product Manager", "Hiring Manager"]
    }
