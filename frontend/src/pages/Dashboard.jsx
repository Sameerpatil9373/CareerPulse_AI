import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import ProgressCircle from "../components/ui/ProgressCircle";
import {
  FileText, Target, BarChart3, Zap, UploadCloud,
  Loader2, ArrowRight, AlertCircle, BrainCircuit, ExternalLink
} from "lucide-react";
import api from "../services/api";

const Dashboard = () => {
  const [resumeData, setResumeData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // NEW: Gamified Loading States
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);

  const fileInputRef = useRef(null);
  const matchingSectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadResume = async () => {
      try {
        const lastId = localStorage.getItem("lastResumeId");
        let resumeToLoad = null;

        if (lastId && lastId !== "undefined") {
          try {
            const res = await api.get(`/api/resume/${lastId}`);
            resumeToLoad = res.data.data;
          } catch (err) {
            console.error("Failed to load specific resume, falling back to latest", err);
          }
        }

        if (!resumeToLoad) {
          const res = await api.get("/api/resume/all");
          if (res.data.data && res.data.data.length > 0) {
            resumeToLoad = res.data.data[0];
          }
        }

        if (resumeToLoad) {
          const insightsRes = await api.get(`/api/resume/insights/${resumeToLoad._id}`);
          setResumeData({
            ...resumeToLoad,
            summary: insightsRes.data?.summary || "",
          });
          localStorage.setItem("lastResumeId", resumeToLoad._id);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    loadResume();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setError("");
    setIsUploading(true);
    setAiProcessing(true);
    setAiProgress(5); // Start gamified loader immediately
    
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const uploadRes = await api.post("/api/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const savedResume = uploadRes.data.data;
      localStorage.setItem("lastResumeId", savedResume._id);

      // Show ATS score instantly
      setResumeData(savedResume);
      setMatchResult(null);
      setHasSearched(false);
      setJobDescription("");
      setIsUploading(false); // Stop main upload spinner

      // Gamified Progress Interval (ticks up to 95% artificially)
      const progressInterval = setInterval(() => {
        setAiProgress(prev => {
          if (prev >= 95) return 95;
          const next = prev + Math.floor(Math.random() * 8) + 2; // Jump by 2-10%
          return next > 95 ? 95 : next; // Hard cap at 95% while polling
        });
      }, 1500);

      // Polling Logic: Keep polling until processing is false
      const pollInsights = setInterval(async () => {
        try {
          const insightsRes = await api.get(`/api/resume/insights/${savedResume._id}`);
          
          if (!insightsRes.data?.processing) {
            clearInterval(pollInsights);
            clearInterval(progressInterval);
            
            setAiProgress(100); // Snap to 100%
            
            setTimeout(() => {
              setResumeData(prev => ({
                ...prev,
                summary: insightsRes.data?.summary || "AI Analysis ready.",
              }));
              setAiProcessing(false);
              setAiProgress(0);
            }, 800); // Wait a split second so the user sees 100%
          }
        } catch (err) {
          console.error("Polling failed", err);
        }
      }, 3000); 

    } catch (err) {
      setError("Upload failed. Please ensure it is a valid PDF or DOCX.");
      setIsUploading(false);
      setAiProcessing(false);
    }
  };

  const handleJobMatch = async () => {
    const currentId = resumeData?._id || localStorage.getItem("lastResumeId");
    if (!currentId) return setError("Please upload a resume first.");
    if (!jobDescription.trim()) return setError("Please enter a target role.");
    
    setError("");
    setIsMatching(true);
    setHasSearched(true);
    
    try {
      const response = await api.post(`/api/resume/match`, {
        resumeId: currentId,
        jobDescription: jobDescription.trim()
      });
      setMatchResult(Array.isArray(response.data) ? response.data[0] : response.data);
    } catch (err) {
      setError("Failed to run AI Matcher. Please try again.");
    } finally {
      setIsMatching(false);
    }
  };

  const handleApply = (role) => {
    const query = encodeURIComponent(role);
    window.open(`https://www.linkedin.com/jobs/search/?keywords=${query}`, '_blank');
    window.open(`https://www.naukri.com/search?keywords=${query}`, '_blank');
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10 px-4">
      <div className="flex justify-between items-center mt-6">
        <h2 className="text-3xl font-black text-[#111322]">AI Dashboard</h2>
        {resumeData && (
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/app/insights", { state: { resumeId: resumeData._id } })}
              className="group flex items-center gap-3 bg-white text-[#111322] px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95"
            >
              Intelligence Report <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
                onClick={() => matchingSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all shadow-xl active:scale-95 border border-transparent hover:border-indigo-600"
              >
                Dynamic Job Matching <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-5 rounded-2xl flex items-center gap-4 font-bold text-sm border border-rose-100 animate-in slide-in-from-top-4 shadow-sm">
          <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
            <AlertCircle size={18} />
          </div>
          {error}
        </div>
      )}

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card 
          title="ATS Performance" 
          value={resumeData ? `${resumeData.atsScore}%` : "0%"} 
          icon={BarChart3} 
          color="indigo" 
          trend="Analyzed" 
          percentage={resumeData ? resumeData.atsScore : 0}
        />
        <Card 
          title="Core Competencies" 
          value={resumeData ? resumeData.skillsDetected.length : "0"} 
          icon={FileText} 
          color="emerald" 
          trend="Verified" 
          percentage={resumeData ? (resumeData.skillsDetected.length / 20) * 100 : 0}
        />
        <Card 
          title="Market Relevance" 
          value={matchResult ? `${matchResult.matchScore}%` : "0%"} 
          icon={Target} 
          color="amber" 
          trend="Matching" 
          percentage={matchResult ? matchResult.matchScore : 0}
        />
        <Card 
          title="AI Status" 
          value={aiProcessing ? "Analyzing" : resumeData?.summary ? "Complete" : "Ready"} 
          icon={Zap} 
          color="purple" 
          trend="Neural"
          percentage={aiProcessing ? aiProgress : resumeData?.summary ? 100 : 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm transition-all">
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx" />
            <div
              onClick={() => !isUploading && fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${
                isUploading ? "border-indigo-300 bg-indigo-50/50" : "border-indigo-100 bg-indigo-50/20 cursor-pointer hover:bg-indigo-50/60"
              }`}
            >
              {isUploading ? (
                <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={32} />
              ) : (
                <UploadCloud size={32} className="mx-auto mb-4 text-indigo-600" />
              )}
              <p className="text-xl font-bold text-[#111322]">
                {isUploading ? "Parsing document..." : "Upload New Resume"}
              </p>
            </div>
          </div>

          <div ref={matchingSectionRef} className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black mb-6 text-[#111322]">Dynamic Job Matching</h3>
            <textarea
              className="w-full p-6 rounded-[1.5rem] bg-gray-50/80 mb-6 outline-none min-h-[160px] font-medium border border-transparent focus:border-indigo-100 transition-all text-sm"
              placeholder="Enter a target role (e.g. Frontend Developer) or paste a job description..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <button
              onClick={handleJobMatch}
              disabled={!resumeData || !jobDescription.trim() || isMatching}
              className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest w-full shadow-lg transition-all flex items-center justify-center gap-2 ${
                !jobDescription.trim() || !resumeData
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-[#111322] text-white hover:bg-indigo-600 active:scale-[0.98]"
              }`}
            >
              {isMatching && <Loader2 size={14} className="animate-spin" />}
              {isMatching ? "Executing AI Match..." : "Run Reasoning Matcher"}
            </button>

            {matchResult && (
              <div className={`mt-8 p-8 rounded-[2rem] border animate-in fade-in slide-in-from-top-2 shadow-sm ${
                matchResult.matchScore >= 50 
                  ? "bg-emerald-50/40 border-emerald-100/50" 
                  : matchResult.matchScore >= 30
                  ? "bg-amber-50/40 border-amber-100/50"
                  : "bg-rose-50/40 border-rose-100/50"
              }`}>
                <div className="flex items-center gap-10 flex-wrap md:flex-nowrap">
                  <div className="text-center min-w-[120px]">
                    <div className={`text-6xl font-black ${
                      matchResult.matchScore >= 50 ? "text-emerald-500" : matchResult.matchScore >= 30 ? "text-amber-500" : "text-rose-500"
                    }`}>
                      {matchResult.matchScore}%
                    </div>
                    <p className={`text-[10px] font-black uppercase mt-2 tracking-widest ${
                      matchResult.matchScore >= 50 ? "text-emerald-600/60" : matchResult.matchScore >= 30 ? "text-amber-600/60" : "text-rose-600/60"
                    }`}>Match Score</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h4 className="text-lg font-black text-[#111322]">{matchResult.role}</h4>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        matchResult.matchScore >= 50 ? "bg-emerald-100 text-emerald-700" : matchResult.matchScore >= 30 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        {matchResult.matchScore >= 80 ? "Perfect Match" : matchResult.matchScore >= 50 ? "Good Match" : matchResult.matchScore >= 30 ? "Potential" : "Roadmap Required"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.matchingSkills?.slice(0, 8).map((s) => (
                        <span key={s} className="px-3 py-1 bg-white text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100 shadow-sm">✓ {s}</span>
                      ))}
                      {matchResult.missingSkills?.slice(0, 8).map((s) => (
                        <span key={s} className="px-3 py-1 bg-white text-rose-500 text-[10px] font-black rounded-lg border border-rose-100 shadow-sm">× {s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className={`mt-6 text-[13px] font-bold italic leading-relaxed border-l-2 pl-4 whitespace-pre-line ${
                  matchResult.matchScore >= 50 ? "text-gray-600 border-emerald-200" : matchResult.matchScore >= 30 ? "text-gray-600 border-amber-200" : "text-gray-600 border-rose-200"
                }`}>
                  {matchResult.explanation}
                </p>
              </div>
            )}

            {!matchResult && hasSearched && !isMatching && (
              <div className="mt-10 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 text-center animate-in fade-in slide-in-from-top-2">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">Analysis Complete</p>
                <h4 className="text-lg font-black text-[#111322]">No Matching Roles Found</h4>
                <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">Try entering a more common technical role like 'Frontend Developer' or 'Data Analyst'.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <ProgressCircle percentage={resumeData ? resumeData.atsScore : 0} size={220} stroke={16} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className="text-5xl font-black text-[#111322]">{resumeData ? resumeData.atsScore : 0}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ATS Score</span>
              </div>
            </div>
            <div className="mt-8 w-full border-t border-gray-50 pt-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Market Predicted Role</span>
                <span className="text-indigo-600 font-black italic text-sm">{resumeData ? resumeData.predictedRole : "Not Analyzed"}</span>
              </div>
            </div>
          </div>

          {/* NEW: Gamified Loading Box */}
          {aiProcessing ? (
             <div className="bg-[#111322] rounded-[2.5rem] p-12 text-white shadow-xl flex flex-col items-center justify-center min-h-[250px] animate-in slide-in-from-bottom-4">
                <div className="relative flex items-center justify-center mb-6">
                  <ProgressCircle percentage={aiProgress} size={100} stroke={8} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{aiProgress}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-xs">
                  <BrainCircuit size={16} className="animate-pulse" /> Generating Insights...
                </div>
             </div>
          ) : resumeData?.summary ? (
            <div className="bg-[#111322] rounded-[2.5rem] p-10 text-white shadow-xl animate-in slide-in-from-bottom-4">
              <h3 className="text-lg font-black flex items-center gap-3 mb-6">
                <Zap size={22} className="text-indigo-400" fill="currentColor" /> Executive AI Summary
              </h3>
              <p className="text-[14px] leading-relaxed font-medium italic text-gray-300 border-l-2 border-indigo-500/50 pl-6 whitespace-pre-line">
                {resumeData.summary}
              </p>
            </div>
          ) : resumeData && (
            <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 animate-pulse">
               <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
               <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
               <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
