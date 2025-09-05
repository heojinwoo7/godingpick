#!/usr/bin/env python3
"""
파일명에 따라 교육청을 자동 결정하여 시간표 데이터를 가져오는 스크립트
"""

import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import sys
from dotenv import load_dotenv
import argparse

# 환경 변수 로드
load_dotenv()

class TimetableImporter:
    def __init__(self):
        self.conn = None
        self.connect()
        
        # 파일명과 교육청 코드 매핑
        self.filename_mapping = {
            '서울시': 'B10',
            '대구시': 'D10', 
            '부산시': 'C10',
            '인천시': 'E10',
            '광주시': 'F10',
            '대전시': 'G10',
            '울산시': 'H10',
            '세종시': 'I10',
            '경기도': 'J10',
            '강원도': 'K10',
            '충청북도': 'M10',
            '충청남도': 'N10',
            '전라북도': 'P10',
            '전라남도': 'Q10',
            '경상북도': 'R10',
            '경상남도': 'S10',
            '제주도': 'T10'
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
    
    def get_education_office_code(self, filename):
        """파일명에서 교육청 코드 추출"""
        for region, code in self.filename_mapping.items():
            if region in filename:
                return code
        return None
    
    def match_schools(self, df, education_office_code):
        """학교명으로 schools 테이블과 매칭"""
        print(f"🏫 학교 매칭 중... (교육청: {education_office_code})")
        
        # 일반계만 필터링
        general_schools = df[df['계열명'] == '일반계']
        print(f"   📊 일반계 학교 수: {len(general_schools):,}개")
        
        # 학교별 고유 정보 추출
        schools_data = general_schools.groupby(['행정표준코드', '학교명']).agg({
            '시도교육청코드': 'first',
            '시도교육청명': 'first',
            '계열명': 'first',
            '학과명': 'first',
            '학년도': 'first',
            '학기': 'first'
        }).reset_index()
        
        # 기존 schools 테이블과 매칭 (지정된 교육청 관할 학교만 1차 필터링)
        cursor = self.conn.cursor()
        matched_schools = {}
        unmatched_schools = []
        
        for _, row in schools_data.iterrows():
            school_code = str(row['행정표준코드'])
            school_name = row['학교명']
            
            # 지정된 교육청 관할 학교만 1차 필터링하여 매칭
            cursor.execute("""
                SELECT id, administrative_code, name, school_type
                FROM schools 
                WHERE (name = %s OR administrative_code = %s)
                AND education_office_code = %s
            """, (school_name, school_code, education_office_code))
            
            result = cursor.fetchone()
            if result:
                school_id, admin_code, db_name, school_type = result
                matched_schools[school_name] = {
                    'id': school_id,
                    'name': db_name,
                    'code': admin_code,
                    'type': school_type
                }
                print(f"   ✅ 매칭됨: {school_name} (ID: {school_id})")
            else:
                unmatched_schools.append({
                    'name': school_name,
                    'code': school_code
                })
                print(f"   ⚠️  매칭 안됨: {school_name} ({school_code})")
        
        print(f"   📊 매칭된 학교: {len(matched_schools)}개")
        print(f"   ⚠️  매칭 안된 학교: {len(unmatched_schools)}개")
        
        cursor.close()
        return matched_schools, unmatched_schools
    
    def process_school_classes(self, df, matched_schools):
        """학교 반 정보 처리 (school_classes 테이블)"""
        print("📚 학교 반 정보 처리 중...")
        
        # 일반계만 필터링
        general_schools = df[df['계열명'] == '일반계']
        
        classes_list = []
        processed_count = 0
        
        for _, row in general_schools.iterrows():
            school_name = row['학교명']
            
            # 매칭된 학교인지 확인
            if school_name not in matched_schools:
                continue
                
            school_id = matched_schools[school_name]['id']
            
            # 학년과 학급명을 안전하게 변환
            try:
                grade = int(row['학년']) if pd.notna(row['학년']) else 0
            except (ValueError, TypeError):
                grade = 0
                
            try:
                class_number = int(row['학급명']) if pd.notna(row['학급명']) else 0
            except (ValueError, TypeError):
                class_number = 0
            
            classroom = row['강의실명'] if pd.notna(row['강의실명']) else None
            academic_year = str(int(row['학년도'])) if pd.notna(row['학년도']) else '2025'
            semester = int(row['학기']) if pd.notna(row['학기']) else 2
            
            # class_name 생성 (1반, 2반, 3반 등)
            class_name = f"{class_number}반"
            
            classes_list.append((
                school_id,
                grade,
                class_name,
                academic_year,
                semester
            ))
            processed_count += 1
        
        # 학급 정보 삽입 (개별 처리로 중복 방지)
        cursor = self.conn.cursor()
        try:
            for i, class_data in enumerate(classes_list, 1):
                cursor.execute("""
                    INSERT INTO school_classes (school_id, grade, class_name, academic_year, semester)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (school_id, grade, class_name, academic_year, semester) DO NOTHING
                """, class_data)
                
                # 1000개마다 진행 상황 출력
                if i % 1000 == 0:
                    print(f"   📚 학급 정보 처리 중... {i:,}/{len(classes_list):,}개")
            
            self.conn.commit()
            print(f"   ✅ {processed_count}개 학급 정보 처리 완료")
            
        except Exception as e:
            print(f"   ❌ 학급 정보 처리 실패: {e}")
            self.conn.rollback()
        finally:
            cursor.close()
    
    def process_school_timetables(self, df, matched_schools, day_of_week):
        """학교 시간표 정보 처리 (school_timetables 테이블)"""
        print(f"📅 학교 시간표 정보 처리 중... (요일: {day_of_week})")
        
        # 일반계만 필터링
        general_schools = df[df['계열명'] == '일반계']
        
        # 학교 ID와 학급 ID 매핑 테이블 생성
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT s.name, s.id as school_id, c.grade, c.class_name, c.id as class_id
            FROM schools s
            JOIN school_classes c ON s.id = c.school_id
        """)
        
        mapping = {}
        for row in cursor.fetchall():
            key = (row[0], row[2], row[3])  # (school_name, grade, class_name)
            mapping[key] = (row[1], row[4])  # (school_id, class_id)
        
        timetables_list = []
        processed_count = 0
        
        for _, row in general_schools.iterrows():
            school_name = row['학교명']
            
            # 학년과 학급명을 안전하게 변환
            try:
                grade = int(row['학년']) if pd.notna(row['학년']) else 0
            except (ValueError, TypeError):
                grade = 0
                
            try:
                class_number = int(row['학급명']) if pd.notna(row['학급명']) else 0
            except (ValueError, TypeError):
                class_number = 0
            
            # 매칭된 학교인지 확인
            if school_name not in matched_schools:
                continue
            
            # class_name 생성
            class_name = f"{class_number}반"
            
            # 학급 매핑 확인
            key = (school_name, grade, class_name)
            if key not in mapping:
                continue
                
            school_id, class_id = mapping[key]
            
            period = int(row['교시']) if pd.notna(row['교시']) else 0
            subject_name = row['수업내용'] if pd.notna(row['수업내용']) else ''
            academic_year = str(int(row['학년도'])) if pd.notna(row['학년도']) else '2025'
            semester = int(row['학기']) if pd.notna(row['학기']) else 2
            
            timetables_list.append((
                school_id,
                class_id,
                day_of_week,
                period,
                subject_name,
                academic_year,
                semester
            ))
            processed_count += 1
        
        # 시간표 정보 삽입 (개별 처리로 중복 방지)
        cursor = self.conn.cursor()
        try:
            for i, timetable_data in enumerate(timetables_list, 1):
                cursor.execute("""
                    INSERT INTO school_timetables (school_id, class_id, day_of_week, period, subject_name, academic_year, semester)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (class_id, day_of_week, period, academic_year, semester) DO NOTHING
                """, timetable_data)
                
                # 1000개마다 진행 상황 출력
                if i % 1000 == 0:
                    print(f"   📅 시간표 정보 처리 중... {i:,}/{len(timetables_list):,}개")
            
            self.conn.commit()
            print(f"   ✅ {processed_count}개 시간표 정보 처리 완료")
            
        except Exception as e:
            print(f"   ❌ 시간표 정보 처리 실패: {e}")
            self.conn.rollback()
        finally:
            cursor.close()
    
    def import_csv(self, csv_file_path, day_of_week):
        """CSV 파일을 읽어서 데이터베이스에 삽입"""
        try:
            print(f"📖 CSV 파일 읽기: {csv_file_path}")
            df = pd.read_csv(csv_file_path, low_memory=False)
            print(f"   📊 총 {len(df):,}개 행")
            
            # 파일명에서 교육청 코드 추출
            filename = os.path.basename(csv_file_path)
            education_office_code = self.get_education_office_code(filename)
            
            if not education_office_code:
                print(f"❌ 파일명에서 교육청을 찾을 수 없습니다: {filename}")
                return False
            
            print(f"   🏛️  교육청 코드: {education_office_code}")
            
            # 학교 매칭
            matched_schools, unmatched_schools = self.match_schools(df, education_office_code)
            
            if not matched_schools:
                print("❌ 매칭된 학교가 없습니다.")
                return False
            
            # 학급 정보 처리
            self.process_school_classes(df, matched_schools)
            
            # 시간표 정보 처리
            self.process_school_timetables(df, matched_schools, day_of_week)
            
            print(f"✅ {filename} 임포트 완료!")
            return True
            
        except Exception as e:
            print(f"❌ 임포트 중 오류 발생: {e}")
            return False
    
    def close(self):
        """데이터베이스 연결 종료"""
        if self.conn:
            self.conn.close()
            print("✅ 데이터베이스 연결 종료")

def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(description='시간표 CSV 파일을 데이터베이스에 임포트')
    parser.add_argument('csv_file', help='CSV 파일 경로')
    parser.add_argument('day_of_week', type=int, help='요일 (1=월요일, 2=화요일, ...)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.csv_file):
        print(f"❌ 파일을 찾을 수 없습니다: {args.csv_file}")
        return
    
    importer = TimetableImporter()
    
    try:
        success = importer.import_csv(args.csv_file, args.day_of_week)
        if success:
            print("\n🎉 시간표 데이터 가져오기 완료!")
        else:
            print("\n❌ 시간표 데이터 가져오기 실패!")
            
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        
    finally:
        importer.close()

if __name__ == "__main__":
    main()
