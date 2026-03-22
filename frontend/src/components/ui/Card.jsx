const Card = ({ title, value, trend, icon: Icon, color = "indigo", percentage = 100 }) => {
  const colorClasses = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      progress: "bg-indigo-600",
      tag: "bg-indigo-50 text-indigo-400"
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      progress: "bg-emerald-600",
      tag: "bg-emerald-50 text-emerald-400"
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      progress: "bg-amber-600",
      tag: "bg-amber-50 text-amber-400"
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      progress: "bg-purple-600",
      tag: "bg-purple-50 text-purple-400"
    }
  };

  const currentTheme = colorClasses[color] || colorClasses.indigo;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm p-6 flex flex-col justify-between border border-gray-100 hover:shadow-xl transition-all duration-500 group h-[220px]">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm ${currentTheme.bg} ${currentTheme.text}`}>
          {Icon && <Icon size={20} />}
        </div>
        {trend && (
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-transparent ${currentTheme.tag} opacity-60`}>
            {trend}
          </span>
        )}
      </div>

      <div className="space-y-0.5">
        <h2 className="text-3xl font-black text-[#111322] leading-none tracking-tight">
          {value}
        </h2>
        <h3 className="text-gray-400 text-[9px] font-black uppercase tracking-widest ml-1">{title}</h3>
      </div>

      {/* Progress Bar at the bottom */}
      <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden mt-4">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${currentTheme.progress}`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
};

export default Card;
