import { useEffect, useState } from 'react';
import { supabase, type Farmer, type FarmerCrop, type Alert, type WeatherData } from '../lib/supabase';
import { LogOut, Users, MapPin, Sprout, Bell, TrendingUp, Search, Filter, Cloud } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

export function OfficerPortal({ onLogout }: Props) {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [farmerCrops, setFarmerCrops] = useState<FarmerCrop[]>([]);
  const [farmerAlerts, setFarmerAlerts] = useState<Alert[]>([]);
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortalData();
  }, []);

  useEffect(() => {
    if (selectedFarmer) {
      loadFarmerDetails(selectedFarmer.id);
    }
  }, [selectedFarmer]);

  async function loadPortalData() {
    try {
      const { data: farmersData } = await supabase
        .from('farmers')
        .select('*')
        .order('name');
      setFarmers(farmersData || []);

      const { data: weatherData } = await supabase
        .from('weather_data')
        .select('*');
      setWeather(weatherData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error loading portal data:', error);
      setLoading(false);
    }
  }

  async function loadFarmerDetails(farmerId: string) {
    try {
      const { data: cropsData } = await supabase
        .from('farmer_crops')
        .select('*, crops(*)')
        .eq('farmer_id', farmerId);
      setFarmerCrops(cropsData || []);

      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('sent_at', { ascending: false });
      setFarmerAlerts(alertsData || []);
    } catch (error) {
      console.error('Error loading farmer details:', error);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const filteredFarmers = farmers.filter(
    (farmer) =>
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.location_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFarmers = farmers.length;
  const totalAlerts = farmerAlerts.length;
  const uniqueLocations = new Set(farmers.map((f) => f.location_name)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Extension Officer Portal</h1>
              <p className="text-green-100">Farmer Management & Monitoring System</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition backdrop-blur-sm border border-white/30"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-lg p-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{totalFarmers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Locations</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueLocations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 rounded-lg p-3">
                <Bell className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{totalAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-600" />
                Farmers Directory
              </h3>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredFarmers.map((farmer) => (
                  <button
                    key={farmer.id}
                    onClick={() => setSelectedFarmer(farmer)}
                    className={`w-full text-left p-4 rounded-lg border transition ${
                      selectedFarmer?.id === farmer.id
                        ? 'bg-green-50 border-green-500 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <h4 className="font-semibold text-gray-900">{farmer.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{farmer.location_name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{farmer.phone}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Cloud className="w-6 h-6 text-blue-600" />
                Weather Overview
              </h3>
              <div className="space-y-3">
                {weather.map((w) => (
                  <div key={w.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{w.location_name}</h4>
                      <span className="text-lg font-bold text-blue-600">{w.temperature}°C</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Humidity: {w.humidity}%</div>
                      <div>Rainfall: {w.rainfall}mm</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedFarmer ? (
              <>
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedFarmer.name}</h3>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedFarmer.location_name}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{selectedFarmer.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Coordinates</p>
                      <p className="text-xs text-gray-500">
                        {selectedFarmer.latitude.toFixed(4)}, {selectedFarmer.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sprout className="w-5 h-5 text-green-600" />
                      Crops Planted
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {farmerCrops.length === 0 ? (
                        <p className="text-gray-500 col-span-2">No crops planted yet</p>
                      ) : (
                        farmerCrops.map((crop) => {
                          const daysGrown = crop.planting_date
                            ? Math.floor(
                                (new Date().getTime() - new Date(crop.planting_date).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : 0;
                          const progress = crop.crops
                            ? Math.min((daysGrown / crop.crops.growth_days) * 100, 100)
                            : 0;

                          return (
                            <div key={crop.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <h5 className="font-bold text-gray-900">{crop.crops?.name}</h5>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  {crop.status}
                                </span>
                              </div>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div>Area: {crop.area_hectares} hectares</div>
                                <div>Planted: {new Date(crop.planting_date).toLocaleDateString()}</div>
                                <div>Days: {daysGrown} / {crop.crops?.growth_days}</div>
                                <div className="pt-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-green-500 h-2 rounded-full"
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% complete</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-600" />
                    Alert History
                  </h4>
                  <div className="space-y-3">
                    {farmerAlerts.length === 0 ? (
                      <p className="text-gray-500">No alerts sent yet</p>
                    ) : (
                      farmerAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-gray-900 capitalize">
                              {alert.alert_type.replace('_', ' ')}
                            </h5>
                            <span className="text-xs text-gray-500">
                              {new Date(alert.sent_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{alert.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 border border-gray-100 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Farmer</h3>
                <p className="text-gray-600">
                  Choose a farmer from the directory to view their details, crops, and alerts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
