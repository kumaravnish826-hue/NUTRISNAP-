import React, { useState, useRef } from "react";
import { useStore } from "../store";
import { format } from "date-fns";
import { X, Upload, Loader2, Check, Camera } from "lucide-react";
import { fetchApi } from "../lib/api";

export default function ScannerModal({ onClose }: { onClose: () => void }) {
  const addLog = useStore((s) => s.addLog);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 800; // Resize to max 800px

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Use JPEG with 0.8 quality to reduce size
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        setPreview(compressedBase64);
        await scanFood(compressedBase64, "image/jpeg");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const scanFood = async (base64DataUrl: string, mimeType: string) => {
    setLoading(true);
    setError("");
    try {
      const base64 = base64DataUrl.split(',')[1];
      const res = await fetchApi("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to scan");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    addLog({
      type: "FOOD",
      title: result.recipeName,
      date: format(new Date(), "yyyy-MM-dd"),
      calories: result.calories,
      protein: result.proteinGrams,
      carbs: result.carbsGrams,
      fats: result.fatsGrams,
      items: result.items,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">✨</span> 
            AI Food Scanner
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>

        {!preview && !loading && (
          <div className="space-y-4">
             <div 
              onClick={() => cameraInputRef.current?.click()}
              className="border-2 border-indigo-200 bg-indigo-50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-100 hover:border-indigo-300 transition group"
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Camera className="text-indigo-600" size={26} />
              </div>
              <p className="font-semibold text-indigo-900">Take a Photo</p>
              <p className="text-xs text-indigo-600/70 mt-1 text-center">Capture your meal directly</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition group"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Upload className="text-gray-500" size={24} />
              </div>
              <p className="font-semibold text-gray-700">Upload Image</p>
              <p className="text-xs text-gray-400 mt-1 text-center">Select from gallery</p>
            </div>

            <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleFileChange} />
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {preview && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative max-h-48 flex items-center justify-center bg-black">
            <img src={preview} alt="Food Upload" className="object-cover w-full h-full opacity-80" />
            {loading && (
              <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 shadow-xl animate-pulse">
                  <Loader2 className="animate-spin text-indigo-600" size={16} /> Scanning with Gemini...
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-4">
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-green-50 text-green-800 p-4 rounded-xl">
              <h3 className="font-bold text-lg mb-1">{result.recipeName}</h3>
              <p className="text-4xl font-black text-green-600 mb-4">{result.calories} <span className="text-lg font-bold text-green-700 opacity-50">kcal</span></p>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/60 p-2 rounded-lg text-center">
                  <div className="text-[10px] font-bold uppercase text-gray-500">Protein</div>
                  <div className="font-bold text-gray-900">{result.proteinGrams}g</div>
                </div>
                <div className="bg-white/60 p-2 rounded-lg text-center">
                  <div className="text-[10px] font-bold uppercase text-gray-500">Carbs</div>
                  <div className="font-bold text-gray-900">{result.carbsGrams}g</div>
                </div>
                <div className="bg-white/60 p-2 rounded-lg text-center">
                  <div className="text-[10px] font-bold uppercase text-gray-500">Fats</div>
                  <div className="font-bold text-gray-900">{result.fatsGrams}g</div>
                </div>
              </div>
            </div>

            <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2">
              <Check size={20} /> Add to Log
            </button>
            <button onClick={() => {setPreview(null); setResult(null);}} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition">
              Scan Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
