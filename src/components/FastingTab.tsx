import { useState, useEffect } from "react";
import { useStore, FastingProtocol } from "../store";
import { format, differenceInMinutes } from "date-fns";
import { Clock, Play, Square, Settings, Flame } from "lucide-react";

export default function FastingTab() {
  const { fasting, setFasting } = useStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // UI update every minute
    return () => clearInterval(timer);
  }, []);

  const protocols: Record<FastingProtocol, number> = {
    "12:12": 12 * 60,
    "14:10": 14 * 60,
    "16:8": 16 * 60,
    "18:6": 18 * 60,
    "20:4": 20 * 60,
  };

  const getFastingStats = () => {
    if (!fasting.startTime || !fasting.isActive) return { progress: 0, text: "0h 0m", remaining: "Not Fasting", startTimeStr: null, endTimeStr: null };
    
    const start = new Date(fasting.startTime);
    const targetMin = protocols[fasting.protocol];
    const elapsed = differenceInMinutes(now, start);

    const progress = Math.min(100, (elapsed / targetMin) * 100);
    const hrs = Math.floor(elapsed / 60);
    const mins = elapsed % 60;
    
    let remaining = "";
    if (elapsed < targetMin) {
      const remMin = targetMin - elapsed;
      remaining = `${Math.floor(remMin / 60)}h ${remMin % 60}m remaining`;
    } else {
      remaining = "Goal Reached! \uD83C\uDF89";
    }

    const endD = new Date(start);
    endD.setMinutes(endD.getMinutes() + targetMin);
    const startTimeStr = format(start, "h:mm a");
    const endTimeStr = format(endD, "h:mm a");

    return { progress, text: `${hrs}h ${mins}m`, remaining, startTimeStr, endTimeStr };
  };

  const stats = getFastingStats();

  const handleToggle = () => {
    if (fasting.isActive) {
      setFasting({ ...fasting, isActive: false, startTime: null });
    } else {
      setFasting({ ...fasting, isActive: true, startTime: new Date().toISOString() });
    }
  };

  const handleChangeProtocol = (p: FastingProtocol) => {
    setFasting({ ...fasting, protocol: p, isActive: false, startTime: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Intermittent Fasting</h2>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center border border-gray-100">
        
        {/* Timer Circle */}
        <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0">
            <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
            <circle 
              cx="128" cy="128" r="120" 
              stroke="currentColor" strokeWidth="12" fill="transparent" 
              className="text-orange-500 transition-all duration-1000 ease-out"
              strokeDasharray={753.6} /* 2 * PI * r */
              strokeDashoffset={753.6 - (753.6 * stats.progress) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center mt-2">
            {fasting.isActive ? (
              <>
                <span className="text-4xl font-black text-gray-800 tracking-tight">{stats.text}</span>
                <span className="text-sm font-semibold text-orange-500 mt-1 uppercase tracking-wider">{stats.remaining}</span>
              </>
            ) : (
              <>
                <Flame className="text-gray-300 mb-2" size={48} />
                <span className="text-lg font-bold text-gray-400">Ready to Fast?</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{fasting.protocol.split(':')[0]}h : {fasting.protocol.split(':')[1]}h</span>
              </>
            )}
          </div>
        </div>

        {fasting.isActive && stats.startTimeStr && (
          <div className="flex w-full justify-between items-center bg-gray-50 p-4 rounded-2xl mb-8 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Clock size={14} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Started</div>
                <div className="text-sm font-bold text-gray-800 leading-none">{stats.startTimeStr}</div>
              </div>
            </div>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3 flex-row-reverse text-right">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Flame size={14} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Goal</div>
                <div className="text-sm font-bold text-gray-800 leading-none">{stats.endTimeStr}</div>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={handleToggle}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-md active:scale-95 text-lg ${fasting.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
        >
          {fasting.isActive ? <><Square size={20} fill="currentColor" /> End Fast</> : <><Play size={20} fill="currentColor" /> Start Fasting</>}
        </button>

      </div>

      <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
        <h3 className="text-sm font-semibold text-orange-800 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Settings size={18} /> Protocols
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(["12:12", "14:10", "16:8", "18:6", "20:4"] as FastingProtocol[]).map((p) => {
            const [fast, eat] = p.split(":");
            return (
              <button 
                key={p}
                onClick={() => handleChangeProtocol(p)}
                className={`py-3 px-4 rounded-xl font-bold flex flex-col items-center transition ${fasting.protocol === p ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-orange-900 border border-orange-200 hover:bg-orange-100'}`}
              >
                <span className="text-lg">{fast}h : {eat}h</span>
                <span className={`text-[10px] uppercase tracking-wider ${fasting.protocol === p ? 'text-orange-200' : 'text-orange-500/70'}`}>Fast : Eat</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
}
