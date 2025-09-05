#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Subject, Department
import logging

router = APIRouter()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/subjects")
async def get_subjects(db: Session = Depends(get_db)):
    """모든 과목 목록 조회"""
    try:
        print("🔍🔍🔍 과목 목록 API 엔드포인트 호출됨!")
        logger.info("🔍🔍🔍 과목 목록 API 엔드포인트 호출됨!")
        
        # 직접 SQL 쿼리로 데이터 조회 (실제 DB 스키마에 맞춤)
        result = db.execute(text("""
            SELECT id, subject_name, department_name, subject_type, credit_hours
            FROM subjects 
            ORDER BY id
        """))
        subjects = result.fetchall()
        
        print(f"🔍 DB에서 조회된 과목 개수: {len(subjects)}")
        logger.info(f"🔍 DB에서 조회된 과목 개수: {len(subjects)}")
        
        # 결과를 딕셔너리 형태로 변환 (앱에서 실제 사용하는 필드만)
        subject_list = []
        for subject in subjects:
            subject_list.append({
                "id": subject.id,
                "subject_name": subject.subject_name,
                "department_name": subject.department_name,
                "subject_type": subject.subject_type,
                "credit_hours": subject.credit_hours
            })
        
        logger.info(f"과목 목록 조회 성공: {len(subject_list)}개")
        return {"success": True, "subjects": subject_list}
        
    except Exception as e:
        print(f"❌ 과목 목록 조회 중 오류 발생: {e}")
        print(f"❌ 오류 타입: {type(e).__name__}")
        print(f"❌ 오류 상세: {str(e)}")
        logger.error(f"과목 목록 조회 중 오류 발생: {e}")
        logger.error(f"오류 타입: {type(e).__name__}")
        logger.error(f"오류 상세: {str(e)}")
        raise HTTPException(status_code=500, detail="과목 목록 조회 중 오류가 발생했습니다.")

@router.get("/subjects/{subject_id}")
async def get_subject(subject_id: int, db: Session = Depends(get_db)):
    """특정 과목 정보 조회"""
    try:
        # TODO: 과목 테이블 생성 후 실제 데이터 조회
        raise HTTPException(status_code=404, detail="과목을 찾을 수 없습니다.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"과목 정보 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="과목 정보 조회 중 오류가 발생했습니다.")

@router.get("/subjects/search/{keyword}")
async def search_subjects(keyword: str, db: Session = Depends(get_db)):
    """과목명으로 과목 검색"""
    try:
        # TODO: 과목 테이블 생성 후 실제 검색 구현
        return {"subjects": []}
    except Exception as e:
        logger.error(f"과목 검색 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="과목 검색 중 오류가 발생했습니다.")
