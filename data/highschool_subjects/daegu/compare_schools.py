#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
학교 목록과 폴더 파일들 대조 분석
"""

# 사용자가 제공한 목록
provided_list = [
    "경북대사대부고", "경북여고", "경북고", "대구여고", "동문고",
    "수성고", "시지고", "경신고", "능인고", "대구남산고", "대구혜화여고", "대륜고", "덕원고", "오성고", "정화여고",
    "강동고", "대구동부고", "영신고", "정동고", "청구고", "구암고", "매천고", "운암고", "칠성고", "학남고", "합지고",
    "강북고", "경명여고", "경상고", "경상여고", "성광고", "성화여고", "영송여고", "영진고",
    "신명고", "경덕여고",
    "달성고", "대구서부고", "대구제일고",
    "대구고", "경일여고", "협성고", "대곡고", "대건고", "대구상원고",
    "대진고", "도원고", "상인고", "성산고", "성서고", "와룡고", "호산고", "경원고", "경화여고", "효성여고", "영남고", "원화여고", "호산여고", "경일고",
    "다사고", "비슬고", "포산고", "화원고", "대원고", "심인고",
    "대구중앙고",
    "달성고",
    "군위고"
]

# 폴더에 있는 파일들 (확장자 제거하고 학교명만 추출)
folder_files = [
    "오성고등학교", "경북고등학교", "경북여자고등학교", "경신고등학교", "경원고등학교", "경화여자고등학교", "구암고등학교", "능인고등학교", "달서고등학교", "달성고등학교", "대곡고등학교", "대구고등학교", "대구남산고등학교", "대구동부고등학교", "대구여자고등학교", "대구제일고등학교", "대륜고등학교", "대원고등학교", "덕원고등학교", "매천고등학교", "비슬고등학교", "사대부고등학교", "상서고등학교", "상인고등학교", "성서고등학교", "성화여자고등학교", "수성고등학교", "시지고등학교", "심인고등학교", "영신고등학교", "와룡고등학교", "운암고등학교", "정화여자고등학교", "청구고등학교", "함지고등학교", "현풍고등학교", "화원고등학교", "경덕여자고등학교", "계성고등학교", "남고등학교", "대구상원고등학교", "신명고등학교", "원고등학교", "협성고등학교", "강북고등학교", "경일여자고등학교", "달구벌고등학교", "대구중앙고등학교", "대구혜화여자고등학교", "송현여자고등학교", "정동고등학교", "칠성고등학교", "효성여자고등학교"
]

def normalize_school_name(name):
    """학교명 정규화"""
    # 여고, 여자고 → 여자고등학교
    if '여고' in name and '여자고등학교' not in name:
        if '여자고' in name:
            name = name.replace('여자고', '여자고등학교')
        else:
            name = name.replace('여고', '여자고등학교')
    # 고 → 고등학교
    elif '고' in name and '고등학교' not in name and '여' not in name:
        name = name.replace('고', '고등학교')
    
    return name

def extract_base_name(name):
    """기본 학교명 추출 (고등학교, 여자고등학교 제거)"""
    base = name.replace('고등학교', '').replace('여자고등학교', '')
    return base

def find_missing_schools():
    """빠진 학교 찾기"""
    print("🔍 학교 목록 대조 분석 (기본명으로 비교)")
    print("=" * 60)
    
    # 기본 학교명 추출
    provided_base_names = [extract_base_name(normalize_school_name(name)) for name in provided_list]
    folder_base_names = [extract_base_name(name) for name in folder_files]
    
    print(f"📊 제공된 목록: {len(provided_base_names)}개")
    print(f"📁 폴더 파일: {len(folder_base_names)}개")
    print()
    
    # 목록에 있지만 폴더에 없는 학교들
    missing_in_folder = []
    for i, base_name in enumerate(provided_base_names):
        if base_name not in folder_base_names:
            original_name = provided_list[i]
            normalized_name = normalize_school_name(original_name)
            missing_in_folder.append((original_name, normalized_name, base_name))
    
    # 폴더에 있지만 목록에 없는 학교들
    extra_in_folder = []
    for i, base_name in enumerate(folder_base_names):
        if base_name not in provided_base_names:
            original_name = folder_files[i]
            extra_in_folder.append((original_name, base_name))
    
    print("❌ 목록에 있지만 폴더에 없는 학교들:")
    for original, normalized, base in missing_in_folder:
        print(f"   - {original} → {normalized} (기본명: {base})")
    
    print()
    print("➕ 폴더에 있지만 목록에 없는 학교들:")
    for original, base in extra_in_folder:
        print(f"   - {original} (기본명: {base})")
    
    print()
    print("=" * 60)
    print(f"📊 분석 결과:")
    print(f"   - 빠진 학교: {len(missing_in_folder)}개")
    print(f"   - 추가 학교: {len(extra_in_folder)}개")
    
    # 정확히 하나만 빠진 학교 찾기
    if len(missing_in_folder) == 1:
        print()
        print("🎯 정확히 하나의 학교가 빠져있습니다!")
        original, normalized, base = missing_in_folder[0]
        print(f"   빠진 학교: {original} → {normalized}")
    elif len(missing_in_folder) > 1:
        print()
        print("⚠️  여러 학교가 빠져있습니다.")
        print("   가장 가능성 높은 후보들:")
        for original, normalized, base in missing_in_folder[:5]:  # 상위 5개만
            print(f"   - {original} → {normalized}")

if __name__ == "__main__":
    find_missing_schools()
