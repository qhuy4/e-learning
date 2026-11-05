-- Seed fake instructor profiles + recurring availability for instructor booking demo
-- day_of_week uses JS getDay(): 0=Sun .. 6=Sat
-- No exceptions: chk requires NULL times for unavailable full days, but backend
-- cannot filter NULL-time exceptions. Partial exceptions with times would work
-- but are skipped to keep the demo list fully available.

BEGIN;

-- 1) Update existing instructor_profiles
UPDATE instructor_profiles ip
SET headline = v.headline,
    bio = v.bio,
    approval_status = 1,
    approved_at = COALESCE(ip.approved_at, NOW()),
    total_students = v.total_students,
    avg_rating = v.avg_rating,
    updated_at = NOW()
FROM (VALUES
  (2,  'CEFR Business English Coach',           'B2â€“C1 Business English, interview drills, and email writing for working professionals.', 48, 4.87),
  (3,  'IELTS Speaking Instructor',                 'IELTS Speaking mock tests, fluency pacing, and Part 2 story structures.', 126, 4.95),
  (4,  'Conversational Fluency Coach',          'Daily conversation rhythm, shadowing, and reducing thinking pauses in English.', 73, 4.62),
  (6,  'Pronunciation & Accent Specialist',     'Connected speech, word stress, and clear American/British accent habits.', 54, 4.71),
  (9,  'Academic Writing Instructor',               'Essay structure, cohesion devices, and C1 academic tone for exams and research.', 41, 4.58),
  (10, 'Young Learners English Guide',          'A1â€“B1 young learners: games, phonics, and confidence-building speaking practice.', 89, 4.76),
  (11, 'TOEFL iBT Speaking Coach',              'TOEFL Speaking tasks 1â€“4 templates, note-taking, and timed delivery.', 67, 4.83),
  (14, 'General English Foundations',           'A1â€“B2 grammar checkpoints, vocabulary builders, and weekly progress plans.', 112, 4.54),
  (15, 'Job Interview English Coach',           'Behavioral answers, STAR stories, and mock interviews in English.', 58, 4.91),
  (17, 'Presentation Skills Instructor',            'Slide storytelling, pacing, and Q&A handling for workplace presentations.', 36, 4.69),
  (19, 'Phrasal Verbs & Idioms Lab',            'Natural phrasal verbs and idioms for intermediate learners who freeze mid-sentence.', 44, 4.55),
  (20, 'Travel English Accelerator',            'Airport, hotel, and small-talk English for travelers who need results fast.', 63, 4.78),
  (22, 'Small Talk & Networking Coach',         'Networking openers, small talk pivots, and confident closing lines.', 51, 4.88)
) AS v(user_id, headline, bio, total_students, avg_rating)
WHERE ip.user_id = v.user_id;

-- 2) Insert missing instructor_profiles
INSERT INTO instructor_profiles (
  user_id, headline, bio, revenue_share_pct, total_earned, pending_payout,
  approval_status, approved_at, total_students, avg_rating, created_at, updated_at
)
SELECT
  u.id,
  'English Instructor',
  'Friendly English instructor ready to help you practice.',
  70, 0, 0,
  1, NOW(), 0, 0,
  NOW(), NOW()
FROM users u
WHERE u.role = 2
  AND u.status = 1
  AND NOT EXISTS (SELECT 1 FROM instructor_profiles ip WHERE ip.user_id = u.id);

-- 3) Replace recurring availability so UI slots (09:30â€“20:00) all match
-- Containment: start_time <= slotStart AND end_time >= slotEnd
DELETE FROM instructor_availability_recurring;

INSERT INTO instructor_availability_recurring (
  instructor_id, day_of_week, start_time, end_time,
  effective_from, effective_until, is_active, created_at, updated_at
)
SELECT
  u.id,
  d.day_of_week,
  '09:00:00'::time,
  '21:00:00'::time,
  (CURRENT_DATE - INTERVAL '7 days')::date,
  NULL,
  TRUE,
  NOW(),
  NOW()
FROM users u
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS d(day_of_week)
WHERE u.role = 2
  AND u.status = 1
  AND EXISTS (
    SELECT 1 FROM instructor_profiles ip
    WHERE ip.user_id = u.id AND ip.approval_status = 1
  );

-- 4) Clear demo exceptions (nullable-time unavailability is unsupported by backend)
DELETE FROM instructor_availability_exceptions;

COMMIT;

-- Verify
SELECT u.id, u.name, ip.headline, ip.avg_rating, ip.total_students, ip.approval_status
FROM users u
JOIN instructor_profiles ip ON ip.user_id = u.id
WHERE u.role = 2 AND u.status = 1 AND ip.approval_status = 1
ORDER BY u.id;

SELECT COUNT(*) AS recurring_rows,
       COUNT(DISTINCT instructor_id) AS instructors_with_availability
FROM instructor_availability_recurring
WHERE is_active AND deleted_at IS NULL;
