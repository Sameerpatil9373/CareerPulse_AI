import { Book, Video, ExternalLink, Brain } from "lucide-react";

const AptitudePrep = () => {
  const resources = [
    {
      category: "Quantitative Aptitude",
      topics: ["Number Systems", "Profit & Loss", "Time & Work"],
      video: "https://www.youtube.com/playlist?list=PLpyc3vcTkQ9fHto9ZID06D4p30f6hE_O-", // Example: IndiaBix or CareerRide
      practice: "https://www.indiabix.com/aptitude/questions-and-answers/"
    },
    {
      category: "Logical Reasoning",
      topics: ["Blood Relations", "Coding-Decoding", "Syllogism"],
      video: "https://www.youtube.com/playlist?list=PLpyc3vcTkQ9e0vU_y2p5p_G-X6pD",
      practice: "https://www.indiabix.com/logical-reasoning/questions-and-answers/"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-10 space-y-10">
      <div className="border-b pb-8">
        <h2 className="text-4xl font-black text-[#111322]">Placement Prep Hub</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Master the first round of campus recruitment</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {resources.map((res, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-black text-[#111322]">{res.category}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {res.topics.map(t => (
                  <span key={t} className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black rounded-lg uppercase">
                    {t}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <a href={res.video} target="_blank" className="flex items-center justify-center gap-2 bg-[#111322] text-white py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-600 transition-all">
                  <Video size={14} /> Video Tutorials
                </a>
                <a href={res.practice} target="_blank" className="flex items-center justify-center gap-2 border border-gray-100 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-gray-50 transition-all">
                  <Book size={14} /> Practice Now
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AptitudePrep;