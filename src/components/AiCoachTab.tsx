import { useState } from "react";
import { useStore } from "../store";
import { Sparkles, Loader2, Target, ArrowRight, Coffee, Sun, Moon, Apple, ChefHat } from "lucide-react";
import AiRecipeModal from "./AiRecipeModal";
import { fetchApi } from "../lib/api";

export default function AiCoachTab() {
  const { profile, updateProfileByPlan, setProfile } = useStore();
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState<any>(null);
  const [language, setLanguage] = useState<"en" | "hi">(profile?.language || "en");
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const handleAIPlan = async () => {
    if (!profile) return;
    setLoading(true);

    // Save language preference
    setProfile({ ...profile, language });

    try {
      const res = await fetchApi("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, language }),
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

  // Prediction Logic
  const getGoalPrediction = () => {
    if (!profile) return null;
    const deficitParams = profile.targetWeight < profile.weight ? 500 : (profile.targetWeight > profile.weight ? -500 : 0);
    if (deficitParams === 0) return "You are already at your target weight!";
    
    // Assumes losing/gaining 0.5kg per week with 500 cal deficit
    const diffKg = Math.abs(profile.weight - profile.targetWeight);
    const weeksToGoal = Math.ceil(diffKg / 0.5);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + weeksToGoal * 7);

    return `At optimal pace, you will reach ${profile.targetWeight}kg by ${targetDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`;
  };

  if (!profile) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Sparkles size={32} className="mx-auto mb-4 text-gray-300" />
        Please set up your profile first to get personalized AI advice.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Fitness AI Coach</h2>
      </div>

      {/* Goal Predictor Tool */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
          <Target size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Smart Goal Predictor</h3>
          <p className="text-xs text-gray-500 font-medium">
            {getGoalPrediction() || "Need weight data to predict."}
          </p>
        </div>
      </div>

      {/* Refrigerator to Recipe Tool */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-3xl text-white shadow-md relative overflow-hidden flex flex-col items-start cursor-pointer hover:shadow-lg transition" onClick={() => setIsRecipeModalOpen(true)}>
        <ChefHat className="absolute -right-4 -bottom-4 text-white opacity-10" size={120} />
        <h3 className="text-lg font-bold mb-1 relative z-10 flex items-center gap-2">
          Fridge to Recipe <Sparkles size={16} className="text-purple-300" />
        </h3>
        <p className="text-indigo-100 text-xs mb-4 relative z-10 max-w-[85%] font-medium">
          Have leftover ingredients? Tell our AI chef and get a macro-friendly recipe instantly.
        </p>
        <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 px-6 rounded-xl transition active:scale-95 shadow-sm inline-flex z-10 text-sm backdrop-blur-md">
          Create Unique Recipe
        </button>
      </div>

      <div className="bg-gray-900 border text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 text-yellow-400 opacity-20" size={80} />
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-400" /> 
          Gemini Coach
        </h3>
        <p className="text-gray-200 text-sm mb-6 max-w-[85%] relative z-10 leading-relaxed">
          I can analyze your metrics ({profile.age}yo {profile.gender}, {profile.weight}kg ➔ {profile.targetWeight}kg) and create a highly customized dietary action plan.
        </p>

        <div className="mb-4 relative z-10">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Coach Language</label>
          <div className="flex space-x-2">
            <button 
              onClick={() => setLanguage("en")} 
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${language === "en" ? "bg-white text-gray-900" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            >
              English
            </button>
            <button 
              onClick={() => setLanguage("hi")} 
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${language === "hi" ? "bg-white text-gray-900" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>

        <button 
          onClick={handleAIPlan} 
          disabled={loading}
          className="bg-white text-gray-900 hover:bg-indigo-50 font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 relative z-10 shadow-md w-full"
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={18} /> Consulting with AI...</>
          ) : (
            <>Generate New Plan <ArrowRight size={18} /></>
          )}
        </button>
      </div>

      {planResult && (
        <div className="space-y-6 animate-in zoom-in duration-300 mt-6 pt-4 border-t border-gray-100">
          <div className="bg-green-50 p-6 rounded-2xl text-center shadow-sm">
            <Target className="mx-auto mb-2 text-green-600" size={32} />
            <h3 className="text-xs font-semibold text-green-800 uppercase tracking-widest mb-1">New Optimal Target</h3>
            <div className="text-5xl font-black text-green-600 mb-1">{planResult.recommendedCalories} <span className="text-xl text-green-700 opacity-60 font-semibold">kcal</span></div>
            <p className="text-green-700 text-xs font-medium">{language === 'hi' ? 'दैनिक लक्ष्य में लागू किया गया' : 'Applied to your daily goals'}</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider px-1">{language === 'hi' ? 'विशेषज्ञ की सलाह' : 'Expert Advice'}</h4>
            <ul className="space-y-3">
              {planResult.tips.map((tip: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700 bg-white shadow-sm p-4 rounded-xl border border-gray-100 leading-relaxed items-start">
                  <span className="bg-green-100 text-green-600 p-1 rounded-full shrink-0 mt-0.5">
                    <Sparkles size={14} />
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider px-1">{language === 'hi' ? 'डाइट प्लान' : 'Daily Diet Plan'}</h4>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-amber-500 font-bold mb-2">
                  <Coffee size={18} /> {language === 'hi' ? 'नाश्ता (Breakfast)' : 'Breakfast'}
                </div>
                <p className="text-sm text-gray-700">{planResult.dietPlan.breakfast}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-orange-500 font-bold mb-2">
                  <Sun size={18} /> {language === 'hi' ? 'दोपहर का भोजन (Lunch)' : 'Lunch'}
                </div>
                <p className="text-sm text-gray-700">{planResult.dietPlan.lunch}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-indigo-500 font-bold mb-2">
                  <Moon size={18} /> {language === 'hi' ? 'रात का भोजन (Dinner)' : 'Dinner'}
                </div>
                <p className="text-sm text-gray-700">{planResult.dietPlan.dinner}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-green-500 font-bold mb-2">
                  <Apple size={18} /> {language === 'hi' ? 'स्नैक्स (Snacks)' : 'Snacks'}
                </div>
                <p className="text-sm text-gray-700">{planResult.dietPlan.snacks}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRecipeModalOpen && <AiRecipeModal onClose={() => setIsRecipeModalOpen(false)} language={language} />}
    </div>
  );
}
