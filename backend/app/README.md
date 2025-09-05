# Heartware Highschool API

고등학교 커뮤니티 및 학교 정보를 제공하는 FastAPI 기반 REST API 서버입니다.

## 🚀 주요 기능

### 사용자 관리
- 사용자 로그인/회원가입
- 사용자 정보 조회
- 학생 정보 및 학교 정보 연동

### 학교 정보
- 학교 목록 조회
- 학교 상세 정보 조회
- 학교 검색 기능

### 커뮤니티
- 게시글 작성/조회
- 댓글 기능
- 위치별 커뮤니티 분류
- 3-테이블 JOIN을 통한 통합 정보 제공

### 과목 정보
- 과목 목록 조회
- 과목 검색 기능

## 🛠️ 기술 스택

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Python**: 3.9+

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 환경변수 설정
```bash
# .env 파일 생성
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=heartware_highschool
DB_HOST=localhost
DB_PORT=5432
```

### 3. 서버 실행
```bash
# 개발 모드
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 또는
python main.py
```

## 🔗 API 엔드포인트

### 사용자 관련
- `POST /api/users/login` - 사용자 로그인
- `GET /api/users/{user_id}` - 사용자 정보 조회
- `POST /api/users/register` - 사용자 등록

### 학교 관련
- `GET /api/schools` - 학교 목록 조회
- `GET /api/schools/{school_id}` - 학교 상세 정보
- `GET /api/schools/search/{keyword}` - 학교 검색

### 커뮤니티 관련
- `GET /api/community/posts` - 게시글 목록
- `GET /api/community/posts/{post_id}` - 게시글 상세
- `GET /api/community/user-school-info/{user_id}` - 사용자-학생-학교 정보
- `GET /api/community/posts/by-location/{type}/{value}` - 위치별 게시글

### 과목 관련
- `GET /api/subjects` - 과목 목록
- `GET /api/subjects/{subject_id}` - 과목 상세
- `GET /api/subjects/search/{keyword}` - 과목 검색

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- `users` - 사용자 정보
- `students` - 학생 정보
- `schools` - 학교 정보
- `posts` - 게시글
- `comments` - 댓글

### 관계
- User ↔ Student (1:1)
- Student ↔ School (N:1)
- User ↔ Post (1:N)
- Post ↔ Comment (1:N)

## 🔧 설정

### 환경변수
- `DB_USER`: 데이터베이스 사용자명
- `DB_PASSWORD`: 데이터베이스 비밀번호
- `DB_NAME`: 데이터베이스 이름
- `DB_HOST`: 데이터베이스 호스트
- `DB_PORT`: 데이터베이스 포트
- `DEBUG`: 디버그 모드 (True/False)

## 📝 개발 가이드

### 새 라우터 추가
1. `routers/` 폴더에 새 파일 생성
2. `main.py`에 라우터 포함
3. 필요한 스키마 추가

### 데이터베이스 모델 추가
1. `models.py`에 새 모델 클래스 정의
2. 필요한 관계 설정
3. 마이그레이션 실행

## 🚨 주의사항

- 개발 환경에서는 CORS가 모든 origin을 허용합니다
- 프로덕션 환경에서는 적절한 보안 설정이 필요합니다
- 데이터베이스 비밀번호는 환경변수로 관리하세요

## 📞 지원

문제가 발생하거나 질문이 있으시면 개발팀에 문의하세요.
