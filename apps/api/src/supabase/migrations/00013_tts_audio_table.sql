-- TTS Audio Table
-- Stores generated text-to-speech audio files for news articles

CREATE TABLE news_tts_audio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('summary', 'full')),
    voice TEXT NOT NULL CHECK (voice IN ('alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer')),
    speed DECIMAL(3,2) NOT NULL DEFAULT 1.0 CHECK (speed >= 0.25 AND speed <= 4.0),
    audio_url TEXT,
    file_size_bytes INTEGER,
    duration_seconds INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_news_tts_audio_news_id ON news_tts_audio(news_id);
CREATE INDEX idx_news_tts_audio_status ON news_tts_audio(status);
CREATE INDEX idx_news_tts_audio_content_type ON news_tts_audio(content_type);
CREATE INDEX idx_news_tts_audio_voice ON news_tts_audio(voice);
CREATE INDEX idx_news_tts_audio_created_at ON news_tts_audio(created_at);

-- Add unique constraint to prevent duplicate TTS for same news+content_type+voice combination
CREATE UNIQUE INDEX idx_news_tts_audio_unique ON news_tts_audio(news_id, content_type, voice);

-- Add trigger for updated_at
CREATE TRIGGER set_news_tts_audio_updated_at
    BEFORE UPDATE ON news_tts_audio
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Add RLS policies
ALTER TABLE news_tts_audio ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all users to read TTS audio
CREATE POLICY "Allow read access to TTS audio" ON news_tts_audio
    FOR SELECT USING (true);

-- Policy: Allow authenticated users to create TTS audio
CREATE POLICY "Allow authenticated users to create TTS audio" ON news_tts_audio
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow system to update TTS audio (for processing status)
CREATE POLICY "Allow system to update TTS audio" ON news_tts_audio
    FOR UPDATE USING (true);

-- Policy: Allow system to delete TTS audio
CREATE POLICY "Allow system to delete TTS audio" ON news_tts_audio
    FOR DELETE USING (true);

-- Add comment
COMMENT ON TABLE news_tts_audio IS 'Stores generated text-to-speech audio files for news articles';
COMMENT ON COLUMN news_tts_audio.content_type IS 'Type of content used for TTS: summary or full article';
COMMENT ON COLUMN news_tts_audio.voice IS 'OpenAI TTS voice used for generation';
COMMENT ON COLUMN news_tts_audio.speed IS 'Playback speed multiplier (0.25 to 4.0)';
COMMENT ON COLUMN news_tts_audio.status IS 'Processing status of the TTS generation';
COMMENT ON COLUMN news_tts_audio.duration_seconds IS 'Audio duration in seconds';
COMMENT ON COLUMN news_tts_audio.file_size_bytes IS 'Audio file size in bytes';
