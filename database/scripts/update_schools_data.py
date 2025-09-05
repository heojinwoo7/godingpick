#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 데이터베이스 연결 설정
DB_CONFIG = {
    'host': '3.35.3.225',
    'database': 'hw_project001',
    'user': 'postgres',
    'password': '!@heart_ware2@!'  # 실제 비밀번호로 변경 필요
}

def connect_to_db():
    """데이터베이스 연결"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        logger.info("데이터베이스 연결 성공")
        return conn
    except Exception as e:
        logger.error(f"데이터베이스 연결 실패: {e}")
        return None

def read_excel_data():
    """Excel 파일에서 학교 데이터 읽기"""
    try:
        # Excel 파일 읽기 (파일명 변경됨)
        df = pd.read_excel('highschool_list.xlsx')
        logger.info(f"Excel 파일 읽기 성공: {len(df)}개 행")
        
        # 필요한 컬럼만 추출
        schools_data = df[['학교명', '도로명주소', '구분']].copy()
        
        # NaN 값 처리
        schools_data = schools_data.dropna(subset=['학교명'])
        schools_data['도로명주소'] = schools_data['도로명주소'].fillna('')
        schools_data['구분'] = schools_data['구분'].fillna('')
        
        logger.info(f"처리된 데이터: {len(schools_data)}개 행")
        return schools_data
        
    except Exception as e:
        logger.error(f"Excel 파일 읽기 실패: {e}")
        return None

def insert_new_schools(conn, schools_data):
    """새로운 학교들을 데이터베이스에 삽입"""
    try:
        cursor = conn.cursor()
        
        # 기존 학교명 목록 조회
        cursor.execute("SELECT name FROM schools")
        existing_schools = {row[0] for row in cursor.fetchall()}
        
        # 새로운 학교들만 필터링
        new_schools = schools_data[~schools_data['학교명'].isin(existing_schools)]
        
        if len(new_schools) == 0:
            logger.info("새로 추가할 학교가 없습니다.")
            return 0
        
        logger.info(f"새로 추가할 학교: {len(new_schools)}개")
        
        # 새로운 학교들 삽입
        inserted_count = 0
        for index, row in new_schools.iterrows():
            try:
                cursor.execute("""
                    INSERT INTO schools (
                        administrative_code,
                        name,
                        school_type,
                        province,
                        education_office,
                        district,
                        address,
                        actual_district,
                        establishment_type,
                        created_at,
                        updated_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                """, (
                    f"NEW{inserted_count + 1:04d}",  # 임시 행정코드
                    row['학교명'],
                    '고등학교',  # 기본값
                    '미분류',    # 기본값
                    '미분류교육청',  # 기본값
                    '미분류',    # 기본값
                    row['도로명주소'],
                    row['구분'],
                    '미분류'     # 기본값
                ))
                
                inserted_count += 1
                logger.info(f"새 학교 추가: {row['학교명']}")
                
            except Exception as e:
                logger.error(f"학교 추가 실패 ({row['학교명']}): {e}")
                continue
        
        conn.commit()
        cursor.close()
        logger.info(f"새 학교 추가 완료: {inserted_count}개")
        return inserted_count
        
    except Exception as e:
        logger.error(f"새 학교 추가 중 오류: {e}")
        conn.rollback()
        return 0

def update_existing_schools(conn, schools_data):
    """기존 학교들의 데이터 업데이트"""
    try:
        cursor = conn.cursor()
        
        # 업데이트된 행 수 카운트
        updated_count = 0
        not_found_count = 0
        
        for index, row in schools_data.iterrows():
            school_name = row['학교명']
            address = row['도로명주소']
            division = row['구분']
            
            # 학교명으로 기존 데이터 검색
            cursor.execute(
                "SELECT id, name FROM schools WHERE name = %s",
                (school_name,)
            )
            
            result = cursor.fetchone()
            
            if result:
                school_id, existing_name = result
                
                # address와 actual_district 업데이트
                cursor.execute(
                    """
                    UPDATE schools 
                    SET 
                        address = %s,
                        actual_district = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    """,
                    (address, division, school_id)
                )
                
                updated_count += 1
                logger.info(f"업데이트 성공: {school_name} (ID: {school_id})")
                
            else:
                not_found_count += 1
                logger.warning(f"학교를 찾을 수 없음: {school_name}")
        
        # 변경사항 커밋
        conn.commit()
        cursor.close()
        
        logger.info(f"업데이트 완료: {updated_count}개 성공, {not_found_count}개 찾을 수 없음")
        return updated_count, not_found_count
        
    except Exception as e:
        logger.error(f"데이터베이스 업데이트 실패: {e}")
        conn.rollback()
        return 0, 0

def verify_updates(conn):
    """업데이트 결과 검증"""
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # 업데이트된 학교들 확인
        cursor.execute("""
            SELECT 
                id, 
                name, 
                address, 
                actual_district,
                province,
                district
            FROM schools 
            WHERE address IS NOT NULL AND actual_district IS NOT NULL
            ORDER BY id
            LIMIT 10
        """
        )
        
        results = cursor.fetchall()
        
        logger.info("=== 업데이트 결과 검증 (처음 10개) ===")
        for row in results:
            logger.info(f"ID: {row['id']}, 학교: {row['name']}")
            logger.info(f"  주소: {row['address']}")
            logger.info(f"  행정구역: {row['actual_district']}")
            logger.info(f"  시도: {row['province']}")
            logger.info(f"  관할구역: {row['district']}")
            logger.info("---")
        
        cursor.close()
        
    except Exception as e:
        logger.error(f"검증 실패: {e}")

def main():
    """메인 함수"""
    logger.info("=== 학교 데이터 업데이트 시작 ===")
    
    # 1. Excel 데이터 읽기
    schools_data = read_excel_data()
    if schools_data is None:
        logger.error("Excel 데이터 읽기 실패")
        return
    
    # 2. 데이터베이스 연결
    conn = connect_to_db()
    if conn is None:
        logger.error("데이터베이스 연결 실패")
        return
    
    try:
        # 3. 새로운 학교들 추가
        inserted_count = insert_new_schools(conn, schools_data)
        
        # 4. 기존 학교들 업데이트
        updated_count, not_found_count = update_existing_schools(conn, schools_data)
        
        # 5. 결과 검증
        verify_updates(conn)
        
        # 6. 최종 통계
        logger.info("=== 최종 결과 ===")
        logger.info(f"총 Excel 데이터: {len(schools_data)}개")
        logger.info(f"새로 추가된 학교: {inserted_count}개")
        logger.info(f"성공적으로 업데이트: {updated_count}개")
        logger.info(f"찾을 수 없음: {not_found_count}개")
        
        if inserted_count > 0 or updated_count > 0:
            logger.info("✅ 학교 데이터 처리가 성공적으로 완료되었습니다!")
        else:
            logger.warning("⚠️ 처리된 데이터가 없습니다.")
            
    except Exception as e:
        logger.error(f"처리 중 오류 발생: {e}")
        
    finally:
        conn.close()
        logger.info("데이터베이스 연결 종료")

if __name__ == "__main__":
    main()
