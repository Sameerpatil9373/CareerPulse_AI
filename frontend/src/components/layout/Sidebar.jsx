import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard,
  Upload,
  Briefcase, 
  Sparkles, 
  History, 
  LogOut,
  BookOpen,
  Send,
  X,
  Activity,
  Zap,
  ChevronRight
} from "lucide-react";
import { getCurrentUser, logout } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const NavItem = ({ to, icon: Icon, label, onClick, isActive }) => {
  return (
    <NavLink to={to} onClick={onClick} className="block outline-none rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500">
      <motion.div
        whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.04)" }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors duration-300 overflow-hidden ${
          isActive 
            ? "bg-indigo-500/10 text-white" 
            : "text-zinc-400 hover:text-zinc-100"
        }`}
      >
        {/* Active Left Glowing Accent Bar */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              layoutId="activeNavIndicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <Icon 
          size={18} 
          className={`transition-colors duration-300 ${isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-400"}`} 
          strokeWidth={isActive ? 2.5 : 2}
        />
        <span className={`text-[13px] tracking-wide transition-all duration-300 ${isActive ? "font-semibold" : "font-medium"}`}>
          {label}
        </span>
      </motion.div>
    </NavLink>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoginModal } = useAuth();
  const isAuthenticated = !!localStorage.getItem("user");
  const user = getCurrentUser(); 
  
  const userName = user?.user?.name || "Guest User";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isMobileClose = () => {
    if (window.innerWidth < 1024) onClose();
  };

  const handleNavClick = (e, to) => {
    isMobileClose();
    if (!isAuthenticated) {
      e.preventDefault();
      showLoginModal(to);
    }
  };

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0A0A0F] text-white flex flex-col border-r border-white/5
        transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 lg:static lg:h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-6">
        <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="relative">
            {/* Subtle Ambient Glow */}
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
            <div className="relative w-10 h-10 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/20 border border-white/10 group-hover:scale-105 transition-transform duration-30">
              <Sparkles size={18} className="text-white fill-white/20" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[15px] font-extrabold tracking-tight leading-none text-zinc-100">
              CareerPulse
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                AI Engine
              </span>
            </div>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button onClick={onClose} className="lg:hidden p-2 text-zinc-500 hover:text-zinc-200 transition-colors bg-white/5 rounded-xl">
          <X size={18} />
        </button>
      </div>

      {/* Navigation Areas */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-8 pb-8 custom-scrollbar">
        
        {/* Main Menu */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3 px-3">
            Main Menu
          </p>
          <NavItem to="/app/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={(e) => handleNavClick(e, "/app/dashboard")} isActive={location.pathname === "/app/dashboard"} />
          <NavItem to="/app/upload" icon={Upload} label="Upload Resume" onClick={(e) => handleNavClick(e, "/app/upload")} isActive={location.pathname === "/app/upload"} />
          <NavItem to="/app/job-matching" icon={Briefcase} label="Job Matching" onClick={(e) => handleNavClick(e, "/app/job-matching")} isActive={location.pathname === "/app/job-matching"} />
          <NavItem to="/app/insights" icon={Sparkles} label="AI Insights" onClick={(e) => handleNavClick(e, "/app/insights")} isActive={location.pathname === "/app/insights"} />
          <NavItem to="/app/aptitude" icon={BookOpen} label="Aptitude Prep" onClick={(e) => handleNavClick(e, "/app/aptitude")} isActive={location.pathname === "/app/aptitude"} />
        </div>

        {/* Activity */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3 px-3">
            Activity
          </p>
          <NavItem to="/app/history" icon={History} label="History" onClick={(e) => handleNavClick(e, "/app/history")} isActive={location.pathname === "/app/history"} />
          <NavItem to="/app/cold-email" icon={Send} label="Networking" onClick={(e) => handleNavClick(e, "/app/cold-email")} isActive={location.pathname === "/app/cold-email"} />
        </div>
      </div>

      {/* Footer Area (Sticky Bottom) */}
      <div className="px-4 pb-6 pt-4 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F] to-transparent">
        
        {/* AI Status Card */}
        <div className="mb-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm flex items-start gap-3">
          <div className="mt-0.5 w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 shrink-0">
            <Activity size={12} className="text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">Intelligence Active</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">Processing resume contexts & optimizing job matches.</p>
          </div>
        </div>

        {/* Premium Profile Card */}
        <div className="mb-3 p-1 rounded-[1.25rem] bg-gradient-to-b from-white/10 to-white/5 shadow-sm">
          <div className="bg-[#0f0f15] rounded-2xl p-3 relative overflow-hidden group">
            {/* Subtle hover glow in profile card */}
            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center font-bold text-sm text-zinc-200 border border-white/10 shadow-inner">
                  {userInitial}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-100 truncate max-w-[100px]">
                    {userName}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Zap size={10} className="text-amber-400 fill-amber-400/20" />
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Pro Plan</p>
                  </div>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </div>

            {/* Micro Stats (UI Only - Based on Prompt Request) */}
            <div className="flex items-center gap-2 pt-2.5 border-t border-white/5">
              <div className="flex-1">
                <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider mb-0.5">Reports</p>
                <p className="text-xs font-bold text-zinc-200">8 Generated</p>
              </div>
              <div className="w-px h-6 bg-white/5" />
              <div className="flex-1 pl-2">
                <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider mb-0.5">Best ATS</p>
                <p className="text-xs font-bold text-emerald-400">84% Match</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        {isAuthenticated && (
          <motion.button 
            whileHover={{ scale: 0.98 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/5 text-zinc-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all duration-300 font-semibold text-xs tracking-wide group outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
            <span>Sign Out</span>
          </motion.button>
        )}
      </div>

      {/* Global styles for hidden scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default Sidebar;
