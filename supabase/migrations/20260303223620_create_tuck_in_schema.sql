/*
  # Tuck In Sleep App Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `onboarding_completed` (boolean)
      - `teddy_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `sleep_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `bedtime` (time)
      - `wake_time` (time)
      - `weekday_bedtime` (time)
      - `weekday_wake_time` (time)
      - `weekend_bedtime` (time)
      - `weekend_wake_time` (time)
      - `use_different_schedule` (boolean)
      - `locked_until` (date)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `sleep_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `date` (date)
      - `bedtime` (timestamptz)
      - `wake_time` (timestamptz)
      - `duration_minutes` (integer)
      - `quality_rating` (integer, 1-10)
      - `stress_level` (integer, 1-5)
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `content_library`
      - `id` (uuid, primary key)
      - `title` (text)
      - `category` (text: story, breath, sound)
      - `duration_minutes` (integer)
      - `description` (text)
      - `thumbnail_url` (text)
      - `audio_url` (text)
      - `popularity` (integer)
      - `created_at` (timestamptz)
    
    - `user_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `content_id` (uuid, foreign key)
      - `created_at` (timestamptz)
    
    - `play_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `content_id` (uuid, foreign key)
      - `played_at` (timestamptz)
    
    - `wind_down_routines`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `breathing_enabled` (boolean)
      - `breathing_duration` (integer)
      - `breathing_pattern` (text)
      - `screen_reminder_enabled` (boolean)
      - `light_reminder_enabled` (boolean)
      - `audio_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `notifications_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `bedtime_reminder_enabled` (boolean)
      - `bedtime_reminder_minutes_before` (integer)
      - `wind_down_reminder_enabled` (boolean)
      - `phone_alert_enabled` (boolean)
      - `morning_checkin_enabled` (boolean)
      - `achievement_notifications_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `achievement_type` (text)
      - `streak_count` (integer)
      - `earned_at` (timestamptz)
    
    - `emotional_checkins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `mood_rating` (integer, 1-5)
      - `satisfaction_rating` (integer, 1-5)
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  onboarding_completed boolean DEFAULT false,
  teddy_name text DEFAULT 'Teddy',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Sleep goals table
CREATE TABLE IF NOT EXISTS sleep_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bedtime time NOT NULL DEFAULT '23:00',
  wake_time time NOT NULL DEFAULT '07:00',
  weekday_bedtime time,
  weekday_wake_time time,
  weekend_bedtime time,
  weekend_wake_time time,
  use_different_schedule boolean DEFAULT false,
  locked_until date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sleep_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sleep goals"
  ON sleep_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep goals"
  ON sleep_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep goals"
  ON sleep_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep goals"
  ON sleep_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Sleep sessions table
CREATE TABLE IF NOT EXISTS sleep_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  bedtime timestamptz,
  wake_time timestamptz,
  duration_minutes integer,
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 10),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 5),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sleep_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sleep sessions"
  ON sleep_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep sessions"
  ON sleep_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep sessions"
  ON sleep_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep sessions"
  ON sleep_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Content library table (public read)
CREATE TABLE IF NOT EXISTS content_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('story', 'breath', 'sound')),
  duration_minutes integer NOT NULL DEFAULT 0,
  description text DEFAULT '',
  thumbnail_url text DEFAULT '',
  audio_url text DEFAULT '',
  popularity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read content library"
  ON content_library FOR SELECT
  TO authenticated
  USING (true);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content_id uuid REFERENCES content_library(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites"
  ON user_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Play history table
CREATE TABLE IF NOT EXISTS play_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content_id uuid REFERENCES content_library(id) ON DELETE CASCADE NOT NULL,
  played_at timestamptz DEFAULT now()
);

ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own play history"
  ON play_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own play history"
  ON play_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Wind down routines table
CREATE TABLE IF NOT EXISTS wind_down_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  breathing_enabled boolean DEFAULT true,
  breathing_duration integer DEFAULT 5,
  breathing_pattern text DEFAULT '4-7-8',
  screen_reminder_enabled boolean DEFAULT true,
  light_reminder_enabled boolean DEFAULT true,
  audio_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wind_down_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wind down routines"
  ON wind_down_routines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wind down routines"
  ON wind_down_routines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wind down routines"
  ON wind_down_routines FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications settings table
CREATE TABLE IF NOT EXISTS notifications_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bedtime_reminder_enabled boolean DEFAULT true,
  bedtime_reminder_minutes_before integer DEFAULT 30,
  wind_down_reminder_enabled boolean DEFAULT true,
  phone_alert_enabled boolean DEFAULT true,
  morning_checkin_enabled boolean DEFAULT true,
  achievement_notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notifications_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notification settings"
  ON notifications_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
  ON notifications_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
  ON notifications_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  achievement_type text NOT NULL,
  streak_count integer DEFAULT 0,
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Emotional checkins table
CREATE TABLE IF NOT EXISTS emotional_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  satisfaction_rating integer CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emotional_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own emotional checkins"
  ON emotional_checkins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotional checkins"
  ON emotional_checkins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emotional checkins"
  ON emotional_checkins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS sleep_sessions_user_date_idx ON sleep_sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS sleep_goals_user_active_idx ON sleep_goals(user_id, is_active);
CREATE INDEX IF NOT EXISTS play_history_user_played_idx ON play_history(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS achievements_user_idx ON achievements(user_id, earned_at DESC);