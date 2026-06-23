import { LogEntry, useStore } from "../store";
import { Utensils, Zap, Trash2 } from "lucide-react";

export default function LogsList({ logs }: { logs: LogEntry[] }) {
  const deleteLog = useStore((s) => s.deleteLog);

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No entries today. Tap + to log food or exercise.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 px-1">Today's Logs</h3>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 
              ${log.type === 'FOOD' ? 'bg-indigo-50 text-indigo-500' : 'bg-orange-50 text-orange-500'}`}>
              {log.type === 'FOOD' ? <Utensils size={20} /> : <Zap size={20} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{log.title}</h4>
              <div className="text-xs text-gray-500 mt-1 flex space-x-2">
                {log.type === 'FOOD' ? (
                  <>
                    <span>{log.protein}g P</span>
                    <span>•</span>
                    <span>{log.carbs}g C</span>
                    <span>•</span>
                    <span>{log.fats}g F</span>
                  </>
                ) : (
                  <span>Activity</span>
                )}
              </div>
              {log.type === 'FOOD' && log.items && log.items.length > 0 && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg space-y-1">
                  {log.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-500">{item.name}</span>
                      <span className="font-medium text-gray-700">{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right ml-4">
              <div className={`font-bold ${log.type === 'FOOD' ? 'text-gray-900' : 'text-orange-500'}`}>
                {log.type === 'FOOD' ? '' : '-'}{log.calories}
              </div>
              <div className="text-[10px] text-gray-400 font-semibold uppercase">Kcal</div>
            </div>

            <button 
              onClick={() => deleteLog(log.id)}
              className="ml-4 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition cursor-pointer"
              title="Delete log"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
