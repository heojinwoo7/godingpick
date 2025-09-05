from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Student, School
from schemas import LoginRequest, LoginResponse
import logging
from datetime import datetime

router = APIRouter()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/users/login")
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """사용자 로그인"""
    try:
        logger.info(f"로그인 시도: {login_data.email}")
        
        # 이메일로 사용자 찾기
        user = db.query(User).filter(User.email == login_data.email).first()
        
        if not user:
            logger.warning(f"로그인 실패: 존재하지 않는 이메일 - {login_data.email}")
            raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 잘못되었습니다.")
        
        # 실제로는 비밀번호 해싱 검증이 필요하지만, 현재는 이메일만 확인
        # TODO: 비밀번호 검증 로직 추가
        
        # 학생 정보와 학교 정보도 함께 가져오기
        student = db.query(Student).filter(Student.user_id == user.id).first()
        school = None
        if student:
            school = db.query(School).filter(School.id == student.school_id).first()
        
        # 응답 데이터 구성 (Frontend와 맞춤)
        response_data = {
            "success": True,  # Frontend가 기대하는 success 필드
            "message": "로그인 성공",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "birth_date": user.birth_date,
                "user_type": user.user_type,
                "created_at": getattr(user, 'created_at', None)
            },
            "additionalInfo": {  # Frontend가 기대하는 additionalInfo
                "school_name": school.name if school else None,
                "school_id": school.id if school else None,
                "grade": student.grade if student else None,
                "class_number": student.class_number if student else None,
                "student_number": student.student_number if student else None,
                "attendance_number": student.attendance_number if student else None
            }
        }
        
        logger.info(f"사용자 로그인 성공: {user.name} ({user.email})")
        logger.info(f"응답 데이터: {response_data}")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"로그인 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="로그인 중 오류가 발생했습니다.")

@router.get("/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """특정 사용자 정보 조회"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        return {"success": True, "user": user}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"사용자 정보 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="사용자 정보 조회 중 오류가 발생했습니다.")

@router.post("/users/register")
async def register_user(user_data: dict, db: Session = Depends(get_db)):
    """사용자 등록"""
    try:
        # 이메일 중복 확인
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")
        
        # 새 사용자 생성
        new_user = User(**user_data)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"새 사용자 등록: {new_user.name} ({new_user.email})")
        return {"success": True, "message": "사용자 등록 성공", "user_id": new_user.id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"사용자 등록 중 오류 발생: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="사용자 등록 중 오류가 발생했습니다.")

@router.post("/users/register/student")
async def register_student(student_data: dict, db: Session = Depends(get_db)):
    """학생 회원가입 (User + Student + School 연동)"""
    try:
        logger.info(f"학생 회원가입 시작: {student_data.get('email', 'Unknown')}")
        
        # 1. 이메일 중복 확인
        existing_user = db.query(User).filter(User.email == student_data["email"]).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")
        
        # 2. 학교 정보 확인
        school_name = student_data.get("schoolName")
        if not school_name:
            raise HTTPException(status_code=400, detail="학교명이 필요합니다.")
        
        school = db.query(School).filter(School.name == school_name).first()
        if not school:
            raise HTTPException(status_code=400, detail="존재하지 않는 학교입니다.")
        
        # 3. User 테이블에 사용자 정보 저장
        user_data = {
            "email": student_data["email"],
            "password_hash": student_data["password"],  # TODO: 실제로는 해싱 필요
            "name": student_data["name"],
            "phone": student_data["phone"],
            "birth_date": datetime.strptime(student_data["birthDate"], "%Y-%m-%d").date(),
            "user_type": "student"
        }
        
        new_user = User(**user_data)
        db.add(new_user)
        db.flush()  # ID 생성
        
        # 4. Student 테이블에 학생 정보 저장
        student_data_db = {
            "user_id": new_user.id,
            "school_id": school.id,
            "grade": int(student_data["grade"]),
            "class_number": int(student_data["classNumber"]),
            "attendance_number": int(student_data["attendanceNumber"]),
            "student_number": f"S{new_user.id:06d}"  # 자동 생성
        }
        
        new_student = Student(**student_data_db)
        db.add(new_student)
        
        # 5. 커밋
        db.commit()
        db.refresh(new_user)
        db.refresh(new_student)
        
        logger.info(f"학생 회원가입 완료: {new_user.name} - {school.name} {student_data_db['grade']}학년 {student_data_db['class_number']}반")
        
        return {
            "success": True,
            "message": "학생 회원가입이 완료되었습니다.",
            "user_id": new_user.id,
            "student_id": new_student.id,
            "school_id": school.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"학생 회원가입 중 오류 발생: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="학생 회원가입 중 오류가 발생했습니다.")

@router.get("/users/search/students")
async def search_students(query: str, db: Session = Depends(get_db)):
    """학생 검색 (parent 회원가입용)"""
    try:
        logger.info(f"학생 검색 요청: query={query}")
        
        if not query or len(query.strip()) < 2:
            raise HTTPException(status_code=400, detail="검색어는 2글자 이상이어야 합니다.")
        
        # 학생명 또는 학생번호로 검색
        students = db.query(Student).join(User).filter(
            (User.name.ilike(f"%{query}%")) | 
            (Student.student_number.ilike(f"%{query}%"))
        ).limit(20).all()
        
        student_list = []
        for student in students:
            user = student.user
            school = db.query(School).filter(School.id == student.school_id).first()
            
            student_data = {
                "id": student.id,
                "name": user.name,
                "student_number": student.student_number,
                "grade": student.grade,
                "class_number": student.class_number,
                "school_name": school.name if school else None
            }
            student_list.append(student_data)
        
        logger.info(f"학생 검색 완료: {len(student_list)}명")
        return {
            "success": True,
            "students": student_list,
            "count": len(student_list)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"학생 검색 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="학생 검색 중 오류가 발생했습니다.")
