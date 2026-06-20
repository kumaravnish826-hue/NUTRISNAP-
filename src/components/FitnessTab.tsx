import { Activity, Zap, Flame, Droplets, Plus, GlassWater, Trophy, CheckCircle2, Circle, RotateCcw } from "lucide-react";
import { useStore } from "../store";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useState } from "react";

export default function FitnessTab({ trackingData }: { trackingData: any }) {
  const { waterLogs, addWater, resetWater, logs, completedChallenges, toggleChallenge } = useStore();
  const [showWaterAnim, setShowWaterAnim] = useState(false);

  if (!trackingData) return <div className="text-center p-8 text-gray-500">Please set up profile first.</div>;

  const exerciseLogs = trackingData.todaysLogs.filter((l: any) => l.type === 'EXERCISE');

  // --- STREAK LOGIC ---
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const activeDates = new Set(logs.map(l => l.date));

  // --- HYDROCORE LOGIC ---
  const todayStr = format(today, "yyyy-MM-dd");
  const waterIntake = waterLogs[todayStr] || 0;
  const waterGoal = 3500; // 3500ml (3.5L) goal
  const waterPercentage = Math.min(100, (waterIntake / waterGoal) * 100);

  const handleDrinkWater = () => {
    addWater(todayStr, 250); // Add 250ml
    setShowWaterAnim(true);
    setTimeout(() => setShowWaterAnim(false), 800);
  };

  // --- CHALLENGES LOGIC ---
  const dailyChallenges = [
    { id: "sugar_free", label: "No Sugar Added", reward: "🔥 +5" },
    { id: "steps_10k", label: "Walk 10,000 Steps", reward: "🔥 +10" },
    { id: "stretching", label: "10m Stretching", reward: "🔥 +5" }
  ];
  const todaysCompletedChallenges = completedChallenges ? (completedChallenges[todayStr] || []) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Fitness & Recovery</h2>
      </div>

      {/* DAILY MINI-CHALLENGES */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" /> Daily Micro-Missions
          </h3>
          <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full">{todaysCompletedChallenges.length}/{dailyChallenges.length}</span>
        </div>
        
        <div className="space-y-3">
          {dailyChallenges.map(challenge => {
            const isCompleted = todaysCompletedChallenges.includes(challenge.id);
            return (
              <div 
                key={challenge.id} 
                onClick={() => toggleChallenge(todayStr, challenge.id)}
                className={`flex justify-between items-center p-3 rounded-2xl cursor-pointer transition border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? <CheckCircle2 className="text-green-500 drop-shadow-sm" size={20} /> : <Circle className="text-gray-300" size={20} />}
                  <span className={`text-sm font-bold ${isCompleted ? 'text-green-800 line-through opacity-70' : 'text-gray-700'}`}>{challenge.label}</span>
                </div>
                <span className={`text-xs font-black ${isCompleted ? 'text-green-600' : 'text-orange-500'}`}>{challenge.reward}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* WEEKLY ACTIVITY STREAK */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <Flame className="absolute -right-4 -top-4 text-purple-700/30" size={120} />
        <div className="relative z-10">
          <h3 className="text-sm font-semibold text-purple-200 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Flame size={16} className="text-orange-400" /> 
            Weekly Streak
          </h3>
          <p className="text-white font-bold text-lg mb-4">Stay consistent this week!</p>
          
          <div className="flex justify-between items-center">
            {weekDays.map((date, i) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const isActive = activeDates.has(dateStr);
              const isToday = isSameDay(date, today);
              
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className={`text-[10px] font-bold ${isToday ? 'text-white' : 'text-purple-300'}`}>
                    {format(date, "EE").charAt(0)}
                  </span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md
                    ${isActive 
                      ? 'bg-gradient-to-r from-orange-400 to-rose-500 scale-110 ring-2 ring-white/20' 
                      : isToday 
                        ? 'bg-white/10 ring-2 ring-white/40 border border-white/20' 
                        : 'bg-white/5 border border-white/10'}
                  `}>
                    {isActive ? (
                      <Flame size={18} className="text-white fill-current" />
                    ) : (
                      <span className="text-purple-100 text-xs font-bold">{format(date, "d")}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DYNAMIC HYDROCORE */}
      <div className="bg-cyan-50 border border-cyan-100 p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
        <button 
          onClick={() => resetWater(todayStr)}
          className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-600 bg-white/50 hover:bg-white p-2 rounded-full transition-all"
          title="Reset Water"
        >
          <RotateCcw size={16} />
        </button>
        <h3 className="text-sm font-semibold text-cyan-800 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Droplets size={16} className="text-cyan-500" /> 
          Dynamic Hydrocore
        </h3>
        <p className="text-xs text-cyan-600 mb-6 font-medium">Drink Water & Fill the Wave</p>

        {/* Water Bottle/Core Animation */}
        <div className="relative w-32 h-32 rounded-full border-4 border-cyan-200 bg-white shadow-inner overflow-hidden mb-6 flex items-center justify-center">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-cyan-300 opacity-80 rounded-b-full transition-all duration-1000 ease-out"
            style={{ height: `${waterPercentage}%` }}
          />
          {/* Wave SVG Effect inside */}
          <div 
            className="absolute bottom-0 left-0 right-0 opacity-50 transition-all duration-1000 ease-out animate-[pulse_3s_ease-in-out_infinite]"
            style={{ height: `${waterPercentage}%` }}
          >
             <svg className="absolute -top-4 w-full h-8 text-cyan-300 fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,213.3C960,224,1056,192,1152,154.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-2xl font-black text-cyan-900 drop-shadow-sm">{waterIntake / 1000}</span>
            <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded-full backdrop-blur-sm mt-1">/ {waterGoal / 1000} L</span>
          </div>
        </div>

        <button 
          onClick={handleDrinkWater}
          className={`bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-cyan-500/30 transition-all active:scale-95 flex items-center gap-2 ${showWaterAnim ? 'animate-[bounce_0.5s_ease-in-out]' : ''}`}
        >
          <GlassWater size={20} />
          Drink 1 Glass
        </button>
      </div>

      <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-500 mb-4">
          <Activity size={32} />
        </div>
        <h3 className="text-sm font-semibold text-orange-800 uppercase tracking-widest mb-1">Burned Today</h3>
        <div className="text-4xl font-black text-orange-600 mb-2">{trackingData.burnedCalories} <span className="text-xl font-bold opacity-60">kcal</span></div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 px-1">Today's Exercises</h3>
        {exerciseLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-2xl shadow-sm border border-gray-100">
            No exercises logged today. Tap + to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {exerciseLogs.map((log: any) => (
              <div key={log.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-orange-50 text-orange-500">
                  <Zap size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{log.title}</h4>
                </div>
                <div className="text-right ml-4">
                  <div className="font-bold text-orange-500">-{log.calories}</div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">Kcal</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
