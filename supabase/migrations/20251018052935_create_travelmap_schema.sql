/*
  # TravelMap Planner Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `trips`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `budget` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `destinations`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, foreign key to trips)
      - `place_id` (text) - Google Place ID
      - `name` (text)
      - `address` (text)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `category` (text) - attraction, restaurant, hotel, etc.
      - `estimated_cost` (numeric)
      - `opening_hours` (jsonb)
      - `images` (jsonb) - array of image URLs
      - `order_index` (integer) - for itinerary ordering
      - `estimated_time_hours` (numeric)
      - `number_of_travelers` (integer)
      - `created_at` (timestamptz)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, foreign key to trips)
      - `destination_id` (uuid, foreign key to destinations)
      - `category` (text) - food, transport, entertainment, accommodation
      - `amount` (numeric)
      - `description` (text)
      - `expense_date` (date)
      - `created_at` (timestamptz)
    
    - `videos`
      - `id` (uuid, primary key)
      - `destination_id` (uuid, foreign key to destinations)
      - `video_url` (text)
      - `video_id` (text) - YouTube video ID
      - `title` (text)
      - `thumbnail_url` (text)
      - `created_at` (timestamptz)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `destination_id` (uuid, foreign key to destinations)
      - `user_id` (uuid, foreign key to users)
      - `rating` (integer) - 1 to 5
      - `comment` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for reviews and videos
    - Users can only modify their own trips and destinations

  3. Important Notes
    - All timestamps use timestamptz for timezone support
    - JSONB used for flexible data storage (images, opening_hours)
    - Numeric type for precise cost calculations
    - Foreign keys ensure referential integrity
    - Order_index allows drag-and-drop reordering of destinations
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_date date,
  end_date date,
  budget numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  place_id text,
  name text NOT NULL,
  address text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  category text DEFAULT 'attraction',
  estimated_cost numeric DEFAULT 0,
  opening_hours jsonb,
  images jsonb,
  order_index integer DEFAULT 0,
  estimated_time_hours numeric DEFAULT 1,
  number_of_travelers integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,
  category text NOT NULL,
  amount numeric NOT NULL,
  description text,
  expense_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  video_id text,
  title text,
  thumbnail_url text,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
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

-- RLS Policies for trips table
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for destinations table
CREATE POLICY "Users can view destinations of own trips"
  ON destinations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = destinations.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert destinations to own trips"
  ON destinations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = destinations.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update destinations of own trips"
  ON destinations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = destinations.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = destinations.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete destinations of own trips"
  ON destinations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = destinations.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- RLS Policies for expenses table
CREATE POLICY "Users can view expenses of own trips"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expenses to own trips"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses of own trips"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses of own trips"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = expenses.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- RLS Policies for videos table
CREATE POLICY "Anyone can view videos"
  ON videos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert videos to destinations of own trips"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM destinations
      JOIN trips ON trips.id = destinations.trip_id
      WHERE destinations.id = videos.destination_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete videos from destinations of own trips"
  ON videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM destinations
      JOIN trips ON trips.id = destinations.trip_id
      WHERE destinations.id = videos.destination_id
      AND trips.user_id = auth.uid()
    )
  );

-- RLS Policies for reviews table
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_destinations_trip_id ON destinations(trip_id);
CREATE INDEX IF NOT EXISTS idx_destinations_order_index ON destinations(trip_id, order_index);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_videos_destination_id ON videos(destination_id);
CREATE INDEX IF NOT EXISTS idx_reviews_destination_id ON reviews(destination_id);
