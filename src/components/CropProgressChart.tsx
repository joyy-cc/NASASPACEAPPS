import { type FarmerCrop } from '../lib/supabase';

interface Props {
  crops: FarmerCrop[];
}

export function CropProgressChart({ crops }: Props) {
  const calculateProgress = (crop: FarmerCrop) => {
    if (!crop.planting_date || !crop.crops) return 0;
    const daysGrown = Math.floor(
      (new Date().getTime() - new Date(crop.planting_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.min((daysGrown / crop.crops.growth_days) * 100, 100);
  };

  const maxProgress = crops.length > 0 ? Math.max(...crops.map(calculateProgress)) : 100;

  return (
    <div className="space-y-6">
      {crops.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No crops planted yet</p>
      ) : (
        <>
          <div className="space-y-4">
            {crops.map((crop) => {
              const progress = calculateProgress(crop);
              const daysGrown = crop.planting_date
                ? Math.floor((new Date().getTime() - new Date(crop.planting_date).getTime()) / (1000 * 60 * 60 * 24))
                : 0;

              return (
                <div key={crop.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{crop.crops?.name}</span>
                    <span className="text-sm text-gray-600">{daysGrown} days</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      >
                        <span className="text-white text-xs font-bold">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Planted</span>
                    <span>Harvest Ready</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Growth Stages Legend</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-300 rounded"></div>
                <span className="text-gray-700">0-25% - Early Growth</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span className="text-gray-700">25-50% - Vegetative</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700">50-75% - Flowering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-gray-700">75-100% - Maturity</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
