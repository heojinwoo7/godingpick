#!/usr/bin/env python3
"""
Excel 파일에서 schools 테이블로 데이터를 가져오는 스크립트
"""

import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

class SchoolImporter:
    def __init__(self):
        self.conn = None
        self.connect()
        
        # 교육청 코드 매핑
        self.education_office_mapping = {
            '서울특별시교육청': 'B10',
            '부산광역시교육청': 'C10', 
            '대구광역시교육청': 'D10',
            '인천광역시교육청': 'E10',
            '광주광역시교육청': 'F10',
            '대전광역시교육청': 'G10',
            '울산광역시교육청': 'H10',
            '세종특별자치시교육청': 'I10',
            '경기도교육청': 'J10',
            '강원특별자치도교육청': 'K10',
            '충청북도교육청': 'M10',
            '충청남도교육청': 'N10',
            '전북특별자치도교육청': 'P10',
            '전라남도교육청': 'Q10',
            '경상북도교육청': 'R10',
            '경상남도교육청': 'S10',
            '제주특별자치도교육청': 'T10',
            # 재외학교들은 특별 코드 사용
            '재외한국학교교육청': 'Z10',
            '재외교육지원담당관실': 'Z20'
        }
    
    def connect(self):
        """데이터베이스 연결"""
        try:
            self.conn = psycopg2.connect(
                host=os.getenv('DB_HOST', '3.35.3.225'),
                port=os.getenv('DB_PORT', '5432'),
                database=os.getenv('DB_NAME', 'hw_project001'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD')
            )
            print("✅ 데이터베이스 연결 성공")
        except Exception as e:
            print(f"❌ 데이터베이스 연결 실패: {e}")
            raise
    
    def import_schools(self, excel_file_path):
        """Excel 파일에서 학교 데이터를 가져와서 데이터베이스에 삽입"""
        try:
            print(f"📖 Excel 파일 읽기: {excel_file_path}")
            df = pd.read_excel(excel_file_path)
            print(f"   📊 총 {len(df):,}개 학교 데이터")
            
            # 데이터 정리
            df = df.fillna('')  # NaN 값을 빈 문자열로 변경
            
            cursor = self.conn.cursor()
            
            # 배치 삽입을 위한 리스트
            schools_data = []
            
            for _, row in df.iterrows():
                # 교육청 코드 매핑
                education_office = row['시도교육청명']
                education_office_code = self.education_office_mapping.get(education_office, 'Z99')  # 알 수 없는 교육청은 Z99
                
                if education_office_code == 'Z99':
                    print(f"⚠️  알 수 없는 교육청 (Z99 처리): {education_office}")
                
                # 데이터 정리 함수
                def clean_data(value, default=None):
                    if pd.isna(value) or value == '':
                        return default
                    return str(value).strip()
                
                # school_type이 누락된 경우 기본값 설정
                school_type = clean_data(row['학교종류명'], '고등학교')
                
                school_data = (
                    clean_data(row['시도교육청명']),  # education_office
                    clean_data(row['행정표준코드']),  # administrative_code
                    clean_data(row['학교명']),  # name
                    school_type,  # school_type (기본값 적용)
                    clean_data(row['시도명']),  # province
                    clean_data(row['구분']),  # district
                    clean_data(row['설립명']),  # establishment_type
                    clean_data(row['전화번호']),  # phone
                    clean_data(row['홈페이지주소']),  # website
                    clean_data(row['고등학교구분명']),  # high_school_category
                    clean_data(row['고등학교일반전문구분명']),  # high_school_division
                    clean_data(row['구분']),  # actual_district (구분과 동일)
                    clean_data(row['도로명주소']),  # address
                    education_office_code  # education_office_code
                )
                
                schools_data.append(school_data)
            
            print(f"   📝 삽입할 데이터: {len(schools_data):,}개")
            
            # 배치 삽입
            insert_query = """
                INSERT INTO schools (
                    education_office, administrative_code, name, school_type,
                    province, district, establishment_type, phone, website,
                    high_school_category, high_school_division, actual_district,
                    address, education_office_code
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.executemany(insert_query, schools_data)
            self.conn.commit()
            
            print(f"✅ {len(schools_data):,}개 학교 데이터 삽입 완료")
            
            # 삽입 결과 확인
            cursor.execute("SELECT COUNT(*) FROM schools")
            total_count = cursor.fetchone()[0]
            print(f"📊 현재 schools 테이블 총 개수: {total_count:,}개")
            
            # 교육청별 통계
            cursor.execute("""
                SELECT education_office_code, education_office, COUNT(*) as school_count
                FROM schools 
                GROUP BY education_office_code, education_office 
                ORDER BY school_count DESC
            """)
            
            print("\n📈 교육청별 학교 수:")
            for row in cursor.fetchall():
                print(f"   {row[0]}: {row[1]} - {row[2]:,}개")
            
            cursor.close()
            
        except Exception as e:
            print(f"❌ 학교 데이터 삽입 실패: {e}")
            self.conn.rollback()
            raise
    
    def close(self):
        """데이터베이스 연결 종료"""
        if self.conn:
            self.conn.close()
            print("✅ 데이터베이스 연결 종료")

def main():
    """메인 함수"""
    excel_file_path = '/Users/hjw/Desktop/Real_Project/heartware_highschool/data/highschool_list.xlsx'
    
    if not os.path.exists(excel_file_path):
        print(f"❌ Excel 파일을 찾을 수 없습니다: {excel_file_path}")
        return
    
    importer = SchoolImporter()
    
    try:
        importer.import_schools(excel_file_path)
        print("\n🎉 학교 데이터 가져오기 완료!")
        
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        
    finally:
        importer.close()

if __name__ == "__main__":
    main()
