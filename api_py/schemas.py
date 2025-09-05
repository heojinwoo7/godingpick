#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

# 기본 응답 스키마
class BaseResponse(BaseModel):
    success: bool
    message: str

# User 관련 스키마
class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    birth_date: Optional[date] = None  # datetime.date 타입 허용
    user_type: str = "student"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None  # 선택적 필드로 변경
    
    class Config:
        from_attributes = True

# Student 관련 스키마
class StudentBase(BaseModel):
    grade: Optional[int] = None  # int 타입 허용
    class_number: Optional[int] = None  # int 타입 허용
    student_number: Optional[str] = None
    attendance_number: Optional[int] = None  # int 타입 허용

class StudentCreate(StudentBase):
    user_id: int
    school_id: int

class StudentResponse(StudentBase):
    id: int
    user_id: Optional[int] = None  # 선택적 필드로 변경
    school_id: Optional[int] = None  # 선택적 필드로 변경
    
    class Config:
        from_attributes = True

# School 관련 스키마
class SchoolBase(BaseModel):
    name: str
    province: Optional[str] = None
    district: Optional[str] = None
    actual_district: Optional[str] = None
    address: Optional[str] = None
    school_type: Optional[str] = None
    education_office: Optional[str] = None
    high_school_category: Optional[str] = None
    high_school_division: Optional[str] = None

class SchoolCreate(SchoolBase):
    pass

class SchoolResponse(SchoolBase):
    id: int
    
    class Config:
        from_attributes = True

# Post 관련 스키마
class PostBase(BaseModel):
    title: str
    content: str
    location_level1: Optional[str] = None
    location_level2: Optional[str] = None
    location_level3: Optional[str] = None

class PostCreate(PostBase):
    user_id: int

class PostResponse(PostBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Comment 관련 스키마
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    post_id: int
    user_id: int

class CommentResponse(CommentBase):
    id: int
    post_id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# 로그인 관련 스키마
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    user: UserResponse
    student: Optional[StudentResponse] = None
    school: Optional[SchoolResponse] = None
    
    class Config:
        from_attributes = True

# 사용자-학생-학교 정보 응답 스키마
class UserStudentSchoolResponse(BaseModel):
    user: UserResponse
    student: StudentResponse
    school: SchoolResponse
