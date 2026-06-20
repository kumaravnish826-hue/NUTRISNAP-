import { useStore } from "../store";
import { Utensils, Zap, Calendar, Trash2 } from "lucide-react";
import { format, parseISO, subDays, isAfter } from "date-fns";

export default function HistoryTab() {
  const logs = useStore((s) => s.logs);
  const deleteLog = useStore((s) => s.deleteLog);
  
  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    if (!acc[log.date]) {
      acc[log.date] = [];
    }
    acc[log.date].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);

  const sevenDaysAgo = subDays(new Date(), 7);
  const sortedDates = Object.keys(groupedLogs)
    .filter(date => isAfter(parseISO(date), sevenDaysAgo))
    .sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">History</h2>
      </div>

      {sortedDates.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl shadow-sm border border-gray-100">
          <Calendar size={32} className="mx-auto mb-3 opacity-20" />
          No history available yet.
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(date => {
            const dateObj = parseISO(date);
            const isToday = format(new Date(), 'yyyy-MM-dd') === date;
            
            return (
              <div key={date} className="space-y-3">
                <h3 className="font-semibold text-gray-500 text-sm px-1 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={14} />
                  {isToday ? 'Today' : format(dateObj, 'MMMM d, yyyy')}
                </h3>
                
                <div className="space-y-3">
                  {groupedLogs[date].map((log) => (
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
          })}
        </div>
      )}
    </div>
  );
}
