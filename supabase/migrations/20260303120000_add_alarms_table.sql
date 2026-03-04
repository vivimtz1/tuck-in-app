-- Alarms table for wake-up (and future bedtime) alarms
CREATE TABLE IF NOT EXISTS alarms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL DEFAULT 'Wake Up',
  time text NOT NULL,
  days text[] NOT NULL DEFAULT '{}',
  alarm_type text NOT NULL DEFAULT 'wake' CHECK (alarm_type IN ('wake', 'bedtime')),
  sound text NOT NULL DEFAULT 'Gentle Rise',
  volume integer NOT NULL DEFAULT 70 CHECK (volume >= 0 AND volume <= 100),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own alarms"
  ON alarms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alarms"
  ON alarms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alarms"
  ON alarms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alarms"
  ON alarms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS alarms_user_time_idx ON alarms(user_id, time);
