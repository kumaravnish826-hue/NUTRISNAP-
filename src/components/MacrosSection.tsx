export default function MacrosSection({ macros }: { macros: any }) {
  const renderMacro = (label: string, data: any, colorClass: string, bgClass: string, textClass: string) => {
    const progress = Math.min(100, Math.round((data.consumed / data.limit) * 100)) || 0;
    
    return (
      <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <h4 className={`${textClass} text-xs font-bold uppercase tracking-wider mb-2`}>{label}</h4>
        <div className={`h-2 w-full ${bgClass} rounded-full overflow-hidden mb-3`}>
          <div 
            className={`h-full ${colorClass} rounded-full transition-all duration-1000`} 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="flex items-baseline gap-1 mt-auto">
          <span className="font-bold text-gray-800 leading-none">{data.consumed}</span>
          <span className="text-xs text-gray-500 font-medium">/ {data.limit}g</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex space-x-3">
      {renderMacro("Protein", macros.protein, "bg-indigo-600", "bg-indigo-100", "text-indigo-800")}
      {renderMacro("Carbs", macros.carbs, "bg-amber-500", "bg-amber-100", "text-amber-800")}
      {renderMacro("Fats", macros.fats, "bg-rose-600", "bg-rose-100", "text-rose-800")}
    </div>
  );
}
