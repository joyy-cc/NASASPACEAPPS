import { useEffect, useState } from 'react';
import { supabase, type Farmer } from './lib/supabase';
import { FarmerDashboard } from './components/FarmerDashboard';
import { OfficerLogin } from './components/OfficerLogin';
import { OfficerPortal } from './components/OfficerPortal';
import { Sprout, MapPin, Phone, User, LogIn } from 'lucide-react';

function App() {
  const [isOfficer, setIsOfficer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [farmers, setFarmers] = useState<Farmer[]>([]);

  useEffect(() => {
    checkAuth();
    loadFarmers();

    const params = new URLSearchParams(window.location.search);
    const farmerParam = params.get('farmer');
    if (farmerParam) {
      setFarmerId(farmerParam);
      setIsOfficer(false);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (() => {
          if (session) {
            setIsAuthenticated(true);
            setIsOfficer(true);
          } else {
            setIsAuthenticated(false);
            setIsOfficer(false);
          }
        })();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
      setIsOfficer(true);
    }
    setLoading(false);
  }

  async function loadFarmers() {
    try {
      const { data } = await supabase
        .from('farmers')
        .select('*')
        .order('name');
      setFarmers(data || []);
    } catch (error) {
      console.error('Error loading farmers:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-800 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (farmerId) {
    return <FarmerDashboard farmerId={farmerId} />;
  }

  if (isOfficer && isAuthenticated) {
    return <OfficerPortal onLogout={() => setIsAuthenticated(false)} />;
  }

  if (isOfficer && !isAuthenticated) {
    return <OfficerLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'linear-gradient(rgba(22, 101, 52, 0.85), rgba(21, 128, 61, 0.85)), url(https://images.pexels.com/photos/296230/pexels-photo-296230.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2">
                <Sprout className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Agroalert</h1>
                <p className="text-xs text-green-100">Smart Farming System</p>
              </div>
            </div>
            <button
              onClick={() => setIsOfficer(true)}
              className="flex items-center gap-2 bg-white text-green-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-green-50 transition shadow-lg hover:shadow-xl"
            >
              <LogIn className="w-4 h-4" />
              Officer Login
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Welcome Farmers!
          </h2>
          <p className="text-xl text-green-50 max-w-3xl mx-auto">
            Access your personalized dashboard through the SMS link sent to your phone.
            Get real-time weather updates, crop progress tracking, and farming alerts.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-7 h-7 text-green-600" />
            <h3 className="text-2xl font-bold text-gray-900">Registered Farmers</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmers.map((farmer) => (
              <a
                key={farmer.id}
                href={`?farmer=${farmer.id}`}
                className="block bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:border-green-400 hover:shadow-lg transition transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full font-semibold">
                    Active
                  </span>
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-3">{farmer.name}</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span>{farmer.location_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{farmer.phone}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-xs text-gray-600">
                    Click to view dashboard
                  </p>
                </div>
              </a>
            ))}
          </div>

          {farmers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No farmers registered yet</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Real-Time Weather</h4>
            <p className="text-sm text-gray-700">
              NASA POWER satellite data provides accurate weather forecasts for your location
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Crop Tracking</h4>
            <p className="text-sm text-gray-700">
              Monitor your crops growth progress from planting to harvest with visual charts
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
            <div className="bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">SMS Alerts</h4>
            <p className="text-sm text-gray-700">
              Receive timely notifications about planting, weather warnings, and harvest readiness
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
            <p className="text-white font-medium">
              Powered by NASA POWER Data & Supabase
            </p>
            <p className="text-green-100 text-sm mt-1">
              Agricultural Extension Services - Supporting Farmers Across Kenya
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
