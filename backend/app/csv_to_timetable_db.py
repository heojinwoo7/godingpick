#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSV 시간표 데이터를 PostgreSQL 데이터베이스에 임포트하는 스크립트
기존 schools 테이블과 연동하여 timetable_classes, timetable_data 테이블에 저장
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import sys
from datetime import datetime
import argparse

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
    
    def parse_date(self, date_str):
        """날짜 문자열을 DATE 객체로 변환"""
        try:
            if isinstance(date_str, str) and len(date_str) == 8:
                return datetime.strptime(date_str, '%Y%m%d').date()
            return None
        except:
            return None
    
    def get_day_of_week(self, date_obj):
        """날짜에서 요일 번호 추출 (1=월, 2=화, 3=수, 4=목, 5=금)"""
        if date_obj:
            weekday = date_obj.weekday()  # 0=월요일, 6=일요일
            return weekday + 1 if weekday < 5 else None  # 월~금만
        return None
    
    def match_schools(self, df):
        """CSV의 학교 정보를 기존 schools 테이블과 매칭"""
        print("🏫 학교 정보 매칭 중...")
        
        # 일반계만 필터링
        general_schools = df[df['계열명'] == '일반계']
        
        # 학교별 고유 정보 추출
        schools_data = general_schools.groupby(['행정표준코드', '학교명']).agg({
            '시도교육청코드': 'first',
            '시도교육청명': 'first',
            '계열명': 'first',
            '학과명': 'first',
            '학년도': 'first',
            '학기': 'first'
        }).reset_index()
        
        # 기존 schools 테이블과 매칭
        cursor = self.conn.cursor()
        matched_schools = {}
        unmatched_schools = []
        
        for _, row in schools_data.iterrows():
            school_code = str(row['행정표준코드'])
            school_name = row['학교명']
            
            # 기존 schools 테이블에서 학교 찾기 (이름 또는 코드로)
            cursor.execute("""
                SELECT id, administrative_code, name, school_type
                FROM schools 
                WHERE name = %s OR administrative_code = %s
            """, (school_name, school_code))
            
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
    
    def process_classes(self, df, matched_schools):
        """학급 정보 처리"""
        print("📚 학급 정보 처리 중...")
        
        # 일반계만 필터링
        general_schools = df[df['계열명'] == '일반계']
        
        # 학급별 고유 정보 추출 (중복 제거)
        classes_data = general_schools.groupby(['학교명', '학년', '학급명', '학년도', '학기']).agg({
            '강의실명': 'first'
        }).reset_index()
        
        classes_list = []
        processed_count = 0
        
        for _, row in classes_data.iterrows():
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
            academic_year = int(row['학년도']) if pd.notna(row['학년도']) else 2025
            semester = int(row['학기']) if pd.notna(row['학기']) else 2
            
            classes_list.append((
                school_id,
                grade,
                class_number,
                classroom,
                academic_year,
                semester
            ))
            processed_count += 1
        
        # 학급 정보 삽입 (개별 처리로 중복 방지)
        cursor = self.conn.cursor()
        try:
            for class_data in classes_list:
                cursor.execute("""
                    INSERT INTO timetable_classes (school_id, grade, class_number, classroom, academic_year, semester)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (school_id, grade, class_number, academic_year, semester) DO UPDATE SET
                        classroom = EXCLUDED.classroom
                """, class_data)
            
            self.conn.commit()
            print(f"   ✅ {processed_count}개 학급 정보 처리 완료")
            
        except Exception as e:
            print(f"   ❌ 학급 정보 처리 실패: {e}")
            self.conn.rollback()
        finally:
            cursor.close()
    
    def process_timetables(self, df, matched_schools):
        """시간표 정보 처리"""
        print("📅 시간표 정보 처리 중...")
        
        # 일반계만 필터링
        general_schools = df[df['계열명'] == '일반계']
        
        # 학교 ID와 학급 ID 매핑 테이블 생성
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT s.name, s.id as school_id, c.grade, c.class_number, c.id as class_id
            FROM schools s
            JOIN timetable_classes c ON s.id = c.school_id
        """)
        
        mapping = {}
        for row in cursor.fetchall():
            key = (row[0], row[2], row[3])  # (school_name, grade, class_number)
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
            
            # 학급 매핑 확인
            key = (school_name, grade, class_number)
            if key not in mapping:
                continue
                
            school_id, class_id = mapping[key]
            
            # 날짜 처리
            date_str = str(row['시간표일자'])
            date_obj = self.parse_date(date_str)
            if not date_obj:
                continue
                
            day_of_week = self.get_day_of_week(date_obj)
            if not day_of_week:
                continue
            
            period = int(row['교시']) if pd.notna(row['교시']) else 0
            subject = row['수업내용'] if pd.notna(row['수업내용']) else ''
            classroom = row['강의실명'] if pd.notna(row['강의실명']) else None
            academic_year = int(row['학년도']) if pd.notna(row['학년도']) else 2025
            semester = int(row['학기']) if pd.notna(row['학기']) else 2
            
            # 수정일자 처리
            modified_date = None
            if pd.notna(row['수정일자']):
                modified_date = self.parse_date(str(row['수정일자']))
            
            timetables_list.append((
                school_id,
                class_id,
                date_obj,
                day_of_week,
                period,
                subject,
                classroom,
                academic_year,
                semester,
                modified_date
            ))
            processed_count += 1
        
        # 시간표 정보 삽입 (배치 처리로 성능 향상)
        try:
            batch_size = 1000
            total_batches = (len(timetables_list) + batch_size - 1) // batch_size
            
            for i in range(0, len(timetables_list), batch_size):
                batch = timetables_list[i:i + batch_size]
                batch_num = (i // batch_size) + 1
                
                print(f"   📦 배치 {batch_num}/{total_batches} 처리 중... ({len(batch)}개 항목)")
                
                for timetable_data in batch:
                    cursor.execute("""
                        INSERT INTO timetable_data (school_id, class_id, date, day_of_week, period, 
                                               subject, classroom, academic_year, semester, modified_date)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (school_id, class_id, date, period) DO UPDATE SET
                            subject = EXCLUDED.subject,
                            classroom = EXCLUDED.classroom,
                            modified_date = EXCLUDED.modified_date
                    """, timetable_data)
                
                self.conn.commit()
                print(f"   ✅ 배치 {batch_num} 완료")
            
            print(f"   ✅ 총 {processed_count:,}개 시간표 정보 처리 완료")
            
        except Exception as e:
            print(f"   ❌ 시간표 정보 처리 실패: {e}")
            self.conn.rollback()
        finally:
            cursor.close()
    
    def show_stats(self):
        """데이터베이스 통계 표시"""
        if not self.connect_db():
            return
        
        cursor = self.conn.cursor()
        try:
            # 전체 통계
            cursor.execute("SELECT COUNT(*) FROM schools WHERE school_type = '고등학교'")
            school_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM timetable_classes")
            class_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM timetable_data")
            timetable_count = cursor.fetchone()[0]
            
            # 요일별 통계
            cursor.execute("SELECT day_of_week, COUNT(*) as count FROM timetable_data GROUP BY day_of_week ORDER BY day_of_week")
            day_stats = cursor.fetchall()
            
            print(f"\n📊 데이터베이스 통계:")
            print(f"   고등학교 수: {school_count:,}개")
            print(f"   총 학급 수: {class_count:,}개")
            print(f"   총 시간표 항목 수: {timetable_count:,}개")
            
            print(f"\n📅 요일별 시간표 통계:")
            day_names = {1: '월요일', 2: '화요일', 3: '수요일', 4: '목요일', 5: '금요일'}
            for day, count in day_stats:
                print(f"   {day_names.get(day, f'{day}요일')}: {count:,}개")
            
            # 학교별 통계
            cursor.execute("""
                SELECT s.name, COUNT(DISTINCT c.grade) as grades, 
                       COUNT(DISTINCT c.class_number) as classes,
                       COUNT(t.id) as periods
                FROM schools s
                LEFT JOIN timetable_classes c ON s.id = c.school_id
                LEFT JOIN timetable_data t ON c.id = t.class_id
                WHERE s.school_type = '고등학교'
                GROUP BY s.id, s.name
                ORDER BY periods DESC
                LIMIT 10
            """)
            
            print(f"\n🏫 상위 10개 학교 통계:")
            for row in cursor.fetchall():
                print(f"   {row[0]}: {row[1]}학년, {row[2]}학급, {row[3]:,}교시")
                
        except Exception as e:
            print(f"❌ 통계 조회 실패: {e}")
        finally:
            cursor.close()
            self.close_db()
    
    def import_csv(self, csv_file_path):
        """CSV 파일 임포트"""
        print(f"📁 CSV 파일 읽는 중: {csv_file_path}")
        
        try:
            df = pd.read_csv(csv_file_path, encoding='utf-8')
            print(f"   ✅ {len(df):,}개 행 읽기 완료")
        except Exception as e:
            print(f"   ❌ CSV 파일 읽기 실패: {e}")
            return False
        
        if not self.connect_db():
            return False
        
        try:
            # 1. 학교 매칭
            matched_schools, unmatched_schools = self.match_schools(df)
            
            if not matched_schools:
                print("❌ 매칭된 학교가 없습니다.")
                return False
            
            # 2. 학급 정보 처리
            self.process_classes(df, matched_schools)
            
            # 3. 시간표 정보 처리
            self.process_timetables(df, matched_schools)
            
            print("\n✅ CSV 임포트 완료!")
            return True
            
        except Exception as e:
            print(f"❌ 임포트 중 오류 발생: {e}")
            return False
        finally:
            self.close_db()

def main():
    parser = argparse.ArgumentParser(description='CSV 시간표 데이터를 PostgreSQL에 임포트')
    parser.add_argument('csv_file', nargs='?', help='CSV 파일 경로')
    parser.add_argument('--stats', action='store_true', help='통계만 표시')
    
    args = parser.parse_args()
    
    # 데이터베이스 설정
    db_config = {
        'host': '3.35.3.225',
        'database': 'hw_project001',
        'user': 'postgres',
        'password': '!@heart_ware2@!'
    }
    
    importer = TimetableImporter(db_config)
    
    if args.stats:
        importer.show_stats()
    elif args.csv_file:
        importer.import_csv(args.csv_file)
    else:
        print("CSV 파일 경로를 입력하거나 --stats 옵션을 사용하세요.")
        parser.print_help()

if __name__ == "__main__":
    main()
