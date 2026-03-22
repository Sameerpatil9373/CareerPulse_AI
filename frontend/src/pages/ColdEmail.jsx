import { useState, useEffect } from "react";
import { 
  Send, 
  Copy, 
  RefreshCw, 
  Sparkles, 
  Mail, 
  User, 
  Briefcase, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import api from "../services/api";

const ColdEmail = () => {
  const [resumeData, setResumeData] = useState(null);
  const [targetRole, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [tone, setRoleTone] = useState("Professional");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const generateEmail = async () => {
    if (!targetRole || !company) return;
    setIsGenerating(true);
    
    // Simulate AI Generation with more professional templates
    setTimeout(() => {
      const skills = resumeData?.skillsDetected?.slice(0, 4).join(", ") || "Full Stack Development";
      const name = JSON.parse(localStorage.getItem("user"))?.user?.name || "Candidate";
      
      let emailTemplate = "";
      
      if (tone === "Professional") {
        emailTemplate = `Subject: Inquiry regarding ${targetRole} opportunities at ${company}

Dear Hiring Manager,

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

Hi Hiring Team,

I've been tracking ${company}'s growth and I'm confident that my expertise as a ${targetRole} can help accelerate your upcoming technical objectives.

I specialize in ${skills}, and I have a proven track record of optimizing workflows and building robust systems. I don't just write code; I build products that scale. My resume (attached) highlights how I've used my skills to drive measurable results.

I'd love to show you how I can hit the ground running and contribute to the ${targetRole} team at ${company}. When would be a good time for a brief 10-minute sync?

Best,
${name}
LinkedIn: linkedin.com/in/profile`;
      }
      
      setGeneratedEmail(emailTemplate);
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 pt-2 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#111322] tracking-tight uppercase">
            Networking
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] mt-1">Generate high-conversion cold emails for top recruiters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Input Form */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-indigo-50 rounded-[18px] flex items-center justify-center text-indigo-600 shadow-sm">
                <Mail size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#111322] leading-none">Email Parameters</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Personalize your outreach</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Target Company</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Briefcase size={18} />
                  </div>
                  <input
                    placeholder="e.g. Google, Meta, Startup Inc."
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 font-bold text-sm text-[#111322] focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Job Role</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    placeholder="e.g. Frontend Developer"
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 font-bold text-sm text-[#111322] focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={targetRole}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Tone</label>
                <div className="flex gap-3">
                  {["Professional", "Confident"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setRoleTone(t)}
                      className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        tone === t ? "bg-[#111322] text-white shadow-lg" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateEmail}
                disabled={!company || !targetRole || isGenerating}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isGenerating ? "Crafting Message..." : "Generate AI Outreach"}
              </button>
            </div>
          </div>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm h-full flex flex-col min-h-[600px]">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Generated Outreach</span>
              </div>
              {generatedEmail && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-gray-50 text-[#111322] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all group"
                >
                  {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} className="group-hover:scale-110 transition-transform" />}
                  {copied ? "Copied!" : "Copy Content"}
                </button>
              )}
            </div>

            <div className="flex-1 p-10 relative">
              {!generatedEmail && !isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                  <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mb-6">
                    <Send size={40} />
                  </div>
                  <h3 className="text-lg font-black text-[#111322] mb-2">No Content Yet</h3>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed font-medium">
                    Fill in the company and role details on the left to generate your personalized AI outreach message.
                  </p>
                </div>
              ) : isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <Loader2 size={40} className="text-indigo-600 animate-spin" />
                  <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">AI is thinking...</p>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-medium text-sm text-gray-600 leading-relaxed font-sans">
                  {generatedEmail}
                </pre>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ColdEmail;