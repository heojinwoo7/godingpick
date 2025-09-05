from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import schools, community, users, subjects, auth
from dotenv import load_dotenv
import uvicorn
import os

# .env 파일 로드
load_dotenv()
print("🔍 .env 파일 로드 완료")

# 환경변수 확인
print("🔍 환경변수 확인:")
print(f"  - DB_HOST: {os.getenv('DB_HOST', '기본값')}")
print(f"  - DB_PORT: {os.getenv('DB_PORT', '기본값')}")
print(f"  - DB_NAME: {os.getenv('DB_NAME', '기본값')}")
print(f"  - DB_USER: {os.getenv('DB_USER', '기본값')}")
print(f"  - DB_PASSWORD: {os.getenv('DB_PASSWORD', '기본값')}")

app = FastAPI(title="Heartware Highschool API", version="1.0.0")

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경에서는 모든 origin 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 포함
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(schools.router, prefix="/api", tags=["schools"])
app.include_router(community.router, prefix="/api", tags=["community"])
app.include_router(subjects.router, prefix="/api", tags=["subjects"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

@app.get("/")
async def root():
    print("🔍🔍🔍 루트 엔드포인트 호출됨!")
    return {"message": "Heartware Highschool API"}

@app.get("/test-db")
async def test_database():
    """데이터베이스 연결 테스트"""
    try:
        from database import get_db
        db = next(get_db())
        db.close()
        return {"success": True, "message": "데이터베이스 연결 성공"}
    except Exception as e:
        return {"success": False, "message": "데이터베이스 연결 실패", "error": str(e), "type": type(e).__name__}


