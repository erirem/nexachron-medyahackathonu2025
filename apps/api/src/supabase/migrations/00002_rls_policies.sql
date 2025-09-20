-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all users"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- User Stats policies
CREATE POLICY "Users can view all stats"
    ON user_stats FOR SELECT
    USING (true);

CREATE POLICY "Users can only update their own stats"
    ON user_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- News policies
CREATE POLICY "Anyone can read news"
    ON news FOR SELECT
    USING (true);

CREATE POLICY "Only authors can update their news"
    ON news FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Only authors can delete their news"
    ON news FOR DELETE
    USING (auth.uid() = author_id);

-- Quizzes policies
CREATE POLICY "Anyone can view quizzes"
    ON quizzes FOR SELECT
    USING (true);

CREATE POLICY "Only authors can update their quizzes"
    ON quizzes FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Only authors can delete their quizzes"
    ON quizzes FOR DELETE
    USING (auth.uid() = author_id);

-- Quiz Questions policies
CREATE POLICY "Anyone can view quiz questions"
    ON quiz_questions FOR SELECT
    USING (true);

CREATE POLICY "Only quiz authors can modify questions"
    ON quiz_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM quizzes
            WHERE quizzes.id = quiz_questions.quiz_id
            AND quizzes.author_id = auth.uid()
        )
    );

-- Quiz Attempts policies
CREATE POLICY "Users can view their own attempts"
    ON quiz_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
    ON quiz_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts"
    ON quiz_attempts FOR UPDATE
    USING (auth.uid() = user_id);

-- Default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON FUNCTIONS TO postgres;