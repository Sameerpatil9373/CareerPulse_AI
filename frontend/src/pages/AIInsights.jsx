import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Lightbulb,
  Loader2,
  Download,
  Calendar,
  TrendingUp,
  Rocket,
  BrainCircuit,
  RefreshCw
} from "lucide-react";
import api from "../services/api";

// Reusable Accordion for Interview Questions (Updated to include AI explanation)
const QuestionAccordion = ({ question, answer, explanation, isOpen, onClick }) => {
  return (
    <div className={`border rounded-xl overflow-hidden mb-3 bg-white transition-all ${isOpen ? 'border-purple-200 shadow-sm ring-1 ring-purple-100' : 'border-slate-200 hover:border-purple-200'}`}>
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-start sm:items-center justify-between p-4 text-left focus:outline-none hover:bg-slate-50 gap-4"
      >
        <span className="font-medium text-sm text-slate-800 leading-snug flex-1">{question}</span>
        <ChevronDown 
          size={18} 
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-purple-600" : ""}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 text-sm space-y-3">
              <div className="flex gap-3 items-start p-4 bg-purple-50/50 rounded-xl border border-purple-100/50">
                <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900">Expected:</span> {answer}
                </p>
              </div>
              {explanation && (
                <div className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <BrainCircuit size={16} className="text-purple-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-slate-600">
                    <span className="font-bold uppercase tracking-wider text-[10px] mr-2">Interviewer Note</span>
                    {explanation}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AIInsights = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openQuestionId, setOpenQuestionId] = useState(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const resumeId = location.state?.resumeId || localStorage.getItem("lastResumeId");

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get(`/api/resume/insights/${resumeId}`);
      setData(res.data?.data || res.data || {});
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    if (!resumeId) {
      navigate("/app/upload");
      return;
    }
    fetchInsights();
  }, [resumeId, navigate, fetchInsights]);

  const fadeUpProps = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" }
  };

  // Error State Rendering
  if (error) {
    return (
      <div className="min-h-screen bg-[#fafbfc] pt-12 px-6 flex flex-col items-center">
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 shadow-sm max-w-lg w-full">
          <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 shadow-sm">
            <AlertCircle size={28} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Analysis Failed</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium max-w-sm">
              Our AI recruiter encountered an issue while parsing your resume data.
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <button 
              onClick={() => navigate("/app/dashboard")}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              Dashboard
            </button>
            <button 
              onClick={fetchInsights}
              className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-md"
            >
              <RefreshCw size={16} /> Retry Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe destructuring with functional fallbacks adapting to the new AI output
  const summary = data?.summary || "";
  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const missingSkills = Array.isArray(data?.missingSkills) ? data.missingSkills : [];
  const strengths = Array.isArray(data?.strengths) ? data.strengths : [];
  const improvements = Array.isArray(data?.improvements) ? data.improvements : (Array.isArray(data?.weaknesses) ? data.weaknesses : []);
  const rawQuestions = Array.isArray(data?.questions) ? data.questions : (Array.isArray(data?.interviewQuestions) ? data.interviewQuestions : []);
  const recommendations = Array.isArray(data?.recommendations) ? data.recommendations : [];

  // Helper to chunk questions into Easy, Medium, Hard functionally
  const categorizedQuestions = {
    Easy: rawQuestions.slice(0, Math.ceil(rawQuestions.length / 3)),
    Medium: rawQuestions.slice(Math.ceil(rawQuestions.length / 3), Math.ceil((rawQuestions.length / 3) * 2)),
    Hard: rawQuestions.slice(Math.ceil((rawQuestions.length / 3) * 2))
  };

  const roadmapLabels = ["This Week", "Next Month", "Long Term"];
  const roadmapIcons = [<Calendar size={20} />, <TrendingUp size={20} />, <Rocket size={20} />];

  return (
    <div className="min-h-screen bg-[#fafbfc] pt-8 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/app/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Resume Intelligence Report</h1>
          <p className="text-sm text-slate-500">
            A comprehensive, AI-driven analysis of your professional profile and market readiness.
          </p>
        </div>

        {/* 1. HERO: AI Executive Summary */}
        <motion.div {...fadeUpProps} className="bg-purple-600 rounded-2xl shadow-sm border border-purple-700 p-8 relative overflow-hidden text-white">
          <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
            <BrainCircuit size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-200 uppercase tracking-widest mb-4">
              <Sparkles size={16} /> AI EXECUTIVE SUMMARY
            </div>
            
            {loading ? (
              <div className="space-y-3 pt-2">
                <div className="h-4 bg-purple-500/50 rounded-md animate-pulse w-full"></div>
                <div className="h-4 bg-purple-500/50 rounded-md animate-pulse w-11/12"></div>
                <div className="h-4 bg-purple-500/50 rounded-md animate-pulse w-4/5"></div>
              </div>
            ) : (
              <div>
                <p className={`text-lg leading-relaxed font-medium text-purple-50 max-w-3xl transition-all duration-300 ${isSummaryExpanded ? '' : 'line-clamp-3'}`}>
                  {summary}
                </p>
                {summary.length > 150 && (
                  <button 
                    onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                    className="mt-4 flex items-center gap-1 text-xs font-bold bg-purple-700/50 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {isSummaryExpanded ? (
                      <>Show Less <ChevronUp size={14} /></>
                    ) : (
                      <>Read Full Briefing <ChevronDown size={14} /></>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* 2. Strengths & Improvements */}
        <motion.div {...fadeUpProps} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Strengths */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
                <CheckCircle2 size={16} className="text-emerald-500" /> KEY STRENGTHS
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-4 bg-emerald-50 rounded animate-pulse w-full"></div>)}
                </div>
              ) : (
                <ul className="space-y-4">
                  {strengths.length > 0 ? strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>{strength}</span>
                    </li>
                  )) : (
                    <li className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100">No core strengths detected in current formatting.</li>
                  )}
                </ul>
              )}
            </div>

            {/* Improvements */}
            <div className="p-6 sm:p-8 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
                <AlertTriangle size={16} className="text-amber-500" /> AREAS TO IMPROVE
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-4 bg-amber-50 rounded animate-pulse w-full"></div>)}
                </div>
              ) : (
                <ul className="space-y-4">
                  {improvements.length > 0 ? improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span>{imp}</span>
                    </li>
                  )) : (
                    <li className="text-sm text-slate-400 italic bg-white p-4 rounded-xl border border-slate-100">No critical weaknesses detected in current formatting.</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </motion.div>

        {/* 3. Detected Skills */}
        {skills.length > 0 && !loading && (
          <motion.div {...fadeUpProps} transition={{ delay: 0.15 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-6">
              <Zap size={16} /> DETECTED SKILLS
            </div>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100 transition-colors hover:bg-purple-100">
                  {typeof skill === 'object' ? skill.name : skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* 4. Missing Skills */}
        {missingSkills.length > 0 && !loading && (
          <motion.div {...fadeUpProps} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-6">
              <Target size={16} /> MISSING HIGH-DEMAND SKILLS
            </div>
            <div className="flex flex-wrap gap-2.5">
              {missingSkills.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-amber-50 text-amber-700 border border-amber-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
                  {typeof skill === 'object' ? skill.name : skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* 5. Interview Questions (Accordion Grouped) */}
        <motion.div {...fadeUpProps} transition={{ delay: 0.25 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider">
              <Briefcase size={16} /> AI-GENERATED INTERVIEW SCENARIOS
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-3">
                  <div className="h-5 bg-slate-100 rounded animate-pulse w-3/4"></div>
                </div>
              ))}
            </div>
          ) : rawQuestions.length > 0 ? (
            <div className="space-y-8">
              {/* Easy Tier */}
              {categorizedQuestions.Easy.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 px-1">Foundational</h4>
                  <div className="space-y-2">
                    {categorizedQuestions.Easy.map((qa, idx) => {
                      const id = `easy-${idx}`;
                      return (
                        <QuestionAccordion 
                          key={id}
                          question={qa.question || qa} 
                          answer={qa.answer || qa.hint || "Use the STAR method to structure your response."}
                          explanation={qa.explanation}
                          isOpen={openQuestionId === id}
                          onClick={() => setOpenQuestionId(openQuestionId === id ? null : id)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Medium Tier */}
              {categorizedQuestions.Medium.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 px-1">Technical</h4>
                  <div className="space-y-2">
                    {categorizedQuestions.Medium.map((qa, idx) => {
                      const id = `med-${idx}`;
                      return (
                        <QuestionAccordion 
                          key={id}
                          question={qa.question || qa} 
                          answer={qa.answer || qa.hint || "Use the STAR method to structure your response."}
                          explanation={qa.explanation}
                          isOpen={openQuestionId === id}
                          onClick={() => setOpenQuestionId(openQuestionId === id ? null : id)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hard Tier */}
              {categorizedQuestions.Hard.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 px-1">System Design & Advanced</h4>
                  <div className="space-y-2">
                    {categorizedQuestions.Hard.map((qa, idx) => {
                      const id = `hard-${idx}`;
                      return (
                        <QuestionAccordion 
                          key={id}
                          question={qa.question || qa} 
                          answer={qa.answer || qa.hint || "Use the STAR method to structure your response."}
                          explanation={qa.explanation}
                          isOpen={openQuestionId === id}
                          onClick={() => setOpenQuestionId(openQuestionId === id ? null : id)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-medium text-slate-600">No interview scenarios generated.</p>
            </div>
          )}
        </motion.div>

        {/* 6. Career Roadmap */}
        {recommendations.length > 0 && !loading && (
          <motion.div {...fadeUpProps} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-6">
              <Rocket size={16} /> CAREER ROADMAP
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl p-5 flex flex-col items-start gap-4 hover:border-purple-200 hover:shadow-sm transition-all bg-slate-50/50">
                  <div className={`p-2.5 rounded-xl shrink-0 ${idx === 0 ? 'bg-purple-100 text-purple-700' : idx === 1 ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {roadmapIcons[idx] || <Rocket size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-2">{roadmapLabels[idx] || `Step ${idx + 1}`}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 7. Action Buttons */}
        {!loading && (
          <motion.div {...fadeUpProps} transition={{ delay: 0.35 }} className="flex flex-col sm:flex-row justify-center gap-4 pt-4 pb-8">
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
              <Download size={16} /> Export Report
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">
              <Briefcase size={16} /> Match Jobs
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AIInsights;