import { useState } from "react";
import { useStore, UserProfile, Gender, ActivityLevel } from "../store";
import { X, Sparkles, Loader2 } from "lucide-react";

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const { profile, setProfile, updateProfileByPlan } = useStore();
  
  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(profile?.age?.toString() || "");
  const [weight, setWeight] = useState(profile?.weight?.toString() || "");
  const [height, setHeight] = useState(profile?.height?.toString() || "");
  const [targetWeight, setTargetWeight] = useState(profile?.targetWeight?.toString() || "");
  const [gender, setGender] = useState<Gender>(profile?.gender || "M");
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activityLevel || "MODERATE");

  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState<any>(null);

  const handleSaveOnly = () => {
    if (!name || !age || !weight || !height || !targetWeight) return;
    setProfile({
      name,
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      targetWeight: Number(targetWeight),
      gender,
      activityLevel: activity,
    });
    onClose();
  };

  const handleAIPlan = async () => {
    if (!name || !age || !weight || !height || !targetWeight) return;
    setLoading(true);
    
    // Save locally first
    setProfile({
      name,
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      targetWeight: Number(targetWeight),
      gender,
      activityLevel: activity,
    });

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age, weight, height, targetWeight, gender, activityLevel: activity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      
      setPlanResult(data);
      updateProfileByPlan(data.recommendedCalories);
    } catch (e: any) {
      alert("Error generating plan: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Profile & Goals</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>

        {!planResult ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Your Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Age</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value as Gender)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2">
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Height (cm)</label>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Current Wt (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Target Weight (kg)</label>
              <input type="number" value={targetWeight} onChange={e => setTargetWeight(e.target.value)} className="w-full border-2 border-green-100 bg-green-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 font-bold" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Activity Level</label>
              <select value={activity} onChange={e => setActivity(e.target.value as ActivityLevel)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2">
                <option value="SEDENTARY">Sedentary (Office Job)</option>
                <option value="LIGHT">Light Exercise (1-2 days/wk)</option>
                <option value="MODERATE">Moderate (3-5 days/wk)</option>
                <option value="ACTIVE">Active (6-7 days/wk)</option>
                <option value="EXTREME">Extreme (Athlete level)</option>
              </select>
            </div>

            <div className="pt-4 space-y-3">
              <button 
                onClick={handleAIPlan} 
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="text-yellow-400" size={20} />}
                Generate AI Diet Plan
              </button>
              <button onClick={handleSaveOnly} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition">
                Use Basic Math Target
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in zoom-in duration-300">
            <div className="bg-gray-900 text-white p-6 rounded-2xl text-center relative overflow-hidden">
              <Sparkles className="absolute top-4 right-4 text-yellow-400 opacity-50" size={48} />
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-2">Optimal Target</h3>
              <div className="text-5xl font-black mb-2">{planResult.recommendedCalories} <span className="text-xl text-gray-400 font-semibold">kcal</span></div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Expert Advice</h4>
              <ul className="space-y-3">
                {planResult.tips.map((tip: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                    <span className="text-green-500 font-bold shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={onClose} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-green-200">
              Apply & Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
