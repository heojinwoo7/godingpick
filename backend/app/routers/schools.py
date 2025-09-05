from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import School
import logging

router = APIRouter()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/schools")
async def get_schools(db: Session = Depends(get_db)):
    """모든 학교 목록 조회"""
    try:
        schools = db.query(School).all()
        return {"success": True, "schools": schools, "count": len(schools)}
    except Exception as e:
        logger.error(f"학교 목록 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="학교 목록 조회 중 오류가 발생했습니다.")

@router.get("/schools/search")
async def search_schools(
    query: str = Query(..., description="검색할 학교명", min_length=1),
    db: Session = Depends(get_db)
):
    """학교명으로 학교 검색 (쿼리 파라미터 방식)"""
    try:
        if not query or len(query.strip()) < 1:
            raise HTTPException(status_code=400, detail="검색어를 입력해주세요.")
        
        # 검색어 정리
        clean_query = query.strip()
        
        # 학교명에 검색어가 포함된 학교들 검색
        schools = db.query(School).filter(School.name.ilike(f"%{clean_query}%")).limit(20).all()
        
        # 응답 데이터 구성
        school_list = []
        for school in schools:
            school_data = {
                "id": school.id,
                "name": school.name,
                "province": school.province,
                "district": school.district,
                "actual_district": school.actual_district,
                "address": school.address,
                "school_type": school.school_type,
                "education_office": school.education_office
            }
            school_list.append(school_data)
        
        print(f"✅ 학교 검색 완료: {len(school_list)}개 학교")
        logger.info(f"학교 검색 완료: {len(school_list)}개 학교")
        
        response_data = {
            "success": True,
            "schools": school_list,
            "count": len(school_list),
            "query": query
        }
        print(f"✅ 응답 데이터 준비 완료: {response_data}")
        logger.info(f"✅ 응답 데이터 준비 완료")
        
        return response_data
        
    except HTTPException as he:
        print(f"❌ HTTPException 발생: {he.detail}")
        logger.error(f"❌ HTTPException 발생: {he.detail}")
        raise
    except Exception as e:
        print(f"❌ 예상치 못한 오류 발생: {e}")
        logger.error(f"학교 검색 중 오류 발생: {e}")
        logger.error(f"오류 타입: {type(e).__name__}")
        logger.error(f"오류 상세: {str(e)}")
        raise HTTPException(status_code=500, detail="학교 검색 중 오류가 발생했습니다.")

@router.get("/schools/test")
async def test_schools(db: Session = Depends(get_db)):
    """학교 테스트 - 간단한 학교 목록 반환"""
    try:
        logger.info("학교 테스트 엔드포인트 호출")
        schools = db.query(School).limit(5).all()
        school_list = []
        for school in schools:
            school_data = {
                "id": school.id,
                "name": school.name,
                "province": school.province,
                "district": school.district
            }
            school_list.append(school_data)
        
        logger.info(f"테스트 학교 목록: {len(school_list)}개")
        return {
            "success": True,
            "schools": school_list,
            "count": len(school_list),
            "message": "테스트 성공"
        }
    except Exception as e:
        logger.error(f"학교 테스트 중 오류: {e}")
        return {"success": False, "error": str(e)}

@router.get("/schools/{school_id}")
async def get_school(school_id: int, db: Session = Depends(get_db)):
    """특정 학교 상세 정보 조회"""
    try:
        school = db.query(School).filter(School.id == school_id).first()
        if not school:
            raise HTTPException(status_code=404, detail="학교를 찾을 수 없습니다.")
        return {"success": True, "school": school}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"학교 정보 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="학교 정보 조회 중 오류가 발생했습니다.")
