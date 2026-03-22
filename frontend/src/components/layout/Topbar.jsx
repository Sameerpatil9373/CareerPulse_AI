import { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown, Mail, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"))?.user || { name: "Sameer Patil", email: "sameer@example.com" };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center bg-white/80 backdrop-blur-md px-8 py-4 border-b border-gray-100 sticky top-0 z-40">
      <div></div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Current Session</span>
          <span className="text-xs font-bold text-gray-400 mt-0.5">{today}</span>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center rounded-full font-black text-xs shadow-lg shadow-indigo-200 ring-2 ring-white transition-all hover:scale-105 cursor-pointer relative group"
          >
            {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "SP"}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50">
              <ChevronDown size={10} className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-gray-100 py-6 px-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right text-[#111322]">
              <div className="px-6">
                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-4">User Profile</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#111322] border border-gray-100">
                    <User size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-black text-[#111322] text-sm truncate">{user.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;