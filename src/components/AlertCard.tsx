import { type Alert } from '../lib/supabase';
import { AlertCircle, CloudRain, Sprout, TrendingUp, Bell, Clock } from 'lucide-react';

interface Props {
  alert: Alert;
}

export function AlertCard({ alert }: Props) {
  const getAlertIcon = () => {
    switch (alert.alert_type) {
      case 'planting_ready':
        return <Sprout className="w-5 h-5" />;
      case 'weather_warning':
        return <CloudRain className="w-5 h-5" />;
      case 'harvest_ready':
        return <TrendingUp className="w-5 h-5" />;
      case 'progress_update':
        return <Bell className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAlertColor = () => {
    switch (alert.alert_type) {
      case 'planting_ready':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'weather_warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'harvest_ready':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'progress_update':
        return 'bg-teal-50 border-teal-200 text-teal-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIconColor = () => {
    switch (alert.alert_type) {
      case 'planting_ready':
        return 'text-green-600';
      case 'weather_warning':
        return 'text-amber-600';
      case 'harvest_ready':
        return 'text-blue-600';
      case 'progress_update':
        return 'text-teal-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`border rounded-xl p-4 transition-all hover:shadow-md ${getAlertColor()} ${!alert.is_read ? 'ring-2 ring-offset-2 ring-green-400' : ''}`}>
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${getAlertIconColor()}`}>
          {getAlertIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold capitalize">
              {alert.alert_type.replace('_', ' ')}
            </h4>
            {!alert.is_read && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                New
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed mb-2">
            {alert.message}
          </p>
          <div className="flex items-center gap-2 text-xs opacity-75">
            <Clock className="w-3 h-3" />
            <span>{formatDate(alert.sent_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
