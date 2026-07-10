import { motion } from "framer-motion";
import { FileText, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyDashboard = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white border border-indigo-100/80 rounded-xl shadow-md"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center mb-6">
        <FileText className="text-indigo-500" size={28} strokeWidth={1.75} />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-2">
        No resumes yet
      </h2>
      <p className="text-sm text-zinc-500 max-w-md mb-8 leading-relaxed">
        Upload your first resume to unlock ATS scoring, AI insights, and job matching.
      </p>
      <button
        type="button"
        onClick={() => navigate("/app/upload")}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:from-indigo-500 hover:to-violet-500 hover:-translate-y-0.5 transition-all shadow-md shadow-indigo-500/25"
      >
        <Upload size={16} strokeWidth={1.75} />
        Upload Resume
      </button>
    </motion.div>
  );
};

export default EmptyDashboard;
