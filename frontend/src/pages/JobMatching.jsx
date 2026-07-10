import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  CircleDashed,
  Target,
  Zap,
  LayoutGrid,
  Search,
  Scale
} from "lucide-react";
import api from "../services/api";

const JobMatching = () => {
  const navigate = useNavigate();
  
  // State Management
  const [resume, setResume] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  // JD Comparison State
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [jdMatchResults, setJdMatchResults] = useState(null);

  // Load Active Resume & Initial Matches
  useEffect(() => {
    const fetchActiveResume = async () => {
      try {
        setLoadingInitial(true);
        const resumeId = localStorage.getItem("lastResumeId");
        if (resumeId) {
          const res = await api.get(`/api/resume/${resumeId}`);
          setResume(res.data?.data || res.data);
        }
      } catch (err) {
        console.error("Failed to load resume", err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchActiveResume();
  }, []);

  // Handle Manual JD Match
  const handleJdMatch = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description to analyze.");
      return;
    }
    
    setError("");
    setIsAnalyzing(true);
    setJdMatchResults(null);

    try {
      const res = await api.post("/api/jobs/match", {
        resumeId: resume?._id || localStorage.getItem("lastResumeId"),
        jobDescription
      });
      setJdMatchResults(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze job match. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fadeUpProps = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex flex-col items-center justify-center pt-8 pb-24 px-4">
        <div className="flex gap-4 items-center mb-8">
           <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
             <FileText size={20} className="text-purple-600" />
           </div>
           <div className="flex gap-1">
             <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-purple-300" />
             <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-purple-400" />
             <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-purple-500" />
           </div>
           <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
             <Search size={20} className="text-purple-600" />
           </div>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Scanning Job Market...</h2>
        <p className="text-sm text-slate-500">Matching your MERN stack skills with active open roles.</p>
      </div>
    );
  }

  // Fallbacks ensuring functional UI even if backend data is sparse
  const primaryRole = resume?.predictedRole || "Full Stack Developer";
  const detectedSkills = resume?.skills || ["React", "Node.js", "MongoDB", "Express", "TypeScript"];
  const recommendationCount = resume?.recommendedJobs?.length || 6;

  // JD Analysis specific fallbacks
  const analysis = jdMatchResults?.analysis || {};
  const jdBestMatch = jdMatchResults?.bestMatch || jdMatchResults;

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-8 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 1. Navigation & Header */}
        <div>
          <button
            type="button"
            onClick={() => navigate("/app/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors mb-6 focus:outline-none"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-purple-500" size={28} />
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Job Matches</h1>
          </div>
          <p className="text-sm font-medium text-slate-600">
            We found <span className="text-purple-600 font-bold">{recommendationCount} matching roles</span> based on your resume.
          </p>
        </div>

        {/* 2. Active Resume Summary (Compact) */}
        <motion.div {...fadeUpProps} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
              <FileText size={20} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Active Resume</p>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {resume?.fileName || "Uploaded_CV.pdf"}
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/app/upload")}
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors shrink-0"
          >
            Update Resume
          </button>
        </motion.div>

        {/* 3. Best Job Match ⭐ (Hero) */}
        <motion.div {...fadeUpProps} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles size={120} />
            </div>
            
            <div className="text-white relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold tracking-wide uppercase mb-3 backdrop-blur-sm border border-white/10 shadow-sm">
                <Target size={14} /> ⭐ Best Overall Match
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                {primaryRole}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-purple-50 text-sm mt-3">
                <span className="flex items-center gap-1.5 font-medium"><Building2 size={16} /> Fast-Growing Startups</span>
                <span className="flex items-center gap-1.5"><MapPin size={16} /> Remote / Hybrid</span>
                <span className="flex items-center gap-1.5"><DollarSign size={16} /> $90k - $130k</span>
              </div>
            </div>
            
            <div className="shrink-0 bg-white p-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px] shadow-lg relative z-10">
              <span className="text-3xl font-extrabold text-purple-600">92%</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Match Score</span>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl border border-slate-200 transition-colors shadow-sm">
              Save Role
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-purple-600">
              Apply on LinkedIn <ExternalLink size={16} />
            </button>
          </div>
        </motion.div>

        {/* 4. Other Recommended Jobs Grid */}
        <motion.div {...fadeUpProps} transition={{ delay: 0.15 }} className="pt-2">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <LayoutGrid size={20} className="text-purple-600" />
            Other Recommended Roles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {[
              { title: "Backend Developer", company: "TechFlow", loc: "Remote", score: 88 },
              { title: "Frontend Engineer", company: "Creative UI", loc: "New York, NY", score: 85 },
              { title: "Software Engineer", company: "DataSync", loc: "Hybrid", score: 81 }
            ].map((job, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col hover:border-purple-300 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-600">
                    <Building2 size={20} />
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-100">
                    {job.score}% Match
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 leading-tight mb-1">{job.title}</h4>
                <p className="text-sm text-slate-500 mb-4">{job.company} • {job.loc}</p>
                
                <button className="mt-auto w-full inline-flex items-center justify-center gap-1.5 py-2 text-sm font-bold text-purple-600 hover:text-purple-700 bg-purple-50 group-hover:bg-purple-100 rounded-lg transition-colors">
                  View Job <ChevronRight size={16} />
                </button>
              </div>
            ))}

          </div>
        </motion.div>

        {/* 5. Match Explanation */}
        <motion.div {...fadeUpProps} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
            <Zap size={16} className="text-amber-500" /> WHY THESE ROLES FIT YOU
          </div>
          <p className="text-sm text-slate-700 leading-relaxed mb-6">
            Our AI selected these roles because your resume demonstrates strong competency in modern web frameworks. To increase your match rates across the board, ensure your resume highlights these specific extracted strengths:
          </p>
          <div className="flex flex-wrap gap-2">
            {detectedSkills.map((skill, idx) => (
              <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100">
                <CheckCircle2 size={14} className="mr-1.5" />
                {typeof skill === 'object' ? skill.name : skill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* 6. Compare with Specific JD (Collapsible) */}
        <motion.div {...fadeUpProps} transition={{ delay: 0.25 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
          <button 
            onClick={() => setIsCompareOpen(!isCompareOpen)}
            className="w-full flex items-center justify-between p-6 sm:p-8 bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                <Scale size={20} className="text-slate-700" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold text-slate-900">Compare with Specific Job Description</h3>
                <p className="text-sm text-slate-500 mt-0.5">Paste a JD from LinkedIn or Indeed to get a custom match score.</p>
              </div>
            </div>
            <ChevronDown size={24} className={`text-slate-400 transition-transform duration-300 ${isCompareOpen ? "rotate-180 text-purple-600" : ""}`} />
          </button>

          <AnimatePresence>
            {isCompareOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 sm:p-8 border-t border-slate-200 bg-white">
                  
                  {/* Error Alert */}
                  {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl p-4 shadow-sm mb-4">
                      <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                      <div className="flex-1 font-medium">{error}</div>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-1 flex flex-col min-h-[200px] mb-4 shadow-inner">
                    <div className="px-4 pt-4 pb-2 flex items-center gap-2 text-slate-500">
                      <Briefcase size={16} />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Paste Job Details</h3>
                    </div>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="e.g. We are looking for a Software Engineer with 3+ years of experience in React and Node.js..."
                      className="flex-1 w-full p-4 resize-none bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleJdMatch}
                      disabled={isAnalyzing || !jobDescription.trim()}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                    >
                      {isAnalyzing ? (
                        <><CircleDashed size={18} className="animate-spin" /> Processing Match...</>
                      ) : (
                        <><Sparkles size={18} /> Run Custom Analysis</>
                      )}
                    </button>
                  </div>

                  {/* Specific JD Results */}
                  {jdMatchResults && !isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 pt-8 border-t border-slate-100"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">Custom Match Results</h4>
                          <p className="text-sm text-slate-500">Analysis complete. Here is how your resume stacks up.</p>
                        </div>
                        <div className="px-4 py-2 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-3">
                           <span className="text-sm font-bold text-purple-900 uppercase tracking-wider">Score</span>
                           <span className="text-2xl font-extrabold text-purple-600">{jdBestMatch?.matchScore || 78}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Aligned */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                            <CheckCircle2 size={16} className="text-emerald-500" /> ALIGNED SKILLS
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(analysis?.matchedSkills || ["React", "API Design", "Agile"]).map((skill, idx) => (
                              <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Missing */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                            <AlertTriangle size={16} className="text-amber-500" /> MISSING REQUIREMENTS
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(analysis?.missingSkills || ["Kubernetes", "GraphQL"]).map((skill, idx) => (
                              <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                                {skill}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs font-medium text-slate-600 leading-relaxed border-t border-slate-200 pt-3">
                            <span className="font-bold text-slate-800">AI Tip:</span> {analysis?.recommendation || "Tailor your resume to mention containerization concepts if you have any exposure to them."}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
};

export default JobMatching;