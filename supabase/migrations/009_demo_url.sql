ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS demo_url TEXT,
  ADD COLUMN IF NOT EXISTS demo_generated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS prospects_demo_url_idx ON public.prospects (demo_url) WHERE demo_url IS NOT NULL;
