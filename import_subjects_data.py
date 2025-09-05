#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import sys

def connect_to_database():
    """데이터베이스 연결"""
    try:
        connection = psycopg2.connect(
            host="3.35.3.225",
            database="hw_project001",
            user="postgres",
            password="!@heart_ware2@!"
        )
        return connection
    except Exception as e:
        print(f"데이터베이스 연결 실패: {e}")
        return None

def create_subjects_table(connection):
    """전과목 테이블 생성 (마스터 테이블)"""
    cursor = connection.cursor()
    
    try:
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS subjects (
            id SERIAL PRIMARY KEY,
            subject_name VARCHAR(100) NOT NULL,
            department_name VARCHAR(100) NOT NULL,
            subject_type VARCHAR(50) NOT NULL,
            credit_hours INTEGER NOT NULL DEFAULT 1,
            difficulty_level VARCHAR(20) DEFAULT '기본',
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(subject_name, department_name)
        )
        """
        
        cursor.execute(create_table_sql)
        connection.commit()
        print("✅ 전과목 테이블(subjects)이 생성되었습니다.")
        
    except Exception as e:
        connection.rollback()
        print(f"❌ 테이블 생성 실패: {e}")
        raise
    finally:
        cursor.close()

def clean_subjects_data(df):
    """전과목 데이터 정리 및 전처리"""
    print("데이터 정리 시작...")
    
    # NaN 값 처리
    df = df.fillna('')
    
    # 공백 제거
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.strip()
    
    # 빈 행 제거
    df = df[(df.iloc[:, 0] != '') & (df.iloc[:, 1] != '')]
    
    # 중복 제거
    df = df.drop_duplicates()
    
    print(f"정리된 데이터: {len(df)}행")
    return df

def import_subjects_data(connection, df):
    """전과목 데이터를 데이터베이스로 가져오기"""
    cursor = connection.cursor()
    
    try:
        # 데이터 삽입을 위한 SQL
        insert_query = """
        INSERT INTO subjects (subject_name, department_name, subject_type, credit_hours) 
        VALUES %s
        ON CONFLICT (subject_name, department_name) DO UPDATE SET
            subject_type = EXCLUDED.subject_type,
            credit_hours = EXCLUDED.credit_hours,
            updated_at = CURRENT_TIMESTAMP
        """
        
        # 데이터 준비 (A열: 과목이름, B열: 과이름, C열: 과목유형)
        data_to_insert = []
        for index, row in df.iterrows():
            subject_name = str(row.iloc[0]).strip()      # A열: 과목이름
            department_name = str(row.iloc[1]).strip()   # B열: 과이름
            subject_type = str(row.iloc[2]).strip()      # C열: 과목유형
            
            # 빈 값 체크
            if subject_name and department_name and subject_type:
                data_to_insert.append((subject_name, department_name, subject_type, 1))
                print(f"준비: {subject_name} - {department_name} - {subject_type}")
        
        if not data_to_insert:
            print("❌ 삽입할 데이터가 없습니다.")
            return
        
        # 데이터 삽입
        execute_values(cursor, insert_query, data_to_insert)
        connection.commit()
        
        print(f"✅ 성공적으로 {len(data_to_insert)}개의 전과목 데이터를 가져왔습니다.")
        
    except Exception as e:
        connection.rollback()
        print(f"❌ 데이터 가져오기 실패: {e}")
        raise
    finally:
        cursor.close()

def verify_data(connection):
    """데이터 검증"""
    cursor = connection.cursor()
    
    try:
        # 총 과목 수 확인
        cursor.execute("SELECT COUNT(*) FROM subjects")
        total_count = cursor.fetchone()[0]
        print(f"\n📊 데이터베이스의 총 과목 수: {total_count}")
        
        # 과별 과목 수 확인
        cursor.execute("""
            SELECT department_name, COUNT(*) as subject_count 
            FROM subjects 
            GROUP BY department_name 
            ORDER BY subject_count DESC
        """)
        dept_stats = cursor.fetchall()
        
        print("\n📊 과별 과목 수:")
        for dept, count in dept_stats:
            print(f"  {dept}: {count}개")
        
        # 샘플 데이터 확인
        cursor.execute("SELECT subject_name, department_name, subject_type FROM subjects LIMIT 10")
        sample_data = cursor.fetchall()
        
        print("\n📝 샘플 데이터:")
        for subject, dept, subject_type in sample_data:
            print(f"  {subject} ({dept}) - {subject_type}")
        
    except Exception as e:
        print(f"❌ 데이터 검증 실패: {e}")
    finally:
        cursor.close()

def main():
    """메인 함수"""
    print("전과목 데이터 가져오기 시작...")
    print("=" * 50)
    
    # Excel 파일 읽기 - "전과목" 시트 직접 지정
    try:
        print("📖 Excel 파일 읽는 중...")
        df = pd.read_excel('highschool_list.xlsx', sheet_name='전과목')
        print(f"✅ Excel 파일 읽기 완료: {len(df)}행, {len(df.columns)}열")
        print(f"📋 컬럼명: {list(df.columns)}")
        
        # 처음 몇 행 확인
        print("\n📊 처음 5행 데이터:")
        print(df.head())
        
    except Exception as e:
        print(f"❌ Excel 파일 읽기 실패: {e}")
        return
    
    # 데이터 정리
    df = clean_subjects_data(df)
    
    # 데이터베이스 연결
    print("\n🔌 데이터베이스 연결 중...")
    connection = connect_to_database()
    if not connection:
        print("❌ 데이터베이스 연결 실패")
        return
    
    try:
        # 테이블 생성
        create_subjects_table(connection)
        
        # 데이터 가져오기
        print("\n📤 데이터 삽입 중...")
        import_subjects_data(connection, df)
        
        # 데이터 검증
        print("\n🔍 데이터 검증 중...")
        verify_data(connection)
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
    finally:
        connection.close()
        print("\n🔌 데이터베이스 연결 종료")
        print("=" * 50)
        print("🎉 전과목 데이터 가져오기 완료!")

if __name__ == "__main__":
    main()
