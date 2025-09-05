-- 새로운 3개 시간표 시스템 스키마
-- 1. 학생 시간표 시스템 (student_*)
-- 2. 학교 시간표 시스템 (school_*)
-- 3. 교사 시간표 시스템 (teacher_*)

-- ===========================================
-- 1. 학생 시간표 시스템
-- ===========================================

-- 학생 개인 시간표 (수강신청한 과목들)
CREATE TABLE IF NOT EXISTS student_timetables (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    school_id INTEGER NOT NULL REFERENCES schools(id),
    subject_name VARCHAR(100) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5), -- 1=월, 2=화, 3=수, 4=목, 5=금
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 10), -- 1-10교시
    classroom VARCHAR(50),
    academic_year VARCHAR(4) NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, day_of_week, period, academic_year, semester)
);

-- ===========================================
-- 2. 학교 시간표 시스템 (공식 시간표)
-- ===========================================

-- 학교 반 정보 (1학년 1반, 2학년 3반 등)
CREATE TABLE IF NOT EXISTS school_classes (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id),
    grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 3), -- 1-3학년
    class_name VARCHAR(50) NOT NULL, -- 1반, 2반, 3반 등
    academic_year VARCHAR(4) NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, grade, class_name, academic_year, semester)
);

-- 학교 과목 정보
CREATE TABLE IF NOT EXISTS school_subjects (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id),
    subject_name VARCHAR(100) NOT NULL,
    subject_type VARCHAR(50), -- 공통, 선택, 진로 등
    credit_hours INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, subject_name)
);

-- 학교 전체 시간표 (공식 시간표)
CREATE TABLE IF NOT EXISTS school_timetables (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id),
    class_id INTEGER NOT NULL REFERENCES school_classes(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5), -- 1=월, 2=화, 3=수, 4=목, 5=금
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 10), -- 1-10교시
    subject_name VARCHAR(100) NOT NULL,
    classroom VARCHAR(50),
    academic_year VARCHAR(4) NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, day_of_week, period, academic_year, semester)
);

-- ===========================================
-- 3. 교사 시간표 시스템
-- ===========================================

-- 교사 담당 반 정보
CREATE TABLE IF NOT EXISTS teacher_classes (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    school_id INTEGER NOT NULL REFERENCES schools(id),
    class_id INTEGER NOT NULL REFERENCES school_classes(id),
    subject_name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(4) NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, class_id, subject_name, academic_year, semester)
);

-- 교사 수업 시간표
CREATE TABLE IF NOT EXISTS teacher_timetables (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    school_id INTEGER NOT NULL REFERENCES schools(id),
    class_id INTEGER NOT NULL REFERENCES school_classes(id),
    subject_name VARCHAR(100) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5), -- 1=월, 2=화, 3=수, 4=목, 5=금
    period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 10), -- 1-10교시
    classroom VARCHAR(50),
    academic_year VARCHAR(4) NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, day_of_week, period, academic_year, semester)
);

-- ===========================================
-- 인덱스 생성 (성능 최적화)
-- ===========================================

-- 학생 시간표 인덱스
CREATE INDEX IF NOT EXISTS idx_student_timetables_student ON student_timetables(student_id);
CREATE INDEX IF NOT EXISTS idx_student_timetables_school ON student_timetables(school_id);
CREATE INDEX IF NOT EXISTS idx_student_timetables_day_period ON student_timetables(day_of_week, period);

-- 학교 시간표 인덱스
CREATE INDEX IF NOT EXISTS idx_school_classes_school ON school_classes(school_id);
CREATE INDEX IF NOT EXISTS idx_school_classes_grade ON school_classes(grade);
CREATE INDEX IF NOT EXISTS idx_school_subjects_school ON school_subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_school_timetables_school ON school_timetables(school_id);
CREATE INDEX IF NOT EXISTS idx_school_timetables_class ON school_timetables(class_id);
CREATE INDEX IF NOT EXISTS idx_school_timetables_day_period ON school_timetables(day_of_week, period);

-- 교사 시간표 인덱스
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher ON teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_school ON teacher_classes(school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_timetables_teacher ON teacher_timetables(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_timetables_school ON teacher_timetables(school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_timetables_day_period ON teacher_timetables(day_of_week, period);

-- ===========================================
-- 뷰 생성 (조회 편의성)
-- ===========================================

-- 학생 시간표 뷰
CREATE OR REPLACE VIEW student_timetable_view AS
SELECT 
    s.name as student_name,
    s.student_number,
    sch.name as school_name,
    st.subject_name,
    st.day_of_week,
    CASE st.day_of_week
        WHEN 1 THEN '월요일'
        WHEN 2 THEN '화요일'
        WHEN 3 THEN '수요일'
        WHEN 4 THEN '목요일'
        WHEN 5 THEN '금요일'
    END as day_name,
    st.period,
    st.classroom,
    st.academic_year,
    st.semester
FROM student_timetables st
JOIN students s ON st.student_id = s.id
JOIN schools sch ON st.school_id = sch.id
ORDER BY s.name, st.day_of_week, st.period;

-- 학교 시간표 뷰
CREATE OR REPLACE VIEW school_timetable_view AS
SELECT 
    sch.name as school_name,
    sc.grade,
    sc.class_name,
    st.day_of_week,
    CASE st.day_of_week
        WHEN 1 THEN '월요일'
        WHEN 2 THEN '화요일'
        WHEN 3 THEN '수요일'
        WHEN 4 THEN '목요일'
        WHEN 5 THEN '금요일'
    END as day_name,
    st.period,
    st.subject_name,
    st.classroom,
    st.academic_year,
    st.semester
FROM school_timetables st
JOIN schools sch ON st.school_id = sch.id
JOIN school_classes sc ON st.class_id = sc.id
ORDER BY sch.name, sc.grade, sc.class_name, st.day_of_week, st.period;

-- 교사 시간표 뷰
CREATE OR REPLACE VIEW teacher_timetable_view AS
SELECT 
    t.teacher_number,
    u.name as teacher_name,
    sch.name as school_name,
    sc.grade,
    sc.class_name,
    tt.subject_name,
    tt.day_of_week,
    CASE tt.day_of_week
        WHEN 1 THEN '월요일'
        WHEN 2 THEN '화요일'
        WHEN 3 THEN '수요일'
        WHEN 4 THEN '목요일'
        WHEN 5 THEN '금요일'
    END as day_name,
    tt.period,
    tt.classroom,
    tt.academic_year,
    tt.semester
FROM teacher_timetables tt
JOIN teachers t ON tt.teacher_id = t.id
JOIN users u ON t.user_id = u.id
JOIN schools sch ON tt.school_id = sch.id
JOIN school_classes sc ON tt.class_id = sc.id
ORDER BY t.teacher_number, tt.day_of_week, tt.period;

-- 주간 시간표 뷰 (월~금 전체)
CREATE OR REPLACE VIEW weekly_school_timetable_view AS
SELECT 
    sch.name as school_name,
    sc.grade,
    sc.class_name,
    st.period,
    MAX(CASE WHEN st.day_of_week = 1 THEN st.subject_name END) as monday,
    MAX(CASE WHEN st.day_of_week = 2 THEN st.subject_name END) as tuesday,
    MAX(CASE WHEN st.day_of_week = 3 THEN st.subject_name END) as wednesday,
    MAX(CASE WHEN st.day_of_week = 4 THEN st.subject_name END) as thursday,
    MAX(CASE WHEN st.day_of_week = 5 THEN st.subject_name END) as friday
FROM school_timetables st
JOIN schools sch ON st.school_id = sch.id
JOIN school_classes sc ON st.class_id = sc.id
GROUP BY sch.name, sc.grade, sc.class_name, st.period
ORDER BY sch.name, sc.grade, sc.class_name, st.period;

-- ===========================================
-- 코멘트 추가
-- ===========================================

COMMENT ON TABLE student_timetables IS '학생 개인 시간표 (수강신청한 과목들)';
COMMENT ON TABLE school_classes IS '학교 반 정보 (1학년 1반, 2학년 3반 등)';
COMMENT ON TABLE school_subjects IS '학교 과목 정보';
COMMENT ON TABLE school_timetables IS '학교 전체 시간표 (공식 시간표)';
COMMENT ON TABLE teacher_classes IS '교사 담당 반 정보';
COMMENT ON TABLE teacher_timetables IS '교사 수업 시간표';

COMMENT ON COLUMN student_timetables.day_of_week IS '요일 (1=월, 2=화, 3=수, 4=목, 5=금)';
COMMENT ON COLUMN student_timetables.period IS '교시 (1-10)';
COMMENT ON COLUMN school_timetables.day_of_week IS '요일 (1=월, 2=화, 3=수, 4=목, 5=금)';
COMMENT ON COLUMN school_timetables.period IS '교시 (1-10)';
COMMENT ON COLUMN teacher_timetables.day_of_week IS '요일 (1=월, 2=화, 3=수, 4=목, 5=금)';
COMMENT ON COLUMN teacher_timetables.period IS '교시 (1-10)';
