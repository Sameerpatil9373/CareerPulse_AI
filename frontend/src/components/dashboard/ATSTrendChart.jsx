import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const ATSTrendChart = ({ data }) => {
  if (!data || data.length < 2) return null;

  const chartData = [...data]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      score: r.atsScore,
    }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-md"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
        <h3 className="text-sm font-semibold text-zinc-900">ATS trend</h3>
      </div>
      <p className="text-xs text-zinc-500 mb-4 ml-3">Score across your uploaded resumes</p>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="atsAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="atsLineStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 10,
                border: "1px solid #e0e7ff",
                background: "#fff",
                boxShadow: "0 4px 16px rgba(99,102,241,0.12)",
              }}
              formatter={(value) => [`${value}%`, "ATS"]}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="url(#atsLineStroke)"
              strokeWidth={2.5}
              fill="url(#atsAreaFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ATSTrendChart;
