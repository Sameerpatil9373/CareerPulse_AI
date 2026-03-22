import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Briefcase,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

const JobMatching = () => {
  const [jobMatches, setJobMatches] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const resumeRes = await api.get("/api/resume/all");
        const latest = resumeRes.data.data[0];

        if (latest) {
          setResumeData(latest);
          const matchRes = await api.post("/api/resume/match", {
            resumeId: latest._id,
            jobDescription: "RECOMMEND_MULTIPLE_ROLES_BASED_ON_SKILLS" 
          });
          setJobMatches(Array.isArray(matchRes.data) ? matchRes.data : [matchRes.data]);
        }
      } catch (err) {
        console.error("Discovery error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const handleApply = (role, platform) => {
    const query = encodeURIComponent(role);
    if (platform === "linkedin") {
      // Improved LinkedIn Search: Uses f_TPR=r86400 (Last 24h) or generic search with keywords
      window.open(
        `https://www.linkedin.com/jobs/search/?keywords=${query}&location=India&f_TPR=r2592000`,
        "_blank"
      );
    } else {
      // Naukri's common search URL format
      window.open(
        `https://www.naukri.com/${role.toLowerCase().replace(/ /g, "-")}-jobs?k=${query}`,
        "_blank"
      );
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-0 space-y-10">
      <div className="flex justify-between items-center border-b pb-6">
        <div>
          <h2 className="text-3xl font-black text-[#111322]">Market Matcher</h2>
          <p className="text-gray-500 text-sm mt-1">
            AI-powered career paths based on your <span className="text-indigo-600 font-bold">{resumeData?.predictedRole || "Professional"}</span> profile.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
          <Sparkles className="text-indigo-600" size={18} />
          <span className="text-xs font-bold uppercase text-indigo-600">Career Discovery Active</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobMatches.map((job, i) => (
          <div
            key={i}
            className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#111322] leading-tight">{job.role}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Recommended Path</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg text-white shadow-sm flex items-center justify-center min-w-[50px] ${getScoreColor(job.matchScore)}`}>
                  {job.matchScore}% FIT
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Top Strengths
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.matchingSkills?.slice(0, 6).map((skill) => (
                      <span key={skill} className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-50/50 text-emerald-700 border border-emerald-100 font-bold capitalize">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {job.missingSkills?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-wider flex items-center gap-2">
                      <XCircle size={12} className="text-rose-500" /> Skills to Gain
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.missingSkills.slice(0, 6).map((skill) => (
                        <span key={skill} className="text-[10px] px-2.5 py-1 rounded-lg bg-rose-50/50 text-rose-700 border border-rose-100 font-bold capitalize">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100/50">
                  <p className="text-[12px] text-gray-600 leading-relaxed font-medium italic">
                    "{job.explanation}"
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50/80">
              <p className="text-[9px] font-black uppercase text-gray-700 mb-3 tracking-[0.2em] text-center">Find jobs on</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleApply(job.role, "linkedin")}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#111322] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-md active:scale-95 group/btn"
                >
                  LinkedIn <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => handleApply(job.role, "naukri")}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#111322] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-md active:scale-95 group/btn"
                >
                  Naukri <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobMatching;
