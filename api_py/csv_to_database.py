#!/usr/bin/env python3
"""
CSV 파일을 PostgreSQL 데이터베이스로 임포트하는 스크립트
대구광역시 일반계 고등학교 시간표 데이터 처리
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, date
import os
from dotenv import load_dotenv
import sys

# .env 파일 로드
load_dotenv()

class TimetableImporter:
    def __init__(self, db_config):
        self.db_config = db_config
        self.conn = None
        
    def connect_db(self):
        """데이터베이스 연결"""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            print("✅ 데이터베이스 연결 성공")
            return True
        except Exception as e:
            print(f"❌ 데이터베이스 연결 실패: {e}")
            return False
    
    def close_db(self):
        """데이터베이스 연결 종료"""
        if self.conn:
            self.conn.close()
            print("✅ 데이터베이스 연결 종료")
    
    def load_csv_data(self, csv_file_path):
        """CSV 파일 로드 및 일반계 필터링"""
        print(f"📁 CSV 파일 로드 중: {csv_file_path}")
        
        try:
            # CSV 파일 읽기
            df = pd.read_csv(csv_file_path, encoding='utf-8')
            print(f"   총 레코드 수: {len(df):,}개")
            
            # 일반계만 필터링
            general_df = df[df['계열명'] == '일반계'].copy()
            print(f"   일반계 레코드 수: {len(general_df):,}개")
            
            # 1-3학년만 필터링
            grade_df = general_df[general_df['학년'].isin([1, 2, 3])].copy()
            print(f"   1-3학년 레코드 수: {len(grade_df):,}개")
            
            return grade_df
            
        except Exception as e:
            print(f"❌ CSV 파일 로드 실패: {e}")
            return None
    
    def extract_date_info(self, date_str):
        """날짜 문자열에서 요일 정보 추출"""
        try:
            # YYYYMMDD 형식을 datetime으로 변환
            date_obj = datetime.strptime(str(date_str), '%Y%m%d')
            # 요일 번호 (1=월요일, 2=화요일, ...)
            day_of_week = date_obj.weekday() + 1
            return date_obj.date(), day_of_week
        except:
            return None, None
    
    def process_schools(self, df):
        """학교 정보 처리"""
        print("🏫 학교 정보 처리 중...")
        
        # 학교별 고유 정보 추출
        schools_data = df.groupby(['행정표준코드', '학교명']).agg({
            '시도교육청코드': 'first',
            '시도교육청명': 'first',
            '계열명': 'first',
            '학과명': 'first',
            '학년도': 'first',
            '학기': 'first'
        }).reset_index()
        
        schools_list = []
        for _, row in schools_data.iterrows():
            schools_list.append((
                row['행정표준코드'],
                row['학교명'],
                row['시도교육청코드'],
                row['시도교육청명'],
                row['계열명'],
                row['학과명'],
                int(row['학년도']),
                int(row['학기'])
            ))
        
        # 학교 정보 삽입
        cursor = self.conn.cursor()
        try:
            execute_values(
                cursor,
                """
                INSERT INTO timetable_schools (school_code, school_name, region_code, region_name, 
                                    school_type, department, academic_year, semester)
                VALUES %s
                ON CONFLICT (school_code) DO UPDATE SET
                    school_name = EXCLUDED.school_name,
                    region_name = EXCLUDED.region_name,
                    school_type = EXCLUDED.school_type,
                    department = EXCLUDED.department,
                    academic_year = EXCLUDED.academic_year,
                    semester = EXCLUDED.semester,
                    updated_at = CURRENT_TIMESTAMP
                """,
                schools_list
            )
            self.conn.commit()
            print(f"   ✅ {len(schools_list)}개 학교 정보 처리 완료")
            
        except Exception as e:
            print(f"   ❌ 학교 정보 처리 실패: {e}")
            self.conn.rollback()
        finally:
            cursor.close()
    
    def process_classes(self, df):
        """학급 정보 처리"""
        print("📚 학급 정보 처리 중...")
        
        # 학교 ID 조회를 위한 매핑 테이블 생성
        cursor = self.conn.cursor()
        cursor.execute("SELECT school_code, id FROM timetable_schools WHERE school_type = '일반계'")
        school_mapping = {row[0]: row[1] for row in cursor.fetchall()}
        
        # 학급별 고유 정보 추출
        classes_data = df.groupby(['행정표준코드', '학년', '학급명']).agg({
            '강의실명': 'first'
        }).reset_index()
        
        classes_list = []
        for _, row in classes_data.iterrows():
            school_id = school_mapping.get(row['행정표준코드'])
            if school_id:
                classes_list.append((
                    school_id,
                    int(row['학년']),
                    int(row['학급명']),
                    row['강의실명']
                ))
        
        # 학급 정보 삽입
        try:
            execute_values(
                cursor,
                """
                INSERT INTO timetable_classes (school_id, grade, class_number, classroom)
                VALUES %s
                ON CONFLICT (school_id, grade, class_number) DO UPDATE SET
                    classroom = EXCLUDED.classroom
                """,
                classes_list
            )
            self.conn.commit()
            print(f"   ✅ {len(classes_list)}개 학급 정보 처리 완료")
            
        except Exception as e:
            print(f"   ❌ 학급 정보 처리 실패: {e}")
            self.conn.rollback()
        finally:
            cursor.close()
    
    def process_timetables(self, df):
        """시간표 정보 처리"""
        print("📅 시간표 정보 처리 중...")
        
        # 학교 ID와 학급 ID 매핑 테이블 생성
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT s.school_code, s.id as school_id, c.grade, c.class_number, c.id as class_id
            FROM timetable_schools s
            JOIN timetable_classes c ON s.id = c.school_id
            WHERE s.school_type = '일반계'
        """)
        
        mapping = {}
        for row in cursor.fetchall():
            key = (row[0], row[2], row[3])  # (school_code, grade, class_number)
            mapping[key] = (row[1], row[4])  # (school_id, class_id)
        
        timetables_list = []
        processed_count = 0
        
        for _, row in df.iterrows():
            # 날짜 정보 추출
            date_obj, day_of_week = self.extract_date_info(row['시간표일자'])
            if not date_obj or not day_of_week:
                continue
            
            # 매핑 정보 조회
            key = (row['행정표준코드'], int(row['학년']), int(row['학급명']))
            school_id, class_id = mapping.get(key, (None, None))
            
            if school_id and class_id:
                timetables_list.append((
                    school_id,
                    class_id,
                    date_obj,
                    day_of_week,
                    int(row['교시']),
                    row['수업내용'],
                    row['강의실명'],
                    int(row['학년도']),
                    int(row['학기']),
                    datetime.strptime(str(row['수정일자']), '%Y%m%d').date() if pd.notna(row['수정일자']) else None
                ))
                processed_count += 1
        
        # 시간표 정보 삽입
        try:
            execute_values(
                cursor,
                """
                INSERT INTO timetable_data (school_id, class_id, date, day_of_week, period, 
                                       subject, classroom, academic_year, semester, modified_date)
                VALUES %s
                ON CONFLICT (school_id, class_id, date, period) DO UPDATE SET
                    subject = EXCLUDED.subject,
                    classroom = EXCLUDED.classroom,
                    modified_date = EXCLUDED.modified_date
                """,
                timetables_list
            )
            self.conn.commit()
            print(f"   ✅ {processed_count:,}개 시간표 정보 처리 완료")
            
        except Exception as e:
            print(f"   ❌ 시간표 정보 처리 실패: {e}")
            self.conn.rollback()
        finally:
            cursor.close()
    
    def import_csv(self, csv_file_path):
        """CSV 파일 전체 임포트"""
        print(f"\n🚀 CSV 파일 임포트 시작: {csv_file_path}")
        
        # 1. 데이터베이스 연결
        if not self.connect_db():
            return False
        
        try:
            # 2. CSV 파일 로드
            df = self.load_csv_data(csv_file_path)
            if df is None:
                return False
            
            # 3. 학교 정보 처리
            self.process_schools(df)
            
            # 4. 학급 정보 처리
            self.process_classes(df)
            
            # 5. 시간표 정보 처리
            self.process_timetables(df)
            
            print("\n🎉 CSV 파일 임포트 완료!")
            return True
            
        except Exception as e:
            print(f"\n❌ 임포트 중 오류 발생: {e}")
            return False
        finally:
            self.close_db()
    
    def get_statistics(self):
        """임포트된 데이터 통계 조회"""
        if not self.connect_db():
            return
        
        cursor = self.conn.cursor()
        try:
            # 전체 통계
            cursor.execute("SELECT COUNT(*) FROM timetable_schools WHERE school_type = '일반계'")
            school_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM timetable_classes")
            class_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM timetable_data")
            timetable_count = cursor.fetchone()[0]
            
            print(f"\n📊 데이터베이스 통계:")
            print(f"   일반계 고등학교 수: {school_count:,}개")
            print(f"   총 학급 수: {class_count:,}개")
            print(f"   총 시간표 항목 수: {timetable_count:,}개")
            
            # 학교별 통계
            cursor.execute("""
                SELECT school_name, grade_count, class_count, total_periods
                FROM timetable_stats
                ORDER BY school_name
                LIMIT 10
            """)
            
            print(f"\n📋 상위 10개 학교 통계:")
            for row in cursor.fetchall():
                print(f"   {row[0]}: {row[1]}학년, {row[2]}반, {row[3]:,}개 시간")
                
        except Exception as e:
            print(f"❌ 통계 조회 실패: {e}")
        finally:
            cursor.close()
            self.close_db()

def main():
    # 데이터베이스 설정
    db_config = {
        'host': '3.35.3.225',
        'database': 'hw_project001',
        'user': 'postgres',
        'password': '!@heart_ware2@!'
    }
    
    # CSV 파일 경로
    csv_file_path = "/Users/hjw/Downloads/고등학교시간표.csv"
    
    # 임포터 생성 및 실행
    importer = TimetableImporter(db_config)
    
    if len(sys.argv) > 1 and sys.argv[1] == '--stats':
        # 통계만 조회
        importer.get_statistics()
    else:
        # CSV 파일 임포트
        success = importer.import_csv(csv_file_path)
        if success:
            importer.get_statistics()

if __name__ == "__main__":
    main()
