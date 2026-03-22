const Topbar = () => {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="flex justify-between items-center bg-white/80 backdrop-blur-md px-8 py-4 border-b border-gray-100 sticky top-0 z-40">
      <div></div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Current Session</span>
          <span className="text-xs font-bold text-gray-400 mt-0.5">{today}</span>
        </div>
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center rounded-full font-black text-xs shadow-lg shadow-indigo-200 ring-2 ring-white transition-transform hover:scale-105 cursor-pointer">
          SP
        </div>
      </div>
    </div>
  );
};

export default Topbar;