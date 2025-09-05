import os
from typing import Optional

class Settings:
    # 애플리케이션 기본 설정
    APP_NAME: str = "Heartware Highschool API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # 데이터베이스 설정
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "hw_project001")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "!@heart_ware2@!")
    
    # 서버 설정
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS 설정
    CORS_ORIGINS: list = ["*"]  # 개발 환경에서는 모든 origin 허용
    
    # 보안 설정
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    def get_database_url(self) -> str:
        """데이터베이스 연결 URL 생성"""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

# 전역 설정 인스턴스
settings = Settings()
