#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
대구 고등학교 파일명 통일 스크립트
OO고 → 2025OO고등학교
OO여고 → 2025OO여자고등학교
"""

import os
import re
import shutil
from pathlib import Path

def extract_school_name(filename):
    """파일명에서 학교명 추출"""
    # 확장자 제거
    name_without_ext = os.path.splitext(filename)[0]
    
    # 이미 완성된 형식인지 확인 (2025로 시작하고 고등학교로 끝남)
    if re.match(r'^2025.*고등학교$', name_without_ext):
        return None  # 이미 완성된 형식이므로 건드리지 않음
    
    # 2025 관련 텍스트 제거
    name_clean = re.sub(r'2025[학년도\s\._]*', '', name_without_ext)
    
    # 학교교육과정 관련 텍스트 제거
    name_clean = re.sub(r'학교교육과정.*', '', name_clean)
    name_clean = re.sub(r'교육과정.*', '', name_clean)
    name_clean = re.sub(r'편성.*', '', name_clean)
    name_clean = re.sub(r'운영.*', '', name_clean)
    name_clean = re.sub(r'평가.*', '', name_clean)
    name_clean = re.sub(r'계획.*', '', name_clean)
    name_clean = re.sub(r'사항.*', '', name_clean)
    
    # 특수문자 및 공백 정리
    name_clean = re.sub(r'[·ㆍ_\-\(\)\[\]\(\)]', '', name_clean)
    name_clean = name_clean.strip()
    
    return name_clean

def standardize_school_name(school_name):
    """학교명을 표준 형식으로 변환"""
    if not school_name:
        return None
    
    # 여자고등학교 관련 처리
    if '여고' in school_name or '여자고' in school_name:
        # 여고, 여자고 → 여자고등학교
        if '여자고등학교' not in school_name:
            if '여자고' in school_name:
                school_name = school_name.replace('여자고', '여자고등학교')
            elif '여고' in school_name:
                school_name = school_name.replace('여고', '여자고등학교')
        return f"2025{school_name}"
    
    # 일반 고등학교 처리
    elif '고등학교' in school_name:
        return f"2025{school_name}"
    elif '고' in school_name and '여' not in school_name:
        # 고 → 고등학교
        school_name = school_name.replace('고', '고등학교')
        return f"2025{school_name}"
    
    return None

def rename_files_in_directory(directory_path):
    """디렉토리 내 파일들 이름 변경"""
    directory = Path(directory_path)
    
    if not directory.exists():
        print(f"❌ 디렉토리가 존재하지 않습니다: {directory_path}")
        return
    
    print(f"📁 작업 디렉토리: {directory_path}")
    print("=" * 60)
    
    # 파일 목록 가져오기
    files = [f for f in directory.iterdir() if f.is_file()]
    print(f"📊 총 {len(files)}개 파일 발견")
    print()
    
    success_count = 0
    error_count = 0
    skip_count = 0
    
    for file_path in files:
        try:
            original_name = file_path.name
            extension = file_path.suffix
            
            # 학교명 추출
            school_name = extract_school_name(original_name)
            print(f"🔍 원본: {original_name}")
            
            if not school_name:
                print(f"   ✅ 이미 완성된 형식이거나 학교명을 추출할 수 없습니다. 건너뜀.")
                skip_count += 1
                continue
            
            print(f"   추출된 학교명: '{school_name}'")
            
            # 표준 형식으로 변환
            new_school_name = standardize_school_name(school_name)
            if not new_school_name:
                print(f"   ⚠️  표준 형식으로 변환할 수 없습니다.")
                error_count += 1
                continue
            
            # 새 파일명 생성
            new_filename = f"{new_school_name}{extension}"
            new_file_path = directory / new_filename
            
            # 중복 파일명 처리
            counter = 1
            while new_file_path.exists():
                new_filename = f"{new_school_name}_{counter}{extension}"
                new_file_path = directory / new_filename
                counter += 1
            
            # 파일명 변경
            file_path.rename(new_file_path)
            print(f"   ✅ 변경: {new_filename}")
            success_count += 1
            
        except Exception as e:
            print(f"   ❌ 오류: {e}")
            error_count += 1
        
        print()
    
    print("=" * 60)
    print(f"📊 작업 완료!")
    print(f"   ✅ 성공: {success_count}개")
    print(f"   ⏭️  건너뜀: {skip_count}개")
    print(f"   ❌ 실패: {error_count}개")

def main():
    """메인 함수"""
    print("🏫 대구 고등학교 파일명 통일 프로그램")
    print("=" * 60)
    
    # 현재 디렉토리 사용
    target_directory = "."
    
    # 파일명 변경 실행
    rename_files_in_directory(target_directory)

if __name__ == "__main__":
    main()
