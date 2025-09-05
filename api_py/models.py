#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

# Base 클래스를 직접 정의
Base = declarative_base()

# relationship 함수를 별칭으로 정의
rel = relationship

# 사용자 테이블 (실제 DB 구조에 맞춤)
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)  # nullable=True (기존 DB에 맞춤)
    birth_date = Column(Date, nullable=True)  # Date 타입으로 변경 (기존 DB에 맞춤)
    user_type = Column(String(20), nullable=False)  # student, teacher, parent
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계 설정
    student = rel("Student", back_populates="user", uselist=False)
    teacher = rel("Teacher", back_populates="user", uselist=False)
    parent = rel("Parent", back_populates="user", uselist=False)
    posts = rel("Post", back_populates="user")  # 커뮤니티 게시글 관계 추가
    comments = rel("Comment", back_populates="user")  # 댓글 관계 추가

# 학생 테이블 (실제 DB 구조에 맞춤)
class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    student_number = Column(String(20), nullable=False)  # 학생번호 추가
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)  # school_id 추가
    grade = Column(Integer, nullable=False)  # 학년
    class_number = Column(Integer, nullable=False)  # 반
    attendance_number = Column(String(10), nullable=True)  # 출석번호 (nullable=True)
    
    # 관계 설정
    user = rel("User", back_populates="student")
    school = rel("School", back_populates="students")  # school 관계 추가
    teacher_assignments = rel("TeacherStudentAssignment", back_populates="student")
    parent_relations = rel("ParentStudentRelation", back_populates="student")
    course_enrollments = rel("CourseEnrollment", back_populates="student")

# 교사 테이블 (실제 DB 구조에 맞춤)
class Teacher(Base):
    __tablename__ = "teachers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)  # 실제 DB와 일치
    teacher_number = Column(String(20), unique=True, nullable=False)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)  # 실제 DB와 일치
    position = Column(String(50), nullable=False, default='교과')
    hire_date = Column(Date, nullable=True, server_default=func.current_date())  # 실제 DB와 일치
    is_homeroom_teacher = Column(Boolean, nullable=True, server_default='false')
    certification_number = Column(String(50), nullable=True)  # 교원인증번호 추가
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    user = rel("User", back_populates="teacher")
    school = rel("School", back_populates="teachers")  # school 관계 추가
    student_assignments = rel("TeacherStudentAssignment", back_populates="teacher")
    homeroom_assignments = rel("HomeroomAssignment", back_populates="teacher")
    teacher_subjects = rel("TeacherSubject", back_populates="teacher")
    class_schedules = rel("ClassSchedule", back_populates="teacher")
    course_enrollments = rel("CourseEnrollment", back_populates="teacher")

# 학부모 테이블 (실제 DB 구조에 맞춤)
class Parent(Base):
    __tablename__ = "parents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    relationship = Column(String(20), nullable=False)  # 부, 모, 보호자
    occupation = Column(String(100), nullable=True)
    emergency_contact = Column(String(20), nullable=True)
    
    # 관계 설정
    user = rel("User", back_populates="parent")
    student_relations = rel("ParentStudentRelation", back_populates="parent")

# 학과 테이블 (실제 DB 구조에 맞춤)
class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계 설정
    # teachers 관계 제거 (Teacher 모델에 department_id가 없음)
    # subjects 관계 제거 (실제 DB에는 외래키 관계가 없음)

# 학교 테이블 (실제 DB 구조에 맞춤)
class School(Base):
    __tablename__ = "schools"
    
    id = Column(Integer, primary_key=True, index=True)
    education_office = Column(String(100), nullable=False)  # 교육청
    administrative_code = Column(String(20), nullable=False)  # 행정코드
    name = Column(String(200), nullable=False)  # 학교명
    school_type = Column(String(50), nullable=False)  # 학교 유형
    province = Column(String(50), nullable=False)  # 도/시
    district = Column(String(100), nullable=True)  # 시/군
    establishment_type = Column(String(20), nullable=True)  # 설립 유형
    phone = Column(String(20), nullable=True)  # 전화번호
    website = Column(Text, nullable=True)  # 웹사이트
    high_school_category = Column(String(20), nullable=True)  # 고등학교 분류
    high_school_division = Column(String(20), nullable=True)  # 고등학교 구분
    actual_district = Column(String(50), nullable=True)  # 실제 구/군 (서울시만)
    address = Column(Text, nullable=True)  # 주소
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    students = rel("Student", back_populates="school")
    teachers = rel("Teacher", back_populates="school")
    school_subjects = rel("SchoolSubject", back_populates="school")
    teacher_subjects = rel("TeacherSubject", back_populates="school")

# 과목 테이블 (실제 DB 구조에 맞춤)
class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_name = Column(String(100), nullable=False)  # 과목명 (실제 DB 컬럼명)
    department_name = Column(String(100), nullable=False)  # 학과명 (실제 DB 컬럼명)
    subject_type = Column(String(50), nullable=False)  # 과목 유형
    credit_hours = Column(Integer, nullable=False)  # 이수 학점
    difficulty_level = Column(String(20), nullable=False)  # 난이도
    description = Column(Text, nullable=True)  # 설명
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정 제거 (실제 DB 구조에 맞춤 - 단순 테이블 구조)
    # school_subjects = rel("SchoolSubject", back_populates="subject")
    # teacher_subjects = rel("TeacherSubject", back_populates="subject")
    # subject_details = rel("SubjectDetail", back_populates="subject")

# 교사-학생 담당 테이블
class TeacherStudentAssignment(Base):
    __tablename__ = "teacher_student_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    academic_year = Column(Integer, nullable=False)  # 학년도
    semester = Column(String(20), nullable=False)  # 1학기/2학기
    assignment_type = Column(String(20), nullable=False)  # 담당 유형 (담임/교과)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    teacher = rel("Teacher", back_populates="student_assignments")
    student = rel("Student", back_populates="teacher_assignments")

# 담임 배정 테이블
class HomeroomAssignment(Base):
    __tablename__ = "homeroom_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    academic_year = Column(Integer, nullable=False)  # 학년도
    grade = Column(Integer, nullable=False)  # 학년
    class_number = Column(Integer, nullable=False)  # 반
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    teacher = rel("Teacher", back_populates="homeroom_assignments")

# 학부모-학생 관계 테이블
class ParentStudentRelation(Base):
    __tablename__ = "parent_student_relations"
    
    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("parents.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    relationship_type = Column(String(20), nullable=False)  # 관계 유형
    is_primary_guardian = Column(Boolean, default=False)  # 주 보호자 여부
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    parent = rel("Parent", back_populates="student_relations")
    student = rel("Student", back_populates="parent_relations")

# 익명 사용자 테이블
class AnonymousUser(Base):
    __tablename__ = "anonymous_users"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    anonymous_id = Column(String(50), unique=True, nullable=False)  # 익명 ID
    nickname = Column(String(50), nullable=True)  # 닉네임
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    user = rel("User")

# 커뮤니티 게시글 테이블 (학교 단위 커뮤니티용)
class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)  # 게시글 제목
    content = Column(Text, nullable=False)  # 게시글 내용
    location_level1 = Column(String(100), nullable=True)  # 광역시/도 + 시/군
    location_level2 = Column(String(100), nullable=True)  # 서울시만 구, 나머지는 null
    location_level3 = Column(String(100), nullable=True)  # 학교명
    is_anonymous = Column(Boolean, default=False)  # 익명 여부
    anonymous_user_id = Column(Integer, ForeignKey("anonymous_users.id"), nullable=True)  # 익명 사용자 ID
    likes_count = Column(Integer, default=0)  # 좋아요 수
    comments_count = Column(Integer, default=0)  # 댓글 수
    views_count = Column(Integer, default=0)  # 조회수
    status = Column(String(20), default='active')  # 상태 (active, deleted, hidden)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    user = rel("User", back_populates="posts")
    anonymous_user = rel("AnonymousUser")
    comments = rel("Comment", back_populates="post")

# 댓글 테이블
class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)  # 댓글 내용
    parent_comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True)  # 부모 댓글 ID (대댓글용)
    is_anonymous = Column(Boolean, default=False)  # 익명 여부
    anonymous_user_id = Column(Integer, ForeignKey("anonymous_users.id"), nullable=True)  # 익명 사용자 ID
    likes_count = Column(Integer, default=0)  # 좋아요 수
    status = Column(String(20), default='active')  # 상태 (active, deleted, hidden)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    post = rel("Post", back_populates="comments")
    user = rel("User", back_populates="comments")
    anonymous_user = rel("AnonymousUser")
    parent_comment = rel("Comment", remote_side=[id])  # 자기 참조 (대댓글용)
    replies = rel("Comment", back_populates="parent_comment")  # 대댓글들

# 게시글 좋아요 테이블
class PostLike(Base):
    __tablename__ = "post_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    post = rel("Post")
    user = rel("User")

# 댓글 좋아요 테이블
class CommentLike(Base):
    __tablename__ = "comment_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    comment = rel("Comment")
    user = rel("User")

# 신고 테이블
class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    reported_type = Column(String(20), nullable=False)  # 신고 대상 유형 (post, comment)
    reported_id = Column(Integer, nullable=False)  # 신고 대상 ID
    reporter_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # 신고자 ID
    reason = Column(String(200), nullable=False)  # 신고 사유
    status = Column(String(20), default='pending')  # 상태 (pending, reviewed, resolved)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    reporter_user = rel("User")

# 성적 테이블
class Grade(Base):
    __tablename__ = "grades"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    academic_year = Column(Integer, nullable=False)  # 학년도
    semester = Column(String(20), nullable=False)  # 1학기, 2학기
    grade = Column(String(10), nullable=False)  # A+, A, B+, B, C+, C, D, F
    credit_earned = Column(Float, nullable=False)  # 획득 학점
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계 설정
    student = rel("Student")
    subject = rel("Subject")

# 과목 상세정보 테이블
class SubjectDetail(Base):
    __tablename__ = "subject_details"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    description = Column(Text, nullable=True)  # 교육부 설명
    university_requirement = Column(Boolean, default=False)  # 대입 필수 여부
    credit_type = Column(String(20), nullable=True)  # 공통/선택/필수
    difficulty_level = Column(String(20), nullable=True)  # 난이도
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    subject = rel("Subject", back_populates="subject_details")

# 학교-과목 연결 테이블 (실제 DB에 school_subjects 테이블이 존재함)
class SchoolSubject(Base):
    __tablename__ = "school_subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    is_active = Column(Boolean, nullable=True, server_default='true')
    credit_hours = Column(Integer, nullable=False)
    max_students = Column(Integer, nullable=True)
    prerequisites = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    school = rel("School", back_populates="school_subjects")
    subject = rel("Subject", back_populates="school_subjects")
    class_schedules = rel("ClassSchedule", back_populates="school_subject")
    course_enrollments = rel("CourseEnrollment", back_populates="school_subject")

# 수강신청 테이블
class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    school_subject_id = Column(Integer, ForeignKey("school_subjects.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    enrollment_status = Column(String(20), default='신청')  # 신청/승인/취소
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    student = rel("Student", back_populates="course_enrollments")
    school_subject = rel("SchoolSubject", back_populates="course_enrollments")
    teacher = rel("Teacher", back_populates="course_enrollments")

# 수업 시간표 테이블
class ClassSchedule(Base):
    __tablename__ = "class_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    school_subject_id = Column(Integer, ForeignKey("school_subjects.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    day_of_week = Column(Integer, nullable=False)  # 1=월요일, 2=화요일, ...
    start_time = Column(String(10), nullable=False)  # 수업 시작 시간 (HH:MM)
    end_time = Column(String(10), nullable=False)  # 수업 종료 시간 (HH:MM)
    room_number = Column(String(20), nullable=True)  # 강의실
    academic_year = Column(Integer, nullable=False)  # 학년도
    semester = Column(String(20), nullable=False)  # 1학기/2학기
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    school_subject = rel("SchoolSubject", back_populates="class_schedules")
    teacher = rel("Teacher", back_populates="class_schedules")

# 교사 담당과 테이블
class TeacherSubject(Base):
    __tablename__ = "teacher_subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=False)
    academic_year = Column(Integer, nullable=False)  # 학년도
    semester = Column(String(20), nullable=False)  # 1학기/2학기
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    teacher = rel("Teacher", back_populates="teacher_subjects")
    subject = rel("Subject", back_populates="teacher_subjects")
    school = rel("School", back_populates="teacher_subjects")

# NEIS 시간표 테이블
class NEISTimetable(Base):
    __tablename__ = "neis_timetables"
    
    id = Column(Integer, primary_key=True, index=True)
    school_code = Column(String(20), nullable=False)  # NEIS 학교 코드
    school_name = Column(String(200), nullable=False)  # 학교명
    region_code = Column(String(10), nullable=False)  # 교육청 코드
    academic_year = Column(Integer, nullable=False)  # 학년도
    semester = Column(String(20), nullable=False)  # 학기
    grade = Column(Integer, nullable=False)  # 학년
    class_number = Column(Integer, nullable=False)  # 반
    date = Column(Date, nullable=False)  # 날짜
    period = Column(Integer, nullable=False)  # 교시
    subject = Column(String(100), nullable=True)  # 과목명
    teacher_name = Column(String(100), nullable=True)  # 교사명
    classroom = Column(String(50), nullable=True)  # 교실
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 인덱스 추가
    __table_args__ = (
        {'extend_existing': True}
    )

# NEIS 학교 정보 테이블
class NEISSchool(Base):
    __tablename__ = "neis_schools"
    
    id = Column(Integer, primary_key=True, index=True)
    school_code = Column(String(20), unique=True, nullable=False)  # NEIS 학교 코드
    school_name = Column(String(200), nullable=False)  # 학교명
    region_code = Column(String(10), nullable=False)  # 교육청 코드
    region_name = Column(String(100), nullable=False)  # 교육청명
    school_type = Column(String(50), nullable=False)  # 학교 유형
    address = Column(Text, nullable=True)  # 주소
    phone = Column(String(20), nullable=True)  # 전화번호
    website = Column(String(200), nullable=True)  # 웹사이트
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, server_default=func.now())
    
    # 관계 설정
    timetables = rel("NEISTimetable")
