import { Plus, Camera, Utensils, Zap, X } from "lucide-react";
import { useState } from "react";

export default function FAB({ onScan, onAddFood, onAddExercise }: { onScan: () => void, onAddFood: () => void, onAddExercise: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}
      
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
        {open && (
          <>
            <button
              onClick={() => { setOpen(false); onScan(); }}
              className="flex items-center space-x-3 bg-white px-4 py-3 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition transform origin-bottom animate-in slide-in-from-bottom-4"
            >
              <span className="font-medium text-gray-700 text-sm">AI Food Scanner</span>
              <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                <Camera size={18} />
              </div>
            </button>
            <button
              onClick={() => { setOpen(false); onAddFood(); }}
              className="flex items-center space-x-3 bg-white px-4 py-3 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition transform origin-bottom animate-in slide-in-from-bottom-8"
            >
              <span className="font-medium text-gray-700 text-sm">Log Food Manually</span>
              <div className="bg-green-100 text-green-600 p-2 rounded-full">
                <Utensils size={18} />
              </div>
            </button>
            <button
              onClick={() => { setOpen(false); onAddExercise(); }}
              className="flex items-center space-x-3 bg-white px-4 py-3 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition transform origin-bottom animate-in slide-in-from-bottom-12"
            >
              <span className="font-medium text-gray-700 text-sm">Log Exercise</span>
              <div className="bg-orange-100 text-orange-600 p-2 rounded-full">
                <Zap size={18} />
              </div>
            </button>
          </>
        )}
        
        <button
          onClick={() => setOpen(!open)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${open ? 'bg-gray-800 rotate-45' : 'bg-gray-900 hover:scale-105'}`}
        >
          <Plus className="text-white" size={24} />
        </button>
      </div>
    </>
  );
}
