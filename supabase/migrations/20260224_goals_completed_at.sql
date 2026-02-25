-- Add completed_at to goals table so users can manually finalize a goal
-- Once completed, the goal's target_amount is deducted from the shared balance pool
-- so other goals can progress independently.
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS completed_at timestamptz DEFAULT NULL;
