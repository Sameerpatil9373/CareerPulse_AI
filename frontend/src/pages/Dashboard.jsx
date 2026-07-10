import { useState, useEffect, useMemo, useCallback } from "react";

import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import {

  BarChart3,

  Target,

  Sparkles,

  Files,

  Upload,

  Briefcase,

  ArrowRight,

  Loader2,

  CheckCircle2,

  Clock,

} from "lucide-react";

import api from "../services/api";

import { getCurrentUser } from "../services/authService";

import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";

import EmptyDashboard from "../components/dashboard/EmptyDashboard";

import StatCard from "../components/dashboard/StatCard";

import CareerHealth from "../components/dashboard/CareerHealth";

import RecommendedActions from "../components/dashboard/RecommendedActions";

import RecentActivity from "../components/dashboard/RecentActivity";

import ATSTrendChart from "../components/dashboard/ATSTrendChart";



const getGreeting = () => {

  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";

  if (hour < 17) return "Good afternoon";

  return "Good evening";

};



const buildRecommendedActions = ({ latest, topMatch, aiStatus }) => {

  const actions = [];



  if (aiStatus.processing) {

    actions.push({

      priority: "medium",

      label: "AI analysis in progress",

      type: "insights",

      route: "/app/insights",

      resumeId: latest._id,

      impact: "Insights generating in background",

    });

  } else if (!aiStatus.ready) {

    actions.push({

      priority: "high",

      label: "View AI insights",

      type: "insights",

      route: "/app/insights",

      resumeId: latest._id,

      impact: "Analysis pending — open to generate",

    });

  }



  if (topMatch?.missingSkills?.length) {

    topMatch.missingSkills.slice(0, 2).forEach((skill) => {

      actions.push({

        priority: "high",

        label: `Add ${skill}`,

        type: "skill",

        route: "/app/job-matching",

        impact: `Missing for ${topMatch.role}`,

      });

    });

  }



  if (latest.atsScore < 70) {

    actions.push({

      priority: "medium",

      label: "Improve ATS score — upload an updated resume",

      type: "upload",

      route: "/app/upload",

      impact: `Current ATS: ${latest.atsScore}%`,

    });

  }



  if (aiStatus.ready) {

    actions.push({

      priority: "low",

      label: "Prepare for interview",

      type: "interview",

      route: "/app/insights",

      resumeId: latest._id,

      impact: `${aiStatus.questionCount} questions ready`,

    });

  }



  if (actions.length < 4) {

    actions.push({

      priority: "low",

      label: "View job matching",

      type: "jobs",

      route: "/app/job-matching",

      impact: topMatch ? `Top match: ${topMatch.matchScore}%` : "Explore role fit",

    });

  }



  return actions.slice(0, 5);

};



const Dashboard = () => {

  const navigate = useNavigate();

  const userName = getCurrentUser()?.user?.name?.split(" ")[0] || "there";



  const [loading, setLoading] = useState(true);

  const [resumes, setResumes] = useState([]);

  const [latestResume, setLatestResume] = useState(null);

  const [topMatch, setTopMatch] = useState(null);

  const [aiStatus, setAiStatus] = useState({ processing: false, ready: false, questionCount: 0 });



  const loadDashboard = useCallback(async () => {

    setLoading(true);

    try {

      const res = await api.get("/api/resume/all");

      const list = res.data?.data || [];

      setResumes(list);



      if (list.length === 0) {

        setLatestResume(null);

        setTopMatch(null);

        return;

      }



      const lastId = localStorage.getItem("lastResumeId");

      const latest = list.find((r) => r._id === lastId) || list[0];



      localStorage.setItem("lastResumeId", latest._id);

      setLatestResume(latest);



      let insights = { processing: false, ready: false, questionCount: 0 };

      try {

        const insightsRes = await api.get(`/api/resume/insights/${latest._id}`);

        const data = insightsRes.data || {};

        insights = {

          processing: data.processing === true,

          ready: Boolean(data.summary?.trim()),

          questionCount: Array.isArray(data.questions) ? data.questions.length : 0,

        };

      } catch {

        const cached = latest.aiInsights;

        insights = {

          processing: false,

          ready: Boolean(cached?.summary?.trim()),

          questionCount: Array.isArray(cached?.questions) ? cached.questions.length : 0,

        };

      }

      setAiStatus(insights);



      try {

        const matchRes = await api.post("/api/resume/match", {

          resumeId: latest._id,

          jobDescription: "RECOMMEND_MULTIPLE_ROLES_BASED_ON_SKILLS",

        });

        const matches = Array.isArray(matchRes.data) ? matchRes.data : [];

        setTopMatch(matches.length > 0 ? matches[0] : null);

      } catch {

        setTopMatch(null);

      }

    } catch (err) {

      console.error("Dashboard load failed:", err);

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    loadDashboard();

  }, [loadDashboard]);



  const aiReportsCount = useMemo(

    () => resumes.filter((r) => r.aiInsights?.summary?.trim()).length,

    [resumes]

  );



  const careerMetrics = useMemo(() => {

    if (!latestResume) {

      return {

        resumeStrength: 0,

        interviewReadiness: 0,

        interviewHint: "Upload a resume to begin",

        skillCoverage: 0,

        skillCount: 0,

        marketReadiness: 0,

        marketHint: "No match data yet",

      };

    }



    const skillCount = latestResume.skillsDetected?.length || 0;

    const interviewReadiness = aiStatus.ready

      ? Math.min(100, Math.round((aiStatus.questionCount / 8) * 100))

      : 0;



    return {

      resumeStrength: latestResume.atsScore ?? 0,

      interviewReadiness,

      interviewHint: aiStatus.processing

        ? "Analysis in progress"

        : aiStatus.ready

        ? `${aiStatus.questionCount} interview questions ready`

        : "Insights not generated yet",

      skillCoverage: Math.min(100, Math.round((skillCount / 20) * 100)),

      skillCount,

      marketReadiness: topMatch?.matchScore ?? 0,

      marketHint: topMatch

        ? `Best fit: ${topMatch.role}`

        : "Run job matching for recommendations",

    };

  }, [latestResume, aiStatus, topMatch]);



  const recommendedActions = useMemo(() => {

    if (!latestResume) return [];

    return buildRecommendedActions({ latest: latestResume, topMatch, aiStatus });

  }, [latestResume, topMatch, aiStatus]);



  const handleAction = (action) => {

    if (action.resumeId) {

      navigate(action.route, { state: { resumeId: action.resumeId } });

    } else {

      navigate(action.route);

    }

  };



  const strongestRole = topMatch?.role || latestResume?.predictedRole;



  if (loading) {

    return (

      <div className="max-w-6xl mx-auto">

        <DashboardSkeleton />

      </div>

    );

  }



  if (resumes.length === 0) {

    return (

      <div className="max-w-6xl mx-auto">

        <EmptyDashboard />

      </div>

    );

  }



  const aiStatusLabel = aiStatus.processing

    ? "Processing"

    : aiStatus.ready

    ? "Ready"

    : "Pending";



  return (

    <div className="max-w-6xl mx-auto space-y-5 pb-8">

      {/* Hero */}

      <motion.div

        initial={{ opacity: 0, y: 8 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.25 }}

        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-zinc-200/90 rounded-xl p-5 shadow-md"

      >

        <div>

          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">

            <span className="mr-1.5">👋</span>

            {getGreeting()}, {userName}

          </h1>

          <p className="text-sm text-zinc-500 mt-1">Your strongest role today</p>

          <p className="text-lg font-semibold text-indigo-600 mt-0.5">{strongestRole}</p>

          <p className="text-sm font-bold text-violet-600 tabular-nums mt-0.5">

            {latestResume.atsScore}% ATS

          </p>

        </div>

        <div className="flex items-center gap-2 shrink-0">

          <button

            type="button"

            onClick={() => navigate("/app/job-matching")}

            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 px-4 py-2.5 rounded-lg border border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"

          >

            <Briefcase size={17} strokeWidth={1.75} />

            Job matching

          </button>

          <button

            type="button"

            onClick={() => navigate("/app/upload")}

            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:-translate-y-0.5 transition-all duration-200 shadow-md shadow-indigo-500/25"

          >

            <Upload size={17} strokeWidth={1.75} />

            Upload resume

          </button>

        </div>

      </motion.div>



      {/* Latest analysis status */}

      <motion.div

        initial={{ opacity: 0, y: 8 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.25, delay: 0.05 }}

        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-indigo-50/60 via-white to-violet-50/40 border border-indigo-100/80 rounded-xl p-4 shadow-md"

      >

        <div className="min-w-0">

          <p className="text-xs font-semibold text-indigo-600 mb-0.5">Latest resume</p>

          <p className="text-sm font-semibold text-zinc-900 truncate">{latestResume.fileName}</p>

          <p className="text-xs text-zinc-500 mt-0.5">

            {latestResume.predictedRole} · {latestResume.atsScore}% ATS

          </p>

        </div>

        <div className="flex items-center gap-3 shrink-0">

          <span

            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${

              aiStatus.processing

                ? "bg-amber-50 text-amber-700 border-amber-200"

                : aiStatus.ready

                ? "bg-emerald-50 text-emerald-700 border-emerald-200"

                : "bg-zinc-100 text-zinc-600 border-zinc-200"

            }`}

          >

            {aiStatus.processing ? (

              <Loader2 size={12} className="animate-spin" />

            ) : aiStatus.ready ? (

              <CheckCircle2 size={12} />

            ) : (

              <Clock size={12} />

            )}

            AI {aiStatusLabel}

          </span>

          <button

            type="button"

            onClick={() =>

              navigate("/app/insights", { state: { resumeId: latestResume._id } })

            }

            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"

          >

            View AI insights

            <ArrowRight size={14} />

          </button>

        </div>

      </motion.div>



      {/* Stats */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard

          title="ATS score"

          value={`${latestResume.atsScore}%`}

          subtitle={latestResume.predictedRole}

          icon={BarChart3}

          delay={0}

          accent="indigo"

          gaugeValue={latestResume.atsScore}

        />

        <StatCard

          title="Top job match"

          value={topMatch ? `${topMatch.matchScore}%` : "—"}

          subtitle={topMatch?.role || "Open job matching"}

          icon={Target}

          delay={0.05}

          accent="emerald"

        />

        <StatCard

          title="AI reports"

          value={aiReportsCount}

          subtitle={`of ${resumes.length} resume${resumes.length !== 1 ? "s" : ""}`}

          icon={Sparkles}

          delay={0.1}

          accent="purple"

        />

        <StatCard

          title="Total resumes"

          value={resumes.length}

          subtitle="Uploaded analyses"

          icon={Files}

          delay={0.15}

          accent="orange"

        />

      </div>



      {/* Health + Actions */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <CareerHealth metrics={careerMetrics} />

        <RecommendedActions actions={recommendedActions} onAction={handleAction} />

      </div>



      {/* Chart — only when 2+ resumes */}

      <ATSTrendChart data={resumes} />



      {/* Recent activity */}

      <RecentActivity

        resumes={resumes}

        onViewInsights={(id) => navigate("/app/insights", { state: { resumeId: id } })}

        onViewAll={() => navigate("/app/history")}

      />

    </div>

  );

};



export default Dashboard;

