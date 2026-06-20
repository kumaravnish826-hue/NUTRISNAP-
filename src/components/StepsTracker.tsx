import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Footprints, AlertCircle, Sparkles, Loader2, RefreshCw, Smartphone, Watch, Activity, Heart, X, CheckCircle2, RotateCcw } from "lucide-react";
import { useStore } from "../store";

export default function StepsTracker() {
  const { stepLogs, addSteps, resetSteps, profile } = useStore();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const currentSteps = stepLogs[todayStr] || 0;
  const targetSteps = 10000;
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [activityQuery, setActivityQuery] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);
  const [isTrackingReal, setIsTrackingReal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  // Real pedometer using device motion
  const handleStartRealTracking = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState === 'granted') {
          startMotionListener();
        } else {
          alert('Permission for motion sensors denied.');
        }
      } catch (e) {
        console.error(e);
        startSimulation(); // fallback
      }
    } else {
      startMotionListener();
    }
  };

  const startMotionListener = () => {
    setIsTrackingReal(true);
    let lastZ = 0;
    let eventsReceived = false;
    
    // Very basic step detection logic
    const handleMotion = (event: DeviceMotionEvent) => {
      const z = event.accelerationIncludingGravity?.z || 0;
      if (z !== 0) eventsReceived = true;
      const deltaZ = Math.abs(z - lastZ);
      
      // Typical step registers a spike in Z acceleration
      if (deltaZ > 3.0 && lastZ !== 0) { 
        addSteps(todayStr, 1);
      }
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);

    // If no events with data are received in 3 seconds, fallback to simulation
    const fallbackTimer = setTimeout(() => {
      if (!eventsReceived) {
        window.removeEventListener('devicemotion', handleMotion);
        setIsTrackingReal(false);
        startSimulation();
      }
    }, 3000);

    // Stop after 30 seconds for demo purposes
    setTimeout(() => {
      window.removeEventListener('devicemotion', handleMotion);
      setIsTrackingReal(false);
      clearTimeout(fallbackTimer);
    }, 30000);
  };

  // Sync Pedometer fallback
  const startSimulation = (deviceStr: string = "Device") => {
    setIsSimulating(true);
    // Simulate network API delay for syncing data from external app
    setTimeout(() => {
      // In a real app, this would be an API call to Apple Health/Google Fit
      const targetAdd = Math.floor(Math.random() * 3000) + 1500; // Sync 1500 to 4500 steps
      addSteps(todayStr, targetAdd);
      
      setIsSimulating(false);
      setSelectedDevice(deviceStr);
      setTimeout(() => setSelectedDevice(null), 3000);
    }, 1500); // 1.5 second simulated loading time
  };

  const handleConnectPedometer = () => {
    setShowDeviceModal(true);
  };

  const syncDevice = (device: any) => {
    setShowDeviceModal(false);
    if (device.isNative) {
      if (window.DeviceMotionEvent && !isSimulating) {
        handleStartRealTracking();
        return;
      }
    }
    startSimulation(device.name);
  };

  const devices = [
    { name: "Apple Health", icon: <Heart size={20} className="text-pink-500" />, color: "bg-pink-50 text-pink-700" },
    { name: "Google Fit", icon: <Activity size={20} className="text-blue-500" />, color: "bg-blue-50 text-blue-700" },
    { name: "Fitbit", icon: <Watch size={20} className="text-teal-500" />, color: "bg-teal-50 text-teal-700" },
    { name: "Garmin Connect", icon: <Watch size={20} className="text-slate-700" />, color: "bg-slate-100 text-slate-800" },
    { name: "Samsung Health", icon: <Heart size={20} className="text-green-500" />, color: "bg-green-50 text-green-700" },
    { name: "Native Pedometer", icon: <Smartphone size={20} className="text-purple-500" />, color: "bg-purple-50 text-purple-700", isNative: true },
  ];

  const handleAiEstimate = async () => {
    if (!activityQuery.trim()) return;
    setIsEstimating(true);
    try {
      const res = await fetch("/api/estimate-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: activityQuery,
          user: profile ? `${profile.height}cm, ${profile.weight}kg` : ''
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      if (data.steps) {
        addSteps(todayStr, data.steps);
      }
      setActivityQuery("");
      setShowAiInput(false);
    } catch (e: any) {
      console.error(e);
      alert("Failed to estimate steps: " + e.message);
    } finally {
      setIsEstimating(false);
    }
  };

  const progressLine = Math.min(100, Math.round((currentSteps / targetSteps) * 100));

  return (
    <div className="bg-white rounded-[2rem] p-7 shadow-sm shadow-slate-200/50 border border-slate-100 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Footprints size={16} className="text-blue-500" /> Step Tracker
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => resetSteps(todayStr)}
            className="text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors border border-transparent hover:border-red-100"
            title="Reset Steps"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={handleConnectPedometer}
            disabled={isSimulating || isTrackingReal}
            className="text-xs bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-100 disabled:opacity-50 transition-all border border-blue-100/50 shadow-sm"
          >
            {isSimulating || isTrackingReal ? <RefreshCw size={14} className="animate-spin" /> : 
             selectedDevice ? <CheckCircle2 size={14} className="text-green-500" /> : <Smartphone size={14} />}
            {isTrackingReal ? "Tracking..." : isSimulating ? "Syncing..." : selectedDevice ? `Synced ${selectedDevice}` : "Connect Device"}
          </button>
        </div>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-5xl font-display font-bold text-slate-800 leading-none tracking-tighter">{currentSteps.toLocaleString()}</span>
        <span className="text-sm text-slate-400 font-bold mb-1 uppercase tracking-widest">/ {targetSteps.toLocaleString()}</span>
      </div>

      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-6 shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000" 
          style={{ width: `${progressLine}%` }}
        />
      </div>

      {showDeviceModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300 border border-slate-100">
            <div className="p-6 pb-4 flex justify-between items-center border-b border-slate-50">
              <h3 className="font-display font-bold text-xl text-slate-900">Connect Device</h3>
              <button onClick={() => setShowDeviceModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 rounded-full p-2.5 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              {devices.map(device => (
                <button
                  key={device.name}
                  onClick={() => syncDevice(device)}
                  className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left w-full group focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shrink-0 ${device.color} shadow-sm`}>
                    {device.icon}
                  </div>
                  <div>
                    <div className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{device.name}</div>
                    <div className="text-xs text-slate-500 font-medium">Tap to sync recent steps</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAiInput ? (
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">
            Describe your activity
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={activityQuery} 
              onChange={(e) => setActivityQuery(e.target.value)} 
              placeholder="e.g. Walked 30 mins to grocery store" 
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all" 
              onKeyDown={(e) => e.key === 'Enter' && handleAiEstimate()}
            />
            <button 
              type="button" 
              onClick={handleAiEstimate} 
              disabled={isEstimating || !activityQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white w-12 rounded-2xl flex items-center justify-center transition disabled:opacity-50 shrink-0 shadow-md shadow-blue-200"
            >
              {isEstimating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 text-center font-medium tracking-wide">✨ AI will estimate real steps based on your profile</p>
        </div>
      ) : (
        <button 
          onClick={() => setShowAiInput(true)}
          className="w-full py-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100/50 rounded-2xl text-blue-700 font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Sparkles size={18} className="text-indigo-500" />
          AI Step Estimator
        </button>
      )}
    </div>
  );
}
