import React, { useState } from "react";
import { X, ChefHat, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function AiRecipeModal({ onClose, language }: { onClose: () => void, language: "en" | "hi" }) {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setRecipe(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-md rounded-3xl p-6 relative z-10 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 max-h-[90vh] flex flex-col">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center border-2 border-indigo-200">
            <ChefHat size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">AI Recipe Builder</h2>
            <p className="text-xs text-gray-500 font-medium">Turn what's in your fridge into a healthy meal</p>
          </div>
        </div>

        {!recipe ? (
          <div className="flex-1 overflow-y-auto">
            <label className="block text-sm font-bold text-gray-700 mb-2">What ingredients do you have?</label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g. Chicken breast, broccoli, eggs, rice..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm min-h-[120px] focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4 resize-none"
            />
            {error && <div className="text-red-500 text-xs mb-4 flex items-center gap-1"><AlertCircle size={14}/> {error}</div>}
            
            <button
              onClick={handleGenerate}
              disabled={loading || !ingredients.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 px-4 rounded-xl transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="animate-spin" size={20} /> Inventing Recipe...</> : <><Sparkles size={20} /> Generate healthy recipe</>}
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="bg-indigo-50 p-4 rounded-2xl mb-6 relative overflow-hidden text-center">
               <h3 className="text-xl font-black text-indigo-900 mb-1">{recipe.title}</h3>
               <div className="inline-block bg-indigo-200/50 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">{recipe.match}% Match</div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { label: "Cals", val: recipe.calories, color: "text-gray-900" },
                { label: "Protein", val: `${recipe.protein}g`, color: "text-red-600" },
                { label: "Carbs", val: `${recipe.carbs}g`, color: "text-blue-600" },
                { label: "Fats", val: `${recipe.fats}g`, color: "text-amber-500" },
              ].map((m) => (
                <div key={m.label} className="bg-gray-50 border border-gray-100 p-2 text-center rounded-xl">
                  <div className={`text-sm font-black ${m.color}`}>{m.val}</div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">{m.label}</div>
                </div>
              ))}
            </div>

            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Instructions</h4>
            <ul className="space-y-3 pb-6">
              {recipe.instructions.map((step: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed font-medium">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs">{i+1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
