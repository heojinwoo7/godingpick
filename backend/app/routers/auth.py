from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Student, School, Teacher, Parent
import logging
from datetime import datetime

router = APIRouter()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/signup/student")
async def signup_student(student_data: dict, db: Session = Depends(get_db)):
    """학생 회원가입 (Frontend와 호환)"""
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
        # 생년월일 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
        birth_date = None
        if student_data.get("birthDate"):
            try:
                birth_str = str(student_data["birthDate"])
                if len(birth_str) == 8:  # YYYYMMDD 형식
                    year = birth_str[:4]
                    month = birth_str[4:6]
                    day = birth_str[6:8]
                    birth_date = datetime.strptime(f"{year}-{month}-{day}", "%Y-%m-%d").date()
                else:  # 이미 YYYY-MM-DD 형식
                    birth_date = datetime.strptime(birth_str, "%Y-%m-%d").date()
            except ValueError as e:
                logger.warning(f"생년월일 파싱 실패: {birth_str}, 오류: {e}")
                birth_date = None
        
        user_data = {
            "email": student_data["email"],
            "password_hash": student_data["password"],  # TODO: 실제로는 해싱 필요
            "name": student_data["name"],
            "phone": student_data.get("phone"),
            "birth_date": birth_date,
            "user_type": "student"
        }
        
        new_user = User(**user_data)
        db.add(new_user)
        db.flush()  # ID 생성
        
        # 4. Student 테이블에 학생 정보 저장
        student_data_db = {
            "user_id": new_user.id,
            "school_id": school.id,
            "grade": int(student_data["grade"]) if student_data.get("grade") else None,
            "class_number": int(student_data["classNumber"]) if student_data.get("classNumber") else None,
            "attendance_number": int(student_data["attendanceNumber"]) if student_data.get("attendanceNumber") else None,
            "student_number": f"S{new_user.id:06d}"  # 자동 생성
        }
        
        new_student = Student(**student_data_db)
        db.add(new_student)
        
        # 5. 커밋
        db.commit()
        db.refresh(new_user)
        db.refresh(new_student)
        
        logger.info(f"학생 회원가입 완료: {new_user.name} - {school.name}")
        
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

@router.post("/signup/teacher")
async def signup_teacher(teacher_data: dict, db: Session = Depends(get_db)):
    """교사 회원가입 (Frontend와 호환)"""
    try:
        logger.info(f"교사 회원가입 시작: {teacher_data.get('email', 'Unknown')}")
        
        # 1. 이메일 중복 확인
        existing_user = db.query(User).filter(User.email == teacher_data["email"]).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")
        
        # 2. 학교 정보 확인
        school_name = teacher_data.get("schoolName")
        if not school_name:
            raise HTTPException(status_code=400, detail="학교명이 필요합니다.")
        
        school = db.query(School).filter(School.name == school_name).first()
        if not school:
            raise HTTPException(status_code=400, detail="존재하지 않는 학교입니다.")
        
        # 3. User 테이블에 사용자 정보 저장
        # 생년월일 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
        birth_date = None
        if teacher_data.get("birthDate"):
            try:
                birth_str = str(teacher_data["birthDate"])
                if len(birth_str) == 8:  # YYYYMMDD 형식
                    year = birth_str[:4]
                    month = birth_str[4:6]
                    day = birth_str[6:8]
                    birth_date = datetime.strptime(f"{year}-{month}-{day}", "%Y-%m-%d").date()
                else:  # 이미 YYYY-MM-DD 형식
                    birth_date = datetime.strptime(birth_str, "%Y-%m-%d").date()
            except ValueError as e:
                logger.warning(f"생년월일 파싱 실패: {birth_str}, 오류: {e}")
                birth_date = None
        
        user_data = {
            "email": teacher_data["email"],
            "password_hash": teacher_data["password"],
            "name": teacher_data["name"],
            "phone": teacher_data.get("phone"),
            "birth_date": birth_date,
            "user_type": "teacher"
        }
        
        new_user = User(**user_data)
        db.add(new_user)
        db.flush()
        
        # 4. Teacher 테이블에 교사 정보 저장
        teacher_data_db = {
            "user_id": new_user.id,
            "school_id": school.id,
            "teacher_number": f"T{new_user.id:06d}",
            "position": teacher_data.get("position", "교과"),
            "hire_date": datetime.now().date(),
            "is_homeroom_teacher": False
        }
        
        new_teacher = Teacher(**teacher_data_db)
        db.add(new_teacher)
        
        # 5. 커밋
        db.commit()
        db.refresh(new_user)
        db.refresh(new_teacher)
        
        logger.info(f"교사 회원가입 완료: {new_user.name} - {school.name}")
        
        return {
            "success": True,
            "message": "교사 회원가입이 완료되었습니다.",
            "user_id": new_user.id,
            "teacher_id": new_teacher.id,
            "school_id": school.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"교사 회원가입 중 오류 발생: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="교사 회원가입 중 오류가 발생했습니다.")

@router.post("/signup/parent")
async def signup_parent(parent_data: dict, db: Session = Depends(get_db)):
    """학부모 회원가입 (Frontend와 호환)"""
    try:
        logger.info(f"학부모 회원가입 시작: {parent_data.get('email', 'Unknown')}")
        
        # 1. 이메일 중복 확인
        existing_user = db.query(User).filter(User.email == parent_data["email"]).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")
        
        # 2. User 테이블에 사용자 정보 저장
        # 생년월일 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
        birth_date = None
        if parent_data.get("birthDate"):
            try:
                birth_str = str(parent_data["birthDate"])
                if len(birth_str) == 8:  # YYYYMMDD 형식
                    year = birth_str[:4]
                    month = birth_str[4:6]
                    day = birth_str[6:8]
                    birth_date = datetime.strptime(f"{year}-{month}-{day}", "%Y-%m-%d").date()
                else:  # 이미 YYYY-MM-DD 형식
                    birth_date = datetime.strptime(birth_str, "%Y-%m-%d").date()
            except ValueError as e:
                logger.warning(f"생년월일 파싱 실패: {birth_str}, 오류: {e}")
                birth_date = None
        
        user_data = {
            "email": parent_data["email"],
            "password_hash": parent_data["password"],
            "name": parent_data["name"],
            "phone": parent_data.get("phone"),
            "birth_date": birth_date,
            "user_type": "parent"
        }
        
        new_user = User(**user_data)
        db.add(new_user)
        db.flush()
        
        # 3. Parent 테이블에 학부모 정보 저장
        parent_data_db = {
            "user_id": new_user.id,
            "relationship": parent_data.get("relationship", "보호자"),
            "occupation": parent_data.get("occupation"),
            "emergency_contact": parent_data.get("phone")
        }
        
        new_parent = Parent(**parent_data_db)
        db.add(new_parent)
        
        # 4. 커밋
        db.commit()
        db.refresh(new_user)
        db.refresh(new_parent)
        
        logger.info(f"학부모 회원가입 완료: {new_user.name}")
        
        return {
            "success": True,
            "message": "학부모 회원가입이 완료되었습니다.",
            "user_id": new_user.id,
            "parent_id": new_parent.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"학부모 회원가입 중 오류 발생: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="학부모 회원가입 중 오류가 발생했습니다.")
