from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Student, School, Post, Comment
import logging

router = APIRouter()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/community/posts")
async def get_posts(db: Session = Depends(get_db)):
    """모든 게시글 조회"""
    try:
        posts = db.query(Post).all()
        return {"posts": posts}
    except Exception as e:
        logger.error(f"게시글 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="게시글 조회 중 오류가 발생했습니다.")

@router.get("/community/posts/{post_id}")
async def get_post(post_id: int, db: Session = Depends(get_db)):
    """특정 게시글 조회"""
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
        return post
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"게시글 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="게시글 조회 중 오류가 발생했습니다.")

@router.get("/community/user-school-info/{user_id}")
async def get_user_school_info(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    사용자-학생-학교 정보를 3개 테이블 JOIN으로 가져오는 API
    """
    try:
        logger.info(f"사용자-학생-학교 정보 조회 요청: user_id={user_id}")
        
        user_student_school = db.query(User, Student, School).join(
            Student, User.id == Student.user_id
        ).join(
            School, Student.school_id == School.id
        ).filter(User.id == user_id).first()
        
        if not user_student_school:
            raise HTTPException(
                status_code=404,
                detail="사용자, 학생, 또는 학교 정보를 찾을 수 없습니다."
            )
        
        user, student, school = user_student_school
        
        response_data = {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "birth_date": user.birth_date,
                "user_type": user.user_type
            },
            "student": {
                "id": student.id,
                "grade": student.grade,
                "class_number": student.class_number,
                "student_number": student.student_number,
                "attendance_number": student.attendance_number
            },
            "school": {
                "id": school.id,
                "name": school.name,
                "province": school.province,
                "district": school.district,
                "actual_district": school.actual_district,
                "address": school.address,
                "school_type": school.school_type,
                "education_office": school.education_office
            }
        }
        
        logger.info(f"사용자-학생-학교 정보 조회 완료: {user.name} - {school.name}")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"사용자-학생-학교 정보 조회 중 오류 발생: {e}")
        raise HTTPException(
            status_code=500,
            detail="사용자-학생-학교 정보 조회 중 오류가 발생했습니다."
        )

@router.get("/community/posts/by-location/{location_type}/{location_value}")
async def get_posts_by_location(
    location_type: str,
    location_value: str,
    db: Session = Depends(get_db)
):
    """위치별 게시글 조회"""
    try:
        if location_type == "school":
            posts = db.query(Post).filter(Post.location_level3 == location_value).all()
        elif location_type == "city":
            posts = db.query(Post).filter(Post.location_level1 == location_value).all()
        elif location_type == "district":
            posts = db.query(Post).filter(Post.location_level2 == location_value).all()
        else:
            raise HTTPException(status_code=400, detail="잘못된 위치 타입입니다.")
        
        return {"posts": posts}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"위치별 게시글 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="위치별 게시글 조회 중 오류가 발생했습니다.")
