/*
  # Integrated Track Management System Schema

  1. New Tables
    - `track_categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name (e.g., "Shipment", "Project", "Task")
      - `color` (text) - Color code for UI display
      - `icon` (text) - Icon identifier
      - `user_id` (uuid) - Owner of the category
      - `created_at` (timestamptz)
    
    - `tracks`
      - `id` (uuid, primary key)
      - `title` (text) - Track title/name
      - `description` (text) - Detailed description
      - `category_id` (uuid) - Foreign key to track_categories
      - `status` (text) - Current status
      - `priority` (text) - Priority level (low, medium, high, urgent)
      - `tracking_number` (text) - Unique tracking identifier
      - `user_id` (uuid) - Owner of the track
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `track_updates`
      - `id` (uuid, primary key)
      - `track_id` (uuid) - Foreign key to tracks
      - `status` (text) - Status at this update
      - `message` (text) - Update message/note
      - `location` (text) - Optional location info
      - `user_id` (uuid) - User who created the update
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Policies for select, insert, update, delete operations
*/

-- Create track_categories table
CREATE TABLE IF NOT EXISTS track_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'Package',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE track_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories"
  ON track_categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON track_categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON track_categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON track_categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category_id uuid REFERENCES track_categories(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  tracking_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tracks"
  ON tracks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracks"
  ON tracks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracks"
  ON tracks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracks"
  ON tracks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create track_updates table
CREATE TABLE IF NOT EXISTS track_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  message text DEFAULT '',
  location text DEFAULT '',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE track_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view updates for own tracks"
  ON track_updates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tracks
      WHERE tracks.id = track_updates.track_id
      AND tracks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert updates for own tracks"
  ON track_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tracks
      WHERE tracks.id = track_updates.track_id
      AND tracks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own track updates"
  ON track_updates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own track updates"
  ON track_updates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tracks_user_id ON tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_tracks_category_id ON tracks(category_id);
CREATE INDEX IF NOT EXISTS idx_tracks_status ON tracks(status);
CREATE INDEX IF NOT EXISTS idx_tracks_tracking_number ON tracks(tracking_number);
CREATE INDEX IF NOT EXISTS idx_track_updates_track_id ON track_updates(track_id);
CREATE INDEX IF NOT EXISTS idx_track_categories_user_id ON track_categories(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tracks table
DROP TRIGGER IF EXISTS update_tracks_updated_at ON tracks;
CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();