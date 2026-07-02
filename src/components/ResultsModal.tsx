import { useGameStore } from '../store/useGameStore';
import { Trophy, RotateCcw, Share2, Target, Zap, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export const ResultsModal = () => {
  const { score, bestStreak, resetGame, missedCountries } = useGameStore();

  const handleShare = () => {
    const text = `🌍 I just scored ${score.toLocaleString()} points on GeoMaster! My best streak was ${bestStreak}. Can you beat me?`;
    if (navigator.share) {
      navigator.share({ title: 'GeoMaster Results', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 text-center shadow-2xl my-auto"
      >
        <div className="mb-6 md:mb-8 flex justify-center">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500">
            <Trophy size={32} className="md:w-12 md:h-12" />
          </div>
        </div>

        <h2 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 italic tracking-tighter uppercase">Mission Complete</h2>
        <p className="text-xs md:text-sm text-gray-400 font-medium mb-8 md:mb-10">Final performance analysis</p>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
          <div className="bg-gray-800/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-800">
            <div className="text-gray-500 text-[8px] md:text-[10px] uppercase tracking-widest font-black mb-1 md:mb-2 flex items-center justify-center gap-1 md:gap-2">
              <Target size={10} className="md:w-3 md:h-3" /> <span className="hidden sm:inline">Total Score</span><span className="sm:hidden">Score</span>
            </div>
            <div className="text-xl md:text-3xl font-mono font-black text-white">{score.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-800">
            <div className="text-gray-500 text-[8px] md:text-[10px] uppercase tracking-widest font-black mb-1 md:mb-2 flex items-center justify-center gap-1 md:gap-2">
              <Zap size={10} className="md:w-3 md:h-3" /> <span className="hidden sm:inline">Best Streak</span><span className="sm:hidden">Streak</span>
            </div>
            <div className="text-xl md:text-3xl font-mono font-black text-white">{bestStreak}</div>
          </div>
        </div>

        {missedCountries.length > 0 && (
          <div className="mb-8 md:mb-10 text-left">
            <h3 className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-gray-500 mb-3 flex items-center gap-2">
              <BookOpen size={12} /> Study List ({missedCountries.length})
            </h3>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {missedCountries.map((country) => (
                <div key={country.id} className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg border border-gray-800">
                  <img src={country.flag} alt="" className="w-8 h-5 object-cover rounded-sm" referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-xs font-bold text-white leading-none">{country.name.common}</p>
                    <p className="text-[10px] text-gray-500 leading-none mt-1">Capital: {country.capital}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 md:space-y-3">
          <button
            onClick={resetGame}
            className="w-full py-4 md:py-5 bg-white text-black font-black text-base md:text-lg rounded-xl md:rounded-2xl hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2 md:gap-3"
          >
            <RotateCcw size={18} className="md:w-5 md:h-5" />
            PLAY AGAIN
          </button>
          <button
            onClick={handleShare}
            className="w-full py-4 md:py-5 bg-gray-800 text-white font-bold text-base md:text-lg rounded-xl md:rounded-2xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2 md:gap-3"
          >
            <Share2 size={18} className="md:w-5 md:h-5" />
            SHARE RESULTS
          </button>
        </div>
      </motion.div>
    </div>
  );
};
