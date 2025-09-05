from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 데이터베이스 연결 설정
def get_database_url():
    print("🔍 데이터베이스 연결 설정 시작...")
    
    # 환경변수에서 전체 URL 가져오기
    if os.getenv("DATABASE_URL"):
        print(f"✅ DATABASE_URL 환경변수 사용: {os.getenv('DATABASE_URL')}")
        return os.getenv("DATABASE_URL")
    
    # 개별 환경변수에서 조합
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    name = os.getenv("DB_NAME", "hw_project001")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "!@heart_ware2@!")
    
    print(f"🔍 환경변수 확인:")
    print(f"  - DB_HOST: {host}")
    print(f"  - DB_PORT: {port}")
    print(f"  - DB_NAME: {name}")
    print(f"  - DB_USER: {user}")
    print(f"  - DB_PASSWORD: {password}")
    
    # 비밀번호에 특수문자가 있을 수 있으므로 URL 인코딩
    encoded_password = quote_plus(password)
    print(f"  - 인코딩된 비밀번호: {encoded_password}")
    
    final_url = f"postgresql://{user}:{encoded_password}@{host}:{port}/{name}"
    print(f"🔗 최종 연결 URL: {final_url}")
    
    return final_url

# 데이터베이스 URL 가져오기
DATABASE_URL = get_database_url()

print(f"🔗 데이터베이스 연결 URL: {DATABASE_URL}")

# 엔진 생성
engine = create_engine(DATABASE_URL)

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스
Base = declarative_base()

# 데이터베이스 세션 의존성
def get_db():
    print("🔍 데이터베이스 세션 생성 시도...")
    try:
        db = SessionLocal()
        print("✅ 데이터베이스 세션 생성 성공")
        
        # 연결 테스트 (간단한 방식)
        print("✅ 데이터베이스 세션 생성 성공 - 연결 테스트 생략")
        
        yield db
    except Exception as e:
        print(f"❌ 데이터베이스 연결 오류: {e}")
        print(f"❌ 오류 타입: {type(e).__name__}")
        print(f"❌ 오류 상세: {str(e)}")
        raise
    finally:
        if 'db' in locals():
            db.close()
            print("🔍 데이터베이스 세션 종료")
