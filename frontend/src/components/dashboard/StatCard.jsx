import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import ProgressCircle from "../ui/ProgressCircle";

const accents = {
  indigo: {
    top: "border-t-indigo-500",
    icon: "bg-indigo-50 text-indigo-600 border-indigo-100",
    value: "text-indigo-600",
  },
  emerald: {
    top: "border-t-emerald-500",
    icon: "bg-emerald-50 text-emerald-600 border-emerald-100",
    value: "text-emerald-600",
  },
  purple: {
    top: "border-t-violet-500",
    icon: "bg-violet-50 text-violet-600 border-violet-100",
    value: "text-violet-600",
  },
  orange: {
    top: "border-t-orange-500",
    icon: "bg-orange-50 text-orange-600 border-orange-100",
    value: "text-orange-600",
  },
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  delay = 0,
  accent = "indigo",
  gaugeValue,
}) => {
  const theme = accents[accent] || accents.indigo;
  const showGauge = typeof gaugeValue === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      whileHover={{ y: -3 }}
      className={cn(
        "bg-white border border-zinc-200/90 border-t-[3px] rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200",
        theme.top
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "w-11 h-11 rounded-xl border flex items-center justify-center shrink-0",
            theme.icon
          )}
        >
          <Icon size={22} strokeWidth={1.75} />
        </div>
        {showGauge ? (
          <div className="relative flex items-center justify-center shrink-0">
            <ProgressCircle percentage={gaugeValue} size={52} stroke={5} />
            <span className="absolute text-[11px] font-bold text-indigo-600 tabular-nums">
              {gaugeValue}%
            </span>
          </div>
        ) : (
          <p className={cn("text-2xl font-bold tracking-tight tabular-nums", theme.value)}>
            {value}
          </p>
        )}
      </div>
      <p className="text-xs font-semibold text-zinc-800 mt-3">{title}</p>
      {subtitle && (
        <p
          className={cn(
            "text-xs mt-0.5 truncate",
            subtitle === "—" ? "text-zinc-400" : "text-zinc-500"
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;
