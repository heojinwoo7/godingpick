#!/usr/bin/env python3
"""
전체 시간표 조회 스크립트
1학년 모든 반의 월~금 1~7교시 전체 시간표를 조회하고 저장
"""

import requests
import json
import csv
import pandas as pd
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

class FullTimetableFetcher:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://open.neis.go.kr/hub"
        self.session = requests.Session()
        
    def get_school_info(self, region_code: str = "D10", school_name: str = None) -> Optional[List[Dict]]:
        """학교 정보 조회"""
        url = f"{self.base_url}/schoolInfo"
        params = {
            "KEY": self.api_key,
            "Type": "json",
            "pIndex": 1,
            "pSize": 100,
            "ATPT_OFCDC_SC_CODE": region_code
        }
        
        if school_name:
            params["SCHUL_NM"] = school_name
        
        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if 'schoolInfo' in data and len(data['schoolInfo']) > 1:
                school_list = data['schoolInfo'][1]['row']
                if isinstance(school_list, dict):
                    school_list = [school_list]
                return school_list
            
            return []
            
        except Exception as e:
            print(f"학교 정보 조회 실패: {e}")
            return None
    
    def get_class_info(self, region_code: str, school_code: str, grade: str = "1") -> Optional[List[Dict]]:
        """학급 정보 조회"""
        url = f"{self.base_url}/classInfo"
        params = {
            "KEY": self.api_key,
            "Type": "json",
            "pIndex": 1,
            "pSize": 100,
            "ATPT_OFCDC_SC_CODE": region_code,
            "SD_SCHUL_CODE": school_code,
            "AY": "2025",
            "GRADE": grade
        }
        
        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if 'classInfo' in data and len(data['classInfo']) > 1:
                class_list = data['classInfo'][1]['row']
                if isinstance(class_list, dict):
                    class_list = [class_list]
                return class_list
            
            return []
            
        except Exception as e:
            print(f"학급 정보 조회 실패: {e}")
            return None
    
    def get_weekly_timetable(self, region_code: str, school_code: str, 
                           grade: str, class_num: str, semester: str = "2", 
                           year: str = "2025") -> Dict[str, List[Dict]]:
        """한 주 전체 시간표 조회 (월~금)"""
        
        # 2025년 9월 첫째 주 월요일부터 금요일까지
        week_dates = [
            "20250901",  # 월요일
            "20250902",  # 화요일  
            "20250903",  # 수요일
            "20250904",  # 목요일
            "20250905"   # 금요일
        ]
        
        weekly_timetable = {}
        
        for date_str in week_dates:
            print(f"  📅 {date_str} 시간표 조회 중...")
            
            url = f"{self.base_url}/hisTimetable"
            params = {
                "KEY": self.api_key,
                "Type": "json",
                "pIndex": 1,
                "pSize": 100,
                "ATPT_OFCDC_SC_CODE": region_code,
                "SD_SCHUL_CODE": school_code,
                "AY": year,
                "SEM": semester,
                "GRADE": grade,
                "CLASS_NM": class_num,
                "ALL_TI_YMD": date_str
            }
            
            try:
                response = self.session.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                if 'hisTimetable' in data and len(data['hisTimetable']) > 1:
                    timetable_list = data['hisTimetable'][1]['row']
                    if isinstance(timetable_list, dict):
                        timetable_list = [timetable_list]
                    
                    # 교시별로 정렬
                    timetable_list.sort(key=lambda x: int(x.get('PERIO', 0)))
                    weekly_timetable[date_str] = timetable_list
                else:
                    weekly_timetable[date_str] = []
                    
            except Exception as e:
                print(f"    ❌ {date_str} 시간표 조회 실패: {e}")
                weekly_timetable[date_str] = []
        
        return weekly_timetable
    
    def get_all_classes_timetable(self, region_code: str, school_code: str, 
                                school_name: str, grade: str = "1") -> Dict:
        """1학년 모든 반의 전체 시간표 조회"""
        
        print(f"\n🏫 {school_name} {grade}학년 전체 시간표 조회 시작...")
        
        # 1. 학급 정보 조회
        print(f"1️⃣ {grade}학년 학급 정보 조회 중...")
        class_info = self.get_class_info(region_code, school_code, grade)
        
        if not class_info:
            print(f"❌ {grade}학년 학급 정보를 찾을 수 없습니다.")
            return {}
        
        print(f"✅ {grade}학년 총 {len(class_info)}개 반 발견!")
        
        all_timetables = {}
        
        # 2. 각 반별로 전체 시간표 조회
        for class_data in class_info:
            class_num = class_data.get('CLASS_NM', '')
            print(f"\n📚 {grade}학년 {class_num}반 시간표 조회 중...")
            
            # 한 주 전체 시간표 조회
            weekly_timetable = self.get_weekly_timetable(
                region_code, school_code, grade, class_num
            )
            
            all_timetables[f"{grade}학년_{class_num}반"] = {
                "class_info": class_data,
                "timetable": weekly_timetable
            }
            
            # 조회된 시간표 요약 출력
            total_periods = sum(len(day_timetable) for day_timetable in weekly_timetable.values())
            print(f"  ✅ {grade}학년 {class_num}반: 총 {total_periods}개 시간 조회 완료")
        
        return all_timetables
    
    def save_to_csv(self, all_timetables: Dict, school_name: str, grade: str = "1"):
        """전체 시간표를 CSV 파일로 저장"""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{school_name}_{grade}학년_전체시간표_{timestamp}.csv"
        
        with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
            writer = csv.writer(csvfile)
            
            # 헤더 작성
            writer.writerow([
                '학교명', '학년', '반', '요일', '날짜', '교시', '과목명', '강의실'
            ])
            
            # 데이터 작성
            for class_key, class_data in all_timetables.items():
                class_info = class_data['class_info']
                timetable = class_data['timetable']
                
                class_num = class_info.get('CLASS_NM', '')
                
                # 요일 매핑
                day_names = {
                    '20250901': '월요일',
                    '20250902': '화요일', 
                    '20250903': '수요일',
                    '20250904': '목요일',
                    '20250905': '금요일'
                }
                
                for date_str, day_timetable in timetable.items():
                    day_name = day_names.get(date_str, date_str)
                    
                    for period_data in day_timetable:
                        writer.writerow([
                            school_name,
                            grade,
                            class_num,
                            day_name,
                            date_str,
                            period_data.get('PERIO', ''),
                            period_data.get('ITRT_CNTNT', ''),
                            period_data.get('CLRM_NM', '')
                        ])
        
        print(f"\n💾 CSV 파일 저장 완료: {filename}")
        return filename
    
    def save_to_excel(self, all_timetables: Dict, school_name: str, grade: str = "1"):
        """전체 시간표를 Excel 파일로 저장"""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{school_name}_{grade}학년_전체시간표_{timestamp}.xlsx"
        
        # 데이터를 DataFrame으로 변환
        data = []
        for class_key, class_data in all_timetables.items():
            class_info = class_data['class_info']
            timetable = class_data['timetable']
            
            class_num = class_info.get('CLASS_NM', '')
            
            # 요일 매핑
            day_names = {
                '20250901': '월요일',
                '20250902': '화요일', 
                '20250903': '수요일',
                '20250904': '목요일',
                '20250905': '금요일'
            }
            
            for date_str, day_timetable in timetable.items():
                day_name = day_names.get(date_str, date_str)
                
                for period_data in day_timetable:
                    data.append({
                        '학교명': school_name,
                        '학년': grade,
                        '반': class_num,
                        '요일': day_name,
                        '날짜': date_str,
                        '교시': period_data.get('PERIO', ''),
                        '과목명': period_data.get('ITRT_CNTNT', ''),
                        '강의실': period_data.get('CLRM_NM', '')
                    })
        
        # DataFrame 생성
        df = pd.DataFrame(data)
        
        # Excel 파일로 저장 (여러 시트로 분리)
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            # 전체 데이터 시트
            df.to_excel(writer, sheet_name='전체시간표', index=False)
            
            # 반별 시트 생성
            for class_key, class_data in all_timetables.items():
                class_info = class_data['class_info']
                class_num = class_info.get('CLASS_NM', '')
                
                class_df = df[df['반'] == class_num]
                if not class_df.empty:
                    sheet_name = f"{grade}학년_{class_num}반"
                    class_df.to_excel(writer, sheet_name=sheet_name, index=False)
        
        print(f"💾 Excel 파일 저장 완료: {filename}")
        return filename
    
    def save_to_json(self, all_timetables: Dict, school_name: str, grade: str = "1"):
        """전체 시간표를 JSON 파일로 저장"""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{school_name}_{grade}학년_전체시간표_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(all_timetables, jsonfile, ensure_ascii=False, indent=2)
        
        print(f"💾 JSON 파일 저장 완료: {filename}")
        return filename

def main():
    # API 키 설정
    api_key = "621b5da0342243baae556a13e459f4df"
    
    # 전체 시간표 조회기 생성
    fetcher = FullTimetableFetcher(api_key)
    
    print("=== 전체 시간표 조회 시작 ===")
    print(f"API 키: {api_key[:10]}...")
    
    # 1. 강동고등학교 정보 조회
    print("\n1️⃣ 강동고등학교 정보 조회 중...")
    schools = fetcher.get_school_info("D10", "강동고등학교")
    
    if not schools:
        print("❌ 강동고등학교를 찾을 수 없습니다.")
        return
    
    school_info = schools[0]
    school_name = school_info.get('SCHUL_NM', '강동고등학교')
    school_code = school_info.get('SD_SCHUL_CODE', '')
    region_code = school_info.get('ATPT_OFCDC_SC_CODE', 'D10')
    
    print(f"✅ {school_name} 발견! (학교코드: {school_code})")
    
    # 2. 1학년 모든 반의 전체 시간표 조회
    all_timetables = fetcher.get_all_classes_timetable(
        region_code, school_code, school_name, "1"
    )
    
    if not all_timetables:
        print("❌ 시간표 조회에 실패했습니다.")
        return
    
    # 3. 결과 요약 출력
    print(f"\n📊 조회 결과 요약:")
    print(f"   학교: {school_name}")
    print(f"   학년: 1학년")
    print(f"   반 수: {len(all_timetables)}개")
    
    total_periods = 0
    for class_key, class_data in all_timetables.items():
        timetable = class_data['timetable']
        class_periods = sum(len(day_timetable) for day_timetable in timetable.values())
        total_periods += class_periods
        print(f"   - {class_key}: {class_periods}개 시간")
    
    print(f"   총 시간 수: {total_periods}개")
    
    # 4. 파일로 저장
    print(f"\n💾 파일 저장 중...")
    csv_file = fetcher.save_to_csv(all_timetables, school_name, "1")
    excel_file = fetcher.save_to_excel(all_timetables, school_name, "1")
    json_file = fetcher.save_to_json(all_timetables, school_name, "1")
    
    print(f"\n🎉 전체 시간표 조회 완료!")
    print(f"   CSV 파일: {csv_file}")
    print(f"   Excel 파일: {excel_file}")
    print(f"   JSON 파일: {json_file}")

if __name__ == "__main__":
    main()
