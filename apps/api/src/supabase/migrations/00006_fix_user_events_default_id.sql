-- Ensure user_events.id auto-generates when not provided
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE public.user_events
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();


