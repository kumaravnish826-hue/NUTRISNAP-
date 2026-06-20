import React, { useState } from "react";
import { useStore } from "../store";
import { X, Sparkles, Loader2 } from "lucide-react";

export default function LogModal({ type, date, onClose }: { type: "FOOD"|"EXERCISE", date: string, onClose: () => void }) {
  const addLog = useStore((s) => s.addLog);
  const [title, setTitle] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAiEstimate = async () => {
    if (!title.trim()) return;
    setLoadingAi(true);
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: title, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      if (data.calories !== undefined) setCalories(String(data.calories));
      if (type === "FOOD") {
        if (data.protein !== undefined) setProtein(String(data.protein));
        if (data.carbs !== undefined) setCarbs(String(data.carbs));
        if (data.fats !== undefined) setFats(String(data.fats));
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed to estimate: " + e.message);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !calories) return;

    addLog({
      type,
      title,
      date,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Log {type === 'FOOD' ? 'Food' : 'Exercise'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {type === 'FOOD' ? 'What did you eat?' : 'What exercise did you do?'}
            </label>
            <div className="flex gap-2">
              <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === 'FOOD' ? "e.g. 2 boiled eggs" : "e.g. 15 mins running"} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
              <button 
                type="button" 
                onClick={handleAiEstimate} 
                disabled={loadingAi || !title.trim()}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 w-12 rounded-xl flex items-center justify-center transition disabled:opacity-50 shrink-0 border border-indigo-200 shadow-sm"
              >
                {loadingAi ? <Loader2 className="animate-spin text-indigo-600" size={20} /> : <Sparkles className="text-indigo-600" size={20} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 pl-1">Tap ✨ to auto-fill calories {type === 'FOOD' && '& macros'}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Calories (kcal)</label>
            <input required type="number" min="0" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
          </div>

          {type === 'FOOD' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Protein (g)</label>
                <input type="number" min="0" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Carbs (g)</label>
                <input type="number" min="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Fats (g)</label>
                <input type="number" min="0" value={fats} onChange={(e) => setFats(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition" />
              </div>
            </div>
          )}

          <div className="pt-4">
            <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl shadow-lg transition disabled:opacity-50">
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
