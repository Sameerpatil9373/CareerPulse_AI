import { useState, useEffect, useCallback } from "react";
import { Book, Video, Brain, Calculator, MessageSquare, Code, Sparkles, RefreshCw, ChevronRight, CheckCircle2 } from "lucide-react";

// 🔥 DATA MOVED OUTSIDE: Prevents infinite re-render loop by providing stable references
const prepResources = [
  {
    category: "Quantitative Aptitude",
    description: "Foundational math: Number Systems, Profit & Loss, and Percentages.",
    topics: ["Number Systems", "Profit & Loss", "Time & Work", "Percentages"],
    video: "https://youtube.com/playlist?list=PLpyc33gOcbVA4qXMoQ5vmhefTruk5t9lt&si=r2nCWKrZ6gITE4A5",
    practice: "https://www.indiabix.com/aptitude/questions-and-answers/",
    icon: <Calculator size={18} />,
    level: "Round 1",
    color: "bg-blue-600"
  },
  {
    category: "Logical Reasoning",
    description: "Puzzles and logic: Blood Relations, Syllogisms, and Series.",
    topics: ["Blood Relations", "Syllogism", "Coding-Decoding", "Series"],
    video: "https://youtube.com/playlist?list=PLpyc33gOcbVADMKqylI__O_O_RMeHTyNK&si=KQALq6MJE0UTlZCq",
    practice: "https://www.indiabix.com/logical-reasoning/questions-and-answers/",
    icon: <Brain size={18} />,
    level: "Round 1",
    color: "bg-purple-600"
  },
  {
    category: "Coding Aptitude",
    description: "Pseudo-code logic and complexity analysis for tech rounds.",
    topics: ["Pseudo-code", "Loop Logic", "Recursion", "Complexity"],
    video: "https://www.youtube.com/playlist?list=PLpyc3vcTkQ9eWp2T6iVnK4O0l_yJ9Q0p0",
    practice: "https://www.geeksforgeeks.org/quizzes-on-c-programming/",
    icon: <Code size={18} />,
    level: "Technical",
    color: "bg-indigo-600"
  },
  {
    category: "Verbal Ability",
    description: "Grammar and comprehension for screening and HR rounds.",
    topics: ["Synonyms", "Sentence Correction", "Comprehension", "Grammar"],
    video: "https://youtu.be/k7J4UOJ1eB8?si=NOfuU2DSp9_QAtkp",
    practice: "https://www.indiabix.com/verbal-ability/questions-and-answers/",
    icon: <MessageSquare size={18} />,
    level: "Language",
    color: "bg-rose-600"
  }
];

const questionPool = [
  // Quantitative Aptitude (1-17)
  { id: 1, type: "Quant", question: "A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is?", options: ["1/4", "1/10", "7/15", "8/15"], answer: "8/15" },
  { id: 2, type: "Quant", question: "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is?", options: ["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"], answer: "Rs. 698" },
  { id: 3, type: "Quant", question: "The average of first five multiples of 3 is?", options: ["3", "9", "12", "15"], answer: "9" },
  { id: 4, type: "Quant", question: "A fruit seller had some apples. He sells 40% apples and still has 420 apples. Originally, he had?", options: ["588 apples", "600 apples", "672 apples", "700 apples"], answer: "700 apples" },
  { id: 5, type: "Quant", question: "What is the least number to be added to 1500 to make it a perfect square?", options: ["21", "25", "29", "31"], answer: "21" },
  { id: 6, type: "Quant", question: "If 20% of a = b, then b% of 20 is the same as?", options: ["4% of a", "5% of a", "20% of a", "None of these"], answer: "4% of a" },
  { id: 7, type: "Quant", question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", options: ["120 metres", "180 metres", "324 metres", "150 metres"], answer: "150 metres" },
  { id: 8, type: "Quant", question: "The ratio between the present ages of P and Q is 6 : 7. If Q is 4 years older than P, what will be the ratio of the ages of P and Q after 4 years?", options: ["3 : 4", "3 : 5", "4 : 3", "None of these"], answer: "None of these" },
  { id: 9, type: "Quant", question: "Find the odd man out: 3, 5, 11, 14, 17, 21", options: ["14", "17", "21", "11"], answer: "14" },
  { id: 10, type: "Quant", question: "If 1st January, 2007 was Monday, then what day of the week lies on 1st January, 2008?", options: ["Monday", "Tuesday", "Wednesday", "Sunday"], answer: "Tuesday" },
  { id: 11, type: "Quant", question: "The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, then the value of x is?", options: ["15", "16", "18", "25"], answer: "16" },
  { id: 12, type: "Quant", question: "A person crosses a 600 m long street in 5 minutes. What is his speed in km per hour?", options: ["3.6", "7.2", "8.4", "10"], answer: "7.2" },
  { id: 13, type: "Quant", question: "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.", options: ["3 hours", "4 hours", "5 hours", "6 hours"], answer: "4 hours" },
  { id: 14, type: "Quant", question: "The length of the bridge, which a train 130 metres long and travelling at 45 km/hr can cross in 30 seconds, is?", options: ["200 m", "225 m", "245 m", "250 m"], answer: "245 m" },
  { id: 15, type: "Quant", question: "Two numbers are respectively 20% and 50% more than a third number. The ratio of the two numbers is?", options: ["2 : 5", "3 : 5", "4 : 5", "6 : 7"], answer: "4 : 5" },
  { id: 16, type: "Quant", question: "A shopkeeper expects a gain of 22.5% on his cost price. If in a week, his sale was of Rs. 392, what was his profit?", options: ["Rs. 70", "Rs. 72", "Rs. 88", "Rs. 92"], answer: "Rs. 72" },
  { id: 17, type: "Quant", question: "A pump can fill a tank with water in 2 hours. Because of a leak, it took 2 1/3 hours to fill the tank. The leak can drain all the water of the tank in?", options: ["10 hours", "12 hours", "14 hours", "16 hours"], answer: "14 hours" },

  // Logical Reasoning (18-34)
  { id: 18, type: "Logical", question: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?", options: ["(1/3)", "(1/8)", "(2/8)", "(1/16)"], answer: "(1/8)" },
  { id: 19, type: "Logical", question: "SCD, TEF, UGH, ____, WKL", options: ["CMN", "UJI", "VIJ", "IJT"], answer: "VIJ" },
  { id: 20, type: "Logical", question: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?", options: ["His own", "His son's", "His father's", "His nephew's"], answer: "His son's" },
  { id: 21, type: "Logical", question: "Cup : Lip :: Bird : ?", options: ["Bush", "Grass", "Forest", "Beak"], answer: "Beak" },
  { id: 22, type: "Logical", question: "Which word does NOT belong with the others?", options: ["Tyre", "Steering wheel", "Engine", "Car"], answer: "Car" },
  { id: 23, type: "Logical", question: "Statement: Some actors are singers. All singers are dancers. Conclusion: 1. Some actors are dancers. 2. No singer is actor.", options: ["Only 1 follows", "Only 2 follows", "Either 1 or 2 follows", "Neither 1 nor 2 follows"], answer: "Only 1 follows" },
  { id: 24, type: "Logical", question: "Paw : Cat :: Hoof : ?", options: ["Lamb", "Horse", "Elephant", "Tiger"], answer: "Horse" },
  { id: 25, type: "Logical", question: "In a certain code, MONKEY is written as XDJMNL. How is TIGER written in that code?", options: ["QDFHS", "SDFHS", "SHFDQ", "UJHFS"], answer: "QDFHS" },
  { id: 26, type: "Logical", question: "A is B's sister. C is B's mother. D is C's father. E is D's mother. Then, how is A related to D?", options: ["Grandmother", "Grandfather", "Daughter", "Granddaughter"], answer: "Granddaughter" },
  { id: 27, type: "Logical", question: "Odometer is to mileage as compass is to?", options: ["Speed", "Hiking", "Needle", "Direction"], answer: "Direction" },
  { id: 28, type: "Logical", question: "Find the missing number in the sequence: 4, 9, 16, 25, 36, ?", options: ["47", "49", "51", "64"], answer: "49" },
  { id: 29, type: "Logical", question: "If South-East becomes North, North-East becomes West and so on. What will West become?", options: ["North-East", "North-West", "South-East", "South-West"], answer: "South-East" },
  { id: 30, type: "Logical", question: "Statement: The old order changed yielding place to new. Conclusions: 1. Change is the law of nature. 2. Discard old ideas because they are old.", options: ["Only 1 follows", "Only 2 follows", "Either 1 or 2 follows", "Neither 1 nor 2 follows"], answer: "Only 1 follows" },
  { id: 31, type: "Logical", question: "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?", options: ["7", "10", "12", "13"], answer: "10" },
  { id: 32, type: "Logical", question: "ELFA, GLHA, ILJA, _____, MLNA", options: ["OLPA", "KLMA", "LLMA", "KLLA"], answer: "KLLA" },
  { id: 33, type: "Logical", question: "Pointing to a photograph, Vipul said, 'She is the daughter of my grandfather's only son.' How is Vipul related to the girl in the photograph?", options: ["Father", "Brother", "Cousin", "Grandson"], answer: "Brother" },
  { id: 34, type: "Logical", question: "Which word is the odd man out?", options: ["Curd", "Butter", "Oil", "Cheese"], answer: "Oil" },

  // Verbal Ability (35-50)
  { id: 35, type: "Verbal", question: "Choose the word which is most nearly the SAME in meaning as the word: ADVERSITY", options: ["Failure", "Helplessness", "Misfortune", "Crisis"], answer: "Misfortune" },
  { id: 36, type: "Verbal", question: "Choose the word which is most nearly OPPOSITE in meaning to the word: ENORMOUS", options: ["Soft", "Average", "Tiny", "Weak"], answer: "Tiny" },
  { id: 37, type: "Verbal", question: "The study of ancient societies is known as?", options: ["History", "Anthropology", "Ethnology", "Archaeology"], answer: "Archaeology" },
  { id: 38, type: "Verbal", question: "Choose the correctly spelt word:", options: ["Efficient", "Efficent", "Effecient", "Efficant"], answer: "Efficient" },
  { id: 39, type: "Verbal", question: "Find the synonym of: CANDID", options: ["Frank", "Greedy", "Dishonest", "Secretive"], answer: "Frank" },
  { id: 40, type: "Verbal", question: "To keep one's temper means?", options: ["To become hungry", "To be in good mood", "To preserve one's energy", "None of these"], answer: "To be in good mood" },
  { id: 41, type: "Verbal", question: "A person who does not believe in the existence of God is?", options: ["Theist", "Heretic", "Atheist", "Fanatic"], answer: "Atheist" },
  { id: 42, type: "Verbal", question: "Fate smiles ...... those who untiringly grapple with stark realities of life.", options: ["with", "over", "on", "round"], answer: "on" },
  { id: 43, type: "Verbal", question: "Antonym of: ARTIFICIAL", options: ["Red", "Natural", "Truthful", "Solid"], answer: "Natural" },
  { id: 44, type: "Verbal", question: "A place where bees are kept is called?", options: ["An apiary", "A nursery", "An aviary", "A kennel"], answer: "An apiary" },
  { id: 45, type: "Verbal", question: "Synonym of: BRIEF", options: ["Limited", "Small", "Little", "Short"], answer: "Short" },
  { id: 46, type: "Verbal", question: "Choose the word which is most nearly OPPOSITE in meaning to the word: TRANSIENT", options: ["Certain", "Eternal", "Permanent", "Shallow"], answer: "Permanent" },
  { id: 47, type: "Verbal", question: "A person who renounces a religious or political belief or principle is?", options: ["Apostate", "Atheist", "Theist", "Heretic"], answer: "Apostate" },
  { id: 48, type: "Verbal", question: "Find the synonym of: DEFER", options: ["Indifferent", "Defy", "Postpone", "Differ"], answer: "Postpone" },
  { id: 49, type: "Verbal", question: "He has a passion ______ reading books.", options: ["at", "for", "in", "with"], answer: "for" },
  { id: 50, type: "Verbal", question: "Find the correctly spelt word:", options: ["Accommodate", "Acommodate", "Accomodate", "Acomodate"], answer: "Accommodate" }
];

const AptitudePrep = () => {
  const [activeView, setActiveView] = useState("prep"); 
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // generateRandomQuestions now has zero external state dependencies
  const generateRandomQuestions = useCallback(() => {
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
    setSampleQuestions(shuffled.slice(0, 10));
    setSelectedAnswers({}); 
  }, []); 

  useEffect(() => {
    generateRandomQuestions();
  }, [generateRandomQuestions]);

  const handleSelectOption = (questionId, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-4 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 bg-indigo-50 px-2.5 py-1 rounded-lg w-fit border border-indigo-100">
            <Sparkles className="text-indigo-600" size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600">Intelligence Portal</span>
          </div>
          <h2 className="text-2xl font-black text-[#111322] tracking-tight uppercase">Placement Prep Hub</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Fix your skill gaps for the first elimination round</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner">
          <button 
            onClick={() => setActiveView("prep")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeView === "prep" ? "bg-white text-indigo-600 shadow-md" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Study Guide
          </button>
          <button 
            onClick={() => {
              setActiveView("sample");
              generateRandomQuestions();
            }}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeView === "sample" ? "bg-white text-indigo-600 shadow-md" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Practice Set
          </button>
        </div>
      </div>

      <div className="min-h-[600px]">
        {activeView === "prep" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-4 duration-500">
            {prepResources.map((res, i) => (
              <div key={i} className="group bg-white p-7 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between h-[300px]">
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className={`w-12 h-12 ${res.color} rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110`}>
                      {res.icon}
                    </div>
                    <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[9px] font-black rounded-full uppercase tracking-widest border border-gray-100">
                      Target: {res.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#111322] mb-2">{res.category}</h3>
                  <p className="text-gray-500 text-[12px] font-medium leading-relaxed mb-4">{res.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {res.topics.map(t => (
                      <span key={t} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg uppercase tracking-wider border border-indigo-100/30">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-gray-50">
                  <a href={res.video} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#111322] text-white py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md active:scale-95"><Video size={14} /> Video Class</a>
                  <a href={res.practice} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 border border-gray-200 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"><Book size={14} /> Practice</a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
            {/* Simplified Header matching image */}
            <div className="flex justify-between items-center bg-[#111322] p-4 px-8 rounded-full text-white shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                    <CheckCircle2 className="text-indigo-400" size={20} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black uppercase tracking-widest">Reasoning AI Daily Set</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Industry-standard placement papers</p>
                </div>
              </div>
              <button 
                onClick={generateRandomQuestions} 
                className="flex items-center gap-2 bg-indigo-600 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-500 transition-all active:scale-95"
              >
                <RefreshCw size={14} /> Refresh Set
              </button>
            </div>

            <div className="grid gap-4">
              {sampleQuestions.map((q, idx) => (
                <div key={q.id} className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm space-y-4 transition-all hover:border-indigo-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black uppercase px-3 py-1 bg-gray-100 rounded-full text-gray-500 border border-gray-200 tracking-widest">
                      {q.type} Assessment • Question {idx + 1}
                    </span>
                  </div>
                  <p className="text-sm font-black text-[#111322] leading-relaxed pl-2 border-l-4 border-indigo-600">
                    {q.question}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, i) => {
                      const isSelected = selectedAnswers[q.id] === opt;
                      return (
                        <div 
                          key={i}
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                            isSelected 
                            ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100" 
                            : "border-gray-50 bg-gray-50/30 hover:border-indigo-200 hover:bg-white"
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-black transition-all ${
                            isSelected ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200" : "bg-white border-gray-200 text-gray-400 group-hover:text-indigo-600"
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className={`text-[11px] font-bold ${isSelected ? "text-indigo-900" : "text-gray-600"}`}>
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <details className="group border-t border-gray-50 pt-3">
                    <summary className="list-none cursor-pointer">
                      <div className="flex items-center gap-2 text-indigo-600 font-black text-[9px] uppercase tracking-[0.2em] hover:translate-x-1 transition-transform">
                        <ChevronRight className="transition-transform group-open:rotate-90 text-indigo-400" size={12} />
                        View Solution
                      </div>
                    </summary>
                    <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-[11px] font-bold animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      <span className="italic">Correct answer: <span className="underline decoration-2 underline-offset-4">{q.answer}</span></span>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AptitudePrep;
