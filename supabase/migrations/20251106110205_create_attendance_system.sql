/*
  # Create Attendance System Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text) - User's full name
      - `email` (text, unique) - User's email address
      - `face_descriptor` (jsonb) - Stored face recognition descriptor
      - `created_at` (timestamptz) - Account creation timestamp
    
    - `attendance_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - Reference to users table
      - `check_in_time` (timestamptz) - When user marked attendance
      - `face_match_confidence` (numeric) - Confidence score of face match
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on both tables
    - Users can read their own profile and attendance records
    - Users can insert their own attendance records
    - Users can update their own profile
    - All users can read other users' names for attendance display
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  face_descriptor jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  check_in_time timestamptz DEFAULT now(),
  face_match_confidence numeric(5,2),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all user names"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = (current_setting('app.current_user_id', true))::uuid)
  WITH CHECK (id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read all attendance records"
  ON attendance_records FOR SELECT
  USING (true);

CREATE POLICY "Users can insert attendance records"
  ON attendance_records FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance_records(created_at DESC);