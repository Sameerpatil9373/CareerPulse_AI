import { motion } from "framer-motion";
import {
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Briefcase,
  Upload,
  Star,
  Lightbulb,
} from "lucide-react";
import { cn } from "../../lib/utils";

const priorityConfig = {
  high: {
    badge: "High",
    icon: AlertTriangle,
    emoji: "⚠",
    row: "border-l-amber-400 bg-gradient-to-r from-amber-50/80 to-white",
    badgeStyle: "bg-amber-100 text-amber-800 border-amber-200",
    iconBox: "bg-amber-100 text-amber-600 border-amber-200",
  },
  medium: {
    badge: "Medium",
    icon: Star,
    emoji: "⭐",
    row: "border-l-indigo-400 bg-gradient-to-r from-indigo-50/80 to-white",
    badgeStyle: "bg-indigo-100 text-indigo-800 border-indigo-200",
    iconBox: "bg-indigo-100 text-indigo-600 border-indigo-200",
  },
  low: {
    badge: "Low",
    icon: Lightbulb,
    emoji: "💡",
    row: "border-l-violet-300 bg-gradient-to-r from-violet-50/50 to-white",
    badgeStyle: "bg-violet-100 text-violet-800 border-violet-200",
    iconBox: "bg-violet-100 text-violet-600 border-violet-200",
  },
};

const typeIcons = {
  skill: AlertTriangle,
  insights: Sparkles,
  interview: Sparkles,
  jobs: Briefcase,
  upload: Upload,
};

const RecommendedActions = ({ actions, onAction }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay: 0.2 }}
    className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow h-full"
  >
    <div className="flex items-center gap-2 mb-1">
      <span className="w-1 h-4 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
      <h3 className="text-sm font-semibold text-zinc-900">Recommended actions</h3>
    </div>
    <p className="text-xs text-zinc-500 mb-4 ml-3">Prioritized next steps for your profile</p>

    {actions.length === 0 ? (
      <p className="text-sm text-zinc-500 py-6 text-center">
        You&apos;re in good shape. Explore job matches or review AI insights.
      </p>
    ) : (
      <ul className="space-y-0 divide-y divide-zinc-100">
        {actions.map((action, index) => {
          const config = priorityConfig[action.priority] || priorityConfig.low;
          const Icon = typeIcons[action.type] || config.icon;

          return (
            <li key={`${action.label}-${index}`}>
              <button
                type="button"
                onClick={() => onAction(action)}
                className={cn(
                  "w-full flex items-center gap-3 p-3.5 border-l-[3px] text-left transition-all hover:shadow-sm group",
                  config.row
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
                    config.iconBox
                  )}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border",
                        config.badgeStyle
                      )}
                    >
                      {config.emoji} {config.badge}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 truncate">{action.label}</p>
                  {action.impact && (
                    <p className="text-xs text-zinc-500 mt-0.5">{action.impact}</p>
                  )}
                </div>
                <ArrowRight
                  size={16}
                  className="text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </motion.div>
);

export default RecommendedActions;
