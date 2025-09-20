-- Sample data for Nexachron
-- Run this AFTER the main schema

-- Insert sample topics
INSERT INTO topics (slug, name) VALUES 
('technology', 'Technology'),
('politics', 'Politics'),
('sports', 'Sports'),
('world', 'World News'),
('economy', 'Economy');

-- Insert sample cards
INSERT INTO cards (name, art_url, rarity, band) VALUES 
('Tech Innovator', 'https://via.placeholder.com/200x300/0066FF/FFFFFF?text=Tech', 'COMMON', 1),
('News Hunter', 'https://via.placeholder.com/200x300/FF6600/FFFFFF?text=Hunter', 'RARE', 2),
('Quiz Master', 'https://via.placeholder.com/200x300/FF0066/FFFFFF?text=Quiz', 'LEGENDARY', 3),
('Daily Reader', 'https://via.placeholder.com/200x300/66FF00/FFFFFF?text=Reader', 'COMMON', 1),
('Prediction Pro', 'https://via.placeholder.com/200x300/6600FF/FFFFFF?text=Predict', 'RARE', 2);

-- Insert sample news
INSERT INTO news (title, summary, content, mode, city, is_popular) VALUES 
(
    'AI Breakthrough in Istanbul Tech Scene',
    'New AI startup in Istanbul develops revolutionary language model for Turkish content.',
    'A groundbreaking artificial intelligence company based in Istanbul has announced a major breakthrough in natural language processing specifically designed for Turkish content. The startup, founded by local engineers, claims their model outperforms existing solutions by 40% in Turkish language understanding.',
    'HAPPY',
    'IST',
    true
),
(
    'World Cup Qualifications Heat Up',
    'Turkey advances to next round with stunning performance against European rivals.',
    'The Turkish national football team delivered an outstanding performance in last night''s World Cup qualification match, securing their spot in the next round with a decisive 3-1 victory.',
    'TOP', 
    'ANK',
    true
),
(
    'Economic Growth Surges in Major Cities',
    'Latest economic indicators show positive growth across Turkey''s metropolitan areas.',
    'According to the latest economic data released by the Ministry of Treasury and Finance, Turkey''s major cities including Istanbul, Ankara, and Izmir have shown remarkable economic growth in the third quarter.',
    'WORLD',
    'ANK', 
    false
),
(
    'Surprise Discovery in Cappadocia',
    'Archaeologists uncover ancient underground city with modern amenities.',
    'In a surprising turn of events, archaeologists working in Cappadocia have discovered what appears to be an ancient underground city equipped with sophisticated water and air circulation systems that rival modern engineering.',
    'SURPRISE',
    'NEV',
    true
);

-- Create some sample quizzes
INSERT INTO quizzes (news_id, question, options, correct_index) 
SELECT 
    n.id,
    'What city was mentioned in this news article?',
    ARRAY['Istanbul', 'Ankara', 'Izmir', 'Antalya'],
    CASE n.city 
        WHEN 'IST' THEN 0
        WHEN 'ANK' THEN 1  
        WHEN 'IZM' THEN 2
        ELSE 3
    END
FROM news n LIMIT 3;

-- Insert sample predictions for future events
INSERT INTO predictions (news_id, question, closes_at)
SELECT 
    id,
    'Will this news topic trend for more than a week?',
    NOW() + INTERVAL '7 days'
FROM news WHERE is_popular = true LIMIT 2;

-- Success message
SELECT '✅ Sample data inserted successfully! Ready for testing.' as result;