-- Seed example quiz data
insert into public.quizzes (id, type, status, question, explanation)
values ('quiz-seed-1', 'ARTICLE', 'ACTIVE', 'Seçeneklerden hangisi doðrudur?', 'Seed quiz explanation')
on conflict (id) do nothing;

insert into public.quiz_options (id, quiz_id, text, is_correct, display_order)
values
  ('quiz-seed-1-opt-1', 'quiz-seed-1', 'Doðru cevap', true, 1),
  ('quiz-seed-1-opt-2', 'quiz-seed-1', 'Yanlýþ cevap 1', false, 2),
  ('quiz-seed-1-opt-3', 'quiz-seed-1', 'Yanlýþ cevap 2', false, 3)
on conflict (id) do nothing;
