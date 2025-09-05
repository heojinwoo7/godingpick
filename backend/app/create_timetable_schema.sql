-- 대구광역시 고등학교 시간표 데이터베이스 스키마
-- 요구사항: 일반계 고등학교만 필터링, 1-3학년 전체, 요일별 데이터 처리

-- 1. 학교 정보 테이블
CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    school_code VARCHAR(20) UNIQUE NOT NULL,  -- 행정표준코드
    school_name VARCHAR(200) NOT NULL,        -- 학교명
    region_code VARCHAR(10) NOT NULL,         -- 시도교육청코드 (D10)
    region_name VARCHAR(100) NOT NULL,        -- 시도교육청명
    school_type VARCHAR(50) NOT NULL,         -- 계열명 (일반계만)
    department VARCHAR(100),                  -- 학과명
    academic_year INTEGER NOT NULL,           -- 학년도
    semester INTEGER NOT NULL,                -- 학기
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 학급 정보 테이블
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id),
    grade INTEGER NOT NULL,                   -- 학년 (1, 2, 3)
    class_number INTEGER NOT NULL,            -- 학급명 (반 번호)
    classroom VARCHAR(50),                    -- 강의실명
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, grade, class_number)
);

-- 3. 시간표 테이블 (핵심 테이블)
CREATE TABLE IF NOT EXISTS timetables (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id),
    class_id INTEGER NOT NULL REFERENCES classes(id),
    date DATE NOT NULL,                       -- 시간표일자 (YYYYMMDD)
    day_of_week INTEGER NOT NULL,             -- 요일 (1=월, 2=화, 3=수, 4=목, 5=금)
    period INTEGER NOT NULL,                  -- 교시 (1-7)
    subject VARCHAR(100) NOT NULL,            -- 수업내용 (과목명)
    classroom VARCHAR(50),                    -- 강의실명
    academic_year INTEGER NOT NULL,           -- 학년도
    semester INTEGER NOT NULL,                -- 학기
    modified_date DATE,                       -- 수정일자
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, class_id, date, period)
);

-- 4. 과목 정보 테이블 (정규화)
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) UNIQUE NOT NULL, -- 과목명
    subject_type VARCHAR(50),                  -- 과목 유형 (공통, 선택 등)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_timetables_school_date ON timetables(school_id, date);
CREATE INDEX IF NOT EXISTS idx_timetables_class_period ON timetables(class_id, period);
CREATE INDEX IF NOT EXISTS idx_timetables_day_period ON timetables(day_of_week, period);
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(school_type);
CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade);

-- 6. 뷰 생성 (조회 편의성)
CREATE OR REPLACE VIEW timetable_view AS
SELECT 
    s.school_name,
    s.region_name,
    c.grade,
    c.class_number,
    t.date,
    t.day_of_week,
    CASE t.day_of_week
        WHEN 1 THEN '월요일'
        WHEN 2 THEN '화요일'
        WHEN 3 THEN '수요일'
        WHEN 4 THEN '목요일'
        WHEN 5 THEN '금요일'
    END as day_name,
    t.period,
    t.subject,
    t.classroom,
    t.academic_year,
    t.semester
FROM timetables t
JOIN schools s ON t.school_id = s.id
JOIN classes c ON t.class_id = c.id
WHERE s.school_type = '일반계'
ORDER BY s.school_name, c.grade, c.class_number, t.date, t.period;

-- 7. 주간 시간표 뷰 (월~금 전체)
CREATE OR REPLACE VIEW weekly_timetable_view AS
SELECT 
    s.school_name,
    c.grade,
    c.class_number,
    t.period,
    MAX(CASE WHEN t.day_of_week = 1 THEN t.subject END) as monday,
    MAX(CASE WHEN t.day_of_week = 2 THEN t.subject END) as tuesday,
    MAX(CASE WHEN t.day_of_week = 3 THEN t.subject END) as wednesday,
    MAX(CASE WHEN t.day_of_week = 4 THEN t.subject END) as thursday,
    MAX(CASE WHEN t.day_of_week = 5 THEN t.subject END) as friday
FROM timetables t
JOIN schools s ON t.school_id = s.id
JOIN classes c ON t.class_id = c.id
WHERE s.school_type = '일반계'
GROUP BY s.school_name, c.grade, c.class_number, t.period
ORDER BY s.school_name, c.grade, c.class_number, t.period;

-- 8. 통계 뷰
CREATE OR REPLACE VIEW timetable_stats AS
SELECT 
    s.school_name,
    COUNT(DISTINCT c.grade) as grade_count,
    COUNT(DISTINCT c.class_number) as class_count,
    COUNT(DISTINCT t.date) as day_count,
    COUNT(t.id) as total_periods
FROM timetables t
JOIN schools s ON t.school_id = s.id
JOIN classes c ON t.class_id = c.id
WHERE s.school_type = '일반계'
GROUP BY s.school_name
ORDER BY s.school_name;

-- 9. 데이터 정합성 체크 함수
CREATE OR REPLACE FUNCTION check_timetable_integrity()
RETURNS TABLE(
    school_name VARCHAR,
    grade INTEGER,
    class_number INTEGER,
    missing_periods INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.school_name,
        c.grade,
        c.class_number,
        (7 * 5) - COUNT(t.period) as missing_periods
    FROM schools s
    CROSS JOIN classes c
    LEFT JOIN timetables t ON s.id = t.school_id AND c.id = t.class_id
    WHERE s.school_type = '일반계'
    GROUP BY s.school_name, c.grade, c.class_number
    HAVING COUNT(t.period) < 35  -- 7교시 * 5일 = 35
    ORDER BY s.school_name, c.grade, c.class_number;
END;
$$ LANGUAGE plpgsql;
