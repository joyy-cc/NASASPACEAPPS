import { useEffect, useState } from 'react';
import { supabase, type Farmer, type FarmerCrop, type Alert, type WeatherData } from '../lib/supabase';
import { Cloud, Droplets, ThermometerSun, Wind, MapPin, Calendar, Sprout, TrendingUp, Bell, Clock } from 'lucide-react';
import { CropProgressChart } from './CropProgressChart';
import { AlertCard } from './AlertCard';

interface Props {
  farmerId: string;
}

export function FarmerDashboard({ farmerId }: Props) {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [crops, setCrops] = useState<FarmerCrop[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [farmerId]);

  async function loadDashboardData() {
    try {
      const { data: farmerData } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmerId)
        .maybeSingle();

      if (farmerData) {
        setFarmer(farmerData);

        const { data: weatherData } = await supabase
          .from('weather_data')
          .select('*')
          .eq('location_name', farmerData.location_name)
          .maybeSingle();
        setWeather(weatherData);
      }

      const { data: cropsData } = await supabase
        .from('farmer_crops')
        .select('*, crops(*)')
        .eq('farmer_id', farmerId);
      setCrops(cropsData || []);

      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('sent_at', { ascending: false })
        .limit(10);
      setAlerts(alertsData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-800 font-medium">Loading your farm data...</p>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Farmer not found</p>
        </div>
      </div>
    );
  }

  const totalArea = crops.reduce((sum, crop) => sum + crop.area_hectares, 0);
  const unreadAlerts = alerts.filter(a => !a.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div
        className="relative bg-cover bg-center py-12 px-4 shadow-lg"
        style={{
          backgroundImage: 'linear-gradient(rgba(22, 101, 52, 0.85), rgba(21, 128, 61, 0.85)), url(https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between text-white">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {farmer.name}!</h1>
              <div className="flex items-center gap-2 text-green-100">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{farmer.location_name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/30">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <span className="text-2xl font-bold">{unreadAlerts}</span>
                </div>
                <p className="text-sm text-green-50">New Alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {weather && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Current Weather</h2>
                <p className="text-blue-100">NASA POWER Data - Updated Today</p>
              </div>
              <Cloud className="w-12 h-12 opacity-80" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <ThermometerSun className="w-6 h-6" />
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <p className="text-3xl font-bold">{weather.temperature}°C</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Droplets className="w-6 h-6" />
                  <span className="text-sm font-medium">Humidity</span>
                </div>
                <p className="text-3xl font-bold">{weather.humidity}%</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Wind className="w-6 h-6" />
                  <span className="text-sm font-medium">Rainfall</span>
                </div>
                <p className="text-3xl font-bold">{weather.rainfall}mm</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm font-medium">Soil Moisture</span>
                </div>
                <p className="text-3xl font-bold">Good</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-lg">{weather.forecast}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 rounded-lg p-3">
                <Sprout className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Crops</p>
                <p className="text-2xl font-bold text-gray-900">{crops.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-100 rounded-lg p-3">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Area</p>
                <p className="text-2xl font-bold text-gray-900">{totalArea.toFixed(1)} ha</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-teal-100 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Season Status</p>
                <p className="text-2xl font-bold text-gray-900">Active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sprout className="w-6 h-6 text-green-600" />
              Your Crops
            </h3>
            <div className="space-y-4">
              {crops.map((crop) => {
                const daysGrown = crop.planting_date
                  ? Math.floor((new Date().getTime() - new Date(crop.planting_date).getTime()) / (1000 * 60 * 60 * 24))
                  : 0;
                const progress = crop.crops ? Math.min((daysGrown / crop.crops.growth_days) * 100, 100) : 0;

                return (
                  <div key={crop.id} className="border border-gray-200 rounded-xl p-4 hover:border-green-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{crop.crops?.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>Planted: {new Date(crop.planting_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {crop.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Growth Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Area: <span className="font-semibold text-gray-900">{crop.area_hectares} ha</span></span>
                      <span className="text-gray-600">Days: <span className="font-semibold text-gray-900">{daysGrown} / {crop.crops?.growth_days}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Crop Growth Timeline</h3>
            <CropProgressChart crops={crops} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6 text-green-600" />
            Recent Alerts & Updates
          </h3>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No alerts yet</p>
            ) : (
              alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
            )}
          </div>
        </div>
      </div>

      <div className="bg-green-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-green-100">Powered by NASA POWER Data & Agricultural Extension Services</p>
          <p className="text-sm text-green-200 mt-2">Real-time weather monitoring and crop management system</p>
        </div>
      </div>
    </div>
  );
}
