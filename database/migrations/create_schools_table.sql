-- 기존 schools 테이블 삭제 (외래키 제약조건 때문에 CASCADE 사용)
DROP TABLE IF EXISTS schools CASCADE;

-- 새로운 schools 테이블 생성
CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    administrative_code VARCHAR(20) UNIQUE NOT NULL, -- 행정표준코드
    name VARCHAR(200) NOT NULL, -- 학교명
    school_type VARCHAR(50) NOT NULL, -- 학교종류명
    province VARCHAR(50) NOT NULL, -- 시도명
    education_office VARCHAR(100) NOT NULL, -- 시도교육청명
    district VARCHAR(100), -- 관할조직명
    establishment_type VARCHAR(20), -- 설립명 (공립, 사립, 국립, 기타, 국외)
    phone VARCHAR(20), -- 전화번호
    website TEXT, -- 홈페이지주소
    high_school_category VARCHAR(20), -- 고등학교구분명 (일반고, 특성화고, 자율고, 특목고)
    high_school_division VARCHAR(20), -- 고등학교일반전문구분명 (일반계, 전문계, 해당없음)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_schools_name ON schools(name);
CREATE INDEX idx_schools_administrative_code ON schools(administrative_code);
CREATE INDEX idx_schools_province ON schools(province);
CREATE INDEX idx_schools_school_type ON schools(school_type);
CREATE INDEX idx_schools_establishment_type ON schools(establishment_type);

-- 제약조건 추가
ALTER TABLE schools ADD CONSTRAINT check_establishment_type 
    CHECK (establishment_type IN ('공립', '사립', '국립', '기타', '국외'));

ALTER TABLE schools ADD CONSTRAINT check_high_school_category 
    CHECK (high_school_category IN ('일반고', '특성화고', '자율고', '특목고'));

ALTER TABLE schools ADD CONSTRAINT check_high_school_division 
    CHECK (high_school_division IN ('일반계', '전문계', '해당없음'));

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_schools_updated_at 
    BEFORE UPDATE ON schools 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 테이블 생성 확인
\d schools;
