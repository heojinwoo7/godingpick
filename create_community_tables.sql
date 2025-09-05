-- 자유 선언 커뮤니티 데이터베이스 스키마

-- 익명 사용자 테이블
CREATE TABLE IF NOT EXISTS anonymous_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- 실제 사용자 ID (users 테이블 참조)
    anonymous_id VARCHAR(20) UNIQUE NOT NULL, -- 익명 ID (예: "익명1234")
    nickname VARCHAR(50), -- 사용자가 설정한 닉네임
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 게시글 테이블
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    anonymous_user_id INTEGER NOT NULL, -- 익명 사용자 ID
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT '자유선언', -- 카테고리 (자유선언, 공지사항 등)
    location_level1 VARCHAR(50) NOT NULL, -- 1단계: 도/광역시/특별시 (예: 서울특별시)
    location_level2 VARCHAR(50) NOT NULL, -- 2단계: 구/시/군 (예: 강남구, 수원시)
    location_level3 VARCHAR(50), -- 3단계: 학교 (예: 서울고등학교)
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active', -- active, deleted, reported
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anonymous_user_id) REFERENCES anonymous_users(id) ON DELETE CASCADE
);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    anonymous_user_id INTEGER NOT NULL,
    parent_comment_id INTEGER, -- 대댓글용 (NULL이면 최상위 댓글)
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (anonymous_user_id) REFERENCES anonymous_users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 좋아요 테이블
CREATE TABLE IF NOT EXISTS post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    anonymous_user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, anonymous_user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (anonymous_user_id) REFERENCES anonymous_users(id) ON DELETE CASCADE
);

-- 댓글 좋아요 테이블
CREATE TABLE IF NOT EXISTS comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL,
    anonymous_user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, anonymous_user_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (anonymous_user_id) REFERENCES anonymous_users(id) ON DELETE CASCADE
);

-- 신고 테이블
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    reporter_anonymous_id INTEGER NOT NULL,
    reported_type VARCHAR(20) NOT NULL, -- post, comment
    reported_id INTEGER NOT NULL, -- 게시글 ID 또는 댓글 ID
    reason VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_anonymous_id) REFERENCES anonymous_users(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_location ON posts(location_level1, location_level2, location_level3);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_users_user_id ON anonymous_users(user_id);

-- 댓글 수 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 댓글 수 자동 업데이트 트리거
CREATE TRIGGER trigger_update_post_comments_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comments_count();

-- 좋아요 수 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 좋아요 수 자동 업데이트 트리거
CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_likes_count();





