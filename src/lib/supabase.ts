import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Farmer = {
  id: string;
  name: string;
  phone: string;
  location_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
};

export type Crop = {
  id: string;
  name: string;
  planting_season: string;
  growth_days: number;
  water_requirements: string;
};

export type FarmerCrop = {
  id: string;
  farmer_id: string;
  crop_id: string;
  planting_date: string;
  area_hectares: number;
  status: string;
  crops?: Crop;
};

export type Alert = {
  id: string;
  farmer_id: string;
  alert_type: string;
  message: string;
  sent_at: string;
  is_read: boolean;
  dashboard_link: string | null;
};

export type WeatherData = {
  id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  forecast: string;
  recorded_at: string;
};

export type ExtensionOfficer = {
  id: string;
  name: string;
  email: string;
  region: string;
  created_at: string;
};
