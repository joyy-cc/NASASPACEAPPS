/*
  # Agricultural Monitoring System Schema

  ## Overview
  Complete database schema for farmer monitoring system with extension officer management.

  ## New Tables

  ### 1. `farmers`
  Core farmer information and location data
  - `id` (uuid, primary key) - Unique farmer identifier
  - `name` (text) - Farmer's full name
  - `phone` (text, unique) - Phone number for SMS alerts
  - `location_name` (text) - Human-readable location (e.g., "Nakuru County")
  - `latitude` (numeric) - GPS latitude
  - `longitude` (numeric) - GPS longitude
  - `created_at` (timestamptz) - Registration timestamp

  ### 2. `crops`
  Crop type definitions and planting requirements
  - `id` (uuid, primary key) - Unique crop identifier
  - `name` (text) - Crop name (e.g., "Maize", "Beans")
  - `planting_season` (text) - Ideal planting period
  - `growth_days` (integer) - Days to maturity
  - `water_requirements` (text) - Water needs description
  - `created_at` (timestamptz)

  ### 3. `farmer_crops`
  Links farmers to their planted crops
  - `id` (uuid, primary key)
  - `farmer_id` (uuid, foreign key) - References farmers table
  - `crop_id` (uuid, foreign key) - References crops table
  - `planting_date` (date) - When crop was planted
  - `area_hectares` (numeric) - Land area allocated
  - `status` (text) - Current status (planted, growing, harvested)
  - `created_at` (timestamptz)

  ### 4. `alerts`
  SMS alerts sent to farmers
  - `id` (uuid, primary key)
  - `farmer_id` (uuid, foreign key) - Target farmer
  - `alert_type` (text) - Type (planting_ready, weather_warning, harvest_ready)
  - `message` (text) - Alert message content
  - `sent_at` (timestamptz) - When alert was sent
  - `is_read` (boolean) - Read status
  - `dashboard_link` (text) - Unique link to farmer dashboard

  ### 5. `weather_data`
  Weather information by location
  - `id` (uuid, primary key)
  - `location_name` (text) - Location identifier
  - `latitude` (numeric) - GPS latitude
  - `longitude` (numeric) - GPS longitude
  - `temperature` (numeric) - Temperature in Celsius
  - `humidity` (numeric) - Humidity percentage
  - `rainfall` (numeric) - Rainfall in mm
  - `forecast` (text) - Weather description
  - `recorded_at` (timestamptz) - Data timestamp

  ### 6. `extension_officers`
  Authentication and profile for extension officers
  - `id` (uuid, primary key) - Links to auth.users
  - `name` (text) - Officer's full name
  - `email` (text, unique) - Login email
  - `region` (text) - Area of responsibility
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Farmers can view their own data (via dashboard link)
  - Extension officers (authenticated) can view all data
  - Public access to weather data for dashboard display
*/

-- Create farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  location_name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create crops table
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  planting_season text NOT NULL,
  growth_days integer NOT NULL,
  water_requirements text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create farmer_crops junction table
CREATE TABLE IF NOT EXISTS farmer_crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  crop_id uuid NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  planting_date date,
  area_hectares numeric NOT NULL,
  status text DEFAULT 'planted',
  created_at timestamptz DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  message text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false,
  dashboard_link text
);

-- Create weather_data table
CREATE TABLE IF NOT EXISTS weather_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  temperature numeric NOT NULL,
  humidity numeric NOT NULL,
  rainfall numeric NOT NULL,
  forecast text NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

-- Create extension_officers table
CREATE TABLE IF NOT EXISTS extension_officers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  region text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_officers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farmers table
CREATE POLICY "Public can view farmers for dashboard access"
  ON farmers FOR SELECT
  USING (true);

CREATE POLICY "Extension officers can view all farmers"
  ON farmers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM extension_officers
      WHERE extension_officers.id = auth.uid()
    )
  );

CREATE POLICY "Extension officers can manage farmers"
  ON farmers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM extension_officers
      WHERE extension_officers.id = auth.uid()
    )
  );

-- RLS Policies for crops table
CREATE POLICY "Anyone can view crops"
  ON crops FOR SELECT
  USING (true);

CREATE POLICY "Extension officers can manage crops"
  ON crops FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM extension_officers
      WHERE extension_officers.id = auth.uid()
    )
  );

-- RLS Policies for farmer_crops table
CREATE POLICY "Public can view farmer crops"
  ON farmer_crops FOR SELECT
  USING (true);

CREATE POLICY "Extension officers can manage farmer crops"
  ON farmer_crops FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM extension_officers
      WHERE extension_officers.id = auth.uid()
    )
  );

-- RLS Policies for alerts table
CREATE POLICY "Public can view alerts"
  ON alerts FOR SELECT
  USING (true);

CREATE POLICY "Extension officers can manage alerts"
  ON alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM extension_officers
      WHERE extension_officers.id = auth.uid()
    )
  );

-- RLS Policies for weather_data table
CREATE POLICY "Anyone can view weather data"
  ON weather_data FOR SELECT
  USING (true);

CREATE POLICY "Extension officers can manage weather data"
  ON weather_data FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM extension_officers
      WHERE extension_officers.id = auth.uid()
    )
  );

-- RLS Policies for extension_officers table
CREATE POLICY "Officers can view their own profile"
  ON extension_officers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Officers can update their own profile"
  ON extension_officers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_farmer_crops_farmer_id ON farmer_crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_crops_crop_id ON farmer_crops(crop_id);
CREATE INDEX IF NOT EXISTS idx_alerts_farmer_id ON alerts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_weather_location ON weather_data(location_name);
CREATE INDEX IF NOT EXISTS idx_alerts_sent_at ON alerts(sent_at DESC);