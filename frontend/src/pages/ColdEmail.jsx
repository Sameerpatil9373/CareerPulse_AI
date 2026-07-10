import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Copy, 
  RefreshCw, 
  Sparkles, 
  Mail, 
  User, 
  Briefcase, 
  CheckCircle2,
  Loader2,
  Download,
  ExternalLink,
  FileText,
  Lightbulb,
  Github,
  Linkedin,
  Target,
  Code
} from "lucide-react";
import api from "../services/api";

const ColdEmail = () => {
  // Original State
  const [resumeData, setResumeData] = useState(null);
  const [targetRole, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [tone, setRoleTone] = useState("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // New UI State
  const [recruiterName, setRecruiterName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeSuggestions, setActiveSuggestions] = useState(["Mention LinkedIn"]);

  const loadingSteps = [
    "Analyzing resume & skills...",
    "Matching profile to role...",
    "Applying semantic tone...",
    "Drafting personalized email..."
  ];

  const aiSuggestions = [
    { id: "projects", label: "Mention Projects", icon: Code },
    { id: "ats", label: "Mention ATS Score", icon: Target },
    { id: "github", label: "Mention GitHub", icon: Github },
    { id: "linkedin", label: "Mention LinkedIn", icon: Linkedin }
  ];

  useEffect(() => {
    const fetchLatestResume = async () => {
      try {
        const res = await api.get("/api/resume/all");
        if (res.data.data && res.data.data.length > 0) {
          setResumeData(res.data.data[0]);
          setRole(res.data.data[0].predictedRole || "");
        }
      } catch (err) {
        console.error("Failed to load resume for email generation");
      }
    };
    fetchLatestResume();
  }, []);

  const toggleSuggestion = (label) => {
    setActiveSuggestions(prev => 
      prev.includes(label) 
        ? prev.filter(s => s !== label)
        : [...prev, label]
    );
  };

  const generateEmail = async () => {
    if (!targetRole || !company) return;
    setIsGenerating(true);
    setLoadingStep(0);
    setSubject("");
    setBody("");
    
    // Simulate Processing Timeline
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 400);

    // Original AI Logic (Unchanged)
    setTimeout(() => {
      clearInterval(interval);
      const skills = resumeData?.skillsDetected?.slice(0, 4).join(", ") || "Full Stack Development";
      const name = JSON.parse(localStorage.getItem("user"))?.user?.name || "Candidate";
      
      let emailTemplate = "";
      
      if (tone === "Professional") {
        emailTemplate = `Subject: Inquiry regarding ${targetRole} opportunities at ${company}

Dear ${recruiterName || 'Hiring Manager'},

I hope this email finds you well.

I am writing to formally express my interest in potential ${targetRole} openings within ${company}. Having followed your company's recent developments in the industry, I am deeply impressed by your commitment to technical excellence and innovation.

As a professional with a strong foundation in ${skills}, I have successfully delivered high-impact solutions in my previous projects. My technical expertise, combined with my problem-solving approach, aligns closely with the standards maintained at ${company}.

I have attached my resume for your consideration and would welcome the opportunity to discuss how my background in ${skills} could add value to your engineering team.

Thank you for your time and consideration.

Sincerely,
${name}
LinkedIn: linkedin.com/in/profile`;
      } else {
        emailTemplate = `Subject: Strategic ${targetRole} candidate for ${company}

Hi ${recruiterName ? recruiterName.split(' ')[0] : 'Hiring Team'},

I've been tracking ${company}'s growth and I'm confident that my expertise as a ${targetRole} can help accelerate your upcoming technical objectives.

I specialize in ${skills}, and I have a proven track record of optimizing workflows and building robust systems. I don't just write code; I build products that scale. My resume (attached) highlights how I've used my skills to drive measurable results.

I'd love to show you how I can hit the ground running and contribute to the ${targetRole} team at ${company}. When would be a good time for a brief 10-minute sync?

Best,
${name}
LinkedIn: linkedin.com/in/profile`;
      }
      
      // Parse subject and body for the premium editor layout
      const lines = emailTemplate.split('\n');
      if(lines[0].startsWith('Subject: ')) {
        setSubject(lines[0].replace('Subject: ', ''));
        setBody(lines.slice(1).join('\n').trim());
      } else {
        setSubject(`Outreach to ${company}`);
        setBody(emailTemplate);
      }
      
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGmail = () => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const downloadEmail = () => {
    const element = document.createElement("a");
    const file = new Blob([`Subject: ${subject}\n\n${body}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${company}_Outreach.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Helper to highlight variables in the generated text (Notion AI style)
  const renderHighlightedText = (text) => {
    if(!text) return null;
    const regex = new RegExp(`(${company}|${targetRole}|${recruiterName})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      const isMatch = [company, targetRole, recruiterName].some(
        val => val && part.toLowerCase() === val.toLowerCase()
      );
      return isMatch ? (
        <span key={i} className="bg-indigo-100 text-indigo-800 px-1 rounded-md font-medium shadow-sm border border-indigo-200/50">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* 1. Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-200/60"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Networking Assistant</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold shadow-sm">
                <Sparkles size={13} className="text-indigo-100"/>
                Powered by AI
              </div>
            </div>
            <p className="text-gray-500 font-medium text-sm">Design high-conversion outreach emails tailored to your target roles.</p>
          </div>

          {resumeData && (
            <div className="flex items-center gap-3 bg-white border border-gray-200/80 shadow-sm px-4 py-2.5 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FileText size={16} />
              </div>
              <div className="flex flex-col pr-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selected Resume</span>
                <span className="text-sm font-semibold text-gray-700 truncate max-w-[150px]">
                  {resumeData.predictedRole || "Active Profile"}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Workflow Inputs */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* 2. Email Parameters Card */}
            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Target Company</label>
                  <div className="relative group">
                    <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      placeholder="e.g. Google, Stripe"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Job Role</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      placeholder="e.g. Frontend Engineer"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={targetRole}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex justify-between">
                    <span>Recruiter Name</span>
                    <span className="text-gray-400 font-medium normal-case tracking-normal">Optional</span>
                  </label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Communication Tone</label>
                  <div className="flex p-1 bg-gray-100/80 rounded-2xl">
                    {["Professional", "Confident"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setRoleTone(t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          tone === t 
                            ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5" 
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={generateEmail}
                disabled={!company || !targetRole || isGenerating}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {isGenerating ? "Synthesizing Draft..." : "Generate AI Outreach"}
              </button>
            </div>

            {/* 4. AI Suggestions Card */}
            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-1">
                <Lightbulb size={16} className="text-amber-500" />
                AI Context Suggestions
              </div>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((suggestion) => {
                  const isActive = activeSuggestions.includes(suggestion.label);
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => toggleSuggestion(suggestion.label)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                        isActive 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={12} />
                      {suggestion.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Networking Tips */}
            <div className="bg-indigo-50/50 rounded-3xl border border-indigo-100/50 p-6">
              <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">Pro Tip</h3>
              <p className="text-sm text-indigo-900/70 leading-relaxed font-medium">
                Keep outreach concise. Recruiters spend an average of 6 seconds reviewing cold emails. Our AI optimizes for scannability and impact.
              </p>
            </div>

          </motion.div>

          {/* Right Column: Editor Workspace */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 h-full"
          >
            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm h-full min-h-[700px] flex flex-col overflow-hidden">
              
              {/* Toolbar */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${body ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Editor Workspace</span>
                </div>
                
                {body && (
                  <div className="flex items-center gap-2">
                    <button onClick={copyToClipboard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-600 font-medium text-xs transition-colors">
                      {copied ? <CheckCircle2 size={14} className="text-emerald-500"/> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button onClick={generateEmail} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-600 font-medium text-xs transition-colors">
                      <RefreshCw size={14} /> Regenerate
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <button onClick={downloadEmail} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors" title="Download">
                      <Download size={16} />
                    </button>
                    <button onClick={openGmail} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors ml-1 shadow-sm">
                      <ExternalLink size={14} /> Open Gmail
                    </button>
                  </div>
                )}
              </div>

              {/* Editor Content Area */}
              <div className="flex-1 relative p-8 md:p-12">
                <AnimatePresence mode="wait">
                  
                  {/* 6. Empty State */}
                  {!isGenerating && !body && (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                    >
                      <div className="w-24 h-24 mb-6 relative">
                        <div className="absolute inset-0 bg-indigo-50 rounded-full animate-ping opacity-75 duration-1000" />
                        <div className="relative w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 border-4 border-white shadow-sm">
                          <Send size={32} className="ml-1" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Draft</h3>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                        Input your target company and role parameters on the left to generate a personalized, high-converting outreach email.
                      </p>
                    </motion.div>
                  )}

                  {/* 7. Loading Timeline State */}
                  {isGenerating && (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white/80 backdrop-blur-sm z-10"
                    >
                      <div className="w-full max-w-sm space-y-6">
                        {loadingSteps.map((step, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="relative flex items-center justify-center w-8 h-8">
                              {index < loadingStep ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500">
                                  <CheckCircle2 size={24} />
                                </motion.div>
                              ) : index === loadingStep ? (
                                <Loader2 size={24} className="text-indigo-600 animate-spin" />
                              ) : (
                                <div className="w-3 h-3 rounded-full bg-gray-200" />
                              )}
                              {/* Connection Line */}
                              {index !== loadingSteps.length - 1 && (
                                <div className={`absolute top-8 w-0.5 h-6 -ml-0.5 ${index < loadingStep ? 'bg-emerald-500' : 'bg-gray-100'}`} />
                              )}
                            </div>
                            <span className={`text-sm font-medium transition-colors duration-300 ${
                              index < loadingStep ? 'text-gray-800' : index === loadingStep ? 'text-indigo-600 font-semibold' : 'text-gray-400'
                            }`}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* 3. Generated Email Area */}
                  {!isGenerating && body && (
                    <motion.div 
                      key="content"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="h-full flex flex-col"
                    >
                      <div className="mb-6 pb-6 border-b border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Subject Line</label>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                          {renderHighlightedText(subject)}
                        </h2>
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <p className="whitespace-pre-wrap font-medium text-base text-gray-700 leading-loose">
                          {renderHighlightedText(body)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default ColdEmail;