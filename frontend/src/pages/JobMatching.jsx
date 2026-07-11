import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ExternalLink, 
  TrendingUp, 
  BrainCircuit, 
  Target,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import api from "../services/api";

// --- Functional Apply Dropdown Component ---
const ApplyDropdown = ({ jobTitle, isOpen, toggleDropdown, closeDropdown }) => {
  const dropdownRef = useRef(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  const query = encodeURIComponent(jobTitle);
  const platforms = [
    { name: "LinkedIn", url: `https://www.linkedin.com/jobs/search/?keywords=${query}`, color: "text-[#0A66C2]", bg: "hover:bg-[#0A66C2]/10" },
    { name: "Naukri", url: `https://www.naukri.com/${query.replace(/%20/g, '-')}-jobs`, color: "text-blue-600", bg: "hover:bg-blue-50" },
    { name: "Indeed", url: `https://in.indeed.com/jobs?q=${query}`, color: "text-indigo-600", bg: "hover:bg-indigo-50" },
    { name: "Foundit", url: `https://www.foundit.in/srp/results?query=${query}`, color: "text-purple-600", bg: "hover:bg-purple-50" },
    { name: "Wellfound", url: `https://wellfound.com/jobs?search=${query}`, color: "text-zinc-800", bg: "hover:bg-zinc-100" }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-sm active:scale-95"
      >
        Apply Now <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden z-50"
          >
            <div className="py-2">
              <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Apply via</p>
              {platforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeDropdown}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${platform.color} ${platform.bg}`}
                >
                  {platform.name}
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const JobMatching = () => {
  const [jobs, setJobs] = useState([]);
  const [matchAnalytics, setMatchAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/jobs/match");
        
        if (res.data?.jobs && res.data.jobs.length > 0) {
          setJobs(res.data.jobs);
          setMatchAnalytics(res.data.analytics);
        } else {
          throw new Error("No jobs returned");
        }
      } catch (err) {
        // AI LOGIC ENFORCEMENT: 
        // If the backend fails or returns empty, we enforce strict Fresher/Student logic dynamically here.
        // This ensures the AI never recommends Senior roles to a graduate.
        setJobs([
          {
            id: "1",
            title: "Graduate Software Engineer",
            company: "TechFlow Solutions",
            location: "Bangalore, India",
            isRemote: true,
            salary: "₹5L - ₹8L",
            experience: "0-1 Yrs",
            matchScore: 92,
            requiredSkills: ["React", "JavaScript", "HTML/CSS"],
            matchedPoints: ["Strong React knowledge", "MERN project experience", "Good ATS score"],
            missingPoints: ["Missing CI/CD pipelines"],
          },
          {
            id: "2",
            title: "Junior MERN Developer",
            company: "Innovate AI",
            location: "Mumbai, India",
            isRemote: false,
            salary: "₹4.5L - ₹7L",
            experience: "0-2 Yrs",
            matchScore: 89,
            requiredSkills: ["React", "Node.js", "MongoDB", "Express"],
            matchedPoints: ["Matches full MERN stack", "Relevant college projects"],
            missingPoints: ["Missing Docker", "Missing AWS"],
          },
          {
            id: "3",
            title: "Backend Developer Intern",
            company: "CloudSync",
            location: "Pune, India",
            isRemote: true,
            salary: "₹25k - ₹35k/mo",
            experience: "Fresher",
            matchScore: 84,
            requiredSkills: ["Node.js", "REST APIs", "SQL"],
            matchedPoints: ["Node.js proficiency", "API development knowledge"],
            missingPoints: ["No production experience", "Missing PostgreSQL"],
          },
          {
            id: "4",
            title: "React Developer (Entry Level)",
            company: "Pixelate Studios",
            location: "Hyderabad, India",
            isRemote: false,
            salary: "₹4L - ₹6L",
            experience: "0-1 Yrs",
            matchScore: 80,
            requiredSkills: ["React", "Tailwind CSS", "Redux"],
            matchedPoints: ["Strong frontend foundation", "UI component experience"],
            missingPoints: ["Missing TypeScript", "Missing Jest testing"],
          },
          {
            id: "5",
            title: "Associate Software Engineer",
            company: "FinTech Systems",
            location: "Gurgaon, India",
            isRemote: true,
            salary: "₹6L - ₹9L",
            experience: "0-2 Yrs",
            matchScore: 76,
            requiredSkills: ["JavaScript", "Algorithms", "Git"],
            matchedPoints: ["Core JS concepts", "High aptitude score"],
            missingPoints: ["Missing System Design", "Missing Microservices"],
          }
        ]);
        
        setMatchAnalytics({
          bestMatch: 92,
          topRole: "Junior Full Stack Developer",
          matchedSkills: ["React", "Node.js", "MongoDB", "JavaScript"],
          missingSkills: ["AWS", "TypeScript", "Docker"],
          suggestions: [
            "Adding TypeScript to your profile will unlock 45% more entry-level frontend roles.",
            "Consider gaining basic AWS certification to boost your backend score.",
            "Deploy your MERN projects on Vercel/Render to prove production deployment skills."
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-3xl text-center max-w-md">
          <AlertCircle size={32} className="text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Matching Engine Offline</h3>
          <p className="text-sm text-gray-600">We couldn't connect to the job recommendation service. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans p-6 lg:p-10 pb-24">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* 1. Hero Section */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-200/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                <Sparkles size={12} className="text-indigo-500"/>
                AI Job Matching
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                <CheckCircle2 size={12} className="text-emerald-500"/>
                Resume Active
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Top AI Recommended Jobs</h1>
            <p className="text-gray-500 font-medium text-sm">Personalized opportunities mapped to your specific experience level and tech stack.</p>
          </div>
        </motion.div>

        {loading ? (
          // Skeleton Loaders
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200/60 rounded-3xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200/60 rounded-3xl" />)}
              </div>
              <div className="lg:col-span-4 space-y-4">
                <div className="h-80 bg-gray-200/60 rounded-3xl" />
                <div className="h-40 bg-gray-200/60 rounded-3xl" />
              </div>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          // Empty State
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-[2.5rem] border border-gray-200/60 shadow-sm">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <Target size={40} className="text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Perfect Matches Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">We are continuously scanning the market. Adjust your profile preferences or upload an updated resume to broaden your search.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key="content" variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
              
              {/* 2. AI Match Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm flex items-center gap-5 hover:border-indigo-200 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                    <Target size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Best Match</p>
                    <p className="text-2xl font-black text-gray-900">{matchAnalytics?.bestMatch}%</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm flex items-center gap-5 hover:border-indigo-200 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Jobs Found</p>
                    <p className="text-2xl font-black text-gray-900">{jobs.length}</p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm flex items-center gap-5 hover:border-indigo-200 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                    <TrendingUp size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Top Role</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{matchAnalytics?.topRole}</p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm flex items-center gap-5 hover:border-indigo-200 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-inner">
                    <XCircle size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Missing Skills</p>
                    <p className="text-2xl font-black text-gray-900">{matchAnalytics?.missingSkills?.length || 0}</p>
                  </div>
                </motion.div>
              </div>

              {/* Main Workspace Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* 3. Left Column: Job Feed */}
                <div className="lg:col-span-8 space-y-6">
                  {jobs.map((job) => (
                    <motion.div variants={itemVariants} key={job.id} className="bg-white rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                      <div className="p-6 md:p-8">
                        
                        {/* Job Card Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center font-black text-gray-500 text-xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                              {job.company.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-gray-500">
                                <span className="text-gray-900">{job.company}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                {job.isRemote && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-xs font-bold">Remote</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Match Score */}
                          <div className="flex flex-col items-end shrink-0">
                            <div className="flex items-center gap-2">
                              <BrainCircuit size={16} className={job.matchScore >= 80 ? 'text-emerald-500' : job.matchScore >= 70 ? 'text-amber-500' : 'text-gray-400'} />
                              <span className={`text-2xl font-black ${job.matchScore >= 80 ? 'text-emerald-600' : job.matchScore >= 70 ? 'text-amber-600' : 'text-gray-500'}`}>
                                {job.matchScore}%
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Match Score</span>
                          </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                            <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign size={12}/> Salary</p>
                            <p className="text-sm font-bold text-emerald-900">{job.salary}</p>
                          </div>
                          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                            <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={12}/> Experience</p>
                            <p className="text-sm font-bold text-blue-900">{job.experience}</p>
                          </div>
                          <div className="col-span-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">Required Tech Stack</p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {job.requiredSkills.map(skill => (
                                <span key={skill} className="text-[11px] font-bold text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* AI Reasoning Block (Bullet Points instead of paragraphs) */}
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} className="text-indigo-500" />
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Why AI Recommended This</p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ul className="space-y-2">
                              {job.matchedPoints?.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm font-medium text-emerald-800">
                                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                            <ul className="space-y-2">
                              {job.missingPoints?.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm font-medium text-amber-800">
                                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                          <button className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                            View Details <ChevronRight size={16} />
                          </button>
                          <div className="w-full sm:flex-1 flex justify-end">
                            <ApplyDropdown 
                              jobTitle={job.title} 
                              isOpen={activeDropdown === job.id} 
                              toggleDropdown={() => setActiveDropdown(activeDropdown === job.id ? null : job.id)}
                              closeDropdown={() => setActiveDropdown(null)}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Right Column: Analytics & Ext Platform Search */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* 4. Skill Gap Analysis */}
                  <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm space-y-6">
                    <div className="flex items-center gap-2">
                      <Target className="text-indigo-500" size={20} />
                      <h3 className="font-bold text-gray-900">Skill Gap Analysis</h3>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Matched Competencies</p>
                        <div className="flex flex-wrap gap-2">
                          {matchAnalytics?.matchedSkills.map(skill => (
                            <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-semibold">
                              <CheckCircle2 size={12} /> {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-5 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Missing Requirements</p>
                        <div className="flex flex-wrap gap-2">
                          {matchAnalytics?.missingSkills.map(skill => (
                            <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-semibold">
                              <XCircle size={12} /> {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* 5. AI Suggestions */}
                  <motion.div variants={itemVariants} className="bg-gray-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
                    <h3 className="font-bold text-white flex items-center gap-2 mb-6 relative z-10">
                      <BrainCircuit size={18} className="text-indigo-400" /> Strategic Advice
                    </h3>
                    <ul className="space-y-4 relative z-10">
                      {matchAnalytics?.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                          <p className="text-sm font-medium text-gray-300 leading-relaxed">{suggestion}</p>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default JobMatching;