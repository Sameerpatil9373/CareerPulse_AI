import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const metricThemes = {
  resume: {
    bar: "bg-gradient-to-r from-indigo-500 to-violet-500",
    dot: "bg-indigo-500",
    label: "text-indigo-700",
  },
  interview: {
    bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
    dot: "bg-emerald-500",
    label: "text-emerald-700",
  },
  skills: {
    bar: "bg-gradient-to-r from-blue-500 to-cyan-500",
    dot: "bg-blue-500",
    label: "text-blue-700",
  },
  market: {
    bar: "bg-gradient-to-r from-orange-500 to-amber-500",
    dot: "bg-orange-500",
    label: "text-orange-700",
  },
};

const MetricBar = ({ label, value, hint, themeKey }) => {
  const theme = metricThemes[themeKey];
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={cn("text-xs font-semibold flex items-center gap-2", theme.label)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", theme.dot)} />
          {label}
        </span>
        <span className="text-xs font-bold text-zinc-900 tabular-nums">
          {typeof value === "number" ? `${value}%` : value}
        </span>
      </div>
      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", theme.bar)}
          style={{ width: typeof value === "number" ? `${Math.min(value, 100)}%` : "0%" }}
        />
      </div>
      {hint && <p className="text-[11px] text-zinc-400 mt-1">{hint}</p>}
    </div>
  );
};

const CareerHealth = ({ metrics }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay: 0.15 }}
    className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow h-full"
  >
    <div className="flex items-center gap-2 mb-1">
      <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
      <h3 className="text-sm font-semibold text-zinc-900">Career health</h3>
    </div>
    <p className="text-xs text-zinc-500 mb-5 ml-3">Based on your latest resume analysis</p>
    <div className="space-y-4">
      <MetricBar
        label="Resume strength"
        value={metrics.resumeStrength}
        hint="ATS optimization score"
        themeKey="resume"
      />
      <MetricBar
        label="Interview readiness"
        value={metrics.interviewReadiness}
        hint={metrics.interviewHint}
        themeKey="interview"
      />
      <MetricBar
        label="Skill coverage"
        value={metrics.skillCoverage}
        hint={`${metrics.skillCount} skills detected`}
        themeKey="skills"
      />
      <MetricBar
        label="Market readiness"
        value={metrics.marketReadiness}
        hint={metrics.marketHint}
        themeKey="market"
      />
    </div>
  </motion.div>
);

export default CareerHealth;
