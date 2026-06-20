import { Activity } from "lucide-react";

export default function DashboardCard({ data }: { data: any }) {
  const percentage = Math.min(100, Math.round((data.netCalories / data.targetCalories) * 100)) || 0;
  
  return (
    <div className="flex space-x-4">
      {/* Main Calorie Ring Card */}
      <div className="flex-1 bg-white p-7 rounded-[2rem] shadow-sm shadow-slate-200/50 border border-slate-100 flex flex-col items-center relative overflow-hidden text-center">
        <h3 className="text-slate-400 font-medium text-sm mb-5 uppercase tracking-widest">Remaining</h3>
        
        <div className="relative flex items-center justify-center mb-5">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="66"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-50"
            />
            <circle
              cx="72"
              cy="72"
              r="66"
              stroke="url(#gradient)"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={66 * 2 * Math.PI}
              strokeDashoffset={66 * 2 * Math.PI - (percentage / 100) * (66 * 2 * Math.PI)}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-display font-bold text-slate-800 tracking-tighter">{data.remainingCalories}</span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Kcal</span>
          </div>
        </div>

        <div className="w-full flex justify-between text-sm px-2">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Consumed</span>
            <span className="font-display font-semibold text-slate-800 text-lg">{data.consumedCalories}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Burned</span>
            <span className="font-display font-semibold text-orange-500 text-lg">{data.burnedCalories}</span>
          </div>
        </div>
      </div>

      {/* BMI Side Card */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="bg-gradient-to-b from-blue-50 to-white p-4 rounded-[2rem] shadow-sm shadow-slate-200/50 border border-blue-100/50 flex-1 flex flex-col items-center justify-center text-center">
          <Activity className="text-blue-500 mb-3" size={24} />
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">BMI</span>
          <span className="text-3xl font-display font-bold text-blue-900 leading-none mb-2">{data.bmi}</span>
          <span className={`text-[10px] font-bold uppercase rounded-full px-2.5 py-1 mt-auto whitespace-nowrap
            ${data.bmiCategory === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 
              data.bmiCategory === 'Underweight' ? 'bg-blue-100 text-blue-700' : 
              'bg-rose-100 text-rose-700'}
          `}>
            {data.bmiCategory}
          </span>
        </div>
      </div>
    </div>
  );
}
