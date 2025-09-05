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

def create_schools_table(connection):
    """학교 테이블 생성"""
    cursor = connection.cursor()
    
    try:
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS schools (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            address TEXT,
            phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(name)
        )
        """
        
        cursor.execute(create_table_sql)
        connection.commit()
        print("✅ 학교 테이블(schools)이 생성되었습니다.")
        
    except Exception as e:
        connection.rollback()
        print(f"❌ 테이블 생성 실패: {e}")
        raise
    finally:
        cursor.close()

def clean_schools_data(df):
    """학교 데이터 정리 및 전처리"""
    print("데이터 정리 시작...")
    
    # NaN 값 처리
    df = df.fillna('')
    
    # 공백 제거
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.strip()
    
    # 빈 행 제거 (학교명이 있는 행만 유지)
    df = df[df.iloc[:, 0] != '']
    
    # 중복 제거
    df = df.drop_duplicates()
    
    print(f"정리된 데이터: {len(df)}행")
    return df

def import_schools_data(connection, df):
    """학교 데이터를 데이터베이스로 가져오기"""
    cursor = connection.cursor()
    
    try:
        # 데이터 삽입을 위한 SQL - 기존 스키마에 맞춤
        insert_query = """
        INSERT INTO schools (name, address, phone) 
        VALUES %s
        ON CONFLICT (name) DO UPDATE SET
            address = EXCLUDED.address,
            phone = EXCLUDED.phone
        """
        
        # 데이터 준비 - 기존 스키마에 맞게 매핑
        data_to_insert = []
        for index, row in df.iterrows():
            # Excel 첫 번째 시트의 컬럼에서 필요한 데이터 추출
            school_name = str(row.iloc[2]).strip() if pd.notna(row.iloc[2]) else ''           # 학교명 (3번째 컬럼)
            province = str(row.iloc[4]).strip() if pd.notna(row.iloc[4]) else ''              # 시도명 (5번째 컬럼)
            district = str(row.iloc[5]).strip() if pd.notna(row.iloc[5]) else ''              # 관할조직명 (6번째 컬럼)
            phone = str(row.iloc[7]).strip() if pd.notna(row.iloc[7]) else ''                 # 전화번호 (8번째 컬럼)
            
            # 주소 조합: 시도명 + 관할조직명
            address = f"{province} {district}".strip()
            
            # 빈 값 체크 (학교명은 필수)
            if school_name and school_name != '':
                data_to_insert.append((school_name, address, phone))
                print(f"준비: {school_name} - {address} - {phone}")
        
        if not data_to_insert:
            print("❌ 삽입할 데이터가 없습니다.")
            return
        
        # 데이터 삽입
        execute_values(cursor, insert_query, data_to_insert)
        connection.commit()
        
        print(f"✅ 성공적으로 {len(data_to_insert)}개의 학교 데이터를 가져왔습니다.")
        
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
        # 총 학교 수 확인
        cursor.execute("SELECT COUNT(*) FROM schools")
        total_count = cursor.fetchone()[0]
        print(f"\n📊 데이터베이스의 총 학교 수: {total_count}")
        
        # 시도별 학교 수 확인
        cursor.execute("""
            SELECT province, COUNT(*) as school_count 
            FROM schools 
            WHERE province != ''
            GROUP BY province 
            ORDER BY school_count DESC
        """)
        province_stats = cursor.fetchall()
        
        print("\n📊 시도별 학교 수:")
        for province, count in province_stats:
            print(f"  {province}: {count}개")
        
        # 샘플 데이터 확인
        cursor.execute("SELECT name, province, district FROM schools LIMIT 10")
        sample_data = cursor.fetchall()
        
        print("\n📝 샘플 데이터:")
        for name, province, district in sample_data:
            print(f"  {name} ({province} {district})")
        
    except Exception as e:
        print(f"❌ 데이터 검증 실패: {e}")
    finally:
        cursor.close()

def main():
    """메인 함수"""
    print("학교 데이터 가져오기 시작...")
    print("=" * 50)
    
    # Excel 파일 읽기 - 첫 번째 시트 (index=0)
    try:
        print("📖 Excel 파일 읽는 중...")
        df = pd.read_excel('highschool_list.xlsx', sheet_name=0)
        print(f"✅ Excel 파일 읽기 완료: {len(df)}행, {len(df.columns)}열")
        print(f"📋 컬럼명: {list(df.columns)}")
        
        # 처음 몇 행 확인
        print("\n📊 처음 5행 데이터:")
        print(df.head())
        
    except Exception as e:
        print(f"❌ Excel 파일 읽기 실패: {e}")
        return
    
    # 데이터 정리
    df = clean_schools_data(df)
    
    # 데이터베이스 연결
    print("\n🔌 데이터베이스 연결 중...")
    connection = connect_to_database()
    if not connection:
        print("❌ 데이터베이스 연결 실패")
        return
    
    try:
        # 테이블 생성
        create_schools_table(connection)
        
        # 데이터 가져오기
        print("\n📤 데이터 삽입 중...")
        import_schools_data(connection, df)
        
        # 데이터 검증
        print("\n🔍 데이터 검증 중...")
        verify_data(connection)
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
    finally:
        connection.close()
        print("\n🔌 데이터베이스 연결 종료")
        print("=" * 50)
        print("🎉 학교 데이터 가져오기 완료!")

if __name__ == "__main__":
    main()
