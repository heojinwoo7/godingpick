# Heartware Highschool

고등학교 시간표 관리 및 커뮤니티 플랫폼

## 프로젝트 구조

```
heartware_highschool/
├── backend/                    # FastAPI 백엔드
│   ├── app/                    # FastAPI 앱 코드
│   │   ├── api/                # API 라우터
│   │   ├── core/               # 설정 및 데이터베이스
│   │   ├── models/             # 데이터 모델
│   │   ├── services/           # 비즈니스 로직
│   │   ├── schemas/            # Pydantic 스키마
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                   # Expo (React Native)
│   ├── src/
│   │   ├── screens/            # 화면 컴포넌트
│   │   ├── components/         # 재사용 컴포넌트
│   │   ├── hooks/              # 커스텀 훅
│   │   ├── assets/             # 이미지, 폰트 등
│   │   └── navigation/         # 네비게이션
│   ├── app.json
│   ├── package.json
│   └── babel.config.js
│
├── database/                   # PostgreSQL 관련
│   ├── migrations/             # SQL 스키마 파일
│   ├── seeds/                  # 초기 데이터
│   └── scripts/                # 데이터 임포트 스크립트
│
├── infrastructure/             # 인프라 및 배포
│   ├── aws/                    # ECS, EC2 설정
│   ├── docker/                 # 배포용 Dockerfile
│   └── nginx/                  # 리버스 프록시 설정
│
├── shared/                     # 공통 코드
│   ├── constants/
│   ├── utils/
│   └── types/
│
└── docs/                       # 문서
    ├── api.md
    ├── mobile-setup.md
    ├── backend-setup.md
    └── deployment.md
```

## 기술 스택

- **Backend**: FastAPI, PostgreSQL, SQLAlchemy
- **Frontend**: Expo (React Native), TypeScript
- **Infrastructure**: AWS ECS, EC2, Docker
- **Database**: PostgreSQL

## 시작하기

### 백엔드 설정

1. 백엔드 디렉토리로 이동
   ```bash
   cd backend
   ```

2. 가상환경 생성 및 활성화
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. 의존성 설치
   ```bash
   pip install -r requirements.txt
   ```

4. 환경변수 설정
   ```bash
   cp .env.example .env
   # .env 파일을 편집하여 실제 값으로 변경
   ```

5. 서버 실행
   ```bash
   python app/main.py
   ```

### 프론트엔드 설정

1. 프론트엔드 디렉토리로 이동
   ```bash
   cd frontend
   ```

2. 의존성 설치
   ```bash
   npm install
   ```

3. 환경변수 설정
   ```bash
   cp .env.example .env
   # .env 파일을 편집하여 실제 값으로 변경
   ```

4. 앱 실행
   ```bash
   npx expo start
   ```

## 데이터베이스

### 시간표 데이터 임포트

시간표 데이터를 임포트하려면 `database/scripts/` 디렉토리의 스크립트를 사용하세요:

```bash
# 학교 데이터 임포트
python database/scripts/import_schools_from_excel.py

# 시간표 데이터 임포트
python database/scripts/import_timetable_by_filename.py /path/to/csv/file.csv 1
```

## 배포

### AWS ECS 배포

1. Docker 이미지 빌드
   ```bash
   docker build -t heartware-backend ./backend
   ```

2. ECR에 푸시
   ```bash
   aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-northeast-2.amazonaws.com
   docker tag heartware-backend:latest <account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/heartware-backend:latest
   docker push <account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/heartware-backend:latest
   ```

3. ECS 서비스 업데이트

## 보안

- `.pem` 파일과 데이터베이스 비밀번호는 절대 Git에 커밋하지 마세요
- AWS Secrets Manager를 사용하여 민감한 정보를 관리하세요
- 환경변수 파일은 `.env.example`을 참고하여 로컬에서 생성하세요

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.


### PEM 키 관리

EC2 접속용 PEM 키는 다음 위치에 안전하게 보관됩니다:

```bash
# PEM 키 위치
~/.ssh/keys/godingpick_ec2_key.pem

# EC2 접속 방법
ssh -i ~/.ssh/keys/godingpick_ec2_key.pem ubuntu@<EC2-IP-ADDRESS>
```

**중요**: PEM 키는 절대 GitHub에 업로드하지 마세요. `.gitignore`에 `*.pem`이 포함되어 있습니다.
