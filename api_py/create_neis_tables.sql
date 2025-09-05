-- NEIS API 관련 테이블 생성 스크립트

-- NEIS 학교 정보 테이블
CREATE TABLE IF NOT EXISTS neis_schools (
    id SERIAL PRIMARY KEY,
    school_code VARCHAR(20) UNIQUE NOT NULL,
    school_name VARCHAR(200) NOT NULL,
    region_code VARCHAR(10) NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    school_type VARCHAR(50) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    website VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NEIS 시간표 테이블
CREATE TABLE IF NOT EXISTS neis_timetables (
    id SERIAL PRIMARY KEY,
    school_code VARCHAR(20) NOT NULL,
    school_name VARCHAR(200) NOT NULL,
    region_code VARCHAR(10) NOT NULL,
    academic_year INTEGER NOT NULL,
    semester VARCHAR(20) NOT NULL,
    grade INTEGER NOT NULL,
    class_number INTEGER NOT NULL,
    date DATE NOT NULL,
    period INTEGER NOT NULL,
    subject VARCHAR(100),
    teacher_name VARCHAR(100),
    classroom VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_neis_schools_code ON neis_schools(school_code);
CREATE INDEX IF NOT EXISTS idx_neis_schools_region ON neis_schools(region_code);
CREATE INDEX IF NOT EXISTS idx_neis_timetables_school ON neis_timetables(school_code);
CREATE INDEX IF NOT EXISTS idx_neis_timetables_date ON neis_timetables(date);
CREATE INDEX IF NOT EXISTS idx_neis_timetables_grade_class ON neis_timetables(grade, class_number);
CREATE INDEX IF NOT EXISTS idx_neis_timetables_period ON neis_timetables(period);

-- 중복 방지를 위한 유니크 제약조건
CREATE UNIQUE INDEX IF NOT EXISTS idx_neis_timetables_unique 
ON neis_timetables(school_code, date, period, grade, class_number);

-- 코멘트 추가
COMMENT ON TABLE neis_schools IS 'NEIS API에서 가져온 학교 정보';
COMMENT ON TABLE neis_timetables IS 'NEIS API에서 가져온 시간표 정보';

COMMENT ON COLUMN neis_schools.school_code IS 'NEIS 학교 코드';
COMMENT ON COLUMN neis_schools.region_code IS '교육청 코드 (G10: 대구광역시)';
COMMENT ON COLUMN neis_timetables.school_code IS 'NEIS 학교 코드';
COMMENT ON COLUMN neis_timetables.region_code IS '교육청 코드';
COMMENT ON COLUMN neis_timetables.academic_year IS '학년도';
COMMENT ON COLUMN neis_timetables.semester IS '학기 (1, 2)';
COMMENT ON COLUMN neis_timetables.grade IS '학년';
COMMENT ON COLUMN neis_timetables.class_number IS '반';
COMMENT ON COLUMN neis_timetables.date IS '날짜';
COMMENT ON COLUMN neis_timetables.period IS '교시';
COMMENT ON COLUMN neis_timetables.subject IS '과목명';
COMMENT ON COLUMN neis_timetables.teacher_name IS '교사명';
COMMENT ON COLUMN neis_timetables.classroom IS '교실';
