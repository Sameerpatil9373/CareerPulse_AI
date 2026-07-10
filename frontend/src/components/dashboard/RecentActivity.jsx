import { motion } from "framer-motion";
import { FileText, ArrowRight } from "lucide-react";

const RecentActivity = ({ resumes, onViewInsights, onViewAll }) => {
  const items = resumes.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.25 }}
      className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-md"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Recent activity</h3>
            <p className="text-xs text-zinc-500">Your latest resume analyses</p>
          </div>
        </div>
        {resumes.length > 3 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((resume) => {
          const hasInsights = Boolean(resume.aiInsights?.summary?.trim());
          return (
            <div
              key={resume._id}
              className="group border border-zinc-200/90 rounded-xl p-4 bg-zinc-50/30 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-indigo-600" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{resume.fileName}</p>
                  <p className="text-xs text-indigo-600/80 truncate mt-0.5 font-medium">
                    {resume.predictedRole}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-indigo-600 tabular-nums">
                      {resume.atsScore}% ATS
                    </span>
                    <span className="text-zinc-300">·</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      hasInsights
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {hasInsights ? "AI ready" : "AI pending"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onViewInsights(resume._id)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                View insights
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
