import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Book, Brain, Calculator, MessageSquare, Code, Sparkles, RefreshCw, 
  CheckCircle2, Flame, Target, Trophy, LayoutGrid, ArrowRight, 
  Database, FileCode2, Server, Users, Binary, Clock, Activity, AlertCircle, Timer
} from "lucide-react";
import api from "../services/api"; // Your existing Axios instance

const practiceCategories = [
  { id: 'Aptitude', name: 'Aptitude', icon: Calculator, count: 'Infinite', difficulty: 'Medium', time: '15m' },
  { id: 'Logical Reasoning', name: 'Reasoning', icon: Brain, count: 'Infinite', difficulty: 'Hard', time: '20m' },
  { id: 'Java', name: 'Java', icon: FileCode2, count: 'Infinite', difficulty: 'Medium', time: '15m' },
  { id: 'JavaScript', name: 'JavaScript', icon: FileCode2, count: 'Infinite', difficulty: 'Medium', time: '15m' },
  { id: 'React', name: 'React', icon: Code, count: 'Infinite', difficulty: 'Hard', time: '25m' },
  { id: 'Node.js', name: 'Node.js', icon: Server, count: 'Infinite', difficulty: 'Hard', time: '20m' },
  { id: 'SQL', name: 'SQL', icon: Database, count: 'Infinite', difficulty: 'Medium', time: '10m' },
  { id: 'MongoDB', name: 'MongoDB', icon: Database, count: 'Infinite', difficulty: 'Medium', time: '10m' },
  { id: 'HR Interview', name: 'HR Interview', icon: Users, count: 'Infinite', difficulty: 'Easy', time: '10m' },
  { id: 'Data Structures', name: 'DSA', icon: Binary, count: 'Infinite', difficulty: 'Hard', time: '30m' },
];

const PlacementPrep = () => {
  const [activeView, setActiveView] = useState("hub"); 
  const [resumeSkills, setResumeSkills] = useState([]);
  
  // AI Question State
  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTopics, setCurrentTopics] = useState([]);
  
  // Session State
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionEndTime, setSessionEndTime] = useState(null);
  const [lifetimeStats, setLifetimeStats] = useState({ solved: 0, correct: 0 });

  useEffect(() => {
    // In a real app, fetch from user context/localStorage
    setResumeSkills(["React", "Node.js", "MongoDB"]);
  }, []);

  const generateAIQuestions = async (topics, difficulty = "Medium", count = 5) => {
    setActiveView("practice");
    setIsGenerating(true);
    setCurrentTopics(topics);
    setSelectedAnswers({});
    setQuestions([]);
    
    try {
      // API call to our new AI generation route
      const response = await api.post("/api/practice/generate", {
        topics,
        difficulty,
        count
      });
      
      if (response.data.success) {
        setQuestions(response.data.data);
        setSessionStartTime(Date.now());
        setSessionEndTime(null);
      }
    } catch (error) {
      console.error("Failed to generate questions:", error);
      // Fallback for demo purposes if API isn't connected yet
      setTimeout(() => {
        setQuestions([
          {
            id: "fallback-1",
            type: "Conceptual",
            topic: topics[0],
            question: `What is the primary use case of ${topics[0]}?`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            answer: "Option B",
            explanation: `This is a generated explanation for ${topics[0]}.`,
            interviewTip: "Always relate this to performance optimization."
          }
        ]);
        setSessionStartTime(Date.now());
        setSessionEndTime(null);
      }, 2000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    if (!!selectedAnswers[questionId]) return; // Prevent changing answer

    const question = questions.find(q => q.id === questionId);
    const isCorrect = question.answer === option;

    setSelectedAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: option };
      
      // Check if session is complete
      if (Object.keys(newAnswers).length === questions.length) {
        setSessionEndTime(Date.now());
      }
      return newAnswers;
    });

    setLifetimeStats(prev => ({
      solved: prev.solved + 1,
      correct: prev.correct + (isCorrect ? 1 : 0)
    }));
  };

  // Derived Performance Metrics
  const sessionCorrect = questions.filter(q => selectedAnswers[q.id] === q.answer).length;
  const timeTakenSeconds = sessionEndTime && sessionStartTime ? Math.floor((sessionEndTime - sessionStartTime) / 1000) : 0;
  const weakConcepts = [...new Set(questions.filter(q => selectedAnswers[q.id] && selectedAnswers[q.id] !== q.answer).map(q => q.topic))];

  // Animation Variants
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } } };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans p-6 lg:p-10">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Navigation & Hero */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-200/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-sm">
                <Sparkles size={13} className="text-indigo-500"/>
                AI-Powered Hub
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Placement Preparation</h1>
            <p className="text-gray-500 font-medium text-sm">Master technical interviews with personalized AI practice.</p>
          </div>

          <div className="flex bg-gray-100/80 p-1.5 rounded-2xl shadow-inner border border-gray-200/50">
            <button onClick={() => setActiveView("hub")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeView === "hub" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <LayoutGrid size={16} /> Overview
            </button>
            <button onClick={() => generateAIQuestions(resumeSkills, "Medium", 5)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeView === "practice" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <Target size={16} /> Practice Arena
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeView === "hub" ? (
            <motion.div key="hub" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, y: -10 }} className="space-y-8">
              
              {/* Today's AI Learning Path */}
              <motion.div variants={itemVariants} className="bg-gray-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-xl shadow-gray-900/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-indigo-400" size={20} />
                      <h2 className="text-2xl font-bold tracking-tight">Today's AI Learning Path</h2>
                    </div>
                    <p className="text-gray-400 font-medium">
                      Curated based on your uploaded resume. Completing this session improves your technical readiness for upcoming placement drives.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {resumeSkills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white/10 rounded-full text-xs font-bold tracking-wider uppercase text-indigo-100 border border-white/10">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 text-center shrink-0 w-full md:w-64">
                    <Clock className="mx-auto text-indigo-400 mb-2" size={24} />
                    <p className="text-sm text-gray-400 font-medium mb-1">AI Curated Session</p>
                    <p className="text-2xl font-bold text-white mb-6">10 Questions</p>
                    <button onClick={() => generateAIQuestions(resumeSkills, "Medium", 10)} className="w-full bg-white text-gray-900 font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95">
                      Start Session <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Practice Categories Grid */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">Generate by Subject</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {practiceCategories.map((cat) => (
                      <button key={cat.id} onClick={() => generateAIQuestions([cat.name], cat.difficulty, 5)} className="group bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                          <cat.icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 mb-1">{cat.name}</h4>
                          <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                            <span>Dynamic AI</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className={cat.difficulty === 'Hard' ? 'text-rose-500' : cat.difficulty === 'Medium' ? 'text-orange-500' : 'text-emerald-500'}>{cat.difficulty}</span>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0 self-center" />
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Sidebar */}
                <motion.div variants={itemVariants} className="space-y-6">
                  {/* Daily Challenge */}
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-3xl shadow-sm">
                    <div className="bg-white rounded-[22px] p-6 text-center h-full flex flex-col items-center justify-center relative overflow-hidden">
                      <Trophy size={32} className="text-indigo-500 mb-3 relative z-10" />
                      <h4 className="font-bold text-gray-900 mb-1 relative z-10">Mixed Bag Challenge</h4>
                      <p className="text-sm text-gray-500 font-medium mb-4 relative z-10">Aptitude, React & SQL • Hard</p>
                      <button onClick={() => generateAIQuestions(["Aptitude", "React", "SQL"], "Hard", 15)} className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-sm relative z-10">
                        Generate Challenge
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            
            /* Practice Arena (AI Driven) */
            <motion.div key="practice" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.98 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-200/60 shadow-sm sticky top-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900">Live Session</h3>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      {Object.keys(selectedAnswers).length} / {questions.length} Done
                    </span>
                  </div>
                  
                  {isGenerating ? (
                    <div className="space-y-2">
                      {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-xl" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2">
                      {questions.map((q, idx) => {
                        const isAnswered = !!selectedAnswers[q.id];
                        const isCorrect = selectedAnswers[q.id] === q.answer;
                        let btnColor = isAnswered ? (isCorrect ? "bg-emerald-500 text-white border-emerald-600" : "bg-rose-500 text-white border-rose-600") : "bg-gray-50 text-gray-400 border-gray-200";
                        return <div key={q.id} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold border shadow-sm transition-all ${btnColor}`}>{idx + 1}</div>;
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-9 space-y-6 pb-20">
                {isGenerating ? (
                  <div className="bg-white p-12 rounded-[2rem] border border-gray-200/60 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
                     <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-pulse" />
                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                        <Brain className="absolute inset-0 m-auto text-indigo-600" size={28} />
                     </div>
                     <div>
                       <h3 className="text-xl font-bold text-gray-900">AI is drafting your questions...</h3>
                       <p className="text-gray-500 font-medium text-sm mt-2">Customizing difficulty and concepts for {currentTopics.join(", ")}</p>
                     </div>
                  </div>
                ) : (
                  <>
                    {questions.map((q, idx) => {
                      const hasAnswered = !!selectedAnswers[q.id];
                      const isCorrect = selectedAnswers[q.id] === q.answer;

                      return (
                        <motion.div variants={itemVariants} key={q.id} className="bg-white p-8 rounded-[2rem] border border-gray-200/60 shadow-sm relative overflow-hidden">
                          <div className={`absolute left-0 top-0 w-1.5 h-full ${hasAnswered ? (isCorrect ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-indigo-500'}`} />
                          
                          <div className="flex justify-between items-center mb-6 pl-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-gray-300" />
                              {q.topic} • {q.type}
                            </span>
                          </div>
                          
                          <p className="text-lg font-bold text-gray-900 leading-relaxed mb-8 pl-2 whitespace-pre-wrap font-mono">
                            {q.question}
                          </p>
                          
                          <div className="grid grid-cols-1 gap-3 pl-2">
                            {q.options.map((opt, i) => {
                              const isSelected = selectedAnswers[q.id] === opt;
                              const isActuallyCorrect = q.answer === opt;
                              
                              let optionStyle = "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 text-gray-700";
                              if (hasAnswered) {
                                if (isActuallyCorrect) optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20";
                                else if (isSelected && !isActuallyCorrect) optionStyle = "border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20";
                                else optionStyle = "border-gray-100 bg-gray-50/50 text-gray-400 opacity-60"; 
                              } else if (isSelected) {
                                optionStyle = "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500/20 text-indigo-900";
                              }

                              return (
                                <button key={i} disabled={hasAnswered} onClick={() => handleSelectOption(q.id, opt)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${optionStyle}`}>
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${hasAnswered && isActuallyCorrect ? "bg-emerald-500 text-white" : hasAnswered && isSelected ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                                    {String.fromCharCode(65 + i)}
                                  </div>
                                  <span className="font-semibold text-sm font-mono">{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          <AnimatePresence>
                            {hasAnswered && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 24 }} className="overflow-hidden pl-2">
                                <div className={`p-6 rounded-2xl border ${isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-200'}`}>
                                  <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                                    <Book size={18} className={isCorrect ? 'text-emerald-600' : 'text-gray-600'} /> Explanation
                                  </h4>
                                  <p className="text-sm font-medium text-gray-700 leading-relaxed mb-4">{q.explanation}</p>
                                  
                                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                                    <AlertCircle size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Interview Tip</p>
                                      <p className="text-sm font-medium text-gray-600">{q.interviewTip}</p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}

                    {/* Post-Quiz Performance Analytics */}
                    {Object.keys(selectedAnswers).length === questions.length && questions.length > 0 && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900 p-10 rounded-[2.5rem] shadow-xl text-white space-y-8">
                        <div className="text-center">
                          <Trophy size={48} className="mx-auto text-yellow-400 mb-4" />
                          <h3 className="text-3xl font-bold mb-2">Session Complete!</h3>
                          <p className="text-gray-400 font-medium">Here is your AI performance breakdown.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/10">
                            <Target size={20} className="mx-auto text-emerald-400 mb-2" />
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Accuracy</p>
                            <p className="text-2xl font-black">{Math.round((sessionCorrect/questions.length)*100)}%</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/10">
                            <CheckCircle2 size={20} className="mx-auto text-emerald-400 mb-2" />
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Correct</p>
                            <p className="text-2xl font-black">{sessionCorrect}</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/10">
                            <AlertCircle size={20} className="mx-auto text-rose-400 mb-2" />
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Wrong</p>
                            <p className="text-2xl font-black">{questions.length - sessionCorrect}</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/10">
                            <Timer size={20} className="mx-auto text-indigo-400 mb-2" />
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Time</p>
                            <p className="text-2xl font-black">{timeTakenSeconds}s</p>
                          </div>
                        </div>

                        {weakConcepts.length > 0 && (
                          <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl">
                            <h4 className="font-bold text-rose-200 mb-3 text-sm">Focus Areas (Weak Concepts Detected)</h4>
                            <div className="flex flex-wrap gap-2">
                              {weakConcepts.map(c => <span key={c} className="px-3 py-1 bg-rose-500/20 text-rose-200 text-xs font-bold rounded-lg border border-rose-500/20">{c}</span>)}
                            </div>
                          </div>
                        )}

                        <button onClick={() => setActiveView("hub")} className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                          Return to AI Hub
                        </button>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlacementPrep;