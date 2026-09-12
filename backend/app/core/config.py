import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoSphere"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    
    # Secrets / API Keys
    GEMINI_API_KEY: str = "REDIRECTED"
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    GRADIUM_API_KEY: str = "REDIRECTED"
    GRADIUM_API_URL: str = "https://api.gradium.ai/v1"
    
    GITHUB_TOKEN: str = "REDIRECTED"
    
    SUPABASE_URL: str = "REDIRECTED"
    SUPABASE_PUBLISHABLE_KEY: str = "REDIRECTED"
    SUPABASE_SERVICE_ROLE_KEY: str = "REDIRECTED"
    DATABASE_URL: str = "REDIRECTED"
    
    EMAIL_API_KEY: str = "REDIRECTED"
    EMAIL_SENDER: str = "noreply@ecosphere.ai"
    
    # Security
    JWT_SECRET_KEY: str = "ecosphere_super_secret_jwt_key_2026_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Interview defaults
    DEFAULT_NUMBER_OF_QUESTIONS: int = 4
    DEFAULT_INTERVIEW_DURATION_MINS: int = 20
    DEFAULT_DIFFICULTY: str = "Medium"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    FRONTEND_URL: str = "http://localhost:3000"

    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_gemini_active(self) -> bool:
        return self.GEMINI_API_KEY != "REDIRECTED" and bool(self.GEMINI_API_KEY)

    @property
    def is_gradium_active(self) -> bool:
        return self.GRADIUM_API_KEY != "REDIRECTED" and bool(self.GRADIUM_API_KEY)

    @property
    def is_github_active(self) -> bool:
        return self.GITHUB_TOKEN != "REDIRECTED" and bool(self.GITHUB_TOKEN)

    @property
    def is_postgres_active(self) -> bool:
        return self.DATABASE_URL != "REDIRECTED" and bool(self.DATABASE_URL) and "postgresql" in self.DATABASE_URL

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
