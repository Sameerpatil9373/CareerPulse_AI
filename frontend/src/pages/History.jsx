import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Filter,
  FileText,
  BarChart2,
  Target,
  Clock,
  Sparkles,
  Trash2,
  Download,
  Briefcase,
  CheckCircle2,
  CircleDashed,
  AlertCircle,
  Loader2,
  Calendar,
  Activity,
  RefreshCw
} from "lucide-react";
import api from "../services/api";

const History = () => {
  const navigate = useNavigate();

  // State Management (Preserving original logic)
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search, Filter & Delete State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Recent");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch History API
  const fetchHistory = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await api.get("/api/resume/all"); 
      setResumes(response.data?.data || response.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load your resume history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Delete API
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/resume/${deleteId}`);
      setResumes((prev) => prev.filter((r) => r._id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete resume.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Memoized Metrics & Filtering
  const { filteredResumes, metrics } = useMemo(() => {
    let result = [...resumes];

    // 1. Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.fileName?.toLowerCase().includes(q) ||
          r.predictedRole?.toLowerCase().includes(q)
      );
    }

    // 2. Filter / Sort
    switch (filterType) {
      case "Recent":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "Oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "Highest ATS":
        result.sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));
        break;
      case "Lowest ATS":
        result.sort((a, b) => (a.atsScore || 0) - (b.atsScore || 0));
        break;
      case "Role":
        result.sort((a, b) => (a.predictedRole || "").localeCompare(b.predictedRole || ""));
        break;
      default:
        break;
    }

    // 3. Metrics Calculation
    const total = resumes.length;
    const bestAts = total > 0 ? Math.max(...resumes.map(r => r.atsScore || 0)) : 0;
    const avgAts = total > 0 
      ? Math.round(resumes.reduce((acc, curr) => acc + (curr.atsScore || 0), 0) / total) 
      : 0;
    
    let latestDate = "--";
    if (total > 0) {
      const latest = new Date(Math.max(...resumes.map(r => new Date(r.createdAt))));
      latestDate = latest.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return { 
      filteredResumes: result, 
      metrics: { total, bestAts, avgAts, latestDate } 
    };
  }, [resumes, searchTerm, filterType]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // --- STATE 1: LOADING (Skeletons) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] pt-8 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="w-32 h-4 bg-slate-200 rounded animate-pulse mb-6" />
          <div className="w-64 h-8 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="w-96 h-4 bg-slate-200 rounded animate-pulse mb-8" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
          <div className="flex gap-4">
            <div className="h-12 bg-slate-100 rounded-xl flex-1 animate-pulse" />
            <div className="h-12 bg-slate-100 rounded-xl w-48 animate-pulse" />
          </div>
          <div className="space-y-4 pt-4 border-l-2 border-slate-100 ml-4 pl-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  // --- STATE 2: ERROR ---
  if (error && resumes.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafbfc] pt-12 px-6 flex flex-col items-center">
        <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-2xl max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="font-bold text-xl text-slate-900 mb-2">Connection Error</h3>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button 
            onClick={fetchHistory}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- STATE 3: EMPTY (No History) ---
  if (resumes.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafbfc] pt-8 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate("/app/dashboard")} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors mb-6">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed p-12 flex flex-col items-center justify-center text-center min-h-[500px]"
          >
            <div className="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center mb-6">
              <Activity size={40} className="text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Resume History Yet</h3>
            <p className="text-base text-slate-500 max-w-md mx-auto mb-8">
              Upload your first resume to generate an ATS score, extract skills, and begin tracking your AI-powered career journey.
            </p>
            <button
              onClick={() => navigate("/app/upload")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
            >
              Upload Resume <ArrowLeft size={16} className="rotate-180" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- STATE 4: SUCCESS (Timeline / Feed) ---
  return (
    <div className="min-h-screen bg-[#fafbfc] pt-8 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <button
            type="button"
            onClick={() => navigate("/app/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors mb-6 focus:outline-none"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Resume Evolution</h1>
          <p className="text-sm text-slate-500">
            Track your career milestones, uploaded documents, and AI analysis history.
          </p>
        </div>

        {/* Hero Metrics */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <FileText size={14} className="text-slate-400" /> Total Resumes
            </div>
            <span className="text-3xl font-extrabold text-slate-900">{metrics.total}</span>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <BarChart2 size={14} className="text-purple-600" /> Average ATS
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.avgAts}%</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-center border-t-[3px] border-t-emerald-500">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <Target size={14} className="text-emerald-500" /> Highest ATS
            </div>
            <span className="text-3xl font-extrabold text-slate-900">{metrics.bestAts}%</span>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <Clock size={14} className="text-slate-400" /> Latest Upload
            </div>
            <span className="text-lg font-bold text-slate-900 mt-1">{metrics.latestDate}</span>
          </motion.div>
        </motion.div>

        {/* Search + Filter Bar */}
        <motion.div variants={itemVariants} initial="hidden" animate="show" className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by resume name or predicted role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent shadow-sm transition-all"
            />
          </div>
          <div className="relative min-w-[180px]">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent shadow-sm transition-all cursor-pointer"
            >
              <option value="Recent">Recent First</option>
              <option value="Highest ATS">Highest ATS Score</option>
              <option value="Lowest ATS">Lowest ATS Score</option>
              <option value="Role">Group by Role</option>
              <option value="Oldest">Oldest First</option>
            </select>
          </div>
        </motion.div>

        {/* Activity Timeline Feed */}
        <div className="pt-6">
          {filteredResumes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
              <p className="text-sm font-medium text-slate-500">No resumes match your search criteria.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200/80 ml-4 sm:ml-6 space-y-8 pb-12">
              <AnimatePresence>
                {filteredResumes.map((item, idx) => {
                  // Infer state based on data presence
                  const isFailed = item.status === "Failed";
                  const isAiReady = item.skills?.length > 0 || item.predictedRole;
                  const uploadDate = new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

                  return (
                    <motion.div 
                      key={item._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="relative pl-6 sm:pl-10 group"
                    >
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[11px] top-6 w-5 h-5 rounded-full border-[4px] border-[#fafbfc] transition-colors duration-300 ${idx === 0 ? 'bg-purple-600' : 'bg-slate-300 group-hover:bg-purple-400'}`} />

                      {/* Premium Activity Card */}
                      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:-translate-y-1 hover:shadow-md hover:border-purple-200 transition-all duration-300">
                        
                        <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
                          
                          {/* Left: Primary Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-slate-900 truncate">{item.fileName}</h3>
                              
                              {/* Dynamic AI Status Badge */}
                              {isFailed ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 uppercase tracking-wider">
                                  <AlertCircle size={10} /> Failed
                                </span>
                              ) : isAiReady ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">
                                  <CheckCircle2 size={10} /> AI Ready
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                                  <CircleDashed size={10} className="animate-spin" /> Processing
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 font-medium">
                              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {uploadDate}</span>
                              <span className="flex items-center gap-1.5"><Target size={14} className="text-slate-400" /> {item.predictedRole || "Pending Role"}</span>
                              <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-slate-400" /> {item.skills?.length || 0} Skills Detected</span>
                            </div>
                          </div>

                          {/* Right: ATS Score Block */}
                          <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl border border-slate-100 md:border-none">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest md:mb-1">ATS Score</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-2xl font-extrabold leading-none ${item.atsScore >= 80 ? 'text-emerald-600' : item.atsScore >= 60 ? 'text-purple-600' : 'text-slate-700'}`}>
                                {item.atsScore || 0}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex flex-wrap items-center gap-2 sm:gap-3">
                          <button 
                            onClick={() => navigate("/app/insights", { state: { resumeId: item._id } })}
                            disabled={!isAiReady}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-purple-300 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-slate-700 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-1"
                          >
                            <FileText size={14} /> View Report
                          </button>
                          
                          <button 
                            onClick={() => navigate("/app/jobs", { state: { resumeId: item._id } })}
                            disabled={!isAiReady}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-purple-300 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-slate-700 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-1"
                          >
                            <Briefcase size={14} /> Match Jobs
                          </button>

                          <div className="flex-1" /> 

                          <button 
                            onClick={() => { /* Placeholder for Download */ }}
                            className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors shadow-sm"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>

                          <button 
                            onClick={() => setDeleteId(item._id)}
                            className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 hover:border-red-200 rounded-lg transition-colors shadow-sm"
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 text-red-600 mb-6">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center border border-red-100">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Record?</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">Cannot be undone</p>
                </div>
              </div>
              
              <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8">
                Are you sure you want to delete this resume? All associated AI insights, match scores, and interview questions will be permanently removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 shadow-sm flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1 disabled:opacity-70"
                >
                  {isDeleting ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : "Delete Resume"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;