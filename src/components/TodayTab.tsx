import { format } from "date-fns";
import DashboardCard from "./DashboardCard";
import MacrosSection from "./MacrosSection";
import LogsList from "./LogsList";
import { Menu, Moon, Sun, Heart, Smile, Meh, Frown, Coffee } from "lucide-react";
import { useStore } from "../store";

export default function TodayTab({ trackingData, onOpenProfile }: { trackingData: any, onOpenProfile: () => void }) {
  const { wellnessLogs, logWellness, profile } = useStore();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayWellness = wellnessLogs ? wellnessLogs[todayStr] : null;

  const handleWellness = (mood: string) => {
    logWellness(todayStr, todayWellness?.sleep || 7, mood);
  };

  const handleSleep = (sleep: number) => {
    let autoMood = "GREAT";
    if (sleep < 5) autoMood = "BAD";
    else if (sleep < 7) autoMood = "GOOD";
    else if (sleep <= 9) autoMood = "GREAT";
    else autoMood = "OKAY";

    logWellness(todayStr, sleep, autoMood);
  };

  const getSleepFeedback = (hours: number) => {
    if (hours < 5) return { text: "Critical Recharge Needed", emoji: "🪫", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", desc: "Low sleep affects hormones & metabolism. Expect lower energy and focus today. Hydrate well!" };
    if (hours < 7) return { text: "Slight Deficit", emoji: "☕", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", desc: "A bit groggy. You might experience sugar cravings later. Grab some coffee or sunlight." };
    if (hours <= 9) return { text: "Prime Recovery", emoji: "⚡", color: "text-green-700", bg: "bg-green-50", border: "border-green-200", desc: "Perfect! Optimal hormone balance, muscle repair, and cognitive sharpness today!" };
    return { text: "Heavy Slumber", emoji: "🛌", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", desc: "Getting extra rest! Just be careful, oversleeping can sometimes leave you slightly sluggish." };
  };

  if (!trackingData) {
    return (
      <div className="bg-white rounded-[2rem] p-8 text-center shadow-sm shadow-slate-200/50 border border-slate-100">
        <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto flex items-center justify-center mb-4 text-slate-400">
          <Menu size={32} />
        </div>
        <h3 className="text-xl font-display font-bold text-slate-800 mb-2">Welcome to NutriSnap</h3>
        <p className="text-slate-500 mb-6 text-sm">Please set up your profile metrics to get your daily calorie targets.</p>
        <button 
          onClick={onOpenProfile}
          className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold tracking-wide shadow-md shadow-slate-300 w-full hover:bg-slate-800 transition-colors"
        >
          Set Up Profile
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-display font-bold text-slate-800">
          Hi{profile?.name ? ` ${profile.name}` : ''}! <span className="text-green-600 block text-sm font-sans font-semibold uppercase tracking-widest mt-1">Today, {format(new Date(), "MMM d")}</span>
        </h2>
      </div>
      <DashboardCard data={trackingData} />
      
      <MacrosSection macros={trackingData.macros} />

      {/* Wellness Check-in */}
      <div className="bg-white rounded-[2rem] p-7 shadow-sm shadow-slate-200/50 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5">
          <Heart size={16} className="text-red-500" fill="currentColor" /> Daily Wellness
        </h3>
        
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-slate-50 to-white p-5 rounded-[2rem] border border-slate-100/80 shadow-sm">
            <label className="flex items-center justify-between text-xs font-bold text-slate-400 mb-4">
              <span className="flex items-center gap-1 uppercase tracking-widest"><Moon size={14}/> Sleep Tracker</span>
              <span className="text-2xl font-display font-bold text-indigo-600">{todayWellness?.sleep || 7} <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest ml-1">hr</span></span>
            </label>
            <input 
              type="range" min="3" max="12" step="0.5" 
              value={todayWellness?.sleep || 7}
              onChange={(e) => handleSleep(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 mb-6"
            />
            {(() => {
              const fb = getSleepFeedback(todayWellness?.sleep || 7);
              return (
                <div className={`p-5 rounded-2xl border ${fb.bg} ${fb.border} transition-colors duration-300`}>
                  <div className="flex gap-4 items-center">
                    <span className="text-4xl drop-shadow-sm leading-none">{fb.emoji}</span>
                    <div>
                      <h4 className={`text-sm font-display font-bold tracking-wide mb-1 ${fb.color}`}>{fb.text}</h4>
                      <p className={`text-xs font-medium leading-relaxed opacity-80 ${fb.color}`}>{fb.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              <Sun size={14}/> Energy & Mood
            </label>
            <div className="flex justify-between gap-3">
              {[
                { id: "GREAT", icon: Smile, color: "text-emerald-500", bg: "bg-emerald-50", active: "ring-2 ring-emerald-500 bg-emerald-100 shadow-sm" },
                { id: "GOOD", icon: Coffee, color: "text-blue-500", bg: "bg-blue-50", active: "ring-2 ring-blue-500 bg-blue-100 shadow-sm" },
                { id: "OKAY", icon: Meh, color: "text-amber-500", bg: "bg-amber-50", active: "ring-2 ring-amber-500 bg-amber-100 shadow-sm" },
                { id: "BAD", icon: Frown, color: "text-rose-500", bg: "bg-rose-50", active: "ring-2 ring-rose-500 bg-rose-100 shadow-sm" }
              ].map(mood => {
                const Icon = mood.icon;
                const isActive = todayWellness?.mood === mood.id;
                return (
                  <button 
                    key={mood.id}
                    onClick={() => handleWellness(mood.id)}
                    className={`flex-1 py-4 flex justify-center rounded-2xl transition-all ${mood.bg} ${mood.color} ${isActive ? mood.active : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                  >
                    <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <LogsList logs={trackingData.todaysLogs} />
    </>
  );
}
