import { useState, useEffect } from "react";
import { useStore, useCalorieTracking } from "./store";
import { format } from "date-fns";
import { Flame, Menu, Plus, LayoutDashboard, Dumbbell, Sparkles, History as HistoryIcon } from "lucide-react";
import FAB from "./components/FAB";
import ProfileModal from "./components/ProfileModal";
import ScannerModal from "./components/ScannerModal";
import LogModal from "./components/LogModal";

import TodayTab from "./components/TodayTab";
import FitnessTab from "./components/FitnessTab";
import AiCoachTab from "./components/AiCoachTab";
import HistoryTab from "./components/HistoryTab";
import FastingTab from "./components/FastingTab";

export default function App() {
  const { profile } = useStore();
  const [showSplash, setShowSplash] = useState(true);
  const [currentDate, setCurrentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const trackingData = useCalorieTracking(currentDate);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logType, setLogType] = useState<"FOOD" | "EXERCISE">("FOOD");

  const [activeTab, setActiveTab] = useState<"TODAY" | "FITNESS" | "FASTING" | "COACH" | "HISTORY">("TODAY");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!profile && !showSplash) {
      setIsProfileOpen(true);
    }
  }, [profile, showSplash]);

  const tabs = [
    { id: "TODAY", icon: LayoutDashboard, label: "Today" },
    { id: "FITNESS", icon: Dumbbell, label: "Fitness" },
    { id: "FASTING", icon: Flame, label: "Fasting" },
    { id: "COACH", icon: Sparkles, label: "AI Coach" },
    { id: "HISTORY", icon: HistoryIcon, label: "History" },
  ];

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-green-500 flex flex-col items-center justify-center animate-in fade-in duration-500 z-50">
        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 shadow-green-700/50">
          <span className="text-green-500 font-display font-bold text-5xl leading-none">N</span>
        </div>
        <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2">NutriSnapAI</h1>
        <div className="h-1 w-12 bg-white/30 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-white w-1/2 animate-pulse rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans selection:bg-green-100 selection:text-green-900">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
            <span className="text-white font-display font-bold text-xl leading-none">N</span>
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-slate-800">NutriSnap<span className="text-green-500">AI</span></h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
            <Flame size={16} fill="currentColor" />
            <span className="font-display font-bold text-sm">12</span>
          </div>
          <button onClick={() => setIsProfileOpen(true)} className="p-2 -mr-2 text-slate-400 hover:text-slate-900 transition flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {activeTab === "TODAY" && <TodayTab trackingData={trackingData} onOpenProfile={() => setIsProfileOpen(true)} />}
        {activeTab === "FITNESS" && <FitnessTab trackingData={trackingData} />}
        {activeTab === "FASTING" && <FastingTab />}
        {activeTab === "COACH" && <AiCoachTab />}
        {activeTab === "HISTORY" && <HistoryTab />}
      </main>

      {/* FAB - show everywhere except history perhaps, or everywhere? Everywhere is fine. */}
      {trackingData && activeTab !== "HISTORY" && activeTab !== "COACH" && (
        <FAB 
          onScan={() => setIsScannerOpen(true)}
          onAddFood={() => { setLogType("FOOD"); setIsLogOpen(true); }}
          onAddExercise={() => { setLogType("EXERCISE"); setIsLogOpen(true); }}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-4 pb-safe z-40">
        <div className="max-w-md mx-auto flex justify-between items-center relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${
                  isActive ? "text-green-600 scale-105" : "text-slate-400 hover:text-slate-600 hover:scale-105"
                }`}
              >
                <div className={`p-2 rounded-2xl mb-1.5 transition-colors ${isActive ? "bg-green-50 shadow-sm shadow-green-100/50" : "transparent"}`}>
                  <Icon size={24} className={isActive ? "fill-current opacity-20" : ""} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isActive ? "text-green-600" : "text-transparent"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {isProfileOpen && <ProfileModal onClose={() => setIsProfileOpen(false)} />}
      {isScannerOpen && <ScannerModal onClose={() => setIsScannerOpen(false)} />}
      {isLogOpen && <LogModal type={logType} onClose={() => setIsLogOpen(false)} date={currentDate} />}
    </div>
  );
}
